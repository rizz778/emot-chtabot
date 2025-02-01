import pandas as pd
import json
import numpy as np
import re
import os
import uuid
from flask import Flask, request, jsonify, send_file, url_for
from flask_cors import CORS
import google.generativeai as genai
from gtts import gTTS
import speech_recognition as sr
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import random
from dotenv import load_dotenv

# Load intents JSON
def load_intents(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)

data = load_intents("intents.json")
df = pd.DataFrame(data['intents'])

# Flatten intents into DataFrame
dic = {"tag": [], "patterns": [], "responses": []}
for i in range(len(df)):
    tag = df.iloc[i]['tag']
    ptrns = df.iloc[i]['patterns']
    rspns = df.iloc[i]['responses']
    for p in ptrns:
        dic['tag'].append(tag)
        dic['patterns'].append(p)
        dic['responses'].append(rspns)

df = pd.DataFrame(dic)

# Preprocessing function
def preprocess_text(s):
    s = re.sub(r'[^a-zA-Z\']', ' ', s).lower().strip()
    return " ".join(s.split())

df['patterns'] = df['patterns'].apply(preprocess_text)
df['tag'] = df['tag'].apply(preprocess_text)

# Load API key securely
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("GEMINI_API_KEY is not set in .env")

genai.configure(api_key=API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# TF-IDF Vectorization
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(df["patterns"])

# Create directories for audio files
AUDIO_DIR = "audio_responses"
UPLOAD_DIR = "audio_uploads"
os.makedirs(AUDIO_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Speech recognition setup
recognizer = sr.Recognizer()

def find_best_match(user_input):
    input_vec = vectorizer.transform([user_input])
    similarities = cosine_similarity(input_vec, X).flatten()
    best_match_idx = similarities.argmax()
    
    if similarities[best_match_idx] < 0.5:
        return None
    
    responses = df.iloc[best_match_idx]["responses"]
    return random.choice(responses) if isinstance(responses, list) else responses

def generate_response_with_rag(user_input):
    retrieved_document = find_best_match(user_input)
    if retrieved_document:
        return retrieved_document
    try:
        response = model.generate_content(user_input)
        return response.text.strip()[:200] if response else "I'm here for you. Tell me more."
    except Exception as e:
        return f"Error generating response: {str(e)}"

@app.route('/chat', methods=['POST'])
def chat():
    try:
        user_message = None
        
        if "audio_file" in request.files:
            audio_file = request.files["audio_file"]
            audio_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}.wav")
            audio_file.save(audio_path)
            with sr.AudioFile(audio_path) as source:
                audio_data = recognizer.record(source)
                user_message = recognizer.recognize_google(audio_data)
        
        if not user_message:
            data = request.get_json()
            user_message = data.get("message")
        
        if not user_message:
            return jsonify({"response": "Error: No input message or audio provided."}), 400
        
        if any(word in user_message.lower() for word in ["bye", "thanks"]):
            return jsonify({"response": "Goodbye! Feel free to chat again anytime!"}), 200
        
        response_text = generate_response_with_rag(user_message)
        
        tts = gTTS(response_text, lang="en")
        audio_file_path = os.path.join(AUDIO_DIR, f"{uuid.uuid4()}.mp3")
        tts.save(audio_file_path)
        
        audio_url = url_for('get_audio', filename=os.path.basename(audio_file_path), _external=True)
        
        return jsonify({"response": response_text, "audio_url": audio_url, "follow_up": "Is there anything else you'd like to ask?"})
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
