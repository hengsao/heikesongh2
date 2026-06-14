import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarDays, Info, PenLine, Save, Trash2, X } from "lucide-react";
import { useAppData } from "../services/AppDataContext";
import type { DiaryNote } from "../types";
import { formatDate } from "../utils/date";

export function Diary() {
  const { diaries, createDiary, updateDiaryNote, removeDiaryNote } = useAppData();
  const [searchParams] = useSearchParams();
  const autoFocus = searchParams.get("autoFocus") === "1";

  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // ---- 编辑表单状态 ----
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState(new Date().toISOString().slice(0, 10));
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  // 从首页"小日记"卡片跳转时自动打开编辑区并聚焦
  useEffect(() => {
    if (autoFocus) {
      setShowEditor(true);
      // 延迟等 DOM 渲染
      setTimeout(() => {
        if (editTitle.trim() === "") {
          titleRef.current?.focus();
        } else {
          contentRef.current?.focus();
        }
      }, 150);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFocus]);

  // ---- 删除确认弹窗 ----
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);

  // ---- 保存 ----
  function handleSave() {
    if (!editTitle.trim() || !editContent.trim()) return;
    const date = editDate || new Date().toISOString().slice(0, 10);
    if (editingId) {
      const existing = diaries.find((d) => d.id === editingId);
      if (existing) {
        updateDiaryNote({ ...existing, date, title: editTitle.trim(), content: editContent.trim() });
      }
    } else {
      createDiary({ date, title: editTitle.trim(), content: editContent.trim() });
    }
    resetEditor();
    setShowEditor(false);
  }

  // ---- 取消/重置编辑器 ----
  function resetEditor() {
    setEditingId(null);
    setEditDate(new Date().toISOString().slice(0, 10));
    setEditTitle("");
    setEditContent("");
  }

  function handleCancel() {
    resetEditor();
    setShowEditor(false);
  }

  // ---- 点击历史卡片进入编辑 ----
  function openEdit(diary: DiaryNote) {
    setEditingId(diary.id);
    setEditDate(diary.date);
    setEditTitle(diary.title);
    setEditContent(diary.content);
    setShowEditor(true);
    setTimeout(() => contentRef.current?.focus(), 100);
  }

  // ---- 新建日记 ----
  function openNew() {
    resetEditor();
    setShowEditor(true);
    setTimeout(() => titleRef.current?.focus(), 100);
  }

  // ---- 删除 ----
  function confirmDelete(id: string) {
    setDeleteTarget(id);
    setDeleteDialog(true);
  }

  function executeDelete() {
    if (deleteTarget) {
      removeDiaryNote(deleteTarget);
      if (editingId === deleteTarget) {
        resetEditor();
        setShowEditor(false);
      }
    }
    setDeleteDialog(false);
    setDeleteTarget(null);
  }

  // 排序：日期倒序
  const sorted = [...diaries].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="page-shell space-y-6">
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
              <button className="btn-secondary flex-1" onClick={() => setDeleteDialog(false)}>
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

      <section className="glass-card p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-zinc-500">小日记</p>
            <h1 className="section-title mt-2">写写今天的念头</h1>
            <p className="mt-1.5 text-sm leading-6 text-zinc-400">
              不用太长，把今天的一小片想法记下来就好。
            </p>
          </div>
          {!showEditor && (
            <button className="btn-primary gap-1.5" onClick={openNew}>
              <PenLine size={15} />
              写日记
            </button>
          )}
        </div>

        {/* ======== 编辑区 ======== */}
        {showEditor && (
          <div className="mt-5 space-y-4 rounded-xl border border-zinc-100 bg-white/60 p-4 sm:p-5">
            {/* 日期选择 */}
            <div className="flex items-center gap-2">
              <CalendarDays size={15} className="text-zinc-400" />
              <input
                type="date"
                className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs text-ink outline-none focus:border-zinc-400"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                max={new Date().toISOString().slice(0, 10)}
              />
            </div>

            {/* 标题 */}
            <input
              ref={titleRef}
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2.5 text-sm font-semibold text-ink outline-none placeholder:text-zinc-300 focus:border-zinc-400"
              placeholder="给今天的日记起个标题…"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />

            {/* 正文 */}
            <textarea
              ref={contentRef}
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2.5 text-sm leading-6 text-ink outline-none placeholder:text-zinc-300 focus:border-zinc-400"
              placeholder="今天发生了什么特别的事？"
              rows={6}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
            />

            {/* 操作按钮 */}
            <div className="flex gap-2.5">
              <button className="btn-secondary px-3" onClick={handleCancel}>
                <X size={14} />
                取消
              </button>
              <button className="btn-primary flex-1 gap-1.5" onClick={handleSave}>
                <Save size={14} />
                保存
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ======== 历史日记列表 ======== */}
      <section>
        <h2 className="section-title mb-4">历史日记</h2>
        {sorted.length ? (
          <div className="space-y-3">
            {sorted.map((diary) => (
              <article
                key={diary.id}
                className="group glass-card cursor-pointer p-4 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-hover sm:p-5"
                onClick={() => openEdit(diary)}
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-2xs font-semibold text-zinc-400">{diary.date}</p>
                    <h3 className="mt-0.5 text-sm font-bold text-ink line-clamp-1">{diary.title}</h3>
                  </div>
                  <button
                    className="shrink-0 rounded-md p-1 text-zinc-300 opacity-0 transition-all duration-150 hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                    title="删除"
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmDelete(diary.id);
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="line-clamp-2 text-sm leading-6 text-zinc-500">{diary.content}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="glass-card p-10 text-center">
            <PenLine size={32} className="mx-auto mb-3 text-zinc-200" />
            <p className="text-sm font-semibold text-zinc-400">还没有写过日记</p>
            <p className="mt-1 text-xs text-zinc-300">点击上方"写日记"按钮开始记录你的日常。</p>
            <button className="btn-primary mt-5 inline-flex gap-1.5" onClick={openNew}>
              <PenLine size={15} />
              写第一篇日记
            </button>
          </div>
        )}
      </section>
    </div>
  );
}