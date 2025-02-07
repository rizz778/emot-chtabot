import axios from 'axios';
import { exec, execSync } from "child_process";
import cors from "cors";
import dotenv from "dotenv";
import voice from "elevenlabs-node";
import express from "express";
import { promises as fs } from "fs";
import { readFileSync, writeFileSync, existsSync } from 'fs'; 
import * as mm from 'music-metadata';
import { phonemize } from 'phonemize';
import fetch from "node-fetch"; // Add this import for making HTTP requests
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const audiosDir = path.resolve(__dirname, "audios");

const fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};
// Ensure audios directory exists

dotenv.config();

const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
const huggingFaceToken = process.env.HF_TOKEN; // Add your Hugging Face token to .env
const voiceID = "cgSgspJ2msm6clMCkdW9";

const app = express();
app.use(express.json());
app.use(cors());
const port = 3000;
ffmpeg.setFfmpegPath(ffmpegPath);
app.get("/", (req, res) => {
  console.log("GET / called"); // Debugging log
  res.send("Hello World!");
});

app.get("/voices", async (req, res) => {
  console.log("GET /voices called"); // Debugging log
  const voices = await voice.getVoices(elevenLabsApiKey);
  console.log("Voices retrieved:", voices); // Debugging log
  res.send(voices);
});

const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    console.log(`Executing command: ${command}`); // Debugging log
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`); // Debugging log
        reject(error);
      }
      console.log(`stdout: ${stdout}`); // Debugging log
      console.error(`stderr: ${stderr}`); // Debugging log
      resolve(stdout);
    });
  });
};



// Simulate phoneme extraction (replace this with an actual phoneme extraction function)


// Function to get the duration of the audio file

const getAudioDuration = async (filePath) => {
  try {
    const metadata = await mm.parseFile(filePath);
    return metadata.format.duration; // Duration in seconds
  } catch (error) {
    console.error("Error getting audio duration:", error);
    return null;
  }
};
const phonemeToViseme = {
  p: "B", b: "B", m: "B",
  d: "C", t: "C", n: "C", l: "C",
  h: "H", H: "H",
  f: "E", v: "E",
  ʃ: "F", ʒ: "F", tʃ: "F", dʒ: "F",
  j: "G", w: "G",
  θ: "H", ð: "H",
  s: "A", z: "A",
  k: "A", g: "A",
  r: "A",
  a: "X", e: "X", i: "X", o: "X", u: "X"
};
// Function to generate phoneme JSON output
const generateTimedPhonemes = async (text, audioPath) => {
  console.log("Processing text:", text);

  const phonemes = phonemize(text);
  console.log("Phonemize Output:", phonemes);
  if (!phonemes || typeof phonemes !== "string") {
    console.error("Phonemize did not return a valid string.");
    return null;
  }

  const phonemeArray = phonemes.split(" ");
  console.log("Phonemize Array Output:", phonemeArray);
  if (phonemeArray.length === 0) {
    console.error("No phonemes generated.");
    return null;
  }

  let totalDuration = text.length * 0.1; // Default estimated duration

  if (audioPath && (await fileExists(audioPath))) {
    totalDuration = await getAudioDuration(audioPath) || 1.5;
  }

  console.log(`Total estimated duration: ${totalDuration}s`);

  const numPhonemes = phonemeArray.length;
  const phonemeDuration = totalDuration / numPhonemes;

  let startTime = 0;
  const mouthCues = phonemeArray.map((phoneme) => {
    const cleanedPhoneme = phoneme.replace(/[ˈˌ!?.]/g, "").split("");; // Remove stress marks and punctuation
    const viseme = cleanedPhoneme
    .map(p => phonemeToViseme[p] || "X") // Map phoneme to viseme
    .find(v => v !== "X") || "X";
    const endTime = startTime + phonemeDuration;
    const entry = { start: parseFloat(startTime.toFixed(2)), end: parseFloat(endTime.toFixed(2)), value: viseme };
    startTime = endTime;
    return entry;
  });

  console.log("Returning Data:", {
    metadata: { soundFile: audioPath, duration: totalDuration },
    mouthCues
  });

  return {
    metadata: {
      soundFile: audioPath,
      duration: totalDuration
    },
    mouthCues
  };
};

// Function to convert MP3 to WAV using ffmpeg
const convertMp3ToWav = (mp3File, wavFile) => {
  return new Promise((resolve, reject) => {
    ffmpeg(mp3File)
      .output(wavFile)
      .audioCodec('pcm_s16le')
      .on('end', () => {
        console.log(`MP3 to WAV conversion completed.`);
        resolve();
      })
      .on('error', (err) => {
        console.error('Error during conversion:', err);
        reject(err);
      })
      .run();
  });
};

// Main function to process lip-syncing
const lipSyncMessage = async (message, text) => {
  const time = new Date().getTime();
  console.log(`Starting phoneme extraction for message: "${text}"`);

  const mp3File = `audios/message_${message}.mp3`;
  const wavFile = `audios/message_${message}.wav`;
  const jsonFile = `audios/message_${message}.json`;

  // Convert MP3 to WAV
  try {
    // Convert MP3 to WAV
    await convertMp3ToWav(mp3File, wavFile);

    // Generate phoneme timings
    const phonemeData = await generateTimedPhonemes(text, wavFile);

    // Save phoneme JSON file
    await fs.writeFile(jsonFile, JSON.stringify(phonemeData, null, 2));

    console.log(`Phoneme JSON saved to: ${jsonFile}`);
    // console.log(`Lip sync completed in ${Date.now() - startTime}ms`);
  } catch (error) {
    console.error("Error during lip sync process:", error);
  }
};



// Function to call Hugging Face GPT-2 model
const generateTextWithHuggingFace = async (prompt) => {
  console.log("Generating text with Hugging Face..."); // Debugging log
  const response = await fetch(
    "https://api-inference.huggingface.co/models/mistralai/mistral-7b-instruct-v0.3",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${huggingFaceToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_length: 1000,
          temperature: 0.6,
          return_full_text : false,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Hugging Face API error: ${response.statusText}`);
  }

  const data = await response.json();
  console.log("Generated text:", data[0].generated_text); // Debugging log
  return data[0].generated_text;
};

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
  console.log("POST /chat called with user message:", userMessage); // Debugging log

  if (!userMessage) {
    console.log("No user message received, sending default response"); // Debugging log
    res.send({
      messages: [
        {
          text: "Hello. How was your day?",
          audio: await audioFileToBase64("audios/intro_0.wav"),
          lipsync: await readJsonTranscript("audios/intro_0.json"),
          facialExpression: "smile",
          animation: "Talking_1",
        },
      ],
    });
    return;
  }

  if (!elevenLabsApiKey || !huggingFaceToken) {
    console.log("API keys missing, sending error response"); // Debugging log
    res.send({
      messages: [
        {
          text: "Don't forget to add your API keys!",
          audio: await audioFileToBase64("audios/api_0.wav"),
          lipsync: await readJsonTranscript("audios/api_0.json"),
          facialExpression: "angry",
          animation: "Angry",
        },
      ],
    });
    return;
  }

  try {
    // Generate response using Hugging Face GPT-2
    const prompt = `
  You are a virtual therapist.
  Always reply with a JSON array of messages, with a maximum of 3 messages.
  Each message must have text, facialExpression, and animation properties.
  The different facial expressions are: smile, sad, angry, surprised, funnyFace, and default.
  The different animations are: Talking_0, Talking_1, Talking_2, Crying, Laughing, Rumba, Idle, Terrified, and Angry.
  IMPORTANT RULES:
- Do NOT add any explanations, headers, or additional text.
- ONLY output a valid JSON array.
- Your response must be strictly JSON format and nothing else.
  Respond to the following user message with a valid JSON array of messages:
  User message: "${userMessage}"
  
  Format your response as follows:
  [
    {
      "text": "Your response here",
      "facialExpression": "default",
      "animation": "Talking_0"
    }
  ]
`;
    const generatedText = await generateTextWithHuggingFace(prompt);

    // Parse the generated text as JSON
    let messages = JSON.parse(generatedText);
    console.log("Parsed messages:", messages); // Debugging log
    if (messages.messages) {
      messages = messages.messages; // Handle cases where the response is nested
    }

    // Generate audio and lip sync for each message
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      console.log(`Generating audio for message ${i}: ${message.text}`); // Debugging log
      const fileName = path.join(audiosDir, `message_${i}.mp3`);
      const textInput = message.text;
      await voice.textToSpeech(elevenLabsApiKey, voiceID, fileName, textInput);
      await lipSyncMessage(i, message.text);
      message.audio = await audioFileToBase64(fileName);
      message.lipsync = await readJsonTranscript(`audios/message_${i}.json`);
      console.log(`Audio and lipsync generated for message ${i}`); // Debugging log
    }

    res.send({ messages });
  } catch (error) {
    console.error("Error generating response:", error);
    res.status(500).send({ error: "Failed to generate response" });
  }
});

const readJsonTranscript = async (file) => {
  console.log(`Reading JSON transcript from file: ${file}`); // Debugging log
  const data = await fs.readFile(file, "utf8");
  return JSON.parse(data);
};

const audioFileToBase64 = async (file) => {
  console.log(`Converting audio file to base64: ${file}`); // Debugging log
  const data = await fs.readFile(file);
  return data.toString("base64");
};

app.listen(port, () => {
  console.log(`Sentio listening on port ${port}`); // Debugging log
});
