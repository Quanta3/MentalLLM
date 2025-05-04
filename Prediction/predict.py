import tensorflow as tf
import numpy as np

def load_model(model_path='./suicide_detection_model.keras'):
    """Load the saved model."""
    try:
        # Try loading .keras format first
        model = tf.keras.models.load_model(model_path)
        print("Model loaded successfully from .keras format!")
        return model
    except Exception as e:
        print(f"Could not load .keras format: {e}")
        try:
            # Fallback to SavedModel format
            saved_model_path = './suicide_detection_model_saved'
            model = tf.keras.models.load_model(saved_model_path)
            print("Model loaded successfully from SavedModel format!")
            return model
        except Exception as e:
            print(f"Error loading model: {e}")
            return None

def predict_text(model, text):
    """
    Make predictions on input text.
    
    Args:
        model: Loaded TensorFlow model
        text: String text input
        
    Returns:
        prediction: Float value (probability of suicidal content)
        label: String interpretation of the prediction
    """
    # Convert text to tensor format expected by the model
    text_tensor = tf.convert_to_tensor([text])
    
    # Make prediction
    prediction = model.predict(text_tensor)[0][0]
    
    # Classify prediction
    label = "suicide" if prediction > 0.5 else "non-suicide"
    confidence = prediction if prediction > 0.5 else 1 - prediction
    
    return prediction, label, confidence

def main():
    """Command-line interface for text prediction."""
    model = load_model()
    if model is None:
        return
    
    print("Suicide Risk Detection Model")
    print("Enter your text (use multiple lines if needed)")
    print("Type 'END' on a new line to finish input\n")
    
    print("Enter text to analyze:")
    lines = []
    while True:
        line = input()
        if line.strip().upper() == 'END':
            break
        lines.append(line)
    
    if not lines:
        return
        
    user_input = '\n'.join(lines)
    prediction, label, confidence = predict_text(model, user_input)
    
    print(f"\nPrediction: {label}")
    print(f"Confidence: {confidence:.2%}")
    print(f"Raw probability: {prediction:.4f}")
    
    if label == "suicide":
        print("\n🟥This text indicates SUICIDAL Tendencies")
    else:
        print("\n️ 🟩This text doesn't strongly indicate suicidal Tendencies")

if __name__ == "__main__":
    main()
