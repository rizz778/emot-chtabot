import os
import json
import re
import uuid
import cv2
import numpy as np
import base64
import time
import requests
from flask import Flask, request, jsonify, send_file, url_for, render_template, Response
from flask_cors import CORS
import google.generativeai as genai
from gtts import gTTS
import speech_recognition as sr
import random
from dotenv import load_dotenv
from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse
import urllib.parse
from deepface import DeepFace

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

# Enhanced CORS configuration to fix cross-origin issues
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Explicitly handle OPTIONS for preflight requests
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

# Create directories for audio files and images
AUDIO_DIR = "audio_responses"
os.makedirs(AUDIO_DIR, exist_ok=True)
IMAGE_PATH = "captured_image.jpg"  # Path to save the captured image

# Speech recognition setup
recognizer = sr.Recognizer()

def assess_distress_level(user_input, conversation_history, user_details=None):
    """
    Uses an LLM to analyze the user's input and context, returning a distress severity score (0–10)
    and a boolean indicating if immediate help is needed.
    """
    # Build conversation history text
    history_text = ""
    for msg in conversation_history:
        if "sender" in msg and "text" in msg:
            history_text += f"{msg['sender']}: {msg['text']}\n"

    # Build user details string (for context)
    user_details_str = ""
    if user_details:
        user_details_str = "User Profile:\n"
        for key, value in user_details.items():
            if key not in ["password", "token"]:
                user_details_str += f"- {key}: {value}\n"

    # Construct LLM prompt
    distress_prompt = f"""
You are a mental health assessment assistant.

Given the user's input, their previous conversation, and their personal context, your job is to assess their emotional distress level.

Assign a distress score from 0 to 10 based on the emotional intensity and language of the message:
- 0 means emotionally stable and calm.
- 10 means extremely distressed, at risk of harm, or needing immediate help.

Respond only with a JSON object like this:
{{
  "distress_score": <number between 0 and 10>,
  "requires_immediate_help": <true or false>
}}

User Input: "{user_input}"

{user_details_str}
Previous Conversation:
{history_text}
"""

    print(f"[DEBUG] Sending to model:\n{distress_prompt}")

    try:
        response = model.generate_content(distress_prompt)
        raw_text = response.text.strip()

        # Extract JSON safely
        match = re.search(r'{.*}', raw_text, re.DOTALL)
        if match:
            distress_data = eval(match.group())  # You can also use `json.loads()` if safer
            return distress_data["distress_score"], distress_data["requires_immediate_help"]
        else:
            print("[ERROR] Could not extract JSON from model response.")
            return 0, False

    except Exception as e:
        print(f"[ERROR] AI Distress Scoring Error: {str(e)}")
        return 0, False

def generate_response_with_user_details(user_input, conversation_history, user_details=None, detected_emotion=None):
    """
    Unified version: Uses a single prompt to generate both the response and distress score from LLM.
    """

    # Validate conversation history
    if not isinstance(conversation_history, list):
        print("[ERROR] Invalid conversation_history format. Expected a list.")
        return {"response": "Error: Invalid conversation format.", "requires_immediate_help": False}

    history_text = []
    for msg in conversation_history:
        if not isinstance(msg, dict) or "sender" not in msg or "text" not in msg:
            print(f"[ERROR] Invalid message format: {msg}")
            return {"response": "Error: Malformed conversation history.", "requires_immediate_help": False}
        history_text.append(f"{msg['sender']}: {msg['text']}")
    history_str = "\n".join(history_text)

    # User details string
    user_details_str = ""
    if user_details:
        user_details_str = "User Details:\n"
        for key, value in user_details.items():
            if key not in ["password", "token"]:
                user_details_str += f"- {key}: {value}\n"

    # Detected emotion
    emotion_str = f"Detected Facial Emotion: {detected_emotion}\n" if detected_emotion else ""

    # --- Unified Prompt ---
    unified_prompt = f"""
You are a highly empathetic AI assistant specialized in mental health and emotional support.

Your task is two-fold:
1. Assess the emotional distress level of the user and return a JSON with:
    {{
      "distress_score": (integer 0–10),
      "requires_immediate_help": (true/false)
    }}

Scoring rubric:
- 0–3 → Low distress (e.g., tired, sad, frustrated)
- 4–6 → Moderate distress (e.g., anxious, overwhelmed, crying)
- 7–10 → High distress (e.g., suicidal thoughts, hopeless, 'can't go on', 'want to die')

**If you detect any signs of suicidal ideation or emotional crisis, the score must be >= 9 and requires_immediate_help must be true.**

2. After the JSON, output an empathetic and supportive message to the user that:
- Acknowledges their emotion
- Validates their experience
- Offers gentle support or coping strategies (mindfulness, grounding, etc.)
- Sounds warm, human, and caring

Always return in this format exactly:

<BEGIN_JSON>
{{ "distress_score": ..., "requires_immediate_help": ... }}
<END_JSON>

<BEGIN_MESSAGE>
Your empathetic, warm, validating message goes here...
<END_MESSAGE>

--- Context ---
User Input: "{user_input}"

{user_details_str}
{emotion_str}
Conversation History:
{history_str}
"""

    try:
        raw = model.generate_content(unified_prompt)
        output = raw.text.strip()

        # Extract JSON and message
        json_match = re.search(r"<BEGIN_JSON>\s*(.*?)\s*<END_JSON>", output, re.DOTALL)
        message_match = re.search(r"<BEGIN_MESSAGE>\s*(.*?)\s*<END_MESSAGE>", output, re.DOTALL)

        if json_match and message_match:
            distress_data = json.loads(json_match.group(1))
            response_text = message_match.group(1).strip()
        else:
            raise ValueError("Output format parsing failed.")

        return {
            "response": response_text,
            "requires_immediate_help": distress_data.get("requires_immediate_help", False),
            "distress_score": distress_data.get("distress_score", 0)
        }

    except Exception as e:
        print(f"[ERROR] Unified generation failed: {e}")
        return {
            "response": "I'm here to support you. Please feel free to share more about how you're feeling.",
            "requires_immediate_help": False,
            "distress_score": 0
        }


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

def capture_image():
    """Captures an image from the webcam without GUI functions."""
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        return None, "Error: Could not access webcam"
    
    # Let camera adjust (no GUI needed)
    print("Adjusting camera... Please wait for 3 seconds.")
    time.sleep(3)  # Allow camera to adjust
    
    # Capture a few frames to ensure stability
    for _ in range(10):
        ret, frame = cap.read()
        if not ret:
            cap.release()
            return None, "Error: Failed to read frame"
    
    # Capture the final frame
    ret, frame = cap.read()
    cap.release()  # Release the camera
    
    if not ret:
        return None, "Error: Failed to capture image"
    
    # Save the image (optional, only if needed for DeepFace)
    cv2.imwrite(IMAGE_PATH, frame)
    
    # Encode image to base64
    _, buffer = cv2.imencode('.jpg', frame)
    img_base64 = base64.b64encode(buffer).decode('utf-8')
    
    return img_base64, None
# Routes

@app.route('/')
def home():
    return render_template("index.html")  # HTML page to trigger capture

@app.route('/capture', methods=['GET', 'OPTIONS'])
def capture_and_predict():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        # (1) Capture image (no GUI)
        image_data, error = capture_image()
        if error:
            return jsonify({'error': error}), 500

        # (2) Analyze emotion
        try:
            result = DeepFace.analyze(
                img_path=IMAGE_PATH,  # or use a temp file
                actions=['emotion'],
                enforce_detection=False  # Don't fail if no face detected
            )
            detected_emotion = result[0]['dominant_emotion']
        except Exception as e:
            return jsonify({'error': f"Emotion detection failed: {str(e)}"}), 500

        return jsonify({
            'emotion': detected_emotion,
            'image_base64': image_data  # Send base64 to frontend
        })

    except Exception as e:
        print(f"[SERVER ERROR] {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/init-conversation', methods=['POST', 'OPTIONS'])
def init_conversation():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.get_json()
        user_details = data.get("user_details", {})
        session_id = data.get("session_id")
        detected_emotion = data.get("detected_emotion")  # Get emotion if provided
        
        if not session_id:
            return jsonify({"error": "Session ID is required"}), 400
            
        # Generate a personalized greeting based on user details
        user_name = user_details.get("name", "there")
        
        # Format the user details for the prompt
        user_details_str = "User Details:\n"
        for key, value in user_details.items():
            if key != "password" and key != "token":  # Skip sensitive information
                user_details_str += f"- {key}: {value}\n"
        if not user_details:
            user_details_str = "User Details: None provided.\n"
            
        # Add emotion context if available
        emotion_context = ""
        if detected_emotion:
            emotion_context = f"The user's detected facial emotion is: {detected_emotion}. Respond appropriately to this emotional state."
            
        greeting_prompt = f"""
        You are an emotionally supportive and compassionate AI assistant, dedicated to promoting mental well-being.
        
        {user_details_str}
        {emotion_context}
        
        Generate a warm, personalized greeting for this user who has just started a new conversation.
        Keep it brief (2-3 sentences) but make it feel personalized based on their details and emotional state if provided.
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

@app.route('/chat', methods=['POST', 'OPTIONS'])
def chat():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.get_json()
        user_message = data.get("message", "")
        conversation_history = data.get("conversation_history", [])
        user_details = data.get("user_details", {})
        detected_emotion = data.get("detected_emotion")  # Get emotion if provided

        # Generate response, now including detected emotion
        response_data = generate_response_with_user_details(
            user_message, 
            conversation_history, 
            user_details,
            detected_emotion
        )

        # # Convert response to speech
        # tts = gTTS(response_data["response"], lang="en")
        # audio_file_path = os.path.join(AUDIO_DIR, f"{uuid.uuid4()}.mp3")
        # tts.save(audio_file_path)
        # audio_url = url_for('get_audio', filename=os.path.basename(audio_file_path), _external=True)

        return jsonify({
            "response": response_data["response"],
            # "audio_url": audio_url,
            "requires_immediate_help": response_data.get("requires_immediate_help", False),
            "distress_score": response_data.get("distress_score", 0),
            "follow_up": "Is there anything else you'd like to share?"
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

@app.route('/make_call', methods=['POST', 'OPTIONS'])
def make_call():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.get_json()
        user_number = data.get("phone")
        user_message = data.get("message", "Hello!")
        detected_emotion = data.get("detected_emotion")  # Get emotion if provided

        if not user_number:
            return jsonify({"error": "Phone number is required"}), 400

        # Generate AI response including emotion context
        response_data = generate_response_with_user_details(
            user_message, 
            [], 
            {},
            detected_emotion
        )
        response_text = response_data["response"]

        # URL-encode the response text
        encoded_response = urllib.parse.quote(response_text)

        ngrok_url = get_ngrok_url()  # Fetch latest ngrok URL dynamically
        if not ngrok_url:
            return jsonify({"error": "Ngrok is not running. Start ngrok first!"}), 500

        # Generate TwiML URL
        twiml_url = f"{ngrok_url}/twiml?message={encoded_response}"
        print("Generated TwiML URL:", twiml_url)

        call = twilio_client.calls.create(
            to=user_number,
            from_=TWILIO_PHONE_NUMBER,
            method="POST",
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
    app.run(host="0.0.0.0", port=5000, debug=True)