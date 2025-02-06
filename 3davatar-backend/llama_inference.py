import os
from dotenv import load_dotenv
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
from huggingface_hub import login
import time

# Load environment variables from .env file
load_dotenv()

print("Starting LLaMA inference script...")

# Check if Hugging Face token is loaded
hf_token = os.getenv("HF_TOKEN")
print(f"Loaded HF_TOKEN")
if not hf_token:
    print("HF_TOKEN is missing!")
    raise ValueError("Hugging Face API token is not set. Please set the 'HF_TOKEN' environment variable.")

# Log in to Hugging Face
try:
    print("Logging into Hugging Face...")
    login(token=hf_token)
    print("Logged in successfully.")
except Exception as e:
    print(f"Error logging into Hugging Face: {e}")
    raise

# Load LLaMA model and tokenizer
model_name = "openai-community/gpt2"  # Example, use the correct model you want

# Check if CUDA (GPU) is available
print(f"CUDA available: {torch.cuda.is_available()}")
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"Using device: {device}")

start_time = time.time()
try:
    print(f"Loading tokenizer for {model_name}...")
    tokenizer = AutoTokenizer.from_pretrained(model_name, token=hf_token)
    print(f"Tokenizer loaded successfully in {time.time() - start_time:.2f} seconds.")
except Exception as e:
    print(f"Error loading tokenizer: {e}")
    raise

start_time = time.time()
try:
    print(f"Loading model {model_name}...")
    model = AutoModelForCausalLM.from_pretrained(model_name, token=hf_token)
    model.to(device)  # Ensure model is on the correct device
    print(f"Model loaded successfully in {time.time() - start_time:.2f} seconds.")
except Exception as e:
    print(f"Error loading model: {e}")
    raise

def generate_response(input_text):
    print(f"Received input text: {input_text}")

    # Tokenize input text
    print("Tokenizing input...")
    inputs = tokenizer(input_text, return_tensors="pt").to(device)
    print("Tokenization complete.")

    # Generate response from model
    print("Generating response... (This may take some time)")
    outputs = model.generate(inputs['input_ids'], max_length=100, num_return_sequences=1)
    print("Response generation complete.")

    # Decode output and return response
    print("Decoding response...")
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    print(f"Decoded response: {response}")

    return response

if __name__ == "__main__":
    input_text = "Hello, how can I help you today?"
    print("Starting inference...")
    response = generate_response(input_text)
    print("Final response:", response)
