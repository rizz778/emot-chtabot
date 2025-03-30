from flask import Flask, request, jsonify, render_template
import cv2
import numpy as np
import base64
import time
from deepface import DeepFace

app = Flask(__name__)

IMAGE_PATH = "captured_image.jpg"  # Path to save the captured image

def capture_image():
    cap = cv2.VideoCapture(0)  # Open webcam
    if not cap.isOpened():
        return None, "Error: Could not open webcam"

    # Allow the camera to adjust
    print("Adjusting camera... Please wait for 5 seconds.")
    time.sleep(5)  # Give more time for the camera to adjust

    # Show live preview before capturing the image
    print("Live preview started. Get ready!")
    for i in range(50):  # Capture more frames for adjustment
        ret, frame = cap.read()
        if not ret:
            cap.release()
            return None, "Error: Failed to read frame"
        cv2.imshow("Live Preview - Get Ready!", frame)
        cv2.waitKey(100)  # Display each frame for 100ms

    print("Capturing image now...")
    ret, frame = cap.read()  # Take the final picture
    cap.release()  # Release webcam

    if not ret:
        return None, "Error: Failed to capture image"

    # Save image
    cv2.imwrite(IMAGE_PATH, frame)

    # Show the captured image for a longer time (5 seconds)
    img = cv2.imread(IMAGE_PATH)
    cv2.imshow("Captured Image", img)
    cv2.waitKey(5000)  # Display for 5 seconds
    cv2.destroyAllWindows()

    # Encode image as base64
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
        # Load the saved image
        img = cv2.imread(IMAGE_PATH)

        # Predict emotion using DeepFace
        result = DeepFace.analyze(img, actions=['emotion'], enforce_detection=False)

        return jsonify({'emotion': result[0]['dominant_emotion'], 'image_path': IMAGE_PATH})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
