export interface ProposalEntry {
  id: string;
  date: string;
  mode: string;
  projectSnippet: string;
  response: string;
}

const STORAGE_KEY = "freelance-os-history";

export function saveProposal(entry: Omit<ProposalEntry, "id" | "date">): void {
  const history = getHistory();
  const newEntry: ProposalEntry = {
    ...entry,
    id: Date.now().toString(),
    date: new Date().toISOString(),
  };
  history.unshift(newEntry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 50)));
}

export function getHistory(): ProposalEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function deleteEntry(id: string): void {
  const history = getHistory().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
