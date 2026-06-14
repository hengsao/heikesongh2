import { Calendar, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import type { LifeCard } from "../../types";
import { formatDate } from "../../utils/date";

export function LifeCardPreview({ card, compact = false }: { card: LifeCard; compact?: boolean }) {
  return (
    <Link
      to={`/cards/${card.id}`}
      className="group glass-card flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-hover"
    >
      {/* 图片区域 - 统一 aspect-ratio 保证网格对齐 */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-blush via-cream to-skysoft">
        {card.imageUrl ? (
          <img
            src={card.imageUrl}
            alt={card.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : null}
        {/* 渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />

        {/* 标签：左上角固定位置，两个标签统一 rounded-md */}
        <div className="absolute left-2.5 top-2.5 z-10 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center rounded-md bg-white/90 px-2 py-0.5 text-2xs font-bold text-ink shadow-sm backdrop-blur-sm">
            {card.category}
          </span>
          <span className="inline-flex items-center rounded-md bg-ink/85 px-2 py-0.5 text-2xs font-bold text-white shadow-sm backdrop-blur-sm">
            {card.imageSource === "uploaded"
              ? "用户照片"
              : card.imageSource === "ai"
                ? "AI 图"
                : "记录卡"}
          </span>
        </div>
      </div>

      {/* 文字区 - 统一内边距 p-3.5 */}
      <div className="flex flex-1 flex-col justify-between gap-2.5 p-3.5">
        <div>
          <h3 className="text-sm font-bold leading-snug text-ink line-clamp-1">{card.title}</h3>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-400">
            {card.aiGeneratedText}
          </p>
        </div>

        <div className="space-y-2">
          {/* 情绪标签 */}
          {card.moodText && (
            <span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-0.5 text-2xs font-bold text-orange-600">
              {card.moodText}
            </span>
          )}
          {/* 底部信息行 */}
          <div className="flex flex-wrap items-center gap-2 text-2xs font-medium text-zinc-300">
            <span className="inline-flex items-center gap-1">
              <Calendar size={11} />
              {formatDate(card.completedAt)}
            </span>
            {card.location ? (
              <span className="inline-flex items-center gap-1">
                <MapPin size={11} />
                {card.location}
              </span>
            ) : null}
            <span className="ml-auto text-2xs font-semibold text-zinc-300">
              {compact ? "查看详情" : "人生卡"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
