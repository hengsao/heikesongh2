import { Calendar, Image as ImageIcon, MapPin, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import type { LifeCard } from "../../types";
import { formatDate } from "../../utils/date";

export function LifeCardPreview({ card, compact = false }: { card: LifeCard; compact?: boolean }) {
  return (
    <Link
      to={`/cards/${card.id}`}
      className="group glass-card block overflow-hidden transition hover:-translate-y-1 hover:shadow-glow"
    >
      <div className="relative min-h-40 bg-gradient-to-br from-blush via-cream to-skysoft p-5">
        {card.imageUrl ? (
          <img src={card.imageUrl} alt={card.title} className="absolute inset-0 h-full w-full object-cover" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-white/10" />
        <div className="relative flex h-full min-h-32 flex-col justify-between gap-8">
          <div className="flex justify-between gap-3">
            <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-bold text-ink">{card.category}</span>
            <span className="rounded-full bg-ink/85 px-3 py-1 text-xs font-bold text-white">
              {card.imageSource === "uploaded" ? "用户照片" : card.imageSource === "ai" ? "AI 图" : "记录卡"}
            </span>
          </div>
          <div>
            <h3 className="text-xl font-black text-ink">{card.title}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-700">{card.aiGeneratedText}</p>
          </div>
        </div>
      </div>
      <div className="space-y-3 p-5">
        <p className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">{card.moodText}</p>
        <div className="flex flex-wrap gap-3 text-xs font-semibold text-zinc-500">
          <span className="inline-flex items-center gap-1">
            <Calendar size={14} />
            {formatDate(card.completedAt)}
          </span>
          {card.location ? (
            <span className="inline-flex items-center gap-1">
              <MapPin size={14} />
              {card.location}
            </span>
          ) : null}
          <span className="ml-auto inline-flex items-center gap-1 text-coral">
            {card.imageSource === "uploaded" ? <ImageIcon size={14} /> : <Sparkles size={14} />}
            {compact ? "查看" : "人生卡"}
          </span>
        </div>
      </div>
    </Link>
  );
}
