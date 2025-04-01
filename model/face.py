from flask import Flask, request, jsonify, render_template
import cv2
import numpy as np
import base64
import time
from deepface import DeepFace
from flask_cors import CORS
import requests
app = Flask(__name__)
CORS(app)  # Allow all requests


IMAGE_PATH = "captured_image.jpg"  # Path to save the captured image


def capture_image():
    cap = cv2.VideoCapture(0)  # Open webcam
    if not cap.isOpened():
        return None, "Error: Could not access webcam"

    print("Adjusting camera... Please wait for 3 seconds.")
    time.sleep(3)  # Allow camera to adjust

    # Capture a few frames before taking the final image
    for _ in range(10):
        ret, frame = cap.read()
        if not ret:
            cap.release()
            return None, "Error: Failed to read frame"
        cv2.imshow("Adjusting Camera...", frame)
        cv2.waitKey(50)  # Display each frame for 50ms

    print("Capturing image now...")
    ret, frame = cap.read()
    cap.release()  # Release webcam

    if not ret:
        return None, "Error: Failed to capture image"

    # Save and display the captured image
    cv2.imwrite(IMAGE_PATH, frame)
    cv2.imshow("Captured Image", frame)
    cv2.waitKey(2000)  # Show for 2 seconds
    cv2.destroyAllWindows()

    # Encode image to base64
    _, buffer = cv2.imencode('.jpg', frame)
    img_base64 = base64.b64encode(buffer).decode('utf-8')

    return img_base64, None


@app.route('/')
def home():
    return render_template("index.html")  # HTML page to trigger capture


@app.route('/capture', methods=['GET'])
def capture_and_predict():
    image_data, error = capture_image()
    if error:
        return jsonify({'error': error}), 500

    try:
        # Predict emotion
        result = DeepFace.analyze(img_path=IMAGE_PATH, actions=['emotion'], enforce_detection=False)
        detected_emotion = result[0]['dominant_emotion']

        # Send detected emotion to chatbot
        chatbot_response = requests.post("http://127.0.0.1:5001/chat", json={
            "message": f"My detected emotion is {detected_emotion}.",
            "conversation_history": [],
            "user_details": {}
        }).json()

        return jsonify({
            'emotion': detected_emotion,
            'image_base64': image_data,
            'chatbot_response': chatbot_response["response"]
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)