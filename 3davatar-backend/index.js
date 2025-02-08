import axios from 'axios';
import { exec } from "child_process";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { promises as fs } from "fs";
import { writeFileSync } from 'fs';
import * as mm from 'music-metadata';
import { phonemize } from 'phonemize';
import fetch from "node-fetch";
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

dotenv.config();

const huggingFaceToken = process.env.HF_TOKEN; // Add your Hugging Face token to .env

// Function to convert text to speech using ResponsiveVoice API
// Map language codes to ResponsiveVoice voices
const languageToVoice = {
  en: "US English Female",
  fr: "French Female",
  jp: "Japanese Female",
  hi: "Hindi Female",
  zh: "Chinese Female",
  de: "Deutsch Female",
};
const languageToInstruction = {
  en: "English",
  fr: "French (Français)",
  jp: "Japanese",
  hi: "Hindi (हिंदी)",
  zh: "Chinese (中文)",
  de: "German (Deutsch)",
};

// Function to get the appropriate voice for a given language
const getVoiceForLanguage = (language) => {
  return languageToVoice[language] || "US English Female"; // Default to English if language is not found
};

// Function to convert text to speech using ResponsiveVoice API
async function textToSpeech(text, language, outputFilename) {
  try {
    const voice = getVoiceForLanguage(language); // Get the voice based on the language
    const url = `https://code.responsivevoice.org/getvoice.php?t=${encodeURIComponent(text)}&voice=${encodeURIComponent(voice)}&lang=${encodeURIComponent(language)}&key=uJKFIn5M`;
    const response = await axios.get(url, { responseType: 'arraybuffer' });

    if (fileExists(outputFilename)) {
      console.log(`File ${outputFilename} already exists. Replacing it with new content.`);
    }

    writeFileSync(outputFilename, response.data);
    console.log(`Audio file saved as ${outputFilename}`);
  } catch (error) {
    console.error('Error fetching voice data:', error.message);
  }
}

const app = express();
app.use(express.json());
app.use(cors());
const port = 3000;
app.use(cors({
  origin: 'https://emot-chtabot-2.onrender.com', // Add the frontend URL
  methods: ['GET', 'POST'], // Allow necessary HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow headers that are needed
}));
ffmpeg.setFfmpegPath(ffmpegPath);

app.get("/", (req, res) => {
  console.log("GET / called");
  res.send("Hello World!");
});

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
  h: "D", H: "D",
  f: "E", v: "E",
  ʃ: "F", ʒ: "F", tʃ: "F", dʒ: "F",
  j: "G", w: "G",
  θ: "H", ð: "H",
  s: "A", z: "A",
  k: "A", g: "A",
  r: "A",
  a: "X", e: "X", i: "X", o: "X", u: "X"
};

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
    const cleanedPhoneme = phoneme.replace(/[ˈˌ!?.]/g, "").split("");
    const viseme = cleanedPhoneme
      .map(p => phonemeToViseme[p] || "X")
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

const lipSyncMessage = async (message, text) => {
  const time = new Date().getTime();
  console.log(`Starting phoneme extraction for message: "${text}"`);

  const mp3File = `audios/message_${message}.mp3`;
  const wavFile = `audios/message_${message}.wav`;
  const jsonFile = `audios/message_${message}.json`;

  try {
    await convertMp3ToWav(mp3File, wavFile);
    const phonemeData = await generateTimedPhonemes(text, wavFile);
    await fs.writeFile(jsonFile, JSON.stringify(phonemeData, null, 2));
    console.log(`Phoneme JSON saved to: ${jsonFile}`);
  } catch (error) {
    console.error("Error during lip sync process:", error);
  }
};

const generateTextWithHuggingFace = async (prompt) => {
  console.log("Generating text with Hugging Face...");
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
          return_full_text: false,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Hugging Face API error: ${response.statusText}`);
  }

  const data = await response.json();
  console.log("Generated text:", data[0].generated_text);
  return data[0].generated_text;
};
app.post("/chat", async (req, res) => {
  const { message, language = "en" } = req.body; // Accept language from frontend
  console.log("POST /chat called with user message:", message, "and language:", language);

  if (!message) {
    console.log("No user message received, sending default response");
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

  if (!huggingFaceToken) {
    console.log("API keys missing, sending error response");
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
    // Generate response using Hugging Face Mistral
    const prompt = `You are a virtual therapist.
Always reply with a JSON array of messages, with a maximum of 3 messages.
Each message must have text, facialExpression, and animation properties.
The different facial expressions are: smile, sad, angry, surprised, funnyFace, and default.
The different animations are: Talking_0, Talking_1, Talking_2, Crying, Laughing, Rumba, Idle, Terrified, and Angry.
IMPORTANT RULES:
- Respond in the user's selected language (${languageToInstruction[language] || "English"}).
- Do NOT add any explanations, headers, or additional text, or "Response" heading.
- ONLY output a valid JSON array.
- Your response must be strictly JSON format and nothing else.
Respond to the following user message with a valid JSON array of messages:
User message: "${message}"
  
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
    console.log("Parsed messages:", messages);
    if (messages.messages) {
      messages = messages.messages; // Handle cases where the response is nested
    }

    // Generate audio and lip sync for each message
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      console.log(`Generating audio for message ${i}: ${message.text}`);
      const fileName = path.join(audiosDir, `message_${i}.mp3`);
      const textInput = message.text;
      await textToSpeech(textInput, language, fileName); // Pass language to ResponsiveVoice
      await lipSyncMessage(i, message.text);
      message.audio = await audioFileToBase64(fileName);
      message.lipsync = await readJsonTranscript(`audios/message_${i}.json`);
      console.log(`Audio and lipsync generated for message ${i}`);
    }

    res.send({ messages });
  } catch (error) {
    console.error("Error generating response:", error);
    res.status(500).send({ error: "Failed to generate response" });
  }
});

const readJsonTranscript = async (file) => {
  console.log(`Reading JSON transcript from file: ${file}`);
  const data = await fs.readFile(file, "utf8");
  return JSON.parse(data);
};

const audioFileToBase64 = async (file) => {
  console.log(`Converting audio file to base64: ${file}`);
  const data = await fs.readFile(file);
  return data.toString("base64");
};

app.listen(port, () => {
  console.log(`Sentio listening on port ${port}`);
});