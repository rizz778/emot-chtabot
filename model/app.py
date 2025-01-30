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

# Initialize session state for conversation history
if "conversation_history" not in st.session_state:
    st.session_state["conversation_history"] = []




class RAGPipelineWithGPT2:
    def __init__(self, retriever, embedding_model, data, gpt2_model, gpt2_tokenizer):
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

def detect_emotion(text):
    emotions = emotion_classifier(text)
    emotion = emotions[0]["label"]
    st.write("Detected emotion:", emotion)
    return emotion


def generate_emotional_audio(response_text, emotion):
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
    st.write("Generated audio for emotion:", emotion)
    return audio_buffer


def play_audio(audio_buffer):
    audio_data = audio_buffer.read()
    b64_audio = base64.b64encode(audio_data).decode()
    audio_tag = f'<audio controls autoplay><source src="data:audio/mpeg;base64,{b64_audio}" type="audio/mpeg"></audio>'
    st.markdown(audio_tag, unsafe_allow_html=True)


# Initialize RAG pipeline
rag_pipeline = RAGPipelineWithGPT2(
    retriever=retriever_index,
    embedding_model=embedding_model,
    data=data,
    gpt2_model=gpt2_model,
    gpt2_tokenizer=gpt2_tokenizer
)

# Streamlit UI setup
st.title("Emotion-Aware Chatbot with Audio Responses")
st.header("Interactive Chatbot with Emotional Speech Output")


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


query = ""
input_method = st.radio("Choose input method:", ("Text", "Speech"))

if input_method == "Text":
    query = st.text_input("Enter your query:")
elif input_method == "Speech":
    if st.button("Start Recording"):
        query = speech_to_text()
        if query:
            st.write(f"You said: {query}")

if st.button("Reset Conversation"):
    st.session_state["conversation_history"] = []
    st.write("Conversation history has been cleared.")

if query:
    emotion = detect_emotion(query)
    response = rag_pipeline.generate_response(query, emotion)
    st.write(f"Bot: {response}")

    audio_buffer = generate_emotional_audio(response, emotion)
    play_audio(audio_buffer)
