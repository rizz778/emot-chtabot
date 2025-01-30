from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import faiss
from sentence_transformers import SentenceTransformer
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
from gtts import gTTS
import numpy as np
from io import BytesIO
import base64
import speech_recognition as sr
import logging
import pyaudio

# Enable logging
logging.basicConfig(level=logging.INFO)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Load GPT-2 model and tokenizer
gpt2_model_name = "gpt2"
gpt2_tokenizer = AutoTokenizer.from_pretrained(gpt2_model_name)
gpt2_model = AutoModelForCausalLM.from_pretrained(gpt2_model_name)
gpt2_tokenizer.pad_token = gpt2_tokenizer.eos_token
gpt2_model.config.pad_token_id = gpt2_tokenizer.eos_token_id

# Load retriever index and embedding model
retriever_index = faiss.read_index("rag_index.faiss")
embedding_model = SentenceTransformer('multi-qa-MiniLM-L6-cos-v1')

# Load emotion classification pipeline
emotion_classifier = pipeline("text-classification", model="bhadresh-savani/distilbert-base-uncased-emotion")

# Speech recognizer setup
recognizer = sr.Recognizer()

class RAGPipelineWithLLM:
    def __init__(self, retriever, embedding_model, gpt2_model, gpt2_tokenizer):
        self.retriever = retriever
        self.embedding_model = embedding_model
        self.gpt2_model = gpt2_model
        self.gpt2_tokenizer = gpt2_tokenizer

    def generate_response(self, user_query, detected_emotion):
        dialog_input = f"User: {user_query}\nBot:"
        inputs = self.gpt2_tokenizer(dialog_input, return_tensors="pt", truncation=True, padding="max_length", max_length=self.gpt2_model.config.n_positions)
        outputs = self.gpt2_model.generate(inputs["input_ids"], attention_mask=inputs["attention_mask"], max_new_tokens=150, do_sample=True, temperature=0.8, top_k=50, top_p=0.9)
        response_text = self.gpt2_tokenizer.decode(outputs[0], skip_special_tokens=True).split("Bot:")[-1].strip()
        if len(response_text.split()) < 5:
            response_text = "I'm here to help. It sounds like you're going through a tough time. Have you considered speaking with a professional or trying mindfulness exercises?"
        return response_text

rag_pipeline = RAGPipelineWithLLM(retriever=retriever_index, embedding_model=embedding_model, gpt2_model=gpt2_model, gpt2_tokenizer=gpt2_tokenizer)

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    user_query = data.get("message", "")
    if not user_query:
        return jsonify({"error": "No message provided"}), 400
    emotion = emotion_classifier(user_query)[0]["label"]
    response_text = rag_pipeline.generate_response(user_query, emotion)

    # Convert text response to speech using gTTS
    tts = gTTS(text=response_text, lang="en")
    audio_buffer = BytesIO()
    tts.write_to_fp(audio_buffer)
    audio_buffer.seek(0)
    
    # Encode audio to base64
    audio_base64 = base64.b64encode(audio_buffer.read()).decode("utf-8")
    
    return jsonify({"response": response_text, "emotion": emotion, "audio": audio_base64})

@app.route("/speech-to-text", methods=["POST"])
def speech_to_text():
    """Converts speech audio to text."""
    try:
        audio_file = request.files["audio"]
        with sr.AudioFile(audio_file) as source:
            audio_data = recognizer.record(source)
            text = recognizer.recognize_google(audio_data)
        return jsonify({"text": text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)



# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import faiss
# from sentence_transformers import SentenceTransformer
# import torch
# from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
# from gtts import gTTS
# import numpy as np
# from io import BytesIO
# import base64
# import speech_recognition as sr
# import logging

# # Enable logging
# logging.basicConfig(level=logging.INFO)

# # Initialize Flask app
# app = Flask(__name__)
# CORS(app)

# # Load GPT-2 model and tokenizer
# gpt2_model_name = "gpt2"
# gpt2_tokenizer = AutoTokenizer.from_pretrained(gpt2_model_name)
# gpt2_model = AutoModelForCausalLM.from_pretrained(gpt2_model_name)
# gpt2_tokenizer.pad_token = gpt2_tokenizer.eos_token
# gpt2_model.config.pad_token_id = gpt2_tokenizer.eos_token_id

# # Load retriever index and embedding model
# retriever_index = faiss.read_index("rag_index.faiss")
# embedding_model = SentenceTransformer('multi-qa-MiniLM-L6-cos-v1')

# # Load emotion classification pipeline
# emotion_classifier = pipeline("text-classification", model="bhadresh-savani/distilbert-base-uncased-emotion")

# class RAGPipelineWithLLM:
#     def __init__(self, retriever, embedding_model, gpt2_model, gpt2_tokenizer):
#         self.retriever = retriever
#         self.embedding_model = embedding_model
#         self.gpt2_model = gpt2_model
#         self.gpt2_tokenizer = gpt2_tokenizer

#     def generate_response(self, user_query, detected_emotion):
#         dialog_input = f"User: {user_query}\nBot:"
#         inputs = self.gpt2_tokenizer(dialog_input, return_tensors="pt", truncation=True, padding="max_length", max_length=self.gpt2_model.config.n_positions)
#         outputs = self.gpt2_model.generate(inputs["input_ids"], attention_mask=inputs["attention_mask"], max_new_tokens=150, do_sample=True, temperature=0.8, top_k=50, top_p=0.9)
#         response_text = self.gpt2_tokenizer.decode(outputs[0], skip_special_tokens=True).split("Bot:")[-1].strip()
#         if len(response_text.split()) < 5:
#             response_text = "I'm here to help. It sounds like you're going through a tough time. Have you considered speaking with a professional or trying mindfulness exercises?"
#         return response_text

# rag_pipeline = RAGPipelineWithLLM(retriever=retriever_index, embedding_model=embedding_model, gpt2_model=gpt2_model, gpt2_tokenizer=gpt2_tokenizer)

# @app.route("/chat", methods=["POST"])
# def chat():
#     data = request.json
#     user_query = data.get("message", "")
#     if not user_query:
#         return jsonify({"error": "No message provided"}), 400
#     emotion = emotion_classifier(user_query)[0]["label"]
#     response_text = rag_pipeline.generate_response(user_query, emotion)
#     return jsonify({"response": response_text, "emotion": emotion})

# if __name__ == "__main__":
#     app.run(host="0.0.0.0", port=5000, debug=True)