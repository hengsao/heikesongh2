import { useState } from "react";
import {
  ArrowRight,
  CalendarHeart,
  CheckCircle2,
  Clock3,
  ListChecks,
  PenLine,
  Plus,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAppData } from "../services/AppDataContext";
import { LifeCardPreview } from "../components/LifeCard/LifeCardPreview";
import { daysBetween, formatDate, isInPeriod } from "../utils/date";

/* =============================================
   统计卡片 — 各卡片跳转目标
   ============================================= */
const statCardLinks = [
  { to: "/todos", label: "今日待办", icon: ListChecks },
  { to: "/diary", label: "小日记", icon: PenLine },
  { to: "/reviews", label: "复盘回溯", icon: Sparkles },
  { to: "/anniversaries", label: "最近纪念日", icon: CalendarHeart },
] as const;

export function Dashboard() {
  const { profile, todos, lifeCards, anniversaries } = useAppData();
  const today = new Date().toISOString().slice(0, 10);
  const todayTodos = todos.filter((item) => item.date === today && item.status === "todo").slice(0, 5);
  const weekCards = lifeCards.filter((card) => isInPeriod(card.completedAt, "weekly"));
  const recentCards = lifeCards.slice().sort((a, b) => +new Date(b.completedAt) - +new Date(a.completedAt)).slice(0, 4);
  const recentAnniversary = anniversaries
    .slice()
    .sort((a, b) => Math.abs(daysBetween(a.date)) - Math.abs(daysBetween(b.date)))[0];

  const statValues = [
    todayTodos.length,
    weekCards.length,
    lifeCards.length,
    recentAnniversary ? `${Math.abs(daysBetween(recentAnniversary.date))}天前` : "暂无",
  ];

  const encouragement =
    profile.aiPreferences.empathy > 70
      ? "今天不用把生活做得很满，认真完成一两件小事就已经很好。"
      : profile.aiPreferences.objectivity > 70
        ? "今天先选一件可执行的小任务，完成后及时记录。"
        : "给今天留一个小小的存档点吧。";

  return (
    <div className="page-shell space-y-5">
      {/* =============================================
          顶部欢迎区 + 统计卡片
          ============================================= */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        {/* 欢迎卡片 */}
        <div className="glass-card overflow-hidden p-5 sm:p-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-zinc-100">
              <CalendarHeart size={12} className="text-zinc-500" />
            </span>
            <span className="text-xs font-semibold text-zinc-400">{formatDate(new Date())}</span>
          </div>
          <h1 className="page-title">
            {profile.nickname}，今天想给生活留下些什么？
          </h1>
          <p className="mt-1.5 max-w-lg text-sm leading-6 text-zinc-400">{encouragement}</p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <Link to="/todos" className="btn-primary">
              <ListChecks size={15} />
              看今日待办
            </Link>
            <Link to="/tasks" className="btn-secondary">
              <Sparkles size={15} />
              快速去打卡
            </Link>
          </div>
        </div>

        {/* 统计卡片 2×2 — 全域可点击 Link，每张绑定独立跳转 */}
        <div className="grid grid-cols-2 gap-3">
          {statCardLinks.map((item, i) => (
            <Link
              key={item.to}
              to={item.to}
              className="group flex flex-col rounded-xl border border-white/70 bg-white/75 p-3.5 shadow-card backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-hover active:scale-[0.97] sm:p-4"
            >
              {/* 图标 */}
              <span className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-md bg-zinc-50 text-zinc-500 transition-colors group-hover:bg-zinc-100 group-hover:text-zinc-600">
                <item.icon size={14} strokeWidth={2} />
              </span>
              {/* 标签 — 小字在上 */}
              <p className="text-2xs font-semibold text-zinc-400">{item.label}</p>
              {/* 数值 — 大号数字在下，视觉权重最高 */}
              <p className="text-lg font-black leading-none text-ink">{statValues[i]}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* =============================================
          今日重点 + 复盘入口
          ============================================= */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1fr]">
        {/* 今日重点 */}
        <div className="glass-card p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-bold text-ink">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-zinc-100 text-zinc-500">
                <Clock3 size={12} />
              </span>
              今日重点
            </h2>
            <Link to="/todos" className="btn-ghost">
              <Plus size={13} />
              新增
            </Link>
          </div>
          <div className="space-y-2">
            {todayTodos.length ? (
              todayTodos.map((todo) => (
                <Link
                  key={todo.id}
                  to={todo.sourceTaskId ? `/checkin/${todo.sourceTaskId}` : "/todos"}
                  className="group flex items-center gap-3 rounded-lg bg-white/60 p-3 transition-all duration-150 hover:bg-white hover:shadow-sm"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-50 text-zinc-400 group-hover:bg-zinc-100">
                    <Clock3 size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">{todo.title}</span>
                    <span className="line-clamp-1 text-2xs text-zinc-400">
                      {todo.description || "今天完成后可以转成人生卡。"}
                    </span>
                  </div>
                  <ArrowRight className="shrink-0 text-zinc-200 transition-colors group-hover:text-zinc-400" size={14} />
                </Link>
              ))
            ) : (
              <div className="rounded-lg bg-white/50 px-4 py-5 text-center text-xs leading-6 text-zinc-400">
                今天还没有待办。去任务库挑一个轻量支线，或者自己写一件想完成的小事。
              </div>
            )}
          </div>
        </div>

        {/* 复盘入口 */}
        <div className="glass-card p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-zinc-100 text-zinc-500">
                <Sparkles size={12} />
              </span>
              复盘入口
            </h2>
            <Link to="/reviews" className="btn-ghost">
              查看全部
            </Link>
          </div>
          <ReviewTabs />
          {/* 提示文字: 增加 left padding 并独立于Tab下边距 */}
          <p className="mt-5 rounded-lg bg-zinc-50 px-4 py-3 text-xs leading-6 text-zinc-400">
            复盘会根据你真实完成的卡片总结，不再只是模板式鼓励。
          </p>
        </div>
      </section>

      {/* =============================================
          最近完成
          ============================================= */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="section-title">最近完成</h2>
          <Link to="/timeline" className="btn-ghost">
            查看人生轨迹
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {recentCards.map((card) => (
            <LifeCardPreview key={card.id} card={card} compact />
          ))}
        </div>
      </section>
    </div>
  );
}

/* =============================================
   复盘 Tab 栏
   ============================================= */
const reviewPeriods = [
  { label: "日", value: "daily" },
  { label: "周", value: "weekly" },
  { label: "月", value: "monthly" },
  { label: "季", value: "quarterly" },
  { label: "年", value: "yearly" },
];

function ReviewTabs() {
  const [active, setActive] = useState("weekly");

  return (
    <div className="flex gap-1 rounded-lg bg-zinc-100 p-1">
      {reviewPeriods.map((p) => (
        <Link
          key={p.value}
          to="/reviews"
          onClick={() => setActive(p.value)}
          className={`flex-1 rounded-md py-2 text-center text-xs font-bold leading-none transition-all duration-150 ${
            active === p.value
              ? "bg-white text-ink shadow-sm ring-1 ring-zinc-200"
              : "text-zinc-400 hover:bg-white/60 hover:text-zinc-600"
          }`}
        >
          {p.label}复盘
        </Link>
      ))}
    </div>
  );
}
