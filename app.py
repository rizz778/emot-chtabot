# import faiss
# from sentence_transformers import SentenceTransformer
# import streamlit as st
# import pandas as pd
# import speech_recognition as sr
# from transformers import AutoModelForCausalLM, AutoTokenizer
# import numpy as np

# # Load DialogGPT model and tokenizer
# dialoggpt_model_name = "microsoft/DialoGPT-medium"
# dialoggpt_tokenizer = AutoTokenizer.from_pretrained(dialoggpt_model_name)
# dialoggpt_model = AutoModelForCausalLM.from_pretrained(dialoggpt_model_name)
# dialoggpt_tokenizer.pad_token = dialoggpt_tokenizer.eos_token
# dialoggpt_model.config.pad_token_id = dialoggpt_tokenizer.eos_token_id

# # Load retriever index and embedding model
# retriever_index = faiss.read_index("rag_index.faiss")
# embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
# df = pd.read_csv('cleaned_counsel_chat.csv')

# # Recognizer for speech input
# recognizer = sr.Recognizer()

# # Initialize session state for conversation history
# if "conversation_history" not in st.session_state:
#     st.session_state["conversation_history"] = []

# # RAG Pipeline with DialogGPT class
# class RAGPipelineWithDialogGPT:
#     def __init__(self, retriever, embedding_model, data, dialoggpt_model, dialoggpt_tokenizer):
#         self.retriever = retriever
#         self.embedding_model = embedding_model
#         self.data = data
#         self.dialoggpt_model = dialoggpt_model
#         self.dialoggpt_tokenizer = dialoggpt_tokenizer

#     def retrieve(self, user_query):
#         query_embedding = self.embedding_model.encode(user_query)
#         _, indices = self.retriever.search(np.array([query_embedding]).astype('float32'), k=5)
#         contexts = []
#         st.write("Query Embedding:", query_embedding)
#         st.write("Retrieved Indices:", indices)

#         if indices.size > 0:
#             for idx in indices[0]:
#                 if idx < len(self.data):
#                     contexts.append(self.data.iloc[idx]['answerText'])
#         if contexts:
#             return "\n".join(contexts)
#         return "I'm here to help. Please tell me more about your issue."

#     def generate_response(self, user_query):
#         context = self.retrieve(user_query)
#         history_length = 3  # Number of exchanges to include
#         conversation_history = "\n".join(st.session_state["conversation_history"][-history_length:])
#         st.write("Retrieved Context Length:", len(context))
#         st.write("Retrieved Context:", context)
#         # Add structured prompt
#         dialog_input = f"""
#         Context: {context}
#         The following is a conversation between a helpful, empathetic chatbot and a user who is seeking advice.

#         {conversation_history}
#         User: {user_query}
#         Bot:"""
        
#         st.write("Dialog Input Length:", len(dialog_input))
#         st.write("Dialog Input:", dialog_input)
#         # Tokenize input with padding and truncation
#         inputs = self.dialoggpt_tokenizer(dialog_input, return_tensors="pt", padding=True, max_length=1024, truncation=True)

#         # Generate response with controlled parameters
#         outputs = self.dialoggpt_model.generate(
#     inputs['input_ids'],
#     attention_mask=inputs['attention_mask'],
#     max_new_tokens=150,  # Generate up to 150 new tokens
#     do_sample=True,
#     temperature=0.9,
#     top_k=40,
#     top_p=0.85,
#     pad_token_id=self.dialoggpt_tokenizer.pad_token_id
# )

#         st.write("Tokenized Input IDs:", inputs['input_ids'])
#         st.write("Tokenized Input Attention Mask:", inputs['attention_mask'])

#         # Decode and filter response
#         response_text = self.dialoggpt_tokenizer.decode(outputs[0], skip_special_tokens=True)

#         st.write("Generated Output (Raw):", outputs)
#         st.write("Decoded Response (Raw):", response_text)

#         # Avoid parroting responses
#         if response_text.lower() == user_query.lower():
#             response_text = "I'm here to help. Could you tell me more?"

#         # Update conversation history
#         st.session_state["conversation_history"].append(f"User: {user_query}")
#         st.session_state["conversation_history"].append(f"Bot: {response_text}")
#         return response_text


# # Initialize RAG pipeline
# rag_pipeline = RAGPipelineWithDialogGPT(
#     retriever=retriever_index,
#     embedding_model=embedding_model,
#     data=df,
#     dialoggpt_model=dialoggpt_model,
#     dialoggpt_tokenizer=dialoggpt_tokenizer
# )

# # Streamlit UI setup
# st.title("Turnable Conversation Chatbot")
# st.header("Interactive RAG Chatbot with DialogGPT")

# # Speech-to-text function
# def speech_to_text():
#     with sr.Microphone() as source:
#         st.write("Listening for your question...")
#         recognizer.adjust_for_ambient_noise(source)
#         audio = recognizer.listen(source)
#         try:
#             st.write("Recognizing...")
#             return recognizer.recognize_google(audio)
#         except sr.UnknownValueError:
#             st.write("Sorry, could not understand the audio.")
#             return ""
#         except sr.RequestError:
#             st.write("Could not request results, check your internet connection.")
#             return ""

# # User input method
# query = ""
# input_method = st.radio("Choose input method:", ("Text", "Speech"))

# if input_method == "Text":
#     query = st.text_input("Enter your query:")
# elif input_method == "Speech":
#     if st.button("Start Recording"):
#         query = speech_to_text()
#         if query:
#             st.write(f"You said: {query}")

# # Reset button to clear conversation history
# if st.button("Reset Conversation"):
#     st.session_state["conversation_history"] = []
#     st.write("Conversation history has been cleared.")

# # Generate response and display conversation
# if query:
#     response = rag_pipeline.generate_response(query)

#     # Display conversation history
#     for message in st.session_state["conversation_history"]:
#         st.write(message)

import faiss
from sentence_transformers import SentenceTransformer
import streamlit as st
import pandas as pd
import speech_recognition as sr
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
from gtts import gTTS
import numpy as np
from io import BytesIO
import base64

# Load DialogGPT model and tokenizer
dialoggpt_model_name = "microsoft/DialoGPT-medium"
dialoggpt_tokenizer = AutoTokenizer.from_pretrained(dialoggpt_model_name)
dialoggpt_model = AutoModelForCausalLM.from_pretrained(dialoggpt_model_name)
dialoggpt_tokenizer.pad_token = dialoggpt_tokenizer.eos_token
dialoggpt_model.config.pad_token_id = dialoggpt_tokenizer.eos_token_id

# Load retriever index and embedding model
retriever_index = faiss.read_index("rag_index.faiss")
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
df = pd.read_csv('cleaned_counsel_chat.csv')

# Recognizer for speech input
recognizer = sr.Recognizer()

# Load emotion classification pipeline
emotion_classifier = pipeline("text-classification", model="bhadresh-savani/distilbert-base-uncased-emotion")

# Initialize session state for conversation history
if "conversation_history" not in st.session_state:
    st.session_state["conversation_history"] = []

# RAG Pipeline with DialogGPT class
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
        if indices.size > 0:
            for idx in indices[0]:
                if idx < len(self.data):
                    contexts.append(self.data.iloc[idx]['answerText'])
        if contexts:
            return "\n".join(contexts)
        return "I'm here to help. Please tell me more about your issue."

    def generate_response(self, user_query):
        context = self.retrieve(user_query)
        history_length = 3  # Number of exchanges to include
        conversation_history = "\n".join(st.session_state["conversation_history"][-history_length:])
        dialog_input = f"""
        Context: {context}
        The following is a conversation between a helpful, empathetic chatbot and a user who is seeking advice.

        {conversation_history}
        User: {user_query}
        Bot:"""
        
        inputs = self.dialoggpt_tokenizer(dialog_input, return_tensors="pt", padding=True, max_length=1024, truncation=True)
        outputs = self.dialoggpt_model.generate(
            inputs['input_ids'],
            attention_mask=inputs['attention_mask'],
            max_new_tokens=150,
            do_sample=True,
            temperature=0.9,
            top_k=40,
            top_p=0.85,
            pad_token_id=self.dialoggpt_tokenizer.pad_token_id
        )
        response_text = self.dialoggpt_tokenizer.decode(outputs[0], skip_special_tokens=True)
        if response_text.lower() == user_query.lower():
            response_text = "I'm here to help. Could you tell me more?"
        st.session_state["conversation_history"].append(f"User: {user_query}")
        st.session_state["conversation_history"].append(f"Bot: {response_text}")
        return response_text

# Function to classify emotion
def detect_emotion(text):
    emotions = emotion_classifier(text)
    return emotions[0]["label"]

# Function to generate emotional audio
def generate_emotional_audio(response_text, emotion):
    emotion_to_voice = {
        "joy": "en-au",  # Happy tone
        "anger": "en-us",  # Neutral or firm tone
        "sadness": "en-uk",  # Soft tone
        "fear": "en-in",  # Calm tone
        "surprise": "en-za",  # Excited tone
        "neutral": "en"  # Default tone
    }
    voice = emotion_to_voice.get(emotion, "en")
    tts = gTTS(response_text, lang=voice)
    audio_buffer = BytesIO()
    tts.write_to_fp(audio_buffer)
    audio_buffer.seek(0)
    return audio_buffer

# Function to play audio in Streamlit
def play_audio(audio_buffer):
    audio_data = audio_buffer.read()
    b64_audio = base64.b64encode(audio_data).decode()
    audio_tag = f'<audio controls autoplay><source src="data:audio/mpeg;base64,{b64_audio}" type="audio/mpeg"></audio>'
    st.markdown(audio_tag, unsafe_allow_html=True)

# Initialize RAG pipeline
rag_pipeline = RAGPipelineWithDialogGPT(
    retriever=retriever_index,
    embedding_model=embedding_model,
    data=df,
    dialoggpt_model=dialoggpt_model,
    dialoggpt_tokenizer=dialoggpt_tokenizer
)

# Streamlit UI setup
st.title("Emotion-Aware Chatbot with Audio Responses")
st.header("Interactive Chatbot with Emotional Speech Output")

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
    emotion = detect_emotion(query)
    st.write(f"Detected Emotion: {emotion}")
    st.write(f"Bot: {response}")

    # Generate and play emotional audio
    audio_buffer = generate_emotional_audio(response, emotion)
    play_audio(audio_buffer)
