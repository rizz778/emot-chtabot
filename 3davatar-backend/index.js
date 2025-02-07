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
        responseType: "arraybuffer", // Handle the response as binary data (arraybuffer)
      }
    );

    // Write the binary audio data to a file
    const audioPath = path.join(__dirname, 'output.mp3');
    fs.writeFile(audioPath, response.data, (err) => {
      if (err) {
        console.error("Error writing audio file:", err);
        return res.status(500).json({ error: "Error writing audio file" });
      }

      // Once the file is saved, send a success message
      res.status(200).send({ message: 'API Works! Audio saved as output.mp3' });
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
