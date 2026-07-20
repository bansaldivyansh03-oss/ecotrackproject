"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ActivityEntry,
  GamificationState,
  PetState,
  PetSpecies,
  UserProfile,
} from "./types";
import { LEVELS } from "./types";
import { ACHIEVEMENT_DEFS, evaluateAchievements, getDailyChallenge } from "./achievements";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function levelFromXp(xp: number) {
  let idx = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].threshold) idx = i;
  }
  return idx;
}

function daysBetween(a: string, b: string) {
  const d1 = new Date(a + "T00:00:00");
  const d2 = new Date(b + "T00:00:00");
  return Math.round((d2.getTime() - d1.getTime()) / 86400000);
}

interface AppState {
  hydrated: boolean;
  profile: UserProfile;
  activities: ActivityEntry[];
  gamification: GamificationState;
  pet: PetState;
  lastUnlocked: string[]; // achievement ids unlocked on the most recent action, for celebration UI
  darkMode: boolean;

  setHydrated: () => void;
  toggleDarkMode: () => void;
  completeOnboarding: () => void;
  login: (method: "google" | "email" | "guest", name: string, email?: string) => void;
  logout: () => void;
  addActivity: (entry: Omit<ActivityEntry, "id" | "createdAt">) => ActivityEntry;
  deleteActivity: (id: string) => void;
  completeDailyChallenge: () => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  setPetName: (name: string) => void;
  setPetSpecies: (species: PetSpecies) => void;
  clearLastUnlocked: () => void;
  resetAll: () => void;
}

const defaultProfile: UserProfile = {
  name: "",
  authMethod: null,
  avatar: "🌱",
  units: "metric",
  language: "en",
  onboarded: false,
  createdAt: new Date().toISOString(),
};

const defaultGamification: GamificationState = {
  xp: 0,
  level: 0,
  greenCoins: 20,
  streak: 0,
  lastActiveDate: null,
  achievements: ACHIEVEMENT_DEFS.map((d) => ({ ...d, unlocked: false })),
  dailyChallengeId: getDailyChallenge(todayStr()).id,
  dailyChallengeDone: false,
  dailyChallengeDate: todayStr(),
};

const defaultPet: PetState = {
  species: "red_panda",
  name: "Ember",
  stage: 0,
  happiness: 70,
  energy: 70,
  health: 70,
  cleanliness: 70,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      profile: defaultProfile,
      activities: [],
      gamification: defaultGamification,
      pet: defaultPet,
      lastUnlocked: [],
      darkMode: false,

      setHydrated: () => set({ hydrated: true }),

      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),

      completeOnboarding: () =>
        set((s) => ({ profile: { ...s.profile, onboarded: true } })),

      login: (method, name, email) =>
        set((s) => ({
          profile: {
            ...s.profile,
            authMethod: method,
            name: name || (method === "guest" ? "Guest" : name),
            email,
            onboarded: true,
          },
        })),

      logout: () =>
        set({
          profile: { ...defaultProfile, onboarded: true },
        }),

      addActivity: (entryInput) => {
        const entry: ActivityEntry = {
          ...entryInput,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          createdAt: new Date().toISOString(),
        };

        const state = get();
        const today = todayStr();
        const g = state.gamification;

        // streak logic
        let streak = g.streak;
        if (g.lastActiveDate !== today) {
          if (g.lastActiveDate && daysBetween(g.lastActiveDate, today) === 1) {
            streak = g.streak + 1;
          } else if (!g.lastActiveDate || daysBetween(g.lastActiveDate, today) > 1) {
            streak = 1;
          }
        }

        // XP + coins
        const isLowCarbon = entry.co2kg < 1.5;
        let xpGain = 15 + (isLowCarbon ? 10 : 0);
        let coinGain = 5 + (isLowCarbon ? 5 : 0);
        if (g.lastActiveDate !== today) xpGain += 5; // first log of the day bonus

        const newXp = g.xp + xpGain;
        const newLevelIdx = levelFromXp(newXp);
        const activities = [entry, ...state.activities];

        const flags = evaluateAchievements(activities, streak, LEVELS[newLevelIdx].name);
        const achievements = g.achievements.map((a) => {
          const nowUnlocked = flags[a.id] ?? a.unlocked;
          if (nowUnlocked && !a.unlocked) {
            return { ...a, unlocked: true, unlockedAt: new Date().toISOString() };
          }
          return a;
        });
        const newlyUnlocked = achievements
          .filter((a, i) => a.unlocked && !g.achievements[i].unlocked)
          .map((a) => a.id);
        if (newlyUnlocked.length) coinGain += newlyUnlocked.length * 20;

        // pet reacts to low-carbon logging
        const pet = state.pet;
        const petBoost = isLowCarbon ? 3 : -2;
        const newPetHappiness = Math.min(100, Math.max(0, pet.happiness + petBoost));
        const newPetHealth = Math.min(100, Math.max(0, pet.health + (isLowCarbon ? 2 : -3)));
        const petStage = Math.min(4, Math.floor(newLevelIdx / 1.5));

        set({
          activities,
          gamification: {
            ...g,
            xp: newXp,
            level: newLevelIdx,
            greenCoins: g.greenCoins + coinGain,
            streak,
            lastActiveDate: today,
            achievements,
          },
          pet: {
            ...pet,
            happiness: newPetHappiness,
            health: newPetHealth,
            stage: petStage,
          },
          lastUnlocked: newlyUnlocked,
        });

        return entry;
      },

      deleteActivity: (id) =>
        set((s) => ({ activities: s.activities.filter((a) => a.id !== id) })),

      completeDailyChallenge: () =>
        set((s) => ({
          gamification: {
            ...s.gamification,
            dailyChallengeDone: true,
            greenCoins: s.gamification.greenCoins + 15,
            xp: s.gamification.xp + 20,
          },
        })),

      updateProfile: (patch) => set((s) => ({ profile: { ...s.profile, ...patch } })),

      setPetName: (name) => set((s) => ({ pet: { ...s.pet, name } })),
      setPetSpecies: (species) => set((s) => ({ pet: { ...s.pet, species } })),

      clearLastUnlocked: () => set({ lastUnlocked: [] }),

      resetAll: () =>
        set({
          profile: defaultProfile,
          activities: [],
          gamification: defaultGamification,
          pet: defaultPet,
          lastUnlocked: [],
        }),
    }),
    {
      name: "ecotracker-store",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
        // refresh daily challenge if the date has rolled over
        if (state && state.gamification.dailyChallengeDate !== todayStr()) {
          state.gamification.dailyChallengeDate = todayStr();
          state.gamification.dailyChallengeId = getDailyChallenge(todayStr()).id;
          state.gamification.dailyChallengeDone = false;
        }
      },
    }
  )
);

export function currentLevel(xp: number) {
  const idx = levelFromXp(xp);
  const current = LEVELS[idx];
  const next = LEVELS[idx + 1];
  const progress = next
    ? Math.round(((xp - current.threshold) / (next.threshold - current.threshold)) * 100)
    : 100;
  return { idx, name: current.name, next: next?.name ?? null, progress, xp };
}
