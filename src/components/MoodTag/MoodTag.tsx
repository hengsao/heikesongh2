export function MoodPill({ text, selected = false, onClick }: { text: string; selected?: boolean; onClick?: () => void }) {
  const className = selected
    ? "border-ink bg-ink text-white"
    : "border-orange-100 bg-white/80 text-zinc-600";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:-translate-y-0.5 ${className}`}
    >
      {text}
    </button>
  );
}

export const moodExamples = ["有点孤单但轻松", "很平静", "有成就感", "其实有点难过", "开心又疲惫", "自由"];
