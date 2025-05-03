import tensorflow as tf
import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt
from sklearn.metrics import confusion_matrix, classification_report

def load_model(model_path='./suicide_detection_model.keras'):
    """Load the saved model."""
    try:
        model = tf.keras.models.load_model(model_path)
        print("Model loaded successfully!")
        return model
    except Exception as e:
        print(f"Error loading model: {e}")
        return None

def prepare_test_data(csv_path='Suicide_Detection.csv', test_size=0.2):
    """Load and prepare test data."""
    # Load dataset
    df = pd.read_csv(csv_path, index_col=0)
    df['class'] = df['class'].map({'suicide': 1, 'non-suicide': 0})
    
    # Split dataset
    from sklearn.model_selection import train_test_split
    _, test_df = train_test_split(df, test_size=test_size, random_state=42)
    
    return test_df

def create_confusion_matrix(y_true, y_pred):
    """Create and display confusion matrix."""
    cm = confusion_matrix(y_true, y_pred)
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=['Non-Suicide', 'Suicide'],
                yticklabels=['Non-Suicide', 'Suicide'])
    plt.title('Confusion Matrix')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.savefig('confusion_matrix.png')
    plt.show()

def main():
    # Load model
    model = load_model()
    if model is None:
        return

    # Prepare test data
    test_df = prepare_test_data()
    
    # Create dataset
    test_ds = tf.data.Dataset.from_tensor_slices(
        (test_df['text'].values, test_df['class'].values)
    ).batch(32)

    # Get predictions
    y_pred_proba = model.predict(test_ds)
    y_pred = (y_pred_proba > 0.5).astype(int)
    y_true = test_df['class'].values

    # Create confusion matrix
    create_confusion_matrix(y_true, y_pred.flatten())

    # Print classification report
    print("\nClassification Report:")
    print(classification_report(y_true, y_pred, 
                              target_names=['Non-Suicide', 'Suicide']))

    # Print additional metrics
    from sklearn.metrics import roc_auc_score, average_precision_score
    print(f"\nROC AUC Score: {roc_auc_score(y_true, y_pred_proba):.4f}")
    print(f"Average Precision Score: {average_precision_score(y_true, y_pred_proba):.4f}")

if __name__ == "__main__":
    main()
