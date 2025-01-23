import faiss
from sentence_transformers import SentenceTransformer
import streamlit as st
import pandas as pd
import speech_recognition as sr
from transformers import AutoModelForCausalLM, AutoTokenizer
import numpy as np
from langdetect import detect

# Load DialogGPT model and tokenizer
dialoggpt_model_name = "microsoft/DialoGPT-medium"
dialoggpt_tokenizer = AutoTokenizer.from_pretrained(dialoggpt_model_name)
dialoggpt_model = AutoModelForCausalLM.from_pretrained(dialoggpt_model_name)
dialoggpt_tokenizer.pad_token = dialoggpt_tokenizer.eos_token
dialoggpt_model.config.pad_token_id = dialoggpt_tokenizer.eos_token_id

# Load retriever index and embedding model
retriever_index = faiss.read_index("rag_index.faiss")
embedding_model = SentenceTransformer('all-MiniLM-L12-v2')
df = pd.read_csv('cleaned_counsel_chat.csv')

# Recognizer for speech input
recognizer = sr.Recognizer()

# Initialize session state for conversation history
if "conversation_history" not in st.session_state:
    st.session_state["conversation_history"] = []

# RAG Pipeline with DialogGPT class
import logging

class RAGPipelineWithDialogGPT:
    def __init__(self, retriever, embedding_model, data, dialoggpt_model, dialoggpt_tokenizer):
        self.retriever = retriever
        self.embedding_model = embedding_model
        self.data = data
        self.dialoggpt_model = dialoggpt_model
        self.dialoggpt_tokenizer = dialoggpt_tokenizer

    def retrieve(self, user_query):
        query_embedding = self.embedding_model.encode(user_query)
        _, indices = self.retriever.search(np.array([query_embedding]).astype('float32'), k=5)

        contexts = []
        for idx in indices[0]:
            if idx < len(self.data):
                contexts.append(self.data.iloc[idx]['answerText'])

        retrieved_context = "\n".join(contexts) if contexts else "I'm here to help. Please tell me more about your issue."
        logging.info(f"Retrieved context: {retrieved_context}")
        return retrieved_context

    def generate_response(self, user_query):
        context = self.retrieve(user_query)

        # Prepare conversation history
        history_length = 3
        conversation_history = "\n".join(
            st.session_state.get("conversation_history", [])[-history_length:]
        )

        dialog_input = f"""
        Context: {context}
        The following is a conversation between a helpful, empathetic chatbot and a user who is seeking advice.

        {conversation_history}
        User: {user_query}
        Bot:"""

        # Tokenization with truncation
        try:
            inputs = self.dialoggpt_tokenizer(
                dialog_input,
                return_tensors="pt",
                truncation=True,
                padding=True,
                max_length=1024
            )
        except Exception as e:
            logging.error(f"Tokenization error: {e}")
            return "I'm sorry, there was an issue processing your input."

        # Debug token IDs
        max_vocab_size = self.dialoggpt_tokenizer.vocab_size
        if inputs["input_ids"].max() >= max_vocab_size:
            logging.error("Input IDs contain out-of-range token indices.")
            return "An error occurred. Please try rephrasing your input."

        # Generate response
        outputs = self.dialoggpt_model.generate(
            inputs["input_ids"],
            attention_mask=inputs["attention_mask"],
            max_new_tokens=150,
            do_sample=True,
            temperature=0.9,
            top_k=40,
            top_p=0.85
        )

        # Decode response
        response_text = self.dialoggpt_tokenizer.decode(
            outputs[0], skip_special_tokens=True
        ).split("Bot:")[-1].strip()

        # Fallback for empty responses
        if not response_text.strip():
            response_text = "Could you tell me more about your situation?"

        # Update conversation history
        st.session_state["conversation_history"] = st.session_state.get(
            "conversation_history", []
        ) + [f"User: {user_query}", f"Bot: {response_text}"]

        return response_text




# Initialize RAG pipeline
rag_pipeline = RAGPipelineWithDialogGPT(
    retriever=retriever_index,
    embedding_model=embedding_model,
    data=df,
    dialoggpt_model=dialoggpt_model,
    dialoggpt_tokenizer=dialoggpt_tokenizer
)

# Streamlit UI setup
st.title("Turnable Conversation Chatbot")
st.header("Interactive RAG Chatbot with DialogGPT")

# Speech-to-text function
def speech_to_text():
    with sr.Microphone() as source:
        st.write("Listening for your question...")
        recognizer.adjust_for_ambient_noise(source)
        audio = recognizer.listen(source)
        try:
            st.write("Recognizing...")
            return recognizer.recognize_google(audio)
        except sr.UnknownValueError:
            st.write("Sorry, could not understand the audio.")
            return ""
        except sr.RequestError:
            st.write("Could not request results, check your internet connection.")
            return ""

# User input method
query = ""
input_method = st.radio("Choose input method:", ("Text", "Speech"))

if input_method == "Text":
    query = st.text_input("Enter your query:")
elif input_method == "Speech":
    if st.button("Start Recording"):
        query = speech_to_text()
        if query:
            st.write(f"You said: {query}")

# Reset button to clear conversation history
if st.button("Reset Conversation"):
    st.session_state["conversation_history"] = []
    st.write("Conversation history has been cleared.")

# Generate response and display conversation
if query:
    response = rag_pipeline.generate_response(query)

    # Display conversation history
    for message in st.session_state["conversation_history"]:
        st.write(message)

