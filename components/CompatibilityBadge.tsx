"use client";

import { CompatibilityResult } from "@/lib/compatibility";

interface Props {
  result: CompatibilityResult;
}

export default function CompatibilityBadge({ result }: Props) {
  return (
    <div style={styles.wrapper}>
      <div style={{ ...styles.badge, borderColor: result.color + "55", background: result.color + "11" }}>
        <span style={{ ...styles.dot, background: result.color, boxShadow: `0 0 6px ${result.color}` }} />
        <span style={{ ...styles.label, color: result.color }}>{result.label}</span>
        <span style={{ ...styles.score, color: result.color }}>{result.score}%</span>
      </div>
      {result.matches.length > 0 && (
        <div style={styles.tags}>
          {result.matches.map((m) => (
            <span key={m} style={styles.tag}>
              {m}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: { display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 10px",
    borderRadius: 20,
    border: "1px solid",
    width: "fit-content",
  },
  dot: { width: 6, height: 6, borderRadius: "50%", flexShrink: 0 },
  label: { fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 },
  score: { fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 },
  tags: { display: "flex", flexWrap: "wrap", gap: 4 },
  tag: {
    fontSize: 10,
    color: "#555",
    background: "#111",
    border: "1px solid #1e1e1e",
    borderRadius: 4,
    padding: "2px 6px",
    fontFamily: "'JetBrains Mono', monospace",
  },
};
