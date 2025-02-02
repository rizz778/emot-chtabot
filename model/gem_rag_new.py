import os
import json
import re
import uuid
from flask import Flask, request, jsonify, send_file, url_for
from flask_cors import CORS
import google.generativeai as genai
from gtts import gTTS
import speech_recognition as sr
import random
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise ValueError("GEMINI_API_KEY is not set in .env")

genai.configure(api_key=API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY")
CORS(app)

# Create directories for audio files
AUDIO_DIR = "audio_responses"
os.makedirs(AUDIO_DIR, exist_ok=True)

# Speech recognition setup
recognizer = sr.Recognizer()

def generate_response_with_rag(user_input, conversation_history):
    """
    Generates a response by sending the conversation history along with the user query to the model.
    """
    history_text = "\n".join([f"{msg['sender']}: {msg['text']}" for msg in conversation_history])

    prompt = f"Previous conversation:\n{history_text}\n\nUser: {user_input}\nBot:"

    print(f"[DEBUG] Sending to model:\n{prompt}")

    try:
        response = model.generate_content(prompt)
        response_text = response.text.strip()
    except Exception as e:
        response_text = f"Error generating response: {str(e)}"

    response_text = re.sub(r'\*+', '', response_text)

    return response_text

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        user_message = data.get("message")
        conversation_history = data.get("conversation_history", [])

        if not user_message:
            return jsonify({"response": "Error: Missing required data."}), 400

        if any(word in user_message.lower() for word in ["bye", "thanks"]):
            return jsonify({"response": "Goodbye! Feel free to chat again anytime!"}), 200

        response_text = generate_response_with_rag(user_message, conversation_history)

        # Convert response to speech
        tts = gTTS(response_text, lang="en")
        audio_file_path = os.path.join(AUDIO_DIR, f"{uuid.uuid4()}.mp3")
        tts.save(audio_file_path)

        audio_url = url_for('get_audio', filename=os.path.basename(audio_file_path), _external=True)

        return jsonify({
            "response": response_text,
            "audio_url": audio_url,
            "follow_up": "Is there anything else you'd like to ask?"
        })

    except Exception as e:
        return jsonify({"response": f"Error: {str(e)}"}), 500

@app.route('/audio/<filename>', methods=['GET'])
def get_audio(filename):
    file_path = os.path.join(AUDIO_DIR, filename)
    if os.path.exists(file_path):
        return send_file(file_path, mimetype="audio/mpeg")
    else:
        return jsonify({"error": "Audio file not found."}), 404

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)

