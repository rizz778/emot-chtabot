import faiss
from sentence_transformers import SentenceTransformer
import streamlit as st
import time
import pandas as pd
import numpy as np
import requests
import speech_recognition as sr

API_URL = "https://api-inference.huggingface.co/models/openai-community/gpt2"
headers = {"Authorization": "Bearer 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"}

recognizer = sr.Recognizer()

# Function to query Hugging Face API
def query_api(payload):
    while True:
        response = requests.post(API_URL, headers=headers, json=payload)
        result = response.json()
        if 'error' in result and 'loading' in result['error']:
            print("Model is loading, waiting for it to be ready...")
            time.sleep(10)
        else:
            return result

# Load retriever index and embedding model
retriever_index = faiss.read_index("rag_index.faiss")
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
df = pd.read_csv('cleaned_counsel_chat (1).csv')

class RAGPipeline:
    def __init__(self, retriever, generator, tokenizer, embedding_model, data):
        self.retriever = retriever
        self.generator = generator
        self.tokenizer = tokenizer
        self.embedding_model = embedding_model
        self.data = data

    def retrieve(self, user_query, top_k=3):
        query_embedding = self.embedding_model.encode([user_query])
        distances, indices = self.retriever.search(np.array(query_embedding), k=top_k)
        retrieved_texts = [self.data.iloc[i]["answerText"] for i in indices[0] if i < len(self.data)]
        return " ".join(retrieved_texts)

    def generate(self, user_query, topics=None):
        query_with_topics = f"Topics: {topics}. Question: {user_query}" if topics else user_query
        context = self.retrieve(query_with_topics)
        prompt = f"Context: {context} Question: {user_query}"
        payload = {"inputs": prompt}
        response = query_api(payload)
        if response and isinstance(response, list) and "generated_text" in response[0]:
            return response[0]["generated_text"]
        else:
            return "Error: Unexpected response format"

# Initialize the RAG pipeline
rag_pipeline = RAGPipeline(retriever=retriever_index, generator=None, tokenizer=None, embedding_model=embedding_model, data=df)

# Streamlit UI Setup
st.title("Speech and Text Chatbot")
st.header("Interactive RAG Chatbot with Speech Input")

# Speech to Text Function
def speech_to_text():
    with sr.Microphone() as source:
        st.write("Listening for your question...")
        recognizer.adjust_for_ambient_noise(source)
        audio = recognizer.listen(source)
        try:
            st.write("Recognizing...")
            text = recognizer.recognize_google(audio)
            return text
        except sr.UnknownValueError:
            st.write("Sorry, could not understand the audio")
            return ""
        except sr.RequestError:
            st.write("Could not request results, check your internet connection")
            return ""

# Input from text or speech
query=""
input_method = st.radio("Choose input method:", ("Text", "Speech"))

if input_method == "Text":
    query = st.text_input("Enter your query:")
elif input_method == "Speech":
    if st.button("Start Recording"):
        query = speech_to_text()
        st.write(f"You said: {query}")

# Generate response if query exists
if query:
    response = rag_pipeline.generate(query)
    st.write("Response:", response)
