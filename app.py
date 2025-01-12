import faiss
from sentence_transformers import SentenceTransformer

import streamlit as st
import time
import pandas as pd
import numpy as np
import requests

API_URL = "https://api-inference.huggingface.co/models/openai-community/gpt2"
headers = {"Authorization": "Bearer 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"}

def query_api(payload):
    while True:
        response = requests.post(API_URL, headers=headers, json=payload)
        result = response.json()
        if 'error' in result and 'loading' in result['error']:
            print("Model is loading, waiting for it to be ready...")
            time.sleep(10)  # Wait for 10 seconds before retrying
        else:
            return result

# Load retriever index
retriever_index = faiss.read_index("rag_index.faiss")
print("Retriever index loaded.")

# Load embedding model
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
print("Embedding model loaded.")

# Streamlit UI
st.title("RAG Model Demo")
st.header("Interactive Question Answering with Contextual Retrieval")

# Define RAG pipeline
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
        retrieved_texts = []
        for i in indices[0]:
            if i < len(self.data):
                retrieved_texts.append(self.data.iloc[i]["answerText"])
                return " ".join(retrieved_texts)

    def generate(self, user_query, topics=None):
        query_with_topics = f"Topics: {topics}. Question: {user_query}" if topics else user_query
        context = self.retrieve(query_with_topics)
        prompt = f"Context: {context} Question: {user_query}"
        payload = {"inputs": prompt}
        response = query_api(payload)
        print("API response:", response)  # Add this line to print the response
        if response and isinstance(response, list) and "generated_text" in response[0]:
          return response[0]["generated_text"]
        else:
          return "Error: Unexpected response format"

df = pd.read_csv('cleaned_counsel_chat (1).csv')

rag_pipeline = RAGPipeline(retriever=retriever_index, generator=None, tokenizer=None, embedding_model=embedding_model, data=df)
# Streamlit UI

query = st.text_input("Enter your query:")
if query:
    response = rag_pipeline.generate(query)
    st.write(response)