import type { ActivityEntry, Achievement } from "./types";

export const ACHIEVEMENT_DEFS: Omit<Achievement, "unlocked" | "unlockedAt">[] = [
  { id: "first_log", title: "First Steps", description: "Log your first activity", icon: "Footprints" },
  { id: "week_streak", title: "Week Warrior", description: "Reach a 7-day streak", icon: "Flame" },
  { id: "month_streak", title: "Streak Master", description: "Reach a 30-day streak", icon: "CalendarCheck" },
  { id: "green_commute_10", title: "Green Commuter", description: "Log 10 low-carbon trips", icon: "Bike" },
  { id: "plant_powered_15", title: "Plant Powered", description: "Log 15 vegan or vegetarian meals", icon: "Leaf" },
  { id: "waste_watcher_10", title: "Waste Watcher", description: "Log 10 waste entries", icon: "Recycle" },
  { id: "century_club", title: "Century Club", description: "Reach 100 total logged activities", icon: "Trophy" },
  { id: "level_tree", title: "Rooted", description: "Reach the Tree level", icon: "TreeDeciduous" },
  { id: "level_forest", title: "Canopy Builder", description: "Reach the Forest level", icon: "TreePine" },
  { id: "low_carbon_day", title: "Carbon Cutter", description: "Log a day under 5kg CO₂", icon: "Sparkles" },
];

function lowCarbonTransport(e: ActivityEntry) {
  return (
    e.category === "transport" &&
    ["walking", "cycling", "metro", "train", "bus", "ev"].includes(String(e.meta.mode))
  );
}

function plantMeal(e: ActivityEntry) {
  return e.category === "food" && ["vegan", "vegetarian"].includes(String(e.meta.type));
}

export function evaluateAchievements(
  activities: ActivityEntry[],
  streak: number,
  levelName: string
): Record<string, boolean> {
  const byDay = new Map<string, number>();
  for (const a of activities) {
    const day = a.createdAt.slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + a.co2kg);
  }
  const lowCarbonDay = [...byDay.values()].some((v) => v > 0 && v < 5);

  return {
    first_log: activities.length >= 1,
    week_streak: streak >= 7,
    month_streak: streak >= 30,
    green_commute_10: activities.filter(lowCarbonTransport).length >= 10,
    plant_powered_15: activities.filter(plantMeal).length >= 15,
    waste_watcher_10: activities.filter((e) => e.category === "waste").length >= 10,
    century_club: activities.length >= 100,
    level_tree: ["Tree", "Forest", "Earth Guardian", "Planet Protector"].includes(levelName),
    level_forest: ["Forest", "Earth Guardian", "Planet Protector"].includes(levelName),
    low_carbon_day: lowCarbonDay,
  };
}

export const DAILY_CHALLENGES = [
  { id: "plant_meal", text: "Log a fully plant-based meal today" },
  { id: "public_transport", text: "Take public transport or carpool instead of driving solo" },
  { id: "zero_plastic", text: "Get through today without logging any plastic waste" },
  { id: "walk_or_cycle", text: "Walk or cycle for at least one trip today" },
  { id: "track_water", text: "Log your water usage for today" },
  { id: "unplug", text: "Unplug one idle appliance and log a lower electricity reading" },
  { id: "recycle_something", text: "Recycle or reuse one item instead of tossing it" },
];

export function getDailyChallenge(dateStr: string) {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0;
  return DAILY_CHALLENGES[hash % DAILY_CHALLENGES.length];
}
