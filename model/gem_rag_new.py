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

def generate_response_with_user_details(user_input, conversation_history, user_details=None):
    """
    Generates a response by sending the conversation history along with user details and the user query to the model.
    """
    if not isinstance(conversation_history, list):
        print("[ERROR] Invalid conversation_history format. Expected a list.")
        return "Error: Invalid conversation format."

    history_text = []
    
    for msg in conversation_history:
        if not isinstance(msg, dict) or "sender" not in msg or "text" not in msg:
            print(f"[ERROR] Invalid message format: {msg}")  # Debugging print
            return "Error: Malformed conversation history."
        
        history_text.append(f"{msg['sender']}: {msg['text']}")
    
    history_str = "\n".join(history_text)  # Create the joined string separately
    
    # Format user details if available
    user_details_str = ""
    if user_details:
        user_details_str = "User Details:\n"
        for key, value in user_details.items():
            if key != "password" and key != "token":  # Skip sensitive information
                user_details_str += f"- {key}: {value}\n"
    
    prompt = f"""
      You are an emotionally supportive and compassionate AI assistant, dedicated to promoting mental well-being and emotional resilience.  
        Your responses should always acknowledge the user's emotions, validate their experiences, and provide comfort.  
        Focus on fostering a sense of safety, encouragement, and self-compassion while offering actionable, behavior-centric guidance.  
        Gently incorporate mental health strategies such as mindfulness, cognitive reframing, and stress management techniques where appropriate.  
        Maintain a warm, empathetic, and conversational tone, ensuring that the user feels truly heard and supported.  
        
        {user_details_str}
        Previous conversation:\n{history_str}\n
        User: {user_input}
        Bot (empathetic, validating, and well-being focused):
"""

    print(f"[DEBUG] Sending to model:\n{prompt}")

    try:
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        response_text = re.sub(r'\*+', '', response_text)

    except Exception as e:
        print(f"[ERROR] AI Model Error: {str(e)}")  # Log error in console
        return "Error generating response from AI."

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
# Add this to your Flask backend

@app.route('/init-conversation', methods=['POST'])
def init_conversation():
    try:
        data = request.get_json()
        user_details = data.get("user_details", {})
        session_id = data.get("session_id")
        
        if not session_id:
            return jsonify({"error": "Session ID is required"}), 400
            
        # Generate a personalized greeting based on user details
        user_name = user_details.get("name", "there")
        
        # Format the user details for the prompt
        user_details_str = "User Details:\n"
        for key, value in user_details.items():
            if key != "password" and key != "token":  # Skip sensitive information
                user_details_str += f"- {key}: {value}\n"
        
        greeting_prompt = f"""
        You are an emotionally supportive and compassionate AI assistant, dedicated to promoting mental well-being.
        
        {user_details_str}
        
        Generate a warm, personalized greeting for this user who has just started a new conversation.
        Keep it brief (2-3 sentences) but make it feel personalized based on their details.
        Be welcoming and offer support without being overly formal.
        """
        
        try:
            response = model.generate_content(greeting_prompt)
            greeting_text = response.text.strip()
            greeting_text = re.sub(r'\*+', '', greeting_text)
            
            # Convert greeting to speech
            tts = gTTS(greeting_text, lang="en")
            audio_file_path = os.path.join(AUDIO_DIR, f"{uuid.uuid4()}.mp3")
            tts.save(audio_file_path)
            
            audio_url = url_for('get_audio', filename=os.path.basename(audio_file_path), _external=True)
            
            return jsonify({
                "message": greeting_text,
                "audio_url": audio_url
            })
            
        except Exception as e:
            print(f"[ERROR] AI Model Error: {str(e)}")
            return jsonify({"error": "Failed to generate greeting"}), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 1. Modify the chat route to accept user details
@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        user_message = data.get("message")
        conversation_history = data.get("conversation_history", [])
        user_details = data.get("user_details", {})  # Get user details if provided

        if not user_message:
            return jsonify({"response": "Error: Missing required data."}), 400

        if any(word in user_message.lower() for word in ["bye", "thanks"]):
            return jsonify({"response": "Goodbye! Feel free to chat again anytime!"}), 200

        # Pass user details to the response generator
        response_text = generate_response_with_user_details(user_message, conversation_history, user_details)

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
        # twiml_url = f"https://emot-chtabot-1.onrender.com/twiml?message={encoded_response}"

                          
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



