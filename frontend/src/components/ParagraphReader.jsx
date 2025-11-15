import React, { useEffect, useMemo, useState } from "react";
import { apiSummarize, apiExplain, apiQuestions } from "../api.js";

/**
 * Props:
 * - rawText: the full article text
 * - cameraSignals: { pinchDetected, headTiltDetected, distracted, resetSignals, setDistracted }
 */
export default function ParagraphReader({ rawText, cameraSignals }) {
  const {
    pinchDetected,
    headTiltDetected,
    distracted,
    resetSignals,
    setDistracted
  } = cameraSignals;

  const paragraphs = useMemo(
    () =>
      rawText
        .split(/\n\s*\n+/) // split on blank lines
        .map((p) => p.trim())
        .filter(Boolean),
    [rawText]
  );

  const [currentIdx, setCurrentIdx] = useState(0);
  const [baselineWPM, setBaselineWPM] = useState(null);
  const [baselineStartedAt, setBaselineStartedAt] = useState(null);
  const [paragraphStartTime, setParagraphStartTime] = useState(Date.now());
  const [summary, setSummary] = useState("");
  const [explanation, setExplanation] = useState("");
  const [confusedSelection, setConfusedSelection] = useState("");
  const [questions, setQuestions] = useState("");
  const [showAttentionCheck, setShowAttentionCheck] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentParagraph = paragraphs[currentIdx] || "";

  // Start baseline timing on first paragraph
  useEffect(() => {
    if (baselineWPM == null && paragraphs.length > 0) {
      setBaselineStartedAt(Date.now());
      setParagraphStartTime(Date.now());
    }
  }, [baselineWPM, paragraphs.length]);

  // When paragraph changes, reset timers & text
  useEffect(() => {
    setParagraphStartTime(Date.now());
    setSummary("");
    setExplanation("");
    setConfusedSelection("");
  }, [currentIdx]);

  // Handle camera “gestures”
  useEffect(() => {
    if (pinchDetected && currentParagraph) {
      handleSummarizeCurrent();
      resetSignals();
    }
  }, [pinchDetected]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (headTiltDetected && currentParagraph) {
      // prompt user to select confusing part, but for demo we just simplify whole paragraph
      handleExplainSelectionOrParagraph();
      resetSignals();
    }
  }, [headTiltDetected]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (distracted && currentParagraph) {
      // show attention check
      handleAttentionCheck();
    }
  }, [distracted]); // eslint-disable-line react-hooks/exhaustive-deps

  // Compute expected reading time and auto-suggest help
  const expectedMs = useMemo(() => {
    const words = currentParagraph.split(/\s+/).filter(Boolean).length;
    const wpm = baselineWPM || 220; // fallback default
    return (words / wpm) * 60 * 1000; // ms
  }, [currentParagraph, baselineWPM]);

  const elapsedMs = Date.now() - paragraphStartTime;
  const isSlow = elapsedMs > expectedMs * 1.7; // “slow / stuck” threshold

  async function handleNextParagraph() {
    // On first paragraph, compute baselineWPM
    if (baselineWPM == null && baselineStartedAt && currentParagraph) {
      const elapsed = Date.now() - baselineStartedAt;
      const words = currentParagraph.split(/\s+/).filter(Boolean).length;
      const wpm = (words / elapsed) * (60 * 1000);
      setBaselineWPM(Math.max(120, Math.min(400, Math.round(wpm))));
    }

    if (currentIdx < paragraphs.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  }

  function handlePrevParagraph() {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  }

  async function handleSummarizeCurrent() {
    if (!currentParagraph) return;
    setLoading(true);
    setSummary("");
    try {
      const { summary } = await apiSummarize(currentParagraph, "");
      setSummary(summary);
    } catch (e) {
      console.error(e);
      setSummary("Error summarizing paragraph.");
    } finally {
      setLoading(false);
    }
  }

  async function handleExplainSelectionOrParagraph() {
    const selection = window.getSelection()?.toString().trim();
    const textToExplain = selection || currentParagraph;
    if (!textToExplain) return;
    setLoading(true);
    setExplanation("");
    try {
      const { explanation } = await apiExplain(textToExplain);
      setExplanation(explanation);
      if (selection) setConfusedSelection(selection);
    } catch (e) {
      console.error(e);
      setExplanation("Error simplifying text.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAttentionCheck() {
    setShowAttentionCheck(true);
    setLoading(true);
    setQuestions("");
    try {
      const { questions } = await apiQuestions(currentParagraph);
      setQuestions(questions);
    } catch (e) {
      console.error(e);
      setQuestions("Error generating attention-check questions.");
    } finally {
      setLoading(false);
      setDistracted(false);
    }
  }

  async function handleFullArticleQuestions() {
    const fullText = paragraphs.join("\n\n");
    setLoading(true);
    setQuestions("");
    try {
      const { questions } = await apiQuestions(fullText);
      setQuestions(questions);
      setShowAttentionCheck(true);
    } catch (e) {
      console.error(e);
      setQuestions("Error generating full-article questions.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
      {/* Main reading panel */}
      <div style={{ flex: 2, maxWidth: "800px" }}>
        <h2>Focused Reader</h2>
        <p style={{ fontSize: "0.9rem", color: "#555" }}>
          Camera controls (demo):
          <br />
          <strong>P</strong> = pinch (summarize), <strong>H</strong> = head tilt
          (simplify), <strong>D</strong> = distracted (attention check)
        </p>

        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "1rem",
            minHeight: "200px",
            marginBottom: "0.5rem"
          }}
        >
          <div
            style={{ lineHeight: 1.6 }}
            onMouseUp={() => {
              // just capture selection to show in UI
              const selection = window.getSelection()?.toString().trim();
              if (selection) setConfusedSelection(selection);
            }}
          >
            {currentParagraph || <em>No paragraph loaded.</em>}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
            marginBottom: "0.75rem"
          }}
        >
          <button onClick={handlePrevParagraph} disabled={currentIdx === 0}>
            ↑ Previous
          </button>
          <span>
            Paragraph {currentIdx + 1} / {paragraphs.length || 0}
          </span>
          <button
            onClick={handleNextParagraph}
            disabled={currentIdx >= paragraphs.length - 1}
          >
            Next ↓
          </button>
        </div>

        {baselineWPM && (
          <p style={{ fontSize: "0.85rem", color: "#666" }}>
            Baseline reading speed: <strong>{baselineWPM} WPM</strong>{" "}
            {isSlow ? "– looks like this section is a bit slow." : ""}
          </p>
        )}

        {(!baselineWPM || isSlow) && currentParagraph && (
          <div
            style={{
              marginTop: "0.5rem",
              padding: "0.5rem 0.75rem",
              background: "#fff7e6",
              borderRadius: "6px",
              border: "1px solid #f0d38f"
            }}
          >
            <strong>Need help?</strong>{" "}
            <button onClick={handleExplainSelectionOrParagraph}>
              Simplify selected text / paragraph
            </button>
          </div>
        )}

        <div style={{ marginTop: "1rem" }}>
          <button onClick={handleSummarizeCurrent} disabled={loading}>
            Summarize this paragraph (or pinch)
          </button>
          <button
            onClick={handleExplainSelectionOrParagraph}
            style={{ marginLeft: "0.5rem" }}
            disabled={loading}
          >
            Simplify selected text
          </button>
          <button
            onClick={handleFullArticleQuestions}
            style={{ marginLeft: "0.5rem" }}
            disabled={loading}
          >
            End-of-article questions
          </button>
        </div>

        {loading && <p style={{ marginTop: "0.5rem" }}>Working…</p>}

        {summary && (
          <div
            style={{
              marginTop: "1rem",
              padding: "0.75rem",
              borderRadius: "6px",
              background: "#f1f5ff"
            }}
          >
            <h3>Paragraph summary</h3>
            <p>{summary}</p>
          </div>
        )}

        {explanation && (
          <div
            style={{
              marginTop: "1rem",
              padding: "0.75rem",
              borderRadius: "6px",
              background: "#f3fff0"
            }}
          >
            <h3>Simplified explanation</h3>
            {confusedSelection && (
              <p style={{ fontSize: "0.85rem", color: "#555" }}>
                You flagged: <em>{confusedSelection}</em>
              </p>
            )}
            <p>{explanation}</p>
          </div>
        )}
      </div>

      {/* Side panel: camera + attention checks */}
      <div style={{ flex: 1, minWidth: "260px" }}>
        <h3>Camera & Attention</h3>
        <p style={{ fontSize: "0.85rem", color: "#555" }}>
          Small preview to show camera-based interaction.
        </p>
        <video
          ref={cameraSignals.videoRef}
          style={{
            width: "100%",
            maxHeight: "180px",
            background: "#000",
            borderRadius: "8px",
            objectFit: "cover"
          }}
          muted
        />

        {showAttentionCheck && (
          <div
            style={{
              marginTop: "1rem",
              padding: "0.75rem",
              border: "1px solid #ccc",
              borderRadius: "6px",
              background: "#fff9fb"
            }}
          >
            <h4>Attention check</h4>
            <p style={{ whiteSpace: "pre-wrap", fontSize: "0.9rem" }}>
              {questions || "Preparing questions…"}
            </p>
            <button
              style={{ marginTop: "0.5rem" }}
              onClick={() => setShowAttentionCheck(false)}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
