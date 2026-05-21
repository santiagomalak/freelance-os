"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import ModeBar from "@/components/ModeBar";
import MessageBubble from "@/components/MessageBubble";
import CompatibilityBadge from "@/components/CompatibilityBadge";
import HistoryPanel from "@/components/HistoryPanel";
import { MODES, QUICK_PROMPTS, getModePrompt, ModeId } from "@/lib/prompts";
import { calculateCompatibility } from "@/lib/compatibility";
import { saveProposal } from "@/lib/history";

interface Message {
  role: "user" | "assistant";
  content: string;
  loading?: boolean;
}

interface HistoryEntry {
  role: "user" | "assistant";
  content: string;
}

const SEND_LABELS: Record<ModeId, string> = {
  analyze: "Analizar →",
  pitch: "Generar →",
  price: "Calcular →",
  profile: "Optimizar →",
};

const PLACEHOLDERS: Record<ModeId, string> = {
  analyze: "Pegá la descripción del proyecto acá...",
  pitch: "Describí el proyecto para generar la propuesta...",
  price: "Describí el proyecto y el contexto del cliente...",
  profile: "¿Qué plataforma o tipo de cliente querés optimizar?",
};

export default function FreelanceOS() {
  const [mode, setMode] = useState<ModeId>("analyze");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const compatibility = useMemo(() => {
    if (mode !== "analyze") return null;
    return calculateCompatibility(input);
  }, [input, mode]);

  const sendMessage = async (overrideInput?: string) => {
    const text = overrideInput || input;
    if (!text.trim() || loading) return;

    const userMsg: HistoryEntry = { role: "user", content: getModePrompt(mode, text) };
    const newHistory = [...history, userMsg];

    setMessages((prev) => [
      ...prev,
      { role: "user", content: text },
      { role: "assistant", content: "", loading: true },
    ]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newHistory }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const reply: string = data.choices?.[0]?.message?.content || "Error al generar respuesta.";
      const assistantMsg: HistoryEntry = { role: "assistant", content: reply };

      setHistory([...newHistory, assistantMsg]);
      setMessages((prev) => [...prev.slice(0, -1), { role: "assistant", content: reply }]);

      // Auto-save to history
      saveProposal({
        mode,
        projectSnippet: text.slice(0, 120),
        response: reply,
      });
      setHistoryRefreshKey((k) => k + 1);
    } catch {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: "❌ Error de conexión. Revisá que GROQ_API_KEY esté configurada." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) sendMessage();
  };

  const clearChat = () => {
    setMessages([]);
    setHistory([]);
  };

  const activeMode = MODES.find((m) => m.id === mode)!;

  return (
    <div style={styles.root}>
      <div style={styles.grain} />

      <header style={styles.header}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>⚙</span>
          <div>
            <div style={styles.logoTitle}>FreelanceOS</div>
            <div style={styles.logoSub}>Llama 3.3 · Groq · Free</div>
          </div>
        </div>
        <div style={styles.headerRight}>
          <button
            style={styles.historyBtn}
            onClick={() => setHistoryOpen(true)}
            title="Ver propuestas guardadas"
          >
            📋 Mis propuestas
          </button>
          <div style={styles.statusBadge}>
            <span style={styles.statusDot} />
            IA activa
          </div>
        </div>
      </header>

      <ModeBar mode={mode} onSelect={setMode} />

      <div style={styles.chatArea}>
        {messages.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyTitle}>
              {activeMode.icon} {activeMode.label}
            </div>
            <div style={styles.emptyDesc}>
              {mode === "analyze" && "Pegá la descripción completa del proyecto y te doy análisis + propuesta lista."}
              {mode === "pitch" && "Describí el proyecto y te genero una propuesta irresistible en el idioma del cliente."}
              {mode === "price" && "Contame el proyecto y te digo cuánto cobrar y cómo justificarlo."}
              {mode === "profile" && "Decime la plataforma o tipo de proyecto y optimizamos tu perfil."}
            </div>
            {mode === "analyze" && (
              <div style={styles.quickSection}>
                <div style={styles.quickTitle}>Ejemplos de proyectos reales:</div>
                <div style={styles.quickList}>
                  {QUICK_PROMPTS.map((p, i) => (
                    <button
                      key={i}
                      style={styles.quickBtn}
                      onClick={() => {
                        setInput(p.text);
                        textareaRef.current?.focus();
                      }}
                    >
                      <span style={styles.quickFlag}>{p.flag}</span>
                      <span style={styles.quickText}>{p.text.slice(0, 60)}...</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      <div style={styles.inputArea}>
        {messages.length > 0 && (
          <button style={styles.clearBtn} onClick={clearChat}>
            ✕ Limpiar chat
          </button>
        )}
        {compatibility && mode === "analyze" && input.trim().length > 20 && (
          <CompatibilityBadge result={compatibility} />
        )}
        <div style={styles.inputWrapper}>
          <textarea
            ref={textareaRef}
            style={styles.textarea}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={PLACEHOLDERS[mode]}
            rows={4}
          />
          <div style={styles.inputFooter}>
            <span style={styles.hint}>Ctrl+Enter para enviar</span>
            <button
              style={{ ...styles.sendBtn, ...(loading || !input.trim() ? styles.sendBtnDisabled : {}) }}
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
            >
              {loading ? "Generando..." : SEND_LABELS[mode]}
            </button>
          </div>
        </div>
      </div>

      <HistoryPanel
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        refreshKey={historyRefreshKey}
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    fontFamily: "'Space Grotesk', sans-serif",
    background: "#0a0a0a",
    color: "#e8e8e8",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
  },
  grain: {
    position: "fixed",
    inset: "-50%",
    width: "200%",
    height: "200%",
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
    animation: "grain 0.5s steps(1) infinite",
    pointerEvents: "none",
    zIndex: 0,
    opacity: 0.6,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 24px",
    borderBottom: "1px solid #1a1a1a",
    background: "#0a0a0a",
    position: "relative",
    zIndex: 10,
  },
  logo: { display: "flex", alignItems: "center", gap: 12 },
  logoIcon: { fontSize: 28, lineHeight: 1, color: "#e8ff47" },
  logoTitle: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 18,
    fontWeight: 700,
    color: "#fff",
    letterSpacing: "-0.5px",
  },
  logoSub: { fontSize: 11, color: "#4fffb0", fontFamily: "'JetBrains Mono', monospace" },
  headerRight: { display: "flex", alignItems: "center", gap: 10 },
  historyBtn: {
    background: "transparent",
    border: "1px solid #222",
    color: "#666",
    fontSize: 12,
    cursor: "pointer",
    padding: "6px 12px",
    borderRadius: 20,
    fontFamily: "'JetBrains Mono', monospace",
    transition: "all 0.15s",
  },
  statusBadge: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    color: "#666",
    background: "#111",
    border: "1px solid #222",
    padding: "4px 10px",
    borderRadius: 20,
    fontFamily: "'JetBrains Mono', monospace",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#4fffb0",
    boxShadow: "0 0 6px #4fffb0",
    display: "inline-block",
    animation: "blink 2s ease-in-out infinite",
  },
  chatArea: {
    flex: 1,
    overflowY: "auto",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: 20,
    position: "relative",
    zIndex: 5,
  },
  emptyState: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    gap: 16,
    padding: "40px 20px",
    maxWidth: 600,
    margin: "0 auto",
  },
  emptyTitle: { fontSize: 24, fontWeight: 700, color: "#fff" },
  emptyDesc: { fontSize: 15, color: "#666", lineHeight: 1.6 },
  quickSection: { width: "100%", textAlign: "left", marginTop: 16 },
  quickTitle: {
    fontSize: 12,
    color: "#444",
    marginBottom: 10,
    fontFamily: "'JetBrains Mono', monospace",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
  },
  quickList: { display: "flex", flexDirection: "column", gap: 8 },
  quickBtn: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    background: "#111",
    border: "1px solid #1e1e1e",
    borderRadius: 8,
    padding: "10px 14px",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "'Space Grotesk', sans-serif",
  },
  quickFlag: { fontSize: 16, flexShrink: 0 },
  quickText: { fontSize: 13, color: "#888", lineHeight: 1.4 },
  inputArea: {
    padding: "16px 24px 24px",
    borderTop: "1px solid #1a1a1a",
    background: "#0a0a0a",
    position: "relative",
    zIndex: 10,
  },
  clearBtn: {
    background: "transparent",
    border: "none",
    color: "#444",
    fontSize: 12,
    cursor: "pointer",
    marginBottom: 10,
    fontFamily: "'JetBrains Mono', monospace",
    padding: "0 2px",
  },
  inputWrapper: { background: "#111", border: "1px solid #222", borderRadius: 12, overflow: "hidden" },
  textarea: {
    width: "100%",
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#e8e8e8",
    fontSize: 14,
    padding: "14px 16px",
    fontFamily: "'Space Grotesk', sans-serif",
    resize: "none",
    lineHeight: 1.6,
  },
  inputFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 14px",
    borderTop: "1px solid #1a1a1a",
  },
  hint: { fontSize: 11, color: "#333", fontFamily: "'JetBrains Mono', monospace" },
  sendBtn: {
    background: "#e8ff47",
    color: "#0a0a0a",
    border: "none",
    borderRadius: 8,
    padding: "8px 18px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "'Space Grotesk', sans-serif",
  },
  sendBtnDisabled: { opacity: 0.3, cursor: "not-allowed" },
};
