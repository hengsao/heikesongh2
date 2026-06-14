import { useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Edit3, PenLine, Plus, Save } from "lucide-react";
import { useAppData } from "../services/AppDataContext";
import { formatDate } from "../utils/date";

export function Diary() {
  const { lifeCards, updateDiary } = useAppData();
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editMood, setEditMood] = useState("");

  const cardsWithDiary = lifeCards
    .filter((card) => card.diary && card.diary.content.trim())
    .sort((a, b) => +new Date(b.diary!.updatedAt) - +new Date(a.diary!.updatedAt));

  function startEdit(cardId: string, currentContent: string, currentMood: string) {
    setEditingCardId(cardId);
    setEditContent(currentContent);
    setEditMood(currentMood);
  }

  function saveEdit() {
    if (!editingCardId) return;
    const card = lifeCards.find((c) => c.id === editingCardId);
    if (!card?.diary) return;
    updateDiary(editingCardId, {
      ...card.diary,
      content: editContent,
      moodText: editMood,
      updatedAt: new Date().toISOString(),
    });
    setEditingCardId(null);
    setEditContent("");
    setEditMood("");
  }

  return (
    <div className="page-shell space-y-6">
      <section className="glass-card p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-zinc-500">小日记</p>
            <h1 className="section-title mt-2">你的日常碎碎念</h1>
            <p className="mt-1.5 text-sm leading-6 text-zinc-400">
              每一张人生卡都附带一段日记。在这里回顾你写下的每一段文字。
            </p>
          </div>
          <Link to="/tasks" className="btn-primary hidden sm:inline-flex gap-1.5">
            <Plus size={15} />
            写新日记
          </Link>
        </div>
      </section>

      {cardsWithDiary.length ? (
        <div className="space-y-4">
          {cardsWithDiary.map((card) => (
            <article key={card.id} className="glass-card overflow-hidden p-5 sm:p-6">
              {/* 头部：标题 + 日期 + 编辑按钮 */}
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <Link to={`/cards/${card.id}`} className="text-base font-black text-ink hover:underline">
                    {card.title}
                  </Link>
                  <p className="mt-0.5 flex items-center gap-1.5 text-2xs text-zinc-400">
                    <Bookmark size={11} />
                    {formatDate(card.completedAt)} · {card.category}
                  </p>
                </div>
                <button
                  className="btn-ghost"
                  onClick={() =>
                    editingCardId === card.id
                      ? saveEdit()
                      : startEdit(card.id, card.diary?.content ?? "", card.diary?.moodText ?? "")
                  }
                >
                  {editingCardId === card.id ? (
                    <>
                      <Save size={13} />
                      保存
                    </>
                  ) : (
                    <>
                      <Edit3 size={13} />
                      编辑
                    </>
                  )}
                </button>
              </div>

              {/* 日记正文区 */}
              {editingCardId === card.id ? (
                <div className="space-y-3">
                  <textarea
                    className="soft-input min-h-[120px] resize-y"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="写点什么吧…"
                  />
                  <input
                    className="soft-input"
                    value={editMood}
                    onChange={(e) => setEditMood(e.target.value)}
                    placeholder="今日心情（选填）"
                  />
                </div>
              ) : (
                <div>
                  {card.diary?.moodText && (
                    <span className="mb-2 inline-flex items-center rounded-md bg-orange-50 px-2 py-0.5 text-2xs font-bold text-orange-600">
                      {card.diary.moodText}
                    </span>
                  )}
                  <p className="mt-2 text-sm leading-7 whitespace-pre-wrap text-zinc-600">
                    {card.diary?.content}
                  </p>
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="glass-card p-10 text-center">
          <PenLine size={32} className="mx-auto mb-3 text-zinc-200" />
          <p className="text-sm font-semibold text-zinc-400">还没有写过日记</p>
          <p className="mt-1 text-xs text-zinc-300">去任务库完成一次打卡，就会自动生成你的第一篇日记。</p>
          <Link to="/tasks" className="btn-primary mt-5 inline-flex gap-1.5">
            <Plus size={15} />
            去写日记
          </Link>
        </div>
      )}
    </div>
  );
}