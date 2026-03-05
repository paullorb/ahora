export const CATEGORY_COLORS: Record<string, string> = {
  focus: "#2563eb",
  meeting: "#7c3aed",
  admin: "#db2777",
  learning: "#059669",
  break: "#d97706",
  general: "#4b5563",
};

export const CATEGORY_OPTIONS = [
  { value: "focus", label: "Focus" },
  { value: "meeting", label: "Meeting" },
  { value: "admin", label: "Admin" },
  { value: "learning", label: "Learning" },
  { value: "break", label: "Break" },
  { value: "general", label: "General" },
] as const;

export function getCategoryColor(category: string) {
  return CATEGORY_COLORS[category] ?? CATEGORY_COLORS.general;
}

export function getCategoryLabel(category: string) {
  return CATEGORY_OPTIONS.find((option) => option.value === category)?.label ?? "General";
}
