import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  BookOpen,
  CalendarHeart,
  CheckCircle2,
  Compass,
  Home,
  ListChecks,
  Menu,
  PenLine,
  Settings,
  Sparkles,
  TimerReset,
  X,
} from "lucide-react";
import { useAppData } from "../../services/AppDataContext";

const navItems = [
  { to: "/", label: "进度盘", icon: Home },
  { to: "/tasks", label: "任务库", icon: Compass },
  { to: "/diary", label: "小日记", icon: PenLine },
  { to: "/todos", label: "待办", icon: ListChecks },
  { to: "/reviews", label: "复盘", icon: BookOpen },
  { to: "/anniversaries", label: "纪念日", icon: CalendarHeart },
  { to: "/timeline", label: "轨迹", icon: TimerReset },
  { to: "/settings", label: "设置", icon: Settings },
];

export function AppLayout() {
  const { profile, lifeCards } = useAppData();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#ffd9df_0,#fff8ed_30%,#f7fbff_70%)]">
      {/* =============================================
          顶部导航栏
          ============================================= */}
      <header className="sticky top-0 z-40 border-b border-white/70 bg-cream/80 backdrop-blur-xl shadow-nav">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-2.5 sm:px-8 lg:px-10">
          {/* 左侧：Logo */}
          <NavLink to="/" className="flex shrink-0 items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-ink text-white shadow-sm">
              <Sparkles size={16} />
            </span>
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm font-bold leading-tight text-ink">人生支线</p>
              <p className="truncate text-2xs leading-tight text-zinc-400">{lifeCards.length} 张人生卡</p>
            </div>
          </NavLink>

          {/* 中段：桌面导航按钮组 — 紧凑排布，与右侧CTA保持同一基线 */}
          <nav className="hidden items-center md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  [
                    "inline-flex h-8 items-center justify-center gap-1 rounded-md px-2.5 text-xs font-semibold transition-all duration-150",
                    isActive
                      ? "bg-ink text-white shadow-sm"
                      : "text-zinc-400 hover:bg-white/70 hover:text-ink",
                  ].join(" ")
                }
              >
                <item.icon size={15} />
                <span className="hidden lg:inline">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* 右侧：CTA + 汉堡菜单 — 与导航按钮相同高度 h-8 */}
          <div className="flex items-center gap-2">
            <NavLink
              to="/tasks"
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-ink px-3 text-xs font-semibold text-white shadow-nav transition-all duration-150 hover:bg-black hover:shadow-hover active:scale-[0.97] max-sm:hidden"
            >
              <CheckCircle2 size={14} />
              <span className="hidden sm:inline">去打卡</span>
            </NavLink>
            <button
              className="btn-icon-square md:hidden"
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {/* 移动端下拉菜单 */}
        {menuOpen && (
          <div className="border-t border-white/60 bg-white/95 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-5 py-2 sm:px-8">
              <div className="flex flex-col gap-0.5">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/"}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      [
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
                        isActive
                          ? "bg-ink text-white"
                          : "text-zinc-600 hover:bg-zinc-50 hover:text-ink",
                      ].join(" ")
                    }
                  >
                    <item.icon size={18} />
                    {item.label}
                  </NavLink>
                ))}
                {/* 分割线 + CTA */}
                <div className="mt-1 border-t border-zinc-100 pt-2 pb-1">
                  <NavLink
                    to="/tasks"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg bg-ink px-3 py-2.5 text-sm font-bold text-white"
                  >
                    <CheckCircle2 size={18} />
                    去打卡
                  </NavLink>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* =============================================
          页面主体
          ============================================= */}
      <main>
        <Outlet />
      </main>

      {/* =============================================
          移动端底部导航（始终只显示4个核心入口）
          ============================================= */}
      <nav className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-4 gap-0.5 rounded-xl border border-white/70 bg-white/90 px-2 py-1.5 shadow-card backdrop-blur md:hidden">
        {navItems.slice(0, 4).map((item) => {
          const isActive =
            item.to === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={`flex flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-2xs font-semibold transition-colors ${
                isActive ? "bg-ink text-white" : "text-zinc-400"
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
      <div className="h-20 md:hidden" />
    </div>
  );
}
