import requests
import pandas as pd
from sentence_transformers import SentenceTransformer, util
from transformers import pipeline
from gtts import gTTS
import logging
from io import BytesIO
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
import faiss
import numpy as np

logging.basicConfig(level=logging.INFO)

app = Flask(__name__)
CORS(app)


API_URL = "https://api-inference.huggingface.co/models/openai-community/gpt2"
HEADERS = {"Authorization": "Bearer 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"}


embedding_model = SentenceTransformer('sentence-transformers/multi-qa-MiniLM-L6-cos-v1', use_auth_token="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")

df = pd.read_csv("cleaned_counsel_chat.csv")

corpus = (df["answerText"]).tolist()  
corpus_embeddings = embedding_model.encode(corpus, convert_to_numpy=True)


retriever_index = faiss.IndexFlatL2(corpus_embeddings.shape[1])
retriever_index.add(corpus_embeddings)
logging.info("FAISS index created with cleaned_counsel_chat.csv data.")

emotion_classifier = pipeline("text-classification", model="bhadresh-savani/distilbert-base-uncased-emotion")

class RAGPipelineWithAPI:
    def __init__(self, retriever, embedding_model, corpus, corpus_df):
        self.retriever = retriever
        self.embedding_model = embedding_model
        self.corpus = corpus
        self.corpus_df = corpus_df  

    def retrieve_context(self, query, top_k=3):
        """Retrieve the most relevant context from the FAISS index."""
        query_embedding = self.embedding_model.encode([query], convert_to_numpy=True)
        distances, indices = self.retriever.search(query_embedding, top_k)
        

        retrieved_contexts = []
        for i in indices[0]:
            question = self.corpus_df.iloc[i]["questionText"]
            answer = self.corpus_df.iloc[i]["answerText"]
            retrieved_contexts.append(f"Q: {question}\nA: {answer}")
        
        return " ".join(retrieved_contexts)

    def query_gpt2_api(self, prompt):
        """Call GPT-2 API with the given prompt."""
        payload = {"inputs": prompt}
        response = requests.post(API_URL, headers=HEADERS, json=payload)
        response_data = response.json()

        # Log the entire response to see its structure
        logging.info(f"GPT-2 API Response: {response_data}")

        # Check if the response is a list or dict
        if isinstance(response_data, list):
            if len(response_data) > 0 and "generated_text" in response_data[0]:
                return response_data[0]["generated_text"]
            else:
                logging.error("Error: Expected 'generated_text' in response, but none found.")
                return "I'm here to help. Could you please provide more details?"
        elif isinstance(response_data, dict) and "generated_text" in response_data:
            return response_data["generated_text"]
        else:
            logging.error("Unexpected response format: Missing 'generated_text'.")
            return "I'm here to help. Could you please provide more details?"

    def generate_response(self, user_query, detected_emotion):
        """Generate response by augmenting the query with retrieved context."""
        retrieved_context = self.retrieve_context(user_query)
        dialog_input = f"Context: {retrieved_context}\nUser: {user_query}\nBot:"
        response_text = self.query_gpt2_api(dialog_input)

        if len(response_text.split()) < 5:
            response_text = (
                "I'm here to help. It sounds like you're going through a tough time. "
                "Have you considered speaking with a professional or trying mindfulness exercises?"
            )

        return response_text


def detect_emotion(text):
    """Detect emotion from text using the emotion classifier."""
    emotions = emotion_classifier(text)
    return emotions[0]["label"]


def generate_emotional_audio(response_text, emotion):
    """Generate emotional audio response using gTTS."""
    emotion_to_voice = {
        "joy": "en-au",
        "anger": "en-us",
        "sadness": "en-uk",
        "fear": "en-in",
        "surprise": "en-za",
        "neutral": "en"
    }
    voice = emotion_to_voice.get(emotion, "en")
    tts = gTTS(response_text, lang=voice)
    audio_buffer = BytesIO()
    tts.write_to_fp(audio_buffer)
    audio_buffer.seek(0)
    audio_data = audio_buffer.read()
    b64_audio = base64.b64encode(audio_data).decode()
    return b64_audio


# Initialize RAG pipeline
rag_pipeline = RAGPipelineWithAPI(
    retriever=retriever_index,
    embedding_model=embedding_model,
    corpus=corpus,
    corpus_df=df
)


@app.route("/chat", methods=["POST"])
def chat():
    """Chat endpoint for the Flask app."""
    data = request.json
    query = data.get("query", "")
    if not query:
        return jsonify({"error": "Query is required"}), 400

    emotion = detect_emotion(query)
    response = rag_pipeline.generate_response(query, emotion)
    audio = generate_emotional_audio(response, emotion)

    return jsonify({
        "response": response,
        "emotion": emotion,
        "audio": audio  # Base64 encoded audio
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)


