from flask import Flask, request, jsonify, send_file, url_for
from flask_cors import CORS
import google.generativeai as genai
from gtts import gTTS
import os
import uuid
import speech_recognition as sr
from dotenv import load_dotenv

# Load API key securely
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("GEMINI_API_KEY is not set in .env")

# Configure Gemini AI
def configure_genai(api_key):
    genai.configure(api_key=api_key)
    return genai.GenerativeModel("gemini-1.5-flash")

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize model
model = configure_genai(api_key=API_KEY)

# Create directories for audio files
AUDIO_DIR = "audio_responses"
UPLOAD_DIR = "audio_uploads"
os.makedirs(AUDIO_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Speech recognition setup
recognizer = sr.Recognizer()

@app.route('/chat', methods=['POST'])
def chat():
    """Handle chat requests from frontend."""
    try:
        user_message = None

        # If audio file is provided
        if "audio_file" in request.files:
            audio_file = request.files["audio_file"]
            audio_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}.wav")
            audio_file.save(audio_path)

            with sr.AudioFile(audio_path) as source:
                audio_data = recognizer.record(source)
                user_message = recognizer.recognize_google(audio_data)
        
        # If text message is provided
        if not user_message:
            data = request.json
            user_message = data.get("message")

        if not user_message:
            return jsonify({"response": "Error: No input message or audio provided."}), 400

        # Stop the conversation if user says "bye" or "thanks"
        if any(word in user_message.lower() for word in ["bye", "thanks"]):
            return jsonify({"response": "Goodbye! Feel free to chat again anytime!"}), 200

        # Generate AI response
        response = model.generate_content(user_message)
        bot_response = response.text.strip()[:200]  # Limit to 200 chars

        # Convert bot response to audio
        tts = gTTS(bot_response, lang="en")
        audio_file_path = os.path.join(AUDIO_DIR, f"{uuid.uuid4()}.mp3")
        tts.save(audio_file_path)

        # Generate accessible audio URL
        audio_url = url_for('get_audio', filename=os.path.basename(audio_file_path), _external=True)

        return jsonify({
            "response": bot_response,
            "audio_url": audio_url,
            "follow_up": "Is there anything else you'd like to ask?"
        })

    except Exception as e:
        return jsonify({"response": f"Error: {str(e)}"}), 500

@app.route('/audio/<filename>', methods=['GET'])
def get_audio(filename):
    """Serve the generated audio file."""
    file_path = os.path.join(AUDIO_DIR, filename)
    if os.path.exists(file_path):
        return send_file(file_path, mimetype="audio/mpeg")
    else:
        return jsonify({"error": "Audio file not found."}), 404

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
