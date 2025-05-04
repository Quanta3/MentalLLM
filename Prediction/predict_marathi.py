import tensorflow as tf
import numpy as np
import google.generativeai as genai
import os
import sys

# --- Model Loading (same as predict.py) ---
def load_model(model_path='./suicide_detection_model.keras'):
    """Load the saved model."""
    try:
        # Try loading .keras format first
        model = tf.keras.models.load_model(model_path)
        print("Suicide detection model loaded successfully from .keras format!")
        return model
    except Exception as e:
        print(f"Could not load .keras format: {e}")
        try:
            # Fallback to SavedModel format
            saved_model_path = './suicide_detection_model_saved'
            model = tf.keras.models.load_model(saved_model_path)
            print("Suicide detection model loaded successfully from SavedModel format!")
            return model
        except Exception as e:
            print(f"Error loading suicide detection model: {e}")
            return None

# --- Prediction Function (same as predict.py) ---
def predict_text(model, text):
    """
    Make predictions on input text.

    Args:
        model: Loaded TensorFlow model
        text: String text input (expected to be English)

    Returns:
        prediction: Float value (probability of suicidal content)
        label: String interpretation of the prediction
        confidence: Float confidence score
    """
    if not text: # Handle empty string after potential translation failure
        return 0.0, "non-suicide", 1.0

    # Convert text to tensor format expected by the model
    text_tensor = tf.convert_to_tensor([text])

    # Make prediction
    prediction = model.predict(text_tensor)[0][0]

    # Classify prediction
    label = "suicide" if prediction > 0.5 else "non-suicide"
    confidence = prediction if prediction > 0.5 else 1 - prediction

    return prediction, label, confidence

# --- Translation Function ---
def translate_to_english(text, gemini_model):
    """Translates text to English using Gemini."""
    if not text:
        return ""
    try:
        prompt = f"Translate the following text to English:\n\n{text}\n\nTranslation:"
        response = gemini_model.generate_content(prompt)
        # Basic check if response has text part
        if response.parts:
             # Accessing the text content safely
            translated_text = ''.join(part.text for part in response.parts if hasattr(part, 'text'))
            return translated_text.strip()
        else:
            # Handle cases where response might be blocked or empty
            print("Warning: Translation response was empty or blocked.")
            # Check for safety feedback if available
            if hasattr(response, 'prompt_feedback') and response.prompt_feedback.block_reason:
                 print(f"Translation blocked due to: {response.prompt_feedback.block_reason}")
            return "" # Return empty string if no text part found or blocked
    except Exception as e:
        print(f"Error during translation: {e}")
        return "" # Return empty string on error

# --- Main Execution ---
def main():
    """Command-line interface for text prediction with translation."""

    # --- Gemini Setup ---
    try:
        api_key = os.environ.get("GOOGLE_API_KEY")
        if not api_key:
            print("Error: GOOGLE_API_KEY environment variable not set.")
            print("Please set the GOOGLE_API_KEY environment variable to your API key.")
            sys.exit(1) # Exit if API key is not set
        genai.configure(api_key=api_key)
        gemini_model = genai.GenerativeModel('gemini-2.0-flash')
        print("Gemini model initialized successfully.")
    except Exception as e:
        print(f"Error initializing Gemini: {e}")
        return

    # --- Load Suicide Detection Model ---
    suicide_model = load_model()
    if suicide_model is None:
        return

    print("\nSuicide Risk Detection Model (Marathi/Hindi Input)")
    print("Enter your text in Marathi or Hindi (use multiple lines if needed)")
    print("Type 'END' on a new line to finish input\n")

    print("Enter text to analyze (Marathi/Hindi):")
    lines = []
    while True:
        try:
            line = input()
        except EOFError: # Handle Ctrl+D or end of input stream
            break
        if line.strip().upper() == 'END':
            break
        lines.append(line)

    if not lines:
        return

    user_input = '\n'.join(lines)
    print(f"\nOriginal Text ({len(user_input)} chars): {user_input[:100]}...") # Show snippet

    # --- Translate Text ---
    print("Translating text to English...")
    translated_text = translate_to_english(user_input, gemini_model)

    if not translated_text:
        print("Translation failed or resulted in empty text. Skipping prediction.")
        return

    print(f"Translated Text ({len(translated_text)} chars): {translated_text[:100]}...") # Show snippet

    # --- Predict using Suicide Model ---
    prediction, label, confidence = predict_text(suicide_model, translated_text)

    print(f"\nPrediction: {label}")
    print(f"Confidence: {confidence:.2%}")
    print(f"Raw probability (based on translated text): {prediction:.4f}")

    if label == "suicide":
        print("\n🟥This text indicates SUICIDAL Tendencies")
    else:
        print("\n️ 🟩This text doesn't strongly indicate suicidal Tendencies")

if __name__ == "__main__":
    # Add a note about dependencies and API key
    print("---")
    print("Ensure you have installed the necessary libraries: pip install tensorflow google-generativeai")
    print("Make sure the GOOGLE_API_KEY environment variable is set.")
    print("---")
    main()
