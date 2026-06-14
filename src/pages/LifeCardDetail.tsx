import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CalendarHeart, Image, MapPin, Save, Sparkles } from "lucide-react";
import { MoodPill, moodExamples } from "../components/MoodTag/MoodTag";
import { useAppData } from "../services/AppDataContext";
import type { DiaryEntry } from "../types";
import { createId } from "../utils/id";
import { formatDate } from "../utils/date";

export function LifeCardDetail() {
  const { cardId } = useParams();
  const { lifeCards, updateDiary } = useAppData();
  const card = useMemo(() => lifeCards.find((item) => item.id === cardId), [cardId, lifeCards]);
  const [content, setContent] = useState(card?.diary?.content ?? "");
  const [moodText, setMoodText] = useState(card?.diary?.moodText ?? card?.moodText ?? "");

  if (!card) {
    return <div className="page-shell"><div className="glass-card p-8">没有找到这张人生卡。</div></div>;
  }

  function saveDiary() {
    const diary: DiaryEntry = {
      id: card!.diary?.id ?? createId("diary"),
      cardId: card!.id,
      content,
      moodText,
      imageUrl: card!.imageUrl,
      updatedAt: new Date().toISOString(),
    };
    updateDiary(card!.id, diary);
  }

  return (
    <div className="page-shell grid grid-cols-1 gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="glass-card overflow-hidden">
        <div className="relative min-h-[520px] bg-gradient-to-br from-blush via-cream to-skysoft p-7">
          {card.imageUrl ? <img src={card.imageUrl} alt={card.title} className="absolute inset-0 h-full w-full object-cover" /> : null}
          <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-white/10" />
          <div className="relative flex min-h-[460px] flex-col justify-between">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-white/85 px-4 py-2 text-xs font-black text-ink">{card.category}</span>
              <span className="rounded-full bg-ink px-4 py-2 text-xs font-black text-white">
                {card.imageSource === "uploaded" ? "用户照片" : card.imageSource === "ai" ? "AI 生成图" : "默认卡片"}
              </span>
            </div>
            <div>
              <p className="mb-3 flex items-center gap-2 text-sm font-bold text-zinc-600">
                <Sparkles size={16} />
                AI 纪念文案
              </p>
              <h1 className="text-4xl font-black leading-tight text-ink">{card.title}</h1>
              <p className="mt-5 text-lg leading-9 text-zinc-700">{card.aiGeneratedText}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="glass-card p-6">
          <p className="mb-4 inline-flex rounded-full bg-orange-50 px-3 py-1 text-sm font-bold text-orange-700">{card.moodText}</p>
          <div className="grid gap-3 text-sm text-zinc-600 sm:grid-cols-2">
            <p><span className="font-bold text-ink">完成时间：</span>{formatDate(card.completedAt, true)}</p>
            <p><span className="font-bold text-ink">地点：</span>{card.location || "未记录"}</p>
            <p><span className="font-bold text-ink">原始感受：</span>{card.note}</p>
            <p className="flex items-center gap-2"><CalendarHeart size={17} />{card.isAnniversary ? "已转化为纪念日" : "普通人生卡"}</p>
            {card.latitude && card.longitude ? (
              <p className="flex items-center gap-2 sm:col-span-2"><MapPin size={17} />经纬度：{card.latitude}, {card.longitude}</p>
            ) : null}
          </div>
          {card.isAnniversary ? (
            <Link to="/anniversaries" className="btn-secondary mt-5">查看纪念日</Link>
          ) : null}
        </div>

        <div className="glass-card p-6">
          <p className="mb-3 flex items-center gap-2 text-sm font-black text-zinc-500">
            <Image size={17} />
            图片记录
          </p>
          <p className="text-sm leading-7 text-zinc-600">
            {card.imageSource === "uploaded"
              ? "这张人生卡使用了你上传的真实照片。"
              : card.imageSource === "ai"
                ? "这张人生卡使用 AI 根据任务、感受和情绪生成的纪念图。"
                : "这张人生卡使用默认温暖视觉背景。"}
          </p>
        </div>

        <div className="glass-card p-6">
          <h2 className="section-title">小日记</h2>
          <p className="mt-2 text-sm text-zinc-500">写下这一刻的真实感受。多年后再看到这张卡，你会想起今天的自己。</p>
          <textarea className="soft-input mt-4 min-h-36" value={content} onChange={(event) => setContent(event.target.value)} />
          <input className="soft-input mt-3" value={moodText} onChange={(event) => setMoodText(event.target.value)} placeholder="补充这一刻的情绪" />
          <div className="mt-3 flex flex-wrap gap-2">
            {moodExamples.map((item) => <MoodPill key={item} text={item} selected={moodText === item} onClick={() => setMoodText(item)} />)}
          </div>
          <button className="btn-primary mt-5" type="button" onClick={saveDiary}>
            <Save size={18} />
            保存日记
          </button>
        </div>
      </section>
    </div>
  );
}
