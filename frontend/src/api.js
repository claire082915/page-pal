const BASE = "/api";

export async function apiSummarize(paragraph, context = "") {
  const res = await fetch(`${BASE}/summarize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paragraph, context })
  });
  if (!res.ok) throw new Error("Summarize failed");
  return res.json();
}

export async function apiExplain(text) {
  const res = await fetch(`${BASE}/explain`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });
  if (!res.ok) throw new Error("Explain failed");
  return res.json();
}

export async function apiQuestions(text) {
  const res = await fetch(`${BASE}/questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });
  if (!res.ok) throw new Error("Questions failed");
  return res.json();
}
