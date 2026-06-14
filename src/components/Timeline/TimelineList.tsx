import { useState } from "react";
import { Info, Trash2, X } from "lucide-react";
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

  // ---- 自定义删除确认弹窗 ----
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  function confirmDelete(cardId: string) {
    setDeleteTarget(cardId);
    setDeleteDialog(true);
  }

  function executeDelete() {
    if (deleteTarget && onDelete) {
      onDelete(deleteTarget);
    }
    setDeleteDialog(false);
    setDeleteTarget(null);
  }

  if (!cards.length) {
    return <div className="glass-card p-8 text-center text-sm text-zinc-500">还没有匹配的人生卡，去完成一条支线吧。</div>;
  }

  return (
    <>
      {/* ======== 删除确认弹窗 ======== */}
      {deleteDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/30 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-white/70 bg-white p-6 shadow-pop">
            <div className="mb-4 flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                <Info size={18} />
              </span>
              <div>
                <p className="text-sm font-bold text-ink">确认删除该条记录？</p>
                <p className="mt-1 text-xs leading-5 text-zinc-400">删除后无法恢复。</p>
              </div>
            </div>
            <div className="flex gap-2.5">
              <button
                className="btn-secondary flex-1"
                onClick={() => {
                  setDeleteDialog(false);
                  setDeleteTarget(null);
                }}
              >
                取消
              </button>
              <button className="btn-primary flex-1 bg-red-500 hover:bg-red-600" onClick={executeDelete}>
                <Trash2 size={14} />
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

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
                        confirmDelete(card.id);
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
    </>
  );
}