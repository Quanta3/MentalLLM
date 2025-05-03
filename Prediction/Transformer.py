import os
import numpy as np
import pandas as pd
import tensorflow as tf
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.utils.class_weight import compute_class_weight
from sklearn.metrics import precision_recall_curve, classification_report
from transformers import BertTokenizer, TFBertForSequenceClassification

# 1. Load & preprocess ------------------------------------------------------

# Load CSV (assumes 'Suicide_Detection.csv' with columns 'text','class')
df = pd.read_csv('Suicide_Detection.csv', index_col=0)

# Map string labels to integers immediately
df['class'] = df['class'].map({'suicide': 1, 'non-suicide': 0})
if set(df['class'].unique()) != {0, 1}:
    raise ValueError("Label mapping failed; check your CSV 'class' column.")

# 2. Stratified train/validation split --------------------------------------

train_df, val_df = train_test_split(
    df,
    test_size=0.1,
    stratify=df['class'],
    random_state=42
)

print(f"Train size: {len(train_df)}, Val size: {len(val_df)}")
print("Train class counts:\n", train_df['class'].value_counts())

# 3. Oversampling minority class --------------------------------------------

num_pos = int(train_df['class'].sum())
num_neg = len(train_df) - num_pos

if num_pos == 0:
    raise ValueError("No positive (suicide) examples in training set.")
# Compute how many times to duplicate positives
oversample_factor = max(1, num_neg // num_pos)

pos_df = train_df[train_df['class'] == 1]
neg_df = train_df[train_df['class'] == 0]
augmented_pos = pd.concat([pos_df] * oversample_factor, ignore_index=True)

# Combine & shuffle
train_df_bal = pd.concat([neg_df, augmented_pos]) \
                   .sample(frac=1, random_state=42) \
                   .reset_index(drop=True)

print(f"Balanced train size: {len(train_df_bal)} (negatives: {len(neg_df)}, positives: {len(augmented_pos)})")

# 4. Compute class weights --------------------------------------------------

class_weights = compute_class_weight(
    class_weight='balanced',
    classes=np.array([0, 1]),
    y=train_df_bal['class'].values
)
class_weight_dict = {0: class_weights[0], 1: class_weights[1]}
print("Class weights:", class_weight_dict)

# 5. Tokenization ------------------------------------------------------------

MODEL_NAME = 'bert-base-uncased'
tokenizer = BertTokenizer.from_pretrained(MODEL_NAME)

def encode_texts(texts, max_length=128):
    return tokenizer(
        texts.tolist(),
        padding=True,
        truncation=True,
        max_length=max_length,
        return_tensors='tf'
    )

train_enc = encode_texts(train_df_bal['text'])
val_enc   = encode_texts(val_df['text'])

train_labels = tf.convert_to_tensor(train_df_bal['class'].values)
val_labels   = tf.convert_to_tensor(val_df['class'].values)

# 6. tf.data datasets -------------------------------------------------------

batch_size = 16

train_ds = tf.data.Dataset.from_tensor_slices((
    dict(train_enc),
    train_labels
)).shuffle(buffer_size=1000) \
 .batch(batch_size) \
 .prefetch(tf.data.AUTOTUNE)

val_ds = tf.data.Dataset.from_tensor_slices((
    dict(val_enc),
    val_labels
)).batch(batch_size) \
 .prefetch(tf.data.AUTOTUNE)

# 7. Model & training setup -------------------------------------------------

with tf.device('/GPU:0' if tf.config.list_physical_devices('GPU') else '/CPU:0'):
    model = TFBertForSequenceClassification.from_pretrained(
        MODEL_NAME,
        num_labels=1,       # single output for sigmoid
        from_pt=True        # load PyTorch weights if needed
    )

    optimizer = tf.keras.optimizers.Adam(learning_rate=3e-5)
    loss_fn = tf.keras.losses.BinaryCrossentropy(from_logits=True)

    model.compile(
        optimizer=optimizer,
        loss=loss_fn,
        metrics=[
            tf.keras.metrics.AUC(name='auc'),
            tf.keras.metrics.Precision(name='precision'),
            tf.keras.metrics.Recall(name='recall')
        ]
    )

callbacks = [
    tf.keras.callbacks.EarlyStopping(
        monitor='val_loss',
        patience=2,
        restore_best_weights=True
    ),
    tf.keras.callbacks.ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.5,
        patience=1,
        min_lr=1e-6
    )
]

# 8. Fine-tune the model ----------------------------------------------------

history = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=3,
    class_weight=class_weight_dict,
    callbacks=callbacks
)

# 9. Threshold tuning -------------------------------------------------------

# Predict logits on validation set
val_logits = model.predict(val_ds).logits.flatten()
val_probs = tf.sigmoid(val_logits).numpy()

precision, recall, thresholds = precision_recall_curve(
    val_df['class'], val_probs
)
# Choose threshold achieving ~90% recall
target_recall = 0.90
idx = np.where(recall >= target_recall)[0]
if len(idx) > 0:
    best_thresh = thresholds[idx[-1]]
else:
    best_thresh = 0.5
print(f"Chosen probability threshold for {target_recall*100:.0f}% recall: {best_thresh:.3f}")

# 10. Evaluation on validation (or out-of-domain) ---------------------------

val_preds = (val_probs >= best_thresh).astype(int)
print(classification_report(val_df['class'], val_preds, digits=4))

# 11. Save model & tokenizer ------------------------------------------------

OUTPUT_DIR = './suicide_bert_model'
os.makedirs(OUTPUT_DIR, exist_ok=True)
model.save_pretrained(OUTPUT_DIR)
tokenizer.save_pretrained(OUTPUT_DIR)

print(f"Model and tokenizer saved to {OUTPUT_DIR}")

# 12. Inference utility -----------------------------------------------------

def predict_texts(text_list, threshold=best_thresh, max_length=128):
    enc = tokenizer(
        text_list,
        padding=True,
        truncation=True,
        max_length=max_length,
        return_tensors='tf'
    )
    logits = model(enc).logits.numpy().flatten()
    probs = tf.sigmoid(logits).numpy()
    preds = (probs >= threshold).astype(int)
    return probs, preds

# Example usage
if __name__ == "__main__":
    examples = [
        "I don't want to live anymore.",
        "Today was a wonderful day!"
    ]
    probs, preds = predict_texts(examples)
    for text, p, label in zip(examples, probs, preds):
        print(f"\"{text}\" → prob={p:.3f}, suicide_flag={bool(label)}")

# 13. (Optional) Save training history --------------------------------------

def save_training_metrics(history, filepath=None):
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    if filepath is None:
        filepath = f'training_metrics_{timestamp}.csv'
    metrics = history.history
    df_hist = pd.DataFrame(metrics)
    df_hist['epoch'] = df_hist.index + 1
    df_hist.to_csv(filepath, index=False)
    print(f"Training history saved to {filepath}")

save_training_metrics(history)

