import type { ActivityEntry, ActivityCategory } from "./types";

export function dayKey(iso: string) {
  return iso.slice(0, 10);
}

export function totalFor(activities: ActivityEntry[], day: string) {
  return activities
    .filter((a) => dayKey(a.createdAt) === day)
    .reduce((sum, a) => sum + a.co2kg, 0);
}

export function last7Days(): string[] {
  const out: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export function last30Days(): string[] {
  const out: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export function weeklySeries(activities: ActivityEntry[]) {
  return last7Days().map((d) => ({
    day: new Date(d).toLocaleDateString("en-US", { weekday: "short" }),
    date: d,
    co2: Math.round(totalFor(activities, d) * 100) / 100,
  }));
}

export function monthlySeries(activities: ActivityEntry[]) {
  return last30Days().map((d) => ({
    day: new Date(d).getDate().toString(),
    date: d,
    co2: Math.round(totalFor(activities, d) * 100) / 100,
  }));
}

const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  transport: "Transport",
  electricity: "Electricity",
  cooking: "Cooking",
  food: "Food",
  shopping: "Shopping",
  waste: "Waste",
  water: "Water",
};

export const CATEGORY_COLORS: Record<ActivityCategory, string> = {
  transport: "#3E7C8C",
  electricity: "#D9713C",
  cooking: "#6B5340",
  food: "#4C7A5B",
  shopping: "#A8886B",
  waste: "#8C6E3E",
  water: "#5FA3B8",
};

export function categoryBreakdown(activities: ActivityEntry[], since?: string) {
  const filtered = since ? activities.filter((a) => dayKey(a.createdAt) >= since) : activities;
  const totals = new Map<ActivityCategory, number>();
  for (const a of filtered) totals.set(a.category, (totals.get(a.category) ?? 0) + a.co2kg);
  return [...totals.entries()]
    .map(([category, co2]) => ({
      category,
      name: CATEGORY_LABELS[category],
      value: Math.round(co2 * 100) / 100,
      color: CATEGORY_COLORS[category],
    }))
    .sort((a, b) => b.value - a.value);
}

// Carbon Score: 0-100, higher is better. Benchmarked against a ~12kg/day
// "sustainable" target and a ~28kg/day high-emission ceiling.
const GOOD_TARGET = 12;
const HIGH_CEILING = 28;

export function carbonScore(todayKg: number): number {
  if (todayKg <= 0) return 100;
  if (todayKg <= GOOD_TARGET) {
    return Math.round(100 - (todayKg / GOOD_TARGET) * 25); // 75-100
  }
  if (todayKg >= HIGH_CEILING) return 5;
  const ratio = (todayKg - GOOD_TARGET) / (HIGH_CEILING - GOOD_TARGET);
  return Math.round(75 - ratio * 70); // scales 75 -> 5
}

export function averageDailyKg(activities: ActivityEntry[], days: string[]): number {
  if (!days.length) return 0;
  const total = days.reduce((sum, d) => sum + totalFor(activities, d), 0);
  return total / days.length;
}

export interface Forecast {
  horizonDays: number;
  label: string;
  projectedKg: number;
  reducedKg: number; // projected if user cuts 20%
}

export function forecast(activities: ActivityEntry[]): Forecast[] {
  const avg = averageDailyKg(activities, last7Days());
  const horizons = [
    { horizonDays: 7, label: "1 week" },
    { horizonDays: 30, label: "1 month" },
    { horizonDays: 182, label: "6 months" },
    { horizonDays: 365, label: "1 year" },
  ];
  return horizons.map((h) => ({
    ...h,
    projectedKg: Math.round(avg * h.horizonDays * 10) / 10,
    reducedKg: Math.round(avg * h.horizonDays * 0.8 * 10) / 10,
  }));
}

export function biggestContributor(activities: ActivityEntry[], since: string): string | null {
  const breakdown = categoryBreakdown(activities, since);
  return breakdown.length ? breakdown[0].name : null;
}

const CAR_FACTOR = 0.192;
const BEEF_FACTOR = 6.0;
const TREE_KG_PER_YEAR = 21;

export interface ImpactStats {
  co2AvoidedKg: number;
  treesSavedEquivalent: number;
  waterLoggedL: number;
  energyLoggedKwh: number;
}

/**
 * Gamified, directional impact stats — not an audited accounting figure.
 * co2Avoided compares logged low-carbon transport/food choices against a
 * car/beef baseline; water & energy are cumulative logged usage, shown as
 * "tracked" rather than "saved" to stay honest about what's measured.
 */
export function computeImpactStats(activities: ActivityEntry[]): ImpactStats {
  let avoided = 0;
  let waterL = 0;
  let energyKwh = 0;

  for (const a of activities) {
    if (a.category === "transport") {
      const km = Number(a.meta.km) || 0;
      const factor = a.co2kg / km || 0;
      if (factor < CAR_FACTOR) avoided += (CAR_FACTOR - factor) * km;
    }
    if (a.category === "food") {
      const servings = Number(a.meta.servings) || 0;
      const factor = a.co2kg / (servings || 1);
      if (a.meta.type !== "beef") avoided += Math.max(0, (BEEF_FACTOR - factor) * servings * 0.15);
    }
    if (a.category === "water") waterL += Number(a.meta.litres) || 0;
    if (a.category === "electricity") energyKwh += Number(a.meta.kwh) || 0;
  }

  return {
    co2AvoidedKg: Math.round(avoided * 10) / 10,
    treesSavedEquivalent: Math.round((avoided / TREE_KG_PER_YEAR) * 10) / 10,
    waterLoggedL: Math.round(waterL),
    energyLoggedKwh: Math.round(energyKwh * 10) / 10,
  };
}
