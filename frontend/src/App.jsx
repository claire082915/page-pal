import React, { useState } from "react";
import ParagraphReader from "./components/ParagraphReader.jsx";
import { useCameraSignals } from "./hooks/useCameraSignals.js";

export default function App() {
  const [rawText, setRawText] = useState("");
  const [articleLoaded, setArticleLoaded] = useState(false);
  const cameraSignals = useCameraSignals();

  function handleLoadDemoArticle() {
    const demo =
      "This is a short research-style paragraph about synaptic plasticity in the brain. " +
      "Synaptic plasticity refers to the ability of connections between neurons to strengthen or weaken over time, " +
      "in response to increases or decreases in their activity.\n\n" +
      "In many learning tasks, synaptic plasticity is believed to be the biological basis of long-term memory. " +
      "Different forms of plasticity operate on different time scales and in different brain regions.";
    setRawText(demo);
    setArticleLoaded(true);
  }

  function handleTextareaChange(e) {
    setRawText(e.target.value);
    setArticleLoaded(false);
  }

  function handleUseText() {
    if (rawText.trim()) {
      setArticleLoaded(true);
    }
  }

  return (
    <div style={{ padding: "1.5rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>NeuroRead – Camera-Aware Reading Assistant</h1>
      <p style={{ maxWidth: "700px", fontSize: "0.95rem", color: "#444" }}>
        Load a research article or reading, then our assistant monitors your{" "}
        <strong>rhythm</strong> (scroll speed / paragraph timing) and{" "}
        <strong>camera signals</strong> (pinch, head tilt, gaze/distraction)
        to offer summaries, simplifications, and attention checks.
      </p>

      <div
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "stretch",
          marginTop: "1rem"
        }}
      >
        <div style={{ flex: 1, maxWidth: "500px" }}>
          <h2>Step 1: Paste or upload text</h2>
          <textarea
            value={rawText}
            onChange={handleTextareaChange}
            placeholder="Paste the article / PDF text here for the hackathon demo..."
            style={{
              width: "100%",
              height: "200px",
              resize: "vertical",
              padding: "0.5rem"
            }}
          />
          <div style={{ marginTop: "0.5rem" }}>
            <button onClick={handleUseText} disabled={!rawText.trim()}>
              Use this text
            </button>
            <button
              onClick={handleLoadDemoArticle}
              style={{ marginLeft: "0.5rem" }}
            >
              Load demo article
            </button>
          </div>
          <p style={{ fontSize: "0.8rem", color: "#555", marginTop: "0.5rem" }}>
            For the full product, this is where you would support uploading PDFs
            and running chunking/RAG. For the hackathon MVP we focus on text
            paragraphs.
          </p>
        </div>

        <div style={{ flex: 2 }}>
          {articleLoaded && rawText.trim() ? (
            <ParagraphReader rawText={rawText} cameraSignals={cameraSignals} />
          ) : (
            <div
              style={{
                border: "1px dashed #ccc",
                borderRadius: "8px",
                height: "100%",
                padding: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#777",
                fontStyle: "italic"
              }}
            >
              Load an article on the left to start.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
