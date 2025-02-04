# **SentIO - AI Emotional Support Chatbot**  
🌟**SentIO** is an intelligent conversational agent designed to provide **emotional support and guidance** to users in distress. It leverages **advanced Natural Language Processing (NLP)** and **Retrieval-Augmented Generation (RAG)** to create meaningful, empathetic, and context-aware responses.  

Unlike traditional rule-based chatbots, **SentIO** adapts dynamically to users' emotions, understands context across multiple interactions, and provides **real-time emotional assistance**. While it is not a substitute for therapy, it serves as a **first point of contact** for individuals seeking emotional comfort, self-help strategies, or mental health resources.  

---

## 🚀 **Live Demo**  
🔗 **[SentIO Deployed Link](https://emot-chtabot-2.onrender.com/)**  

🎥 **[YouTube Demo](https://www.youtube.com/watch?v=7js-tPy3AAw)**  

---

## 🛠 **Tech Stack**  

### **Frontend**  
- ⚡ **React + Vite** → Fast and interactive UI for smooth user experience.  
- 🌐 **Node.js** → Manages API requests and ensures seamless communication.  

### **Backend**  
- 🗄 **MongoDB** → Stores chat histories and user interactions securely.  
- 🚀 **Express.js** → Handles backend logic and API endpoints efficiently.  

### **Machine Learning**  
- 🤖 **Gemini API** → Provides advanced NLP for empathetic, context-aware responses.  
- 📚 **RAG (Retrieval-Augmented Generation)** → Enhances chatbot responses with relevant information.  
- 🧠 **Flask** → Hosts and integrates deep learning-based emotional support models.  

### **Deployment**  
- 🌍 **Heroku** → Backend hosting for scalable chatbot operations.  
- 🌟 **Netlify** → Frontend deployment for a fast, accessible user experience.  

---

## 🔥 **Features**  
✅ **24/7 Emotional Support** – Always available to listen and respond with empathy.  
✅ **Personalized Conversations** – Adapts responses based on user interaction history.  
✅ **Secure & Private** – Chat history is securely stored for better continuity.  
✅ **Text & Voice Input** – Users can interact via text or speech recognition.  
✅ **Dynamic Responses** – Uses retrieval-augmented generation (RAG) for improved accuracy.  

### Instructions to Run **Sentio** Project
---

### **1. Frontend (React App)**

1. **Navigate to the frontend directory**:
   ```bash
   cd client
   ```

2. **Install the dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

   - This will start the React development server, and you can access the frontend at [http://localhost:5173](http://localhost:5173).

---

### **2. Backend (Express.js Server)**

1. **Navigate to the backend directory**:
   ```bash
   cd server
   ```

2. **Install the dependencies**:
   ```bash
   npm install
   ```

3. **Start the backend server**:
   ```bash
   npm start
   ```

   - This will start the Express.js server, and the backend API will be available on [http://localhost:4000](http://localhost:4000).

---

### **3. Model (Flask Server for AI Integration)**

1. **Navigate to the model directory**:
   ```bash
   cd model
   ```

2. **Run the Python model script**:
   ```bash
   python gem_rag_new.py
   ```

   - This will start the Flask server, integrating the machine learning models that provide emotional support. The Flask server will run on [http://localhost:5000](http://localhost:5000) (or the port defined in your script).

---

### **Final Setup Overview:**

1. **Frontend**: Runs on React (client-side) and communicates with the backend API.
2. **Backend**: Runs on Express.js and handles routing, database operations, and communication with the model.
3. **Model**: Runs a Flask-based server which integrates the AI/ML model to provide real-time emotional support via Gemini and RAG.
