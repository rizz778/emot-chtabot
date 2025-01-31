from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import google.generativeai as genai
from gtts import gTTS
import os
import uuid
import speech_recognition as sr

# Configure the Gemini API
def configure_genai(api_key):
    genai.configure(api_key=api_key)
    return genai.GenerativeModel("gemini-1.5-flash")

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

# Replace with your actual Gemini API key
API_KEY = "AIzaSyD8-W295SU5aMKlQx9UFpk64zvDTkR1L30"
model = configure_genai(api_key=API_KEY)

# Temporary directory for storing audio files
AUDIO_DIR = "audio_responses"
os.makedirs(AUDIO_DIR, exist_ok=True)

# Initialize Speech Recognition
recognizer = sr.Recognizer()

@app.route('/chat', methods=['POST'])
def chat():
    """Handle chat requests from the frontend."""
    try:
        data = request.json
        user_message = data.get("message")
        audio_file = data.get("audio_file")

        # If audio file is provided, convert it to text
        if audio_file:
            audio_path = os.path.join("audio_uploads", f"{uuid.uuid4()}.wav")
            with open(audio_path, 'wb') as f:
                f.write(audio_file)
            
            with sr.AudioFile(audio_path) as source:
                audio_data = recognizer.record(source)
                user_message = recognizer.recognize_google(audio_data)

        # If a text message is provided
        if user_message:
            # Stop the conversation if user says "bye" or "thanks"
            if any(word in user_message.lower() for word in ["bye", "thanks"]):
                return jsonify({"response": "Goodbye! Feel free to chat again anytime!"}), 200

            response = model.generate_content(user_message)
            bot_response = response.text.strip()

            # Limit the response length
            bot_response = bot_response[:200]  # Limit to first 200 characters

            # Convert bot response to audio
            tts = gTTS(bot_response, lang="en")
            audio_file_path = os.path.join(AUDIO_DIR, f"{uuid.uuid4()}.mp3")
            tts.save(audio_file_path)

            # Ask for follow-up question
            follow_up_message = "Is there anything else you'd like to ask?"

            return jsonify({
                "response": bot_response,
                "audio_file": audio_file_path,
                "follow_up": follow_up_message
            })

        else:
            return jsonify({"response": "Error: No input message or audio provided."}), 400
    except Exception as e:
        return jsonify({"response": f"Error: {str(e)}"}), 500

@app.route('/audio/<filename>', methods=['GET'])
def get_audio(filename):
    """Serve the audio file."""
    file_path = os.path.join(AUDIO_DIR, filename)
    if os.path.exists(file_path):
        return send_file(file_path, mimetype="audio/mpeg")
    else:
        return jsonify({"error": "Audio file not found."}), 404

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
