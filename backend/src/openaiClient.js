import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  console.warn("WARNING: OPENAI_API_KEY not set in .env");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Helper wrappers

export async function summarizeParagraph(paragraph, context = "") {
  const content = [
    {
      role: "system",
      content:
        "You are an assistant helping a student read dense academic or research articles. " +
        "Summarize text clearly and concisely, preserving key technical meaning."
    },
    {
      role: "user",
      content: `Context (optional): ${context}\n\nParagraph:\n${paragraph}\n\nSummarize this paragraph in 3–4 sentences.`
    }
  ];

  const resp = await openai.chat.completions.create({
    model: "gpt-4.1-mini", // swap to your preferred 'ChatGPT 5 wrapper' model
    messages: content,
    temperature: 0.3
  });

  return resp.choices[0].message.content.trim();
}

export async function simplifyText(text) {
  const content = [
    {
      role: "system",
      content:
        "You explain complex academic language in simple, clear terms for a college student, " +
        "without losing the main ideas. Use short sentences and concrete wording."
    },
    {
      role: "user",
      content:
        `Explain this text in simpler language. Keep all important details:\n\n${text}`
    }
  ];

  const resp = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: content,
    temperature: 0.4
  });

  return resp.choices[0].message.content.trim();
}

export async function generateQuestions(text) {
  const content = [
    {
      role: "system",
      content:
        "You generate comprehension questions for students who just read a paragraph or section of a research article."
    },
    {
      role: "user",
      content:
        `Create 3–5 short-answer comprehension questions that test understanding of the following text. ` +
        `Do not include the answers.\n\n${text}`
    }
  ];

  const resp = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: content,
    temperature: 0.5
  });

  return resp.choices[0].message.content.trim();
}
