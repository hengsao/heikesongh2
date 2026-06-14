import { defaultAIApiConfig, defaultAIPreferences, defaultProfile, mockAnniversaries, mockDiaryNotes, mockLifeCards, mockTodos, seededTasks } from "../data/mockData";
import type { Anniversary, DiaryNote, LifeCard, LifeTask, ReviewSettings, TodoItem, UserProfile } from "../types";

const keys = {
  tasks: "lifequest.tasks",
  wishlist: "lifequest.wishlist",
  todos: "lifequest.todos",
  cards: "lifequest.cards",
  anniversaries: "lifequest.anniversaries",
  reviewSettings: "lifequest.reviewSettings",
  profile: "lifequest.profile",
  diaries: "lifequest.diaries",
};

const defaultReviewSettings: ReviewSettings = {
  daily: true,
  weekly: true,
  monthly: true,
  quarterly: true,
  yearly: true,
};

export function initializeStorage() {
  ensure(keys.tasks, seededTasks);
  ensure(keys.todos, migrateWishlistToTodos(read<any[]>(keys.wishlist, mockTodos)));
  ensure(keys.cards, mockLifeCards);
  ensure(keys.anniversaries, mockAnniversaries);
  ensure(keys.reviewSettings, defaultReviewSettings);
  ensure(keys.profile, defaultProfile);
  ensure(keys.diaries, mockDiaryNotes);
}

export function getTasks() {
  initializeStorage();
  return read<LifeTask[]>(keys.tasks, seededTasks).map(normalizeTask);
}

export function saveTasks(value: LifeTask[]) {
  write(keys.tasks, value);
}

export function getTodos() {
  initializeStorage();
  return read<TodoItem[]>(keys.todos, mockTodos).map(normalizeTodo);
}

export function saveTodos(value: TodoItem[]) {
  write(keys.todos, value.map(normalizeTodo));
}

export function getLifeCards() {
  initializeStorage();
  return read<LifeCard[]>(keys.cards, mockLifeCards).map(normalizeCard);
}

export function saveLifeCards(value: LifeCard[]) {
  write(keys.cards, value.map(normalizeCard));
}

export function getDiaries() {
  initializeStorage();
  return read<DiaryNote[]>(keys.diaries, mockDiaryNotes).map(normalizeDiary);
}

export function saveDiaries(value: DiaryNote[]) {
  write(keys.diaries, value.map(normalizeDiary));
}

export function getAnniversaries() {
  initializeStorage();
  return read<Anniversary[]>(keys.anniversaries, mockAnniversaries);
}

export function saveAnniversaries(value: Anniversary[]) {
  write(keys.anniversaries, value);
}

export function getReviewSettings() {
  initializeStorage();
  return read<ReviewSettings>(keys.reviewSettings, defaultReviewSettings);
}

export function saveReviewSettings(value: ReviewSettings) {
  write(keys.reviewSettings, { ...value, quarterly: true, yearly: true });
}

export function getProfile() {
  initializeStorage();
  const profile = read<UserProfile>(keys.profile, defaultProfile);
  return {
    ...defaultProfile,
    ...profile,
    aiPreferences: { ...defaultAIPreferences, ...(profile as Partial<UserProfile>).aiPreferences },
    aiApiConfig: { ...defaultAIApiConfig, ...(profile as Partial<UserProfile>).aiApiConfig },
  };
}

export function saveProfile(value: UserProfile) {
  write(keys.profile, {
    ...value,
    aiPreferences: { ...defaultAIPreferences, ...value.aiPreferences },
    aiApiConfig: { ...defaultAIApiConfig, ...value.aiApiConfig },
  });
}

export function exportAllData() {
  initializeStorage();
  return {
    profile: getProfile(),
    tasks: getTasks(),
    todos: getTodos(),
    lifeCards: getLifeCards(),
    anniversaries: getAnniversaries(),
    reviewSettings: getReviewSettings(),
    diaries: getDiaries(),
  };
}

export function resetStorage() {
  Object.values(keys).forEach((key) => localStorage.removeItem(key));
  initializeStorage();
}

function ensure<T>(key: string, fallback: T) {
  if (!localStorage.getItem(key)) write(key, fallback);
}

function read<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function normalizeTask(task: any): LifeTask {
  return {
    ...task,
    status: task.status === "wishlist" ? "todo" : task.status ?? "preset",
  };
}

function normalizeTodo(item: any): TodoItem {
  const today = new Date().toISOString().slice(0, 10);
  return {
    id: item.id ?? `todo_${item.taskId ?? Date.now()}`,
    title: item.title,
    description: item.description,
    date: item.date ?? today,
    status: item.status === "已完成" || item.status === "completed" ? "completed" : "todo",
    sourceTaskId: item.sourceTaskId ?? item.taskId,
    category: item.category,
    isPinned: Boolean(item.isPinned),
    createdAt: item.createdAt ?? new Date().toISOString(),
    updatedAt: item.updatedAt ?? item.createdAt ?? new Date().toISOString(),
  };
}

function normalizeCard(card: any): LifeCard {
  const moodText = card.moodText ?? (Array.isArray(card.moodTags) ? card.moodTags.join("、") : "平静");
  return {
    ...card,
    moodText,
    imageSource: card.imageSource ?? (card.imageUrl ? "uploaded" : "default"),
    diary: card.diary
      ? {
          ...card.diary,
          moodText: card.diary.moodText ?? (Array.isArray(card.diary.moodTags) ? card.diary.moodTags.join("、") : moodText),
        }
      : undefined,
  };
}

function normalizeDiary(diary: any): DiaryNote {
  return {
    id: diary.id ?? `diary_note_${Date.now()}`,
    date: diary.date ?? new Date().toISOString().slice(0, 10),
    title: diary.title ?? "无标题日记",
    content: diary.content ?? "",
    createdAt: diary.createdAt ?? new Date().toISOString(),
    updatedAt: diary.updatedAt ?? diary.createdAt ?? new Date().toISOString(),
  };
}

function migrateWishlistToTodos(items: any[]): TodoItem[] {
  if (!items?.length) return mockTodos;
  return items.map(normalizeTodo);
}
