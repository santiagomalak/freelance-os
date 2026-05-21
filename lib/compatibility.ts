export interface CompatibilityResult {
  score: number;
  level: "high" | "medium" | "low";
  matches: string[];
  color: string;
  label: string;
}

const STACK_KEYWORDS: Record<string, string[]> = {
  "Data Engineering": ["bigquery", "dbt", "pipeline", "etl", "elt", "data warehouse", "sql", "python", "spark", "airflow", "snowflake", "data engineer"],
  "ML / AI": ["machine learning", "ml", "ai", "xgboost", "scikit", "clasificación", "classification", "prediction", "modelo", "model", "llm", "neural", "nlp", "series temporal", "time series", "random forest", "regression"],
  "Automatización": ["n8n", "automatización", "automação", "automation", "apify", "zapier", "webhook", "api integration", "workflow", "scraping", "bot", "integracion", "integração"],
  "Full Stack": ["next.js", "nextjs", "react", "typescript", "node.js", "nodejs", "stripe", "fullstack", "full stack", "frontend", "backend", "web app", "landing page", "dashboard web"],
  "BI / Dashboards": ["dashboard", "metabase", "power bi", "tableau", "looker", "visualización", "visualization", "visualizacao", "chart", "report", "kpi", "metrics", "analytics"],
  "Cloud": ["vercel", "aws", "gcp", "azure", "vps", "docker", "cloud", "deploy", "infraestructura"],
};

export function calculateCompatibility(text: string): CompatibilityResult | null {
  if (text.trim().length < 20) return null;

  const lower = text.toLowerCase();
  const matches: string[] = [];

  for (const [category, keywords] of Object.entries(STACK_KEYWORDS)) {
    const hit = keywords.some((k) => lower.includes(k));
    if (hit) matches.push(category);
  }

  const categoryScore = Math.round((matches.length / Object.keys(STACK_KEYWORDS).length) * 100);

  // Boost for multiple keyword hits (density bonus, capped at 20pts)
  let densityBonus = 0;
  for (const keywords of Object.values(STACK_KEYWORDS)) {
    densityBonus += keywords.filter((k) => lower.includes(k)).length;
  }
  const bonus = Math.min(20, densityBonus * 3);

  const score = Math.min(100, categoryScore + bonus);

  let level: "high" | "medium" | "low";
  let color: string;
  let label: string;

  if (score >= 55) {
    level = "high";
    color = "#4fffb0";
    label = "Alta compatibilidad";
  } else if (score >= 25) {
    level = "medium";
    color = "#e8ff47";
    label = "Media compatibilidad";
  } else {
    level = "low";
    color = "#ff6b6b";
    label = "Baja compatibilidad";
  }

  return { score, level, matches, color, label };
}
