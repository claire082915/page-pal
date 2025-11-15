import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
  summarizeParagraph,
  simplifyText,
  generateQuestions
} from "./openaiClient.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Reading assist backend running" });
});

app.post("/api/summarize", async (req, res) => {
  try {
    const { paragraph, context } = req.body;
    if (!paragraph) {
      return res.status(400).json({ error: "Missing paragraph" });
    }
    const summary = await summarizeParagraph(paragraph, context || "");
    res.json({ summary });
  } catch (err) {
    console.error("Error in /api/summarize", err);
    res.status(500).json({ error: "Failed to summarize paragraph" });
  }
});

app.post("/api/explain", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Missing text" });
    }
    const explanation = await simplifyText(text);
    res.json({ explanation });
  } catch (err) {
    console.error("Error in /api/explain", err);
    res.status(500).json({ error: "Failed to explain text" });
  }
});

app.post("/api/questions", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Missing text" });
    }
    const questions = await generateQuestions(text);
    res.json({ questions });
  } catch (err) {
    console.error("Error in /api/questions", err);
    res.status(500).json({ error: "Failed to generate questions" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
