export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as T;
    if (Array.isArray(fallback) && !Array.isArray(parsed)) {
      return fallback;
    }
    if (parsed === null || parsed === undefined) {
      return fallback;
    }
    return parsed;
  } catch {
    return fallback;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn("Failed to save state to localStorage", err);
  }
}

export const STORAGE_KEYS = {
  METRICS: "antonov_sys_metrics_v1",
  CARDS: "antonov_sys_planner_cards_v1",
  VAULT: "antonov_sys_research_vault_v1",
  VOICE_DNA: "antonov_sys_voice_dna_v1",
  AUDITS: "antonov_sys_audit_history_v1",
  NOTION: "antonov_sys_notion_config_v1",
  GOALS: "antonov_sys_weekly_goals_v1",
};
