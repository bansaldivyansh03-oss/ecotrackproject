import type { TransportMode, FoodType, WasteType } from "./types";
import {
  calcTransport,
  calcFood,
  calcElectricity,
  calcWaste,
  calcWater,
} from "./emissions";
import type { ActivityEntry } from "./types";

const TRANSPORT_WORDS: Record<string, TransportMode> = {
  car: "car",
  drove: "car",
  driving: "car",
  bike: "bike",
  motorbike: "bike",
  scooter: "bike",
  bus: "bus",
  metro: "metro",
  subway: "metro",
  train: "train",
  walked: "walking",
  walking: "walking",
  cycled: "cycling",
  cycling: "cycling",
  bicycle: "cycling",
  flight: "flight",
  flew: "flight",
  ev: "ev",
  "electric car": "ev",
};

const FOOD_WORDS: Record<string, FoodType> = {
  vegan: "vegan",
  vegetarian: "vegetarian",
  chicken: "chicken",
  fish: "seafood",
  seafood: "seafood",
  pork: "pork",
  beef: "beef",
  steak: "beef",
  dairy: "dairy",
  milk: "dairy",
  cheese: "dairy",
};

const WASTE_WORDS: Record<string, WasteType> = {
  plastic: "plastic",
  paper: "paper",
  glass: "glass",
  "food waste": "foodWaste",
  "e-waste": "eWaste",
  electronic: "eWaste",
};

function extractNumber(text: string): number | null {
  const match = text.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
}

export interface VoiceParseResult {
  entry: Omit<ActivityEntry, "id" | "createdAt"> | null;
  transcript: string;
  interpretation: string;
}

export function parseVoiceTranscript(transcript: string): VoiceParseResult {
  const text = transcript.toLowerCase();
  const number = extractNumber(text);

  // Transport: "I travelled 15 kilometres by metro"
  for (const [word, mode] of Object.entries(TRANSPORT_WORDS)) {
    if (text.includes(word)) {
      const km = number ?? 5;
      const entry = calcTransport(mode, km);
      return {
        entry,
        transcript,
        interpretation: `Logged ${km} km by ${mode} (${entry.co2kg} kg CO₂)`,
      };
    }
  }

  // Food: "I had a chicken meal" / "ate 2 vegan meals"
  for (const [word, type] of Object.entries(FOOD_WORDS)) {
    if (text.includes(word)) {
      const servings = number ?? 1;
      const entry = calcFood(type, servings);
      return {
        entry,
        transcript,
        interpretation: `Logged ${servings} serving(s) of ${type} (${entry.co2kg} kg CO₂)`,
      };
    }
  }

  // Waste: "I recycled 2 kg of plastic"
  for (const [word, type] of Object.entries(WASTE_WORDS)) {
    if (text.includes(word)) {
      const kg = number ?? 1;
      const entry = calcWaste(type, kg);
      return {
        entry,
        transcript,
        interpretation: `Logged ${kg} kg of ${type} waste (${entry.co2kg} kg CO₂)`,
      };
    }
  }

  // Electricity: "I used 3 kWh of electricity"
  if (text.includes("electric") || text.includes("kwh") || text.includes("power")) {
    const kwh = number ?? 2;
    const entry = calcElectricity(kwh, "Voice logged");
    return {
      entry,
      transcript,
      interpretation: `Logged ${kwh} kWh of electricity (${entry.co2kg} kg CO₂)`,
    };
  }

  // Water: "I used 50 litres of water"
  if (text.includes("water") || text.includes("litre") || text.includes("liter")) {
    const litres = number ?? 20;
    const entry = calcWater(litres);
    return {
      entry,
      transcript,
      interpretation: `Logged ${litres}L of water use (${entry.co2kg} kg CO₂)`,
    };
  }

  return {
    entry: null,
    transcript,
    interpretation:
      "I couldn't identify an activity in that sentence. Try something like \"I travelled 15 kilometres by metro today.\"",
  };
}
