import tensorflow as tf
import pandas as pd
import csv
from datetime import datetime

gpus = tf.config.list_physical_devices('GPU')
if gpus:
    try:
        tf.config.experimental.set_visible_devices(gpus[0], 'GPU')
        tf.config.experimental.set_memory_growth(gpus[0], True)
        print(f"Using GPU: {gpus[0]}")
    except RuntimeError as e:
        print(e)

from sklearn.model_selection import train_test_split

df = pd.read_csv('Suicide_Detection.csv', index_col=0)

df['class'] = df['class'].map({'suicide': 1, 'non-suicide': 0})

train_df, test_df = train_test_split(df, test_size=0.5, random_state=42)

def df_to_dataset(dataframe, shuffle=True, batch_size=32):
    texts = dataframe['text'].values
    labels = dataframe['class'].values
    dataset = tf.data.Dataset.from_tensor_slices((texts, labels))
    if shuffle:
        dataset = dataset.shuffle(buffer_size=len(dataframe))
    return dataset.batch(batch_size)

batch_size = 32
train_ds = df_to_dataset(train_df, shuffle=True, batch_size=batch_size)
test_ds  = df_to_dataset(test_df, shuffle=False, batch_size=batch_size)

max_features = 20000
sequence_length = 250
vectorize_layer = tf.keras.layers.TextVectorization(
    max_tokens=max_features,
    output_mode='int',
    output_sequence_length=sequence_length)

train_text = train_df['text'].tolist()
vectorize_layer.adapt(train_text)

class_counts = df['class'].value_counts()
print(f"Class distribution:\n{class_counts}")
total = len(df)
print(f"Class balance: {class_counts[1]/total:.2f} suicide, {class_counts[0]/total:.2f} non-suicide")

embedding_dim = 64 
model = tf.keras.Sequential([
    tf.keras.layers.Input(shape=(1,), dtype=tf.string),
    vectorize_layer,
    tf.keras.layers.Embedding(max_features, embedding_dim, mask_zero=False),
    tf.keras.layers.SpatialDropout1D(0.3),  
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Bidirectional(tf.keras.layers.LSTM(32, return_sequences=True, 
                                                      kernel_regularizer=tf.keras.regularizers.L2(0.01))),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Dropout(0.5),
    tf.keras.layers.Bidirectional(tf.keras.layers.LSTM(16,  # Reduced from 32
                                                      kernel_regularizer=tf.keras.regularizers.L2(0.01))),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Dropout(0.5),
    tf.keras.layers.Dense(32, activation='relu',  
                         kernel_regularizer=tf.keras.regularizers.L2(0.01)),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Dropout(0.5),
    tf.keras.layers.Dense(1, activation='sigmoid')
])

model.summary()

model.compile(
    loss='binary_crossentropy',
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
    metrics=[
        'accuracy', 
        tf.keras.metrics.Precision(name='precision'),
        tf.keras.metrics.Recall(name='recall'),
        tf.keras.metrics.AUC(name='auc')
    ]
)

callbacks = [
    tf.keras.callbacks.EarlyStopping(
        monitor='val_loss', patience=3, restore_best_weights=True),
    tf.keras.callbacks.ReduceLROnPlateau(
        monitor='val_loss', factor=0.5, patience=2, min_lr=0.00001)
]

history = model.fit(
    train_ds, 
    epochs=5, 
    validation_data=test_ds,
    callbacks=callbacks
)

loss, accuracy, precision, recall, auc = model.evaluate(test_ds)
eval_metrics = [loss, accuracy, precision, recall, auc]
print(f"Test Loss: {loss:.4f}")
print(f"Test Accuracy: {accuracy:.4f}")
print(f"Test Precision: {precision:.4f}")
print(f"Test Recall: {recall:.4f}")
print(f"Test AUC: {auc:.4f}")

def save_training_metrics(history, eval_metrics, filepath=None):
    """Save training history and final evaluation metrics to CSV."""
    if filepath is None:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filepath = f'training_metrics_{timestamp}.csv'
    
    metrics_data = {
        'epoch': list(range(1, len(history.history['loss']) + 1))
    }
    metrics_data.update(history.history)
    
    df = pd.DataFrame(metrics_data)
    df.to_csv(filepath, index=False)
    
    with open(filepath, 'a', newline='') as f:
        writer = csv.writer(f)
        writer.writerow([])  
        writer.writerow(['Final Evaluation Metrics'])
        writer.writerow(['test_loss', 'test_accuracy', 'test_precision', 'test_recall', 'test_auc'])
        writer.writerow([eval_metrics[0], eval_metrics[1], eval_metrics[2], eval_metrics[3], eval_metrics[4]])
    
    print(f"Training metrics saved to {filepath}")

save_training_metrics(history, eval_metrics)

model_save_path = './suicide_detection_model.keras'  
saved_model_path = './suicide_detection_model_saved'  
model.save(model_save_path)
model.export(saved_model_path)  
print(f"Model saved to {model_save_path}")
print(f"Model exported as SavedModel to {saved_model_path}")

import matplotlib.pyplot as plt

def plot_metrics(history):
    metrics = ['loss', 'accuracy', 'precision', 'recall', 'auc']
    plt.figure(figsize=(15, 10))
    
    for i, metric in enumerate(metrics):
        plt.subplot(3, 2, i+1)
        plt.plot(history.history[metric])
        plt.plot(history.history[f'val_{metric}'])
        plt.title(f'Model {metric}')
        plt.ylabel(metric)
        plt.xlabel('Epoch')
        plt.legend(['Train', 'Validation'], loc='upper left')
    
    plt.tight_layout()
    plt.savefig('training_metrics.png')
    plt.show()

plot_metrics(history)
