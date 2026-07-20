export type ActivityCategory =
  | "transport"
  | "electricity"
  | "cooking"
  | "food"
  | "shopping"
  | "waste"
  | "water";

export type TransportMode =
  | "car"
  | "ev"
  | "bike"
  | "bus"
  | "metro"
  | "train"
  | "walking"
  | "cycling"
  | "flight";

export type FoodType =
  | "vegan"
  | "vegetarian"
  | "chicken"
  | "seafood"
  | "pork"
  | "beef"
  | "dairy";

export type ShoppingType =
  | "clothing"
  | "electronics"
  | "furniture"
  | "household";

export type WasteType = "plastic" | "paper" | "glass" | "foodWaste" | "eWaste";

export type CookingFuel = "lpg" | "piped_gas" | "induction" | "firewood";

export interface ActivityEntry {
  id: string;
  category: ActivityCategory;
  createdAt: string; // ISO timestamp
  label: string;
  detail: string;
  co2kg: number;
  formula: string;
  treeDaysEquivalent: number;
  alternatives: string[];
  // category-specific raw inputs, kept loose for flexibility
  meta: Record<string, string | number>;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export type PetSpecies = "panda" | "fox" | "turtle" | "owl" | "red_panda";

export interface PetState {
  species: PetSpecies;
  name: string;
  stage: number; // 0-4
  happiness: number;
  energy: number;
  health: number;
  cleanliness: number;
}

export interface UserProfile {
  name: string;
  email?: string;
  authMethod: "google" | "email" | "guest" | null;
  avatar: string;
  units: "metric" | "imperial";
  language: string;
  onboarded: boolean;
  createdAt: string;
}

export interface GamificationState {
  xp: number;
  level: number;
  greenCoins: number;
  streak: number;
  lastActiveDate: string | null;
  achievements: Achievement[];
  dailyChallengeId: string;
  dailyChallengeDone: boolean;
  dailyChallengeDate: string;
}

export const LEVELS = [
  { name: "Seed", threshold: 0 },
  { name: "Sprout", threshold: 100 },
  { name: "Sapling", threshold: 300 },
  { name: "Tree", threshold: 700 },
  { name: "Forest", threshold: 1500 },
  { name: "Earth Guardian", threshold: 3000 },
  { name: "Planet Protector", threshold: 6000 },
] as const;
