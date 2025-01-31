import streamlit as st
import google.generativeai as genai
from gtts import gTTS
import os
import uuid
import speech_recognition as sr

# Configure the Gemini API
def configure_genai(api_key):
    genai.configure(api_key=api_key)
    return genai.GenerativeModel("gemini-1.5-flash")

# Replace with your actual Gemini API key
API_KEY = "AIzaSyD8-W295SU5aMKlQx9UFpk64zvDTkR1L30"
try:
    model = configure_genai(api_key=API_KEY)
except Exception as e:
    st.error(f"Failed to initialize Gemini model: {str(e)}")

# Temporary directory for storing audio files
AUDIO_DIR = "audio_responses"
os.makedirs(AUDIO_DIR, exist_ok=True)

# Initialize Speech Recognition
recognizer = sr.Recognizer()

# Initialize or reset the conversation history
if "conversation" not in st.session_state:
    st.session_state.conversation = []

# App UI
st.title("Chat with Gemini AI")

# User input type
input_type = st.radio("Choose input type:", ("Text", "Speech"), index=0)

def display_conversation():
    """Display the chat history."""
    for message in st.session_state.conversation:
        if message["role"] == "user":
            st.write(f"**You:** {message['message']}")
        else:
            st.write(f"**Bot:** {message['message']}")

def generate_response(user_message):
    """Generate a bot response and update the conversation."""
    try:
        response = model.generate_content(user_message)
        bot_response = response.text.strip()
        st.session_state.conversation.append({"role": "user", "message": user_message})
        st.session_state.conversation.append({"role": "bot", "message": bot_response})
        return bot_response
    except Exception as e:
        st.error(f"Failed to get a response: {str(e)}")
        return None

def text_to_speech(text):
    """Convert bot response to speech and save as an audio file."""
    try:
        tts = gTTS(text, lang="en")
        audio_file = os.path.join(AUDIO_DIR, f"{uuid.uuid4()}.mp3")
        tts.save(audio_file)
        return audio_file
    except Exception as e:
        st.error(f"Failed to convert text to speech: {str(e)}")
        return None

# Handle Text Input
if input_type == "Text":
    user_message = st.text_input("Your message:")

    if user_message:
        if any(word in user_message.lower() for word in ["bye", "thanks"]):
            st.session_state.conversation.append({"role": "bot", "message": "Goodbye! Feel free to chat again anytime!"})
            st.session_state.conversation = []  # Clear conversation history
            st.write("**Bot:** Goodbye! Feel free to chat again anytime!")
        else:
            bot_response = generate_response(user_message)
            if bot_response:
                display_conversation()
                audio_file = text_to_speech(bot_response)
                if audio_file:
                    st.audio(audio_file)

# Handle Speech Input
elif input_type == "Speech":
    st.subheader("Speak your message:")
    if st.button("Start Listening"):
        try:
            with sr.Microphone() as source:
                st.write("Listening...")
                recognizer.adjust_for_ambient_noise(source)
                audio_data = recognizer.listen(source)

            user_message = recognizer.recognize_google(audio_data)
            st.write(f"**You said:** {user_message}")

            if any(word in user_message.lower() for word in ["bye", "thanks"]):
                st.session_state.conversation.append({"role": "bot", "message": "Goodbye! Feel free to chat again anytime!"})
                st.session_state.conversation = []  # Clear conversation history
                st.write("**Bot:** Goodbye! Feel free to chat again anytime!")
            else:
                bot_response = generate_response(user_message)
                if bot_response:
                    display_conversation()
                    audio_file = text_to_speech(bot_response)
                    if audio_file:
                        st.audio(audio_file)

        except sr.UnknownValueError:
            st.error("Sorry, I couldn't understand your speech. Please try again.")
        except sr.RequestError as e:
            st.error(f"Speech recognition error: {str(e)}")
        except Exception as e:
            st.error(f"Error: {str(e)}")
