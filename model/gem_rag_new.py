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
from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse
from flask import Flask, request, Response  # Import Response
from twilio.twiml.voice_response import VoiceResponse
import requests

# Load environment variables
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

if not API_KEY or not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN or not TWILIO_PHONE_NUMBER:
    raise ValueError("Missing API credentials in .env")

genai.configure(api_key=API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")

twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

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

def get_ngrok_url():
    """Fetches the ngrok URL dynamically from the ngrok API."""
    try:
        ngrok_api_url = "http://127.0.0.1:4040/api/tunnels"  # Local ngrok API
        response = requests.get(ngrok_api_url).json()
        
        for tunnel in response.get("tunnels", []):
            if tunnel["proto"] == "https":
                return tunnel["public_url"]  # Get the HTTPS tunnel URL
    except Exception as e:
        print("Error fetching ngrok URL:", str(e))
        return None

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

    #----------------------------Twilio----------------


import urllib.parse

@app.route('/make_call', methods=['POST'])
def make_call():
    try:
        data = request.get_json()
        user_number = data.get("phone")
        user_message = data.get("message", "Hello!")

        if not user_number:
            return jsonify({"error": "Phone number is required"}), 400

        # Generate AI response
        response_text = generate_response_with_rag(user_message, [])

        # URL-encode the response text
        encoded_response = urllib.parse.quote(response_text)

        ngrok_url = get_ngrok_url()  # ✅ Fetch latest ngrok URL dynamically
        if not ngrok_url:
            return jsonify({"error": "Ngrok is not running. Start ngrok first!"}), 500

        # Generate TwiML URL
        twiml_url = f"{ngrok_url}/twiml?message={encoded_response}"
                          
        print("Generated TwiML URL:", twiml_url)

        call = twilio_client.calls.create(
            to=user_number,
            from_=TWILIO_PHONE_NUMBER,
            method="POST",  # Use POST instead of GET
            url=twiml_url
        )

        return jsonify({"message": "Call initiated", "call_sid": call.sid}), 200

    except Exception as e:
        print("Error in make_call:", str(e))  # Debugging
        return jsonify({"error": str(e)}), 500


@app.route('/twiml', methods=['POST', 'GET'])
def twiml_response():
    """
    Generates TwiML response with AI-generated text.
    """
    message = request.args.get("message", "Hello! This is your chatbot.")  # Get message from query parameter

    response = VoiceResponse()
    response.say(message, voice="alice")

    return Response(str(response), mimetype='text/xml')



if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)



