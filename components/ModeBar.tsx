"use client";

import { MODES, ModeId } from "@/lib/prompts";

interface Props {
  mode: ModeId;
  onSelect: (id: ModeId) => void;
}

export default function ModeBar({ mode, onSelect }: Props) {
  return (
    <div style={styles.modeBar}>
      {MODES.map((m) => (
        <button
          key={m.id}
          onClick={() => onSelect(m.id)}
          style={{ ...styles.modeBtn, ...(mode === m.id ? styles.modeBtnActive : {}) }}
        >
          <span style={styles.modeIcon}>{m.icon}</span>
          <span>{m.label}</span>
        </button>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  modeBar: {
    display: "flex",
    gap: 8,
    padding: "12px 24px",
    borderBottom: "1px solid #1a1a1a",
    background: "#0a0a0a",
    overflowX: "auto",
    position: "relative",
    zIndex: 10,
  },
  modeBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 16px",
    borderRadius: 8,
    border: "1px solid #222",
    background: "transparent",
    color: "#666",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
    fontFamily: "'Space Grotesk', sans-serif",
    whiteSpace: "nowrap",
    transition: "all 0.15s ease",
  },
  modeBtnActive: {
    background: "#e8ff47",
    color: "#0a0a0a",
    border: "1px solid #e8ff47",
    fontWeight: 700,
  },
  modeIcon: { fontSize: 16 },
};
