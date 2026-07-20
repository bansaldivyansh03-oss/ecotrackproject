import type { ActivityEntry } from "./types";
import { biggestContributor, categoryBreakdown, last7Days, averageDailyKg, totalFor } from "./analytics";

const MOTIVATIONAL_TIPS = [
  "Small swaps compound: one meat-free meal a week saves roughly 50kg of CO₂ a year.",
  "A short walk instead of a short drive is one of the easiest wins on your dashboard today.",
  "Unplugging idle chargers overnight can quietly shave kilos off your monthly electricity footprint.",
  "Batching errands into one trip cuts both fuel and time — a rare win-win.",
  "Composting food scraps keeps them out of landfill, where they'd otherwise release methane.",
  "Buying one fewer fast-fashion item this month has a bigger impact than most people expect.",
  "Line-drying clothes instead of using a dryer is a near-zero-effort emissions cut.",
  "Every tree in your forest represents real progress — keep logging honestly, not perfectly.",
];

export function motivationalTip(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return MOTIVATIONAL_TIPS[hash % MOTIVATIONAL_TIPS.length];
}

interface AssistantContext {
  activities: ActivityEntry[];
  name: string;
}

const GREETINGS = /^(hi|hello|hey|namaste|yo)\b/i;
const BIGGEST = /(biggest|highest|most|worst).*(source|contributor|emission|category)/i;
const HOW_DOING = /(how am i doing|how's my|progress|summary|this week)/i;
const REDUCE = /(reduce|lower|cut|improve|help me).*(footprint|emission|carbon)/i;
const TRANSPORT_Q = /(transport|commute|travel|car|drive)/i;
const FOOD_Q = /(food|meal|diet|eat)/i;
const GOAL = /(set|create).*(goal|target)/i;
const STREAK_Q = /(streak)/i;

export function assistantReply(message: string, ctx: AssistantContext): string {
  const msg = message.trim();
  const since = last7Days()[0];
  const breakdown = categoryBreakdown(ctx.activities, since);
  const avg = averageDailyKg(ctx.activities, last7Days());
  const todayKg = totalFor(ctx.activities, new Date().toISOString().slice(0, 10));

  if (GREETINGS.test(msg)) {
    return `Hi ${ctx.name || "there"}! I'm your Eco Assistant. Ask me about your biggest emission source, how you're trending this week, or how to cut your footprint.`;
  }

  if (BIGGEST.test(msg)) {
    const top = biggestContributor(ctx.activities, since);
    if (!top) return "I don't see enough logged activity yet this week — log a few entries and ask me again.";
    const topEntry = breakdown[0];
    return `Over the last 7 days, ${top} is your biggest contributor at about ${topEntry.value}kg CO₂. Want a few ways to bring that down?`;
  }

  if (HOW_DOING.test(msg)) {
    if (!ctx.activities.length) return "You haven't logged anything yet — start with your commute or your last meal and I'll track trends from there.";
    const trend = avg > 0 ? `averaging about ${avg.toFixed(1)}kg CO₂/day` : "just getting started";
    return `This week you're ${trend}. Today so far: ${todayKg.toFixed(1)}kg CO₂. ${breakdown[0] ? `${breakdown[0].name} is leading your footprint.` : ""}`;
  }

  if (REDUCE.test(msg) || TRANSPORT_Q.test(msg)) {
    const top = breakdown[0]?.category;
    if (top === "transport") return "Transport is your top source — try swapping one car trip a week for metro, bus, or cycling. Even one swap adds up over a month.";
    if (top === "food") return "Food is leading right now — cutting back on beef and dairy a couple of times a week has an outsized impact versus most other changes.";
    if (top === "electricity") return "Electricity is your top source — check for appliances left running, and consider shifting heavy usage to off-peak hours.";
    return "Log a few more activities and I can point to your single biggest lever — usually it's transport, food, or electricity.";
  }

  if (FOOD_Q.test(msg)) {
    return "Plant-based meals generally run 0.5–1kg CO₂ versus 2.5–6kg for pork or beef. Swapping even two meals a week can meaningfully lower your average.";
  }

  if (GOAL.test(msg)) {
    return "A good starting goal: bring your daily average under 12kg CO₂. Your dashboard's Carbon Score is tuned to that target — I'll flag it when you're close.";
  }

  if (STREAK_Q.test(msg)) {
    return "Streaks count consecutive days with at least one logged activity — log something today, even something small, to keep it alive.";
  }

  return "I can help with: your biggest emission source, a weekly summary, ways to cut your footprint, or food/transport swaps. What would you like to know?";
}
