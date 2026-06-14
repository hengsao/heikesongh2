import { Trash2 } from "lucide-react";
import type { LifeCard } from "../../types";
import { groupCardsByMonth } from "../../utils/date";
import { LifeCardPreview } from "../LifeCard/LifeCardPreview";

export function TimelineList({
  cards,
  onDelete,
}: {
  cards: LifeCard[];
  onDelete?: (cardId: string) => void;
}) {
  const groups = groupCardsByMonth(cards);

  if (!cards.length) {
    return <div className="glass-card p-8 text-center text-sm text-zinc-500">还没有匹配的人生卡，去完成一条支线吧。</div>;
  }

  return (
    <div className="space-y-8">
      {Object.entries(groups).map(([month, monthCards]) => (
        <section key={month} className="relative">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-coral" />
            <h2 className="text-lg font-black text-ink">{month}</h2>
            <span className="text-sm text-zinc-500">{monthCards.length} 张人生卡</span>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {monthCards.map((card) => (
              <div key={card.id} className="group/card relative">
                <LifeCardPreview card={card} compact />
                {onDelete && (
                  <button
                    className="absolute right-2 top-2 z-10 rounded-md bg-white/90 p-1.5 text-zinc-400 opacity-0 shadow-sm backdrop-blur transition-all duration-150 hover:bg-red-50 hover:text-red-500 group-hover/card:opacity-100"
                    title="删除这张人生卡"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (window.confirm("确定要删除这张人生卡吗？")) {
                        onDelete(card.id);
                      }
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}