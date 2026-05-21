"use client";

import { useState, useEffect } from "react";
import { ProposalEntry, getHistory, deleteEntry, clearHistory, formatDate } from "@/lib/history";
import { MODES } from "@/lib/prompts";

interface Props {
  open: boolean;
  onClose: () => void;
  refreshKey: number;
}

export default function HistoryPanel({ open, onClose, refreshKey }: Props) {
  const [entries, setEntries] = useState<ProposalEntry[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setEntries(getHistory());
  }, [open, refreshKey]);

  const handleDelete = (id: string) => {
    deleteEntry(id);
    setEntries(getHistory());
  };

  const handleClear = () => {
    if (confirm("¿Borrar todo el historial?")) {
      clearHistory();
      setEntries([]);
    }
  };

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const getModeIcon = (modeId: string) => MODES.find((m) => m.id === modeId)?.icon ?? "📝";
  const getModeLabel = (modeId: string) => MODES.find((m) => m.id === modeId)?.label ?? modeId;

  return (
    <>
      {/* Backdrop */}
      {open && <div style={styles.backdrop} onClick={onClose} />}

      {/* Panel */}
      <div style={{ ...styles.panel, transform: open ? "translateX(0)" : "translateX(100%)" }}>
        <div style={styles.panelHeader}>
          <div style={styles.panelTitle}>
            <span style={styles.panelIcon}>📋</span>
            Mis propuestas
            {entries.length > 0 && <span style={styles.count}>{entries.length}</span>}
          </div>
          <div style={styles.panelActions}>
            {entries.length > 0 && (
              <button style={styles.clearAllBtn} onClick={handleClear}>
                Borrar todo
              </button>
            )}
            <button style={styles.closeBtn} onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <div style={styles.panelBody}>
          {entries.length === 0 ? (
            <div style={styles.emptyHistory}>
              <div style={styles.emptyHistoryIcon}>📂</div>
              <div style={styles.emptyHistoryText}>Todavía no generaste propuestas.</div>
              <div style={styles.emptyHistoryHint}>Se guardan automáticamente acá.</div>
            </div>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} style={styles.entryCard}>
                <div style={styles.entryHeader}>
                  <div style={styles.entryMeta}>
                    <span style={styles.entryMode}>
                      {getModeIcon(entry.mode)} {getModeLabel(entry.mode)}
                    </span>
                    <span style={styles.entryDate}>{formatDate(entry.date)}</span>
                  </div>
                  <button style={styles.deleteBtn} onClick={() => handleDelete(entry.id)} title="Eliminar">
                    ✕
                  </button>
                </div>

                <div style={styles.entrySnippet}>"{entry.projectSnippet}"</div>

                <div
                  style={{
                    ...styles.entryResponse,
                    maxHeight: expanded === entry.id ? "none" : "80px",
                    overflow: expanded === entry.id ? "visible" : "hidden",
                  }}
                >
                  {entry.response}
                </div>

                <div style={styles.entryFooter}>
                  <button
                    style={styles.expandBtn}
                    onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
                  >
                    {expanded === entry.id ? "▲ Colapsar" : "▼ Ver completo"}
                  </button>
                  <button style={styles.copyEntryBtn} onClick={() => handleCopy(entry.response, entry.id)}>
                    {copied === entry.id ? "✓ Copiado!" : "⎘ Copiar"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    zIndex: 40,
    backdropFilter: "blur(2px)",
  },
  panel: {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    width: 400,
    background: "#0d0d0d",
    borderLeft: "1px solid #1a1a1a",
    zIndex: 50,
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.25s ease",
  },
  panelHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    borderBottom: "1px solid #1a1a1a",
  },
  panelTitle: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 14,
    fontWeight: 700,
    color: "#fff",
    fontFamily: "'Space Grotesk', sans-serif",
  },
  panelIcon: { fontSize: 16 },
  count: {
    background: "#e8ff47",
    color: "#0a0a0a",
    fontSize: 10,
    fontWeight: 800,
    padding: "1px 6px",
    borderRadius: 10,
    fontFamily: "'JetBrains Mono', monospace",
  },
  panelActions: { display: "flex", alignItems: "center", gap: 8 },
  clearAllBtn: {
    background: "transparent",
    border: "1px solid #2a2a2a",
    color: "#555",
    fontSize: 11,
    cursor: "pointer",
    padding: "4px 8px",
    borderRadius: 6,
    fontFamily: "'JetBrains Mono', monospace",
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#555",
    fontSize: 16,
    cursor: "pointer",
    padding: "4px 6px",
  },
  panelBody: {
    flex: 1,
    overflowY: "auto",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  emptyHistory: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "60px 20px",
    textAlign: "center",
  },
  emptyHistoryIcon: { fontSize: 32, opacity: 0.3 },
  emptyHistoryText: { color: "#555", fontSize: 14 },
  emptyHistoryHint: { color: "#333", fontSize: 12, fontFamily: "'JetBrains Mono', monospace" },
  entryCard: {
    background: "#111",
    border: "1px solid #1e1e1e",
    borderRadius: 10,
    padding: "12px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  entryHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 },
  entryMeta: { display: "flex", flexDirection: "column", gap: 2 },
  entryMode: { fontSize: 12, color: "#888", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 },
  entryDate: { fontSize: 10, color: "#444", fontFamily: "'JetBrains Mono', monospace" },
  deleteBtn: {
    background: "transparent",
    border: "none",
    color: "#333",
    fontSize: 12,
    cursor: "pointer",
    padding: "2px 4px",
    flexShrink: 0,
  },
  entrySnippet: {
    fontSize: 12,
    color: "#555",
    fontStyle: "italic",
    lineHeight: 1.4,
    borderLeft: "2px solid #222",
    paddingLeft: 8,
  },
  entryResponse: {
    fontSize: 12,
    color: "#888",
    lineHeight: 1.6,
    whiteSpace: "pre-wrap",
    position: "relative",
  },
  entryFooter: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  expandBtn: {
    background: "transparent",
    border: "none",
    color: "#444",
    fontSize: 10,
    cursor: "pointer",
    fontFamily: "'JetBrains Mono', monospace",
    padding: 0,
  },
  copyEntryBtn: {
    background: "transparent",
    border: "1px solid #2a2a2a",
    color: "#666",
    fontSize: 10,
    cursor: "pointer",
    padding: "3px 8px",
    borderRadius: 5,
    fontFamily: "'JetBrains Mono', monospace",
  },
};
