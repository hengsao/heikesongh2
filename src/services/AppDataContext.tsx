import { createContext, useContext, useMemo, useState } from "react";
import { generateCardImage, generateLifeCardText } from "./aiService";
import {
  getAnniversaries,
  getDiaries,
  getLifeCards,
  getProfile,
  getReviewSettings,
  getTasks,
  getTodos,
  resetStorage,
  saveAnniversaries,
  saveDiaries,
  saveLifeCards,
  saveProfile,
  saveReviewSettings,
  saveTasks,
  saveTodos,
} from "./storageService";
import type {
  Anniversary,
  CheckInInput,
  DiaryEntry,
  DiaryNote,
  LifeCard,
  LifeTask,
  ReviewSettings,
  TodoItem,
  UserProfile,
} from "../types";
import { createId } from "../utils/id";

type AppDataContextValue = {
  profile: UserProfile;
  tasks: LifeTask[];
  todos: TodoItem[];
  lifeCards: LifeCard[];
  anniversaries: Anniversary[];
  reviewSettings: ReviewSettings;
  updateProfile: (profile: UserProfile) => void;
  updateReviewSettings: (settings: ReviewSettings) => void;
  createCustomTask: (task: Omit<LifeTask, "id" | "status" | "isCustom" | "createdAt">) => LifeTask;
  addTaskToTodos: (task: LifeTask, date?: string) => void;
  createTodo: (input: Pick<TodoItem, "title" | "description" | "date">) => TodoItem;
  updateTodo: (item: TodoItem) => void;
  completeTodo: (id: string) => void;
  removeTodo: (id: string) => void;
  toggleTodoPin: (id: string) => void;
  createLifeCard: (input: CheckInInput) => Promise<LifeCard>;
  updateDiary: (cardId: string, diary: DiaryEntry) => void;
  removeLifeCard: (cardId: string) => void;
  diaries: DiaryNote[];
  createDiary: (input: Pick<DiaryNote, "date" | "title" | "content">) => DiaryNote;
  updateDiaryNote: (diary: DiaryNote) => void;
  removeDiaryNote: (id: string) => void;
  addAnniversary: (anniversary: Omit<Anniversary, "id" | "createdAt">) => void;
  resetAllData: () => void;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState(getProfile);
  const [tasks, setTasks] = useState(getTasks);
  const [todos, setTodos] = useState(getTodos);
  const [lifeCards, setLifeCards] = useState(getLifeCards);
  const [anniversaries, setAnniversaries] = useState(getAnniversaries);
  const [reviewSettings, setReviewSettings] = useState(getReviewSettings);
  const [diaries, setDiaries] = useState(getDiaries);

  const value = useMemo<AppDataContextValue>(
    () => ({
      profile,
      tasks,
      todos,
      lifeCards,
      anniversaries,
      reviewSettings,
      diaries,
      updateProfile(nextProfile) {
        setProfile(nextProfile);
        saveProfile(nextProfile);
      },
      updateReviewSettings(nextSettings) {
        const normalized = { ...nextSettings, quarterly: true as const, yearly: true as const };
        setReviewSettings(normalized);
        saveReviewSettings(normalized);
      },
      createCustomTask(taskInput) {
        const task: LifeTask = {
          ...taskInput,
          id: createId("task"),
          status: "preset",
          isCustom: true,
          createdAt: new Date().toISOString(),
        };
        const nextTasks = [task, ...tasks];
        setTasks(nextTasks);
        saveTasks(nextTasks);
        return task;
      },
      addTaskToTodos(task, date = new Date().toISOString().slice(0, 10)) {
        if (todos.some((item) => item.sourceTaskId === task.id && item.date === date && item.status !== "completed")) return;
        const now = new Date().toISOString();
        const item: TodoItem = {
          id: createId("todo"),
          title: task.title,
          description: task.description,
          date,
          status: "todo",
          sourceTaskId: task.id,
          category: task.category,
          isPinned: false,
          createdAt: now,
          updatedAt: now,
        };
        const nextTodos = [item, ...todos];
        const nextTasks = tasks.map((current) => (current.id === task.id ? { ...current, status: "todo" as const } : current));
        setTodos(nextTodos);
        setTasks(nextTasks);
        saveTodos(nextTodos);
        saveTasks(nextTasks);
      },
      createTodo(input) {
        const now = new Date().toISOString();
        const item: TodoItem = {
          id: createId("todo"),
          title: input.title,
          description: input.description,
          date: input.date,
          status: "todo",
          createdAt: now,
          updatedAt: now,
        };
        const nextTodos = [item, ...todos];
        setTodos(nextTodos);
        saveTodos(nextTodos);
        return item;
      },
      updateTodo(item) {
        const nextTodos = todos.map((current) =>
          current.id === item.id ? { ...item, updatedAt: new Date().toISOString() } : current,
        );
        setTodos(nextTodos);
        saveTodos(nextTodos);
      },
      completeTodo(id) {
        const nextTodos = todos.map((item) =>
          item.id === id ? { ...item, status: "completed" as const, updatedAt: new Date().toISOString() } : item,
        );
        setTodos(nextTodos);
        saveTodos(nextTodos);
      },
      removeTodo(id) {
        const item = todos.find((current) => current.id === id);
        const nextTodos = todos.filter((current) => current.id !== id);
        const nextTasks = item?.sourceTaskId
          ? tasks.map((task) => (task.id === item.sourceTaskId && task.status === "todo" ? { ...task, status: "preset" as const } : task))
          : tasks;
        setTodos(nextTodos);
        setTasks(nextTasks);
        saveTodos(nextTodos);
        saveTasks(nextTasks);
      },
      toggleTodoPin(id) {
        const nextTodos = todos.map((item) => (item.id === id ? { ...item, isPinned: !item.isPinned } : item));
        setTodos(nextTodos);
        saveTodos(nextTodos);
      },
      async createLifeCard(input) {
        const aiInput = {
          title: input.task.title,
          category: input.task.category,
          note: input.note,
          moodText: input.moodText,
          preferences: profile.aiPreferences,
          aiMode: profile.aiMode,
        };
        const now = new Date().toISOString();
        const aiGeneratedText = await generateLifeCardText(aiInput);
        const aiImageUrl = input.uploadedImageUrl
          ? undefined
          : await generateCardImage({ ...aiInput, shouldGenerateImage: input.shouldGenerateImage });
        const imageUrl = input.uploadedImageUrl ?? aiImageUrl;
        const imageSource = input.uploadedImageUrl ? "uploaded" : aiImageUrl ? "ai" : "default";

        const card: LifeCard = {
          id: createId("card"),
          taskId: input.task.id,
          title: input.task.title,
          category: input.task.category,
          note: input.note,
          moodText: input.moodText,
          location: input.location,
          latitude: input.latitude,
          longitude: input.longitude,
          completedAt: new Date(input.completedAt).toISOString(),
          imageUrl,
          imageSource,
          aiGeneratedText,
          isAnniversary: input.isAnniversary,
          anniversaryDate: input.isAnniversary ? new Date(input.completedAt).toISOString() : undefined,
          createdAt: now,
          diary: {
            id: createId("diary"),
            cardId: "",
            content: input.note,
            moodText: input.moodText,
            imageUrl,
            updatedAt: now,
          },
        };
        card.diary = { ...card.diary!, cardId: card.id };

        const nextCards = [card, ...lifeCards];
        const nextTasks = tasks.map((task) => (task.id === input.task.id ? { ...task, status: "completed" as const } : task));
        const nextTodos = todos.map((item) =>
          item.sourceTaskId === input.task.id || item.title === input.task.title
            ? { ...item, status: "completed" as const, updatedAt: now }
            : item,
        );
        const nextAnniversaries = input.isAnniversary
          ? [
              {
                id: createId("ann"),
                title: card.title,
                date: card.completedAt,
                type: "countUp" as const,
                source: "fromLifeCard" as const,
                relatedCardId: card.id,
                description: card.aiGeneratedText,
                createdAt: now,
              },
              ...anniversaries,
            ]
          : anniversaries;

        setLifeCards(nextCards);
        setTasks(nextTasks);
        setTodos(nextTodos);
        setAnniversaries(nextAnniversaries);
        saveLifeCards(nextCards);
        saveTasks(nextTasks);
        saveTodos(nextTodos);
        saveAnniversaries(nextAnniversaries);
        return card;
      },
      updateDiary(cardId, diary) {
        const nextCards = lifeCards.map((card) => (card.id === cardId ? { ...card, diary } : card));
        setLifeCards(nextCards);
        saveLifeCards(nextCards);
      },
      removeLifeCard(cardId) {
        const nextCards = lifeCards.filter((card) => card.id !== cardId);
        const nextAnniversaries = anniversaries.filter((ann) => ann.relatedCardId !== cardId);
        setLifeCards(nextCards);
        setAnniversaries(nextAnniversaries);
        saveLifeCards(nextCards);
        saveAnniversaries(nextAnniversaries);
      },
      createDiary(input) {
        const now = new Date().toISOString();
        const diary: DiaryNote = {
          id: createId("diary_note"),
          date: input.date,
          title: input.title,
          content: input.content,
          createdAt: now,
          updatedAt: now,
        };
        const nextDiaries = [diary, ...diaries];
        setDiaries(nextDiaries);
        saveDiaries(nextDiaries);
        return diary;
      },
      updateDiaryNote(diary) {
        const nextDiaries = diaries.map((d) => (d.id === diary.id ? { ...diary, updatedAt: new Date().toISOString() } : d));
        setDiaries(nextDiaries);
        saveDiaries(nextDiaries);
      },
      removeDiaryNote(id) {
        const nextDiaries = diaries.filter((d) => d.id !== id);
        setDiaries(nextDiaries);
        saveDiaries(nextDiaries);
      },
      addAnniversary(input) {
        const anniversary: Anniversary = {
          ...input,
          id: createId("ann"),
          createdAt: new Date().toISOString(),
        };
        const nextAnniversaries = [anniversary, ...anniversaries];
        setAnniversaries(nextAnniversaries);
        saveAnniversaries(nextAnniversaries);
      },
      resetAllData() {
        resetStorage();
        setProfile(getProfile());
        setTasks(getTasks());
        setTodos(getTodos());
        setLifeCards(getLifeCards());
        setAnniversaries(getAnniversaries());
        setReviewSettings(getReviewSettings());
      },
    }),
    [anniversaries, lifeCards, profile, reviewSettings, tasks, todos, diaries],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) throw new Error("useAppData must be used inside AppDataProvider");
  return context;
}
