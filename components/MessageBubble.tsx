"use client";

import { useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  loading?: boolean;
}

interface Props {
  message: Message;
}

function formatMessage(content: string) {
  const lines = content.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("## "))
      return (
        <h2 key={i} style={styles.h2}>
          {line.slice(3)}
        </h2>
      );
    if (line.startsWith("# "))
      return (
        <h1 key={i} style={styles.h1}>
          {line.slice(2)}
        </h1>
      );
    if (line.startsWith("- ") || line.startsWith("• "))
      return (
        <div key={i} style={styles.bullet}>
          ▸ {line.slice(2)}
        </div>
      );
    if (line.match(/^\d+\./))
      return (
        <div key={i} style={styles.numbered}>
          {line}
        </div>
      );
    if (line.trim() === "") return <br key={i} />;
    const boldParsed = line.split(/\*\*(.*?)\*\*/g).map((part, j) =>
      j % 2 === 1 ? (
        <strong key={j} style={{ color: "#e8ff47", fontWeight: 700 }}>
          {part}
        </strong>
      ) : (
        part
      )
    );
    return (
      <p key={i} style={styles.para}>
        {boldParsed}
      </p>
    );
  });
}

export default function MessageBubble({ message }: Props) {
  const [copied, setCopied] = useState(false);

  const copyText = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyProposal = async () => {
    // Extract only the proposal section (between "PROPUESTA" and "PREGUNTAS")
    const content = message.content;
    const proposalMatch = content.match(
      /(?:PROPUESTA[^\n]*\n)([\s\S]*?)(?=\n(?:PREGUNTAS|PRECIO|3\.|4\.)|\n---|\Z)/i
    );
    const textToCopy = proposalMatch ? proposalMatch[1].trim() : content;
    // Strip markdown for clean paste
    const clean = textToCopy
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/^#+\s/gm, "")
      .replace(/^[▸•-]\s/gm, "")
      .trim();
    await navigator.clipboard.writeText(clean);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (message.role === "user") {
    return (
      <div style={{ ...styles.msgWrapper, ...styles.msgWrapperUser }}>
        <div style={{ ...styles.bubble, ...styles.bubbleUser }}>
          <div style={styles.userText}>{message.content}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.msgWrapper}>
      <div style={styles.avatar}>S</div>
      <div style={{ ...styles.bubble, ...styles.bubbleAssistant }}>
        {message.loading ? (
          <div style={styles.loadingDots}>
            <span style={{ ...styles.dot, animationDelay: "0s" }} />
            <span style={{ ...styles.dot, animationDelay: "0.2s" }} />
            <span style={{ ...styles.dot, animationDelay: "0.4s" }} />
          </div>
        ) : (
          <>
            <div style={styles.msgContent}>{formatMessage(message.content)}</div>
            <div style={styles.copyRow}>
              <button style={styles.copyBtn} onClick={copyProposal}>
                {copied ? "✓ Copiado!" : "⎘ Copiar propuesta"}
              </button>
              <button style={{ ...styles.copyBtn, ...styles.copyBtnSecondary }} onClick={copyText}>
                Copiar todo
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  msgWrapper: { display: "flex", gap: 12, alignItems: "flex-start" },
  msgWrapperUser: { flexDirection: "row-reverse" },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: "#e8ff47",
    color: "#0a0a0a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 800,
    flexShrink: 0,
    fontFamily: "'JetBrains Mono', monospace",
  },
  bubble: { maxWidth: "80%", padding: "14px 18px", borderRadius: 12, fontSize: 14, lineHeight: 1.7 },
  bubbleUser: { background: "#1a1a1a", border: "1px solid #2a2a2a", borderTopRightRadius: 4 },
  bubbleAssistant: { background: "#111", border: "1px solid #1e1e1e", borderTopLeftRadius: 4, flex: 1 },
  userText: { color: "#ccc" },
  msgContent: { color: "#d4d4d4" },
  loadingDots: { display: "flex", gap: 6, alignItems: "center", padding: "4px 0" },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#e8ff47",
    display: "inline-block",
    animation: "blink 1.4s ease-in-out infinite",
  },
  copyRow: { display: "flex", gap: 8, marginTop: 12 },
  copyBtn: {
    background: "transparent",
    border: "1px solid #2a2a2a",
    color: "#888",
    padding: "4px 10px",
    borderRadius: 6,
    fontSize: 11,
    cursor: "pointer",
    fontFamily: "'JetBrains Mono', monospace",
    transition: "all 0.15s",
  },
  copyBtnSecondary: { color: "#444", borderColor: "#1e1e1e" },
  h1: { fontSize: 18, fontWeight: 700, color: "#fff", margin: "12px 0 6px" },
  h2: {
    fontSize: 12,
    fontWeight: 700,
    color: "#e8ff47",
    margin: "12px 0 4px",
    fontFamily: "'JetBrains Mono', monospace",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  bullet: { paddingLeft: 12, color: "#bbb", margin: "2px 0" },
  numbered: { paddingLeft: 8, color: "#bbb", margin: "3px 0" },
  para: { margin: "3px 0", color: "#ccc" },
};
