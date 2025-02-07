import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware to handle JSON requests
app.use(express.json());

// Test route for Eleven Labs API
app.get("/test-elevenlabs", async (req, res) => {
  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/cgSgspJ2msm6clMCkdW9`, // Replace VOICE_ID with your actual voice ID
      {
        text: "Testing API from Render!",
        voice_settings: { stability: 0, similarity_boost: 0 },
      },
      {
        headers: {
          "xi-api-key": process.env.ELEVEN_LABS_API_KEY, // Ensure ELEVEN_LABS_API_KEY is in your Render environment variables
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        responseType: "stream", // Audio stream response
      }
    );

    // Stream the audio response and save it as an MP3 file
    const audioStream = response.data;
    const audioPath = path.join(__dirname, 'output.mp3');

    // Pipe the audio stream to a file
    const writer = fs.createWriteStream(audioPath);
    audioStream.pipe(writer);

    // Once the file is saved, send a response
    writer.on('finish', () => {
      res.status(200).send({ message: 'API Works! Audio saved as output.mp3' });
    });

    // Handle stream errors
    writer.on('error', (error) => {
      console.error("Error writing audio file:", error);
      res.status(500).json({ error: "Error writing audio file" });
    });

  } catch (error) {
    // Handle any errors and log the response
    console.error("API Error:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.response ? error.response.data : error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
