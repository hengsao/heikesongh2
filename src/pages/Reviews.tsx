import { useEffect, useMemo, useState } from "react";
import { ReviewPanel } from "../components/ReviewPanel/ReviewPanel";
import { TimelineList } from "../components/Timeline/TimelineList";
import { useAppData } from "../services/AppDataContext";
import { generateNextTaskSuggestions, generateReviewSummary } from "../services/aiService";
import { buildReviewReport, getPeriodCards } from "../services/reviewService";
import type { ReviewPeriod, ReviewReport } from "../types";

const periods: Array<{ key: ReviewPeriod; label: string; custom: boolean }> = [
  { key: "daily", label: "日复盘", custom: true },
  { key: "weekly", label: "周复盘", custom: true },
  { key: "monthly", label: "月复盘", custom: true },
  { key: "quarterly", label: "季复盘", custom: false },
  { key: "yearly", label: "年复盘", custom: false },
];

export function Reviews() {
  const { lifeCards, tasks, profile, reviewSettings } = useAppData();
  const [period, setPeriod] = useState<ReviewPeriod>("weekly");
  const baseReport = useMemo(() => buildReviewReport(lifeCards, period), [lifeCards, period]);
  const periodCards = useMemo(() => getPeriodCards(lifeCards, period), [lifeCards, period]);
  const [report, setReport] = useState<ReviewReport>(baseReport);

  useEffect(() => {
    let cancelled = false;
    async function build() {
      const [aiSummary, nextSuggestions] = await Promise.all([
        generateReviewSummary({
          cards: periodCards,
          periodLabel: baseReport.title,
          periodType: period,
          preferences: profile.aiPreferences,
          aiMode: profile.aiMode,
        }),
        generateNextTaskSuggestions({
          cards: periodCards.length ? periodCards : lifeCards,
          tasks,
          preferences: profile.aiPreferences,
          aiMode: profile.aiMode,
        }),
      ]);
      if (!cancelled) setReport({ ...baseReport, aiSummary, nextSuggestions });
    }
    setReport({ ...baseReport, aiSummary: "正在根据真实记录生成复盘...", nextSuggestions: [] });
    build();
    return () => {
      cancelled = true;
    };
  }, [baseReport, lifeCards, period, periodCards, profile.aiMode, profile.aiPreferences, tasks]);

  return (
    <div className="page-shell space-y-6">
      <section className="glass-card p-6">
        <p className="text-sm font-bold text-zinc-500">复盘回溯</p>
        <h1 className="section-title mt-2">基于真实完成记录，而不是模板鼓励</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-600">
          AI 会读取当前周期内完成的人生卡，结合任务标题、感受和自由情绪，生成更像倾听者的阶段总结。
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {periods.map((item) => {
            const enabled = item.custom ? reviewSettings[item.key as "daily" | "weekly" | "monthly"] : true;
            return (
              <button
                key={item.key}
                className={`rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${
                  period === item.key ? "bg-ink text-white" : enabled ? "bg-white/80 text-zinc-700" : "bg-zinc-100 text-zinc-400"
                }`}
                onClick={() => setPeriod(item.key)}
                type="button"
              >
                <span>{item.label}</span>
                <span className="ml-2 text-xs opacity-70">{item.custom ? "用户可自定义" : "系统固定保留"}</span>
                {!enabled ? <span className="ml-2 text-xs">已关闭</span> : null}
              </button>
            );
          })}
        </div>
      </section>

      <ReviewPanel report={report} />

      <section>
        <h2 className="mb-4 text-lg font-black text-ink">本周期真实记录</h2>
        <TimelineList cards={periodCards} />
      </section>
    </div>
  );
}
