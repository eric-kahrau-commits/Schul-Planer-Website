"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { Pet, Subject, StudySession, Topic, User, FoodType, WeeklyPlan } from "./types";
import {
  validateSubjectInput,
  validateTopicInput,
  validateStudySessionInput,
} from "./validation";
import {
  PET_TYPE_ORDER,
  PET_DISPLAY,
  FEED_OPTIONS,
  levelFromTotalXP,
  stageFromLevel,
} from "./pets";
import { calculateCoinReward, isWeekend } from "./coinRewards";
import { loadAchievements, checkAchievements, type Achievement } from "./achievements";

const LOCAL_STORAGE_PREFIX = "studyflow";
const LOCAL_USER_ID = "local";

function storageKey(base: string) {
  return `${LOCAL_STORAGE_PREFIX}_${base}`;
}

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createInitialPets(): Pet[] {
  return PET_TYPE_ORDER.map((type, index) => {
    const info = PET_DISPLAY[type];
    return {
      id: `pet-${type}`,
      type,
      name: info?.name ?? type,
      level: 1,
      xp: 0,
      stage: "baby",
      unlocked: index === 0,
    };
  });
}

interface StoreState {
  user: User;
  subjects: Subject[];
  topics: Topic[];
  sessions: StudySession[];
  coins: number;
  pets: Pet[];
  streak: number;
  lastVisitDate: string | null;
  achievements: Achievement[];
  weeklyPlans: WeeklyPlan[];
}

interface StoreContextValue extends StoreState {
  hasHydrated: boolean;
  setUser: (user: User) => void;
  addSubject: (s: Omit<Subject, "id">) => Subject;
  updateSubject: (id: string, data: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  addTopic: (t: Omit<Topic, "id">) => Topic;
  updateTopic: (id: string, data: Partial<Topic>) => void;
  deleteTopic: (id: string) => void;
  addSession: (s: Omit<StudySession, "id">) => StudySession;
  updateSession: (id: string, data: Partial<StudySession>) => { coinsAdded?: number; rewardBreakdown?: any };
  deleteSession: (id: string) => void;
  getSessionsForDate: (date: string) => StudySession[];
  getSubjectById: (id: string) => Subject | undefined;
  getTopicById: (id: string) => Topic | undefined;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  feedPet: (petId: string, foodType: FoodType) => { success: boolean; levelUp?: boolean; unlockedType?: string };
  checkAndUpdateStreak: () => { streakIncreased: boolean; newStreak: number };
  achievements: Achievement[];
  checkAchievements: () => { newlyUnlocked: Achievement[] };
  addWeeklyPlan: (plan: Omit<WeeklyPlan, "id" | "userId" | "createdAt">) => WeeklyPlan;
  deleteWeeklyPlan: (id: string) => void;
  getWeeklyPlanById: (id: string) => WeeklyPlan | undefined;
  applyWeeklyPlan: (planId: string) => void; // Erstellt alle Sessions aus dem Plan
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [coins, setCoins] = useState(0);
  const [pets, setPets] = useState<Pet[]>([]);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [user, setUserState] = useState<User>({ id: LOCAL_USER_ID, name: "" });
  const [streak, setStreak] = useState(0);
  const [lastVisitDate, setLastVisitDate] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [weeklyPlans, setWeeklyPlans] = useState<WeeklyPlan[]>([]);

  useEffect(() => {
    setSubjects(load(storageKey("subjects"), []));
    setTopics(load(storageKey("topics"), []));
    setSessions(load(storageKey("sessions"), []));
    setCoins(load(storageKey("coins"), 0));
    const loadedPets = load<Pet[]>(storageKey("pets"), []);
    setPets(loadedPets.length ? loadedPets : createInitialPets());
    const profile = load(storageKey("profile"), { name: "" });
    setUserState({ id: LOCAL_USER_ID, name: profile.name || "" });
    const loadedStreak = load<number>(storageKey("streak"), 0);
    const loadedLastVisit = load<string | null>(storageKey("lastVisitDate"), null);
    setStreak(loadedStreak);
    setLastVisitDate(loadedLastVisit);
    const loadedAchievements = loadAchievements();
    setAchievements(loadedAchievements);
    setWeeklyPlans(load(storageKey("weeklyPlans"), []));
    setHasHydrated(true);
  }, []);

  useEffect(() => { if (hasHydrated) save(storageKey("subjects"), subjects); }, [subjects, hasHydrated]);
  useEffect(() => { if (hasHydrated) save(storageKey("topics"), topics); }, [topics, hasHydrated]);
  useEffect(() => { if (hasHydrated) save(storageKey("sessions"), sessions); }, [sessions, hasHydrated]);
  useEffect(() => { if (hasHydrated) save(storageKey("coins"), coins); }, [coins, hasHydrated]);
  useEffect(() => { if (hasHydrated) save(storageKey("pets"), pets); }, [pets, hasHydrated]);
  useEffect(() => { if (hasHydrated) save(storageKey("profile"), { name: user.name }); }, [user.name, hasHydrated]);
  useEffect(() => { if (hasHydrated) save(storageKey("streak"), streak); }, [streak, hasHydrated]);
  useEffect(() => { if (hasHydrated) save(storageKey("lastVisitDate"), lastVisitDate); }, [lastVisitDate, hasHydrated]);
  useEffect(() => { if (hasHydrated && achievements.length > 0) {
    try {
      localStorage.setItem(storageKey("achievements"), JSON.stringify(achievements));
    } catch {}
  }}, [achievements, hasHydrated]);
  useEffect(() => { if (hasHydrated) save(storageKey("weeklyPlans"), weeklyPlans); }, [weeklyPlans, hasHydrated]);

  const setUser = useCallback((next: User) => {
    setUserState({ id: next.id || LOCAL_USER_ID, name: next.name.trim() });
  }, []);

  const addSubject = useCallback((s: Omit<Subject, "id">) => {
    validateSubjectInput(s);
    const newSubject = { ...s, id: generateId(), userId: s.userId || user.id };
    setSubjects((prev) => [...prev, newSubject]);
    return newSubject;
  }, [user.id]);

  const updateSubject = useCallback((id: string, data: Partial<Subject>) => {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
  }, []);

  const deleteSubject = useCallback((id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    setTopics((prev) => prev.filter((t) => t.subjectId !== id));
    setSessions((prev) => prev.filter((s) => s.subjectId !== id));
  }, []);

  const addTopic = useCallback((t: Omit<Topic, "id">) => {
    validateTopicInput(t);
    const newTopic = { ...t, id: generateId() };
    setTopics((prev) => [...prev, newTopic]);
    return newTopic;
  }, []);

  const updateTopic = useCallback((id: string, data: Partial<Topic>) => {
    setTopics((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
  }, []);

  const deleteTopic = useCallback((id: string) => {
    setTopics((prev) => prev.filter((t) => t.id !== id));
    setSessions((prev) => prev.map((s) => (s.topicId === id ? { ...s, topicId: null } : s)));
  }, []);

  const addSession = useCallback((s: Omit<StudySession, "id">) => {
    validateStudySessionInput(s);
    const newSession = { ...s, id: generateId(), userId: s.userId || user.id };
    setSessions((prev) => [...prev, newSession]);
    return newSession;
  }, [user.id]);

  const addCoins = useCallback((amount: number) => setCoins((c) => c + amount), []);

  const spendCoins = useCallback((amount: number) => {
    let ok = false;
    setCoins((c) => {
      if (c >= amount) { ok = true; return c - amount; }
      return c;
    });
    return ok;
  }, []);

  const updateSession = useCallback((id: string, data: Partial<StudySession>) => {
    let coinsAdded;
    let rewardBreakdown;
    if (data.completed) {
      const session = sessions.find((s) => s.id === id);
      if (session && !session.completed) {
        const today = new Date().toISOString().split("T")[0];
        const sessionsToday = sessions.filter((s) => s.date === today && s.completed).length;
        const updatedSession = { ...session, ...data };
        
        rewardBreakdown = calculateCoinReward(
          updatedSession,
          streak,
          sessionsToday,
          isWeekend(session.date)
        );
        
        addCoins(rewardBreakdown.total);
        coinsAdded = rewardBreakdown.total;
      }
    }
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
    return { coinsAdded, rewardBreakdown };
  }, [sessions, addCoins, streak]);

  const feedPet = useCallback((petId: string, foodType: FoodType) => {
    const option = FEED_OPTIONS[foodType];
    const pet = pets.find((p) => p.id === petId);
    if (!pet || !pet.unlocked || coins < option.cost) return { success: false };

    const newXp = pet.xp + option.xp;
    const newLevel = levelFromTotalXP(newXp);
    const levelUp = newLevel > pet.level;
    const newStage = stageFromLevel(newLevel);

    setCoins((c) => c - option.cost);
    setPets((prev) =>
      prev.map((p) => p.id === petId ? { ...p, xp: newXp, level: newLevel, stage: newStage } : p)
    );

    return { success: true, levelUp };
  }, [pets, coins]);

  const getSessionsForDate = useCallback((date: string) =>
    sessions.filter((s) => s.date === date).sort((a, b) => a.startTime.localeCompare(b.startTime)), [sessions]);

  const getSubjectById = useCallback((id: string) => subjects.find((s) => s.id === id), [subjects]);
  const getTopicById = useCallback((id: string) => topics.find((t) => t.id === id), [topics]);

  const checkAndUpdateStreak = useCallback((): { streakIncreased: boolean; newStreak: number } => {
    const today = new Date().toISOString().split("T")[0];
    
    if (!lastVisitDate) {
      // Erster Besuch
      setStreak(1);
      setLastVisitDate(today);
      return { streakIncreased: true, newStreak: 1 };
    }

    if (lastVisitDate === today) {
      // Bereits heute besucht
      return { streakIncreased: false, newStreak: streak };
    }

    const lastVisit = new Date(lastVisitDate);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Gestern besucht - Streak fortsetzen
      const newStreak = streak + 1;
      setStreak(newStreak);
      setLastVisitDate(today);
      return { streakIncreased: true, newStreak };
    } else if (diffDays > 1) {
      // Streak unterbrochen - neu starten
      setStreak(1);
      setLastVisitDate(today);
      return { streakIncreased: true, newStreak: 1 };
    }

    return { streakIncreased: false, newStreak: streak };
  }, [lastVisitDate, streak]);

  const checkAchievementsCallback = useCallback(() => {
    const completedSessions = sessions.filter((s) => s.completed);
    const maxPetLevel = Math.max(...pets.map((p) => p.level), 0);
    const unlockedPets = pets.filter((p) => p.unlocked).length;

    const result = checkAchievements(
      {
        totalSessions: completedSessions.length,
        streak,
        coins,
        maxPetLevel,
        unlockedPets,
        totalPets: pets.length,
      },
      achievements
    );

    setAchievements(result.achievements);
    return { newlyUnlocked: result.newlyUnlocked };
  }, [sessions, streak, coins, pets, achievements]);

  const addWeeklyPlan = useCallback((plan: Omit<WeeklyPlan, "id" | "userId" | "createdAt">) => {
    const newPlan: WeeklyPlan = {
      ...plan,
      id: generateId(),
      userId: user.id,
      createdAt: new Date().toISOString(),
    };
    setWeeklyPlans((prev) => [...prev, newPlan]);
    return newPlan;
  }, [user.id]);

  const deleteWeeklyPlan = useCallback((id: string) => {
    setWeeklyPlans((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const getWeeklyPlanById = useCallback((id: string) => {
    return weeklyPlans.find((p) => p.id === id);
  }, [weeklyPlans]);

  const applyWeeklyPlan = useCallback((planId: string) => {
    const plan = weeklyPlans.find((p) => p.id === planId);
    if (!plan) return;

    // Erstelle alle Sessions aus dem Plan
    plan.sessions.forEach((sessionData: any) => {
      // Finde oder erstelle Subject
      let subject = subjects.find((s) => s.name.toLowerCase() === sessionData.subjectName.toLowerCase());
      if (!subject) {
        // Subject existiert nicht - erstelle es
        const SUBJECT_COLORS = [
          "#88d4ab", "#a8e6cf", "#b5e8f0", "#93c5fd", "#3b82f6", "#d4c5f9", "#a78bfa",
          "#f9c5d1", "#fca5a5", "#ffdab9", "#fb923c", "#fde047", "#2dd4bf", "#f472b6", "#94a3b8",
        ];
        subject = addSubject({
          name: sessionData.subjectName,
          color: SUBJECT_COLORS[subjects.length % SUBJECT_COLORS.length] || "#88d4ab",
          userId: user.id,
        });
      }

      // Finde oder erstelle Topic falls vorhanden
      let topicId: string | null = null;
      if (sessionData.topicName) {
        let topic = topics.find(
          (t) => t.subjectId === subject!.id && t.name.toLowerCase() === sessionData.topicName.toLowerCase()
        );
        if (!topic) {
          topic = addTopic({
            subjectId: subject!.id,
            name: sessionData.topicName,
            difficulty: "mittel",
            examRelevant: false,
          });
        }
        topicId = topic.id;
      }

      // Erstelle Session mit korrekten IDs
      addSession({
        subjectId: subject.id,
        topicId,
        date: sessionData.date,
        startTime: sessionData.startTime,
        duration: sessionData.durationMinutes,
        type: sessionData.type || "Neues Thema",
        goal: sessionData.goal || "",
        priority: sessionData.priority || "mittel",
        userId: user.id,
        completed: false,
      });
    });
  }, [weeklyPlans, subjects, topics, addSubject, addTopic, addSession, user.id]);

  const value = useMemo(() => ({
    user, subjects, topics, sessions, coins, pets, streak, lastVisitDate, hasHydrated, achievements, weeklyPlans,
    setUser, addSubject, updateSubject, deleteSubject,
    addTopic, updateTopic, deleteTopic,
    addSession, updateSession, deleteSession: (id: string) => setSessions((p) => p.filter((s) => s.id !== id)),
    getSessionsForDate, getSubjectById, getTopicById,
    addCoins, spendCoins, feedPet, checkAndUpdateStreak, checkAchievements: checkAchievementsCallback,
    addWeeklyPlan, deleteWeeklyPlan, getWeeklyPlanById, applyWeeklyPlan
  }), [user, subjects, topics, sessions, coins, pets, streak, lastVisitDate, hasHydrated, achievements, weeklyPlans, checkAndUpdateStreak, checkAchievementsCallback, addWeeklyPlan, deleteWeeklyPlan, getWeeklyPlanById, applyWeeklyPlan]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
