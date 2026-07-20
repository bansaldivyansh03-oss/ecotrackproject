import type {
  ActivityCategory,
  ActivityEntry,
  CookingFuel,
  FoodType,
  ShoppingType,
  TransportMode,
  WasteType,
} from "./types";

// All factors are widely-cited ballpark averages meant for personal awareness,
// not audit-grade accounting. Sources: IPCC/DEFRA-style per-km and per-kg
// averages. Users can treat these as directional estimates.

export const TRANSPORT_FACTORS_KG_PER_KM: Record<TransportMode, number> = {
  car: 0.192,
  ev: 0.053,
  bike: 0.083, // motorbike/scooter
  bus: 0.089,
  metro: 0.041,
  train: 0.041,
  walking: 0,
  cycling: 0,
  flight: 0.255,
};

export const TRANSPORT_LABELS: Record<TransportMode, string> = {
  car: "Car",
  ev: "Electric vehicle",
  bike: "Motorbike",
  bus: "Bus",
  metro: "Metro",
  train: "Train",
  walking: "Walking",
  cycling: "Cycling",
  flight: "Flight",
};

export const ELECTRICITY_KG_PER_KWH = 0.716; // grid-average estimate

export const COOKING_FACTORS_KG_PER_HOUR: Record<CookingFuel, number> = {
  lpg: 0.62,
  piped_gas: 0.55,
  induction: 0, // counted under electricity separately
  firewood: 1.2,
};

export const FOOD_FACTORS_KG_PER_SERVING: Record<FoodType, number> = {
  vegan: 0.5,
  vegetarian: 0.9,
  dairy: 1.1,
  chicken: 1.6,
  seafood: 1.8,
  pork: 2.5,
  beef: 6.0,
};

export const FOOD_LABELS: Record<FoodType, string> = {
  vegan: "Vegan meal",
  vegetarian: "Vegetarian meal",
  dairy: "Dairy-heavy meal",
  chicken: "Chicken",
  seafood: "Seafood",
  pork: "Pork",
  beef: "Beef",
};

export const SHOPPING_FACTORS_KG_PER_ITEM: Record<ShoppingType, number> = {
  clothing: 8,
  electronics: 55,
  furniture: 45,
  household: 5,
};

export const SHOPPING_LABELS: Record<ShoppingType, string> = {
  clothing: "Clothing",
  electronics: "Electronics",
  furniture: "Furniture",
  household: "Household items",
};

export const WASTE_FACTORS_KG_PER_KG: Record<WasteType, number> = {
  plastic: 6.0,
  paper: 1.3,
  glass: 0.9,
  foodWaste: 2.5,
  eWaste: 20,
};

export const WASTE_LABELS: Record<WasteType, string> = {
  plastic: "Plastic waste",
  paper: "Paper waste",
  glass: "Glass waste",
  foodWaste: "Food waste",
  eWaste: "E-waste",
};

export const WATER_KG_PER_LITRE = 0.0003;

// A mature tree absorbs roughly 21kg CO2 per year.
const TREE_KG_PER_YEAR = 21;

export function treeDaysEquivalent(co2kg: number): number {
  if (co2kg <= 0) return 0;
  return Math.round((co2kg / TREE_KG_PER_YEAR) * 365 * 10) / 10;
}

export function treesToOffsetAnnual(dailyAverageKg: number): number {
  const annual = dailyAverageKg * 365;
  return Math.round((annual / TREE_KG_PER_YEAR) * 10) / 10;
}

interface BuildArgs {
  category: ActivityCategory;
  co2kg: number;
  label: string;
  detail: string;
  formula: string;
  alternatives: string[];
  meta: Record<string, string | number>;
}

export function buildEntry(args: BuildArgs): Omit<ActivityEntry, "id" | "createdAt"> {
  return {
    category: args.category,
    label: args.label,
    detail: args.detail,
    co2kg: Math.round(args.co2kg * 100) / 100,
    formula: args.formula,
    treeDaysEquivalent: treeDaysEquivalent(args.co2kg),
    alternatives: args.alternatives,
    meta: args.meta,
  };
}

export function calcTransport(mode: TransportMode, km: number, passengers = 1) {
  const factor = TRANSPORT_FACTORS_KG_PER_KM[mode];
  const co2kg = (factor * km) / Math.max(1, passengers);
  const alternatives = transportAlternatives(mode);
  return buildEntry({
    category: "transport",
    co2kg,
    label: `${TRANSPORT_LABELS[mode]} · ${km} km`,
    detail: passengers > 1 ? `${passengers} passengers` : "Solo trip",
    formula: `${factor} kg CO₂/km × ${km} km ÷ ${passengers} passenger(s)`,
    alternatives,
    meta: { mode, km, passengers },
  });
}

function transportAlternatives(mode: TransportMode): string[] {
  const greener = ["walking", "cycling", "metro", "train", "bus", "ev"] as TransportMode[];
  if (mode === "walking" || mode === "cycling") return ["Already a low-carbon choice — keep it up!"];
  const options = greener.filter((m) => TRANSPORT_FACTORS_KG_PER_KM[m] < TRANSPORT_FACTORS_KG_PER_KM[mode]);
  return options.slice(0, 3).map((m) => `Try ${TRANSPORT_LABELS[m].toLowerCase()} for this distance`);
}

export function calcElectricity(kwh: number, applianceType: string) {
  const co2kg = kwh * ELECTRICITY_KG_PER_KWH;
  return buildEntry({
    category: "electricity",
    co2kg,
    label: `Electricity · ${kwh} kWh`,
    detail: applianceType || "General usage",
    formula: `${ELECTRICITY_KG_PER_KWH} kg CO₂/kWh × ${kwh} kWh`,
    alternatives: [
      "Switch to LED lighting to cut usage",
      "Unplug idle appliances (phantom load)",
      "Shift heavy appliance use to daylight hours if on solar",
    ],
    meta: { kwh, applianceType },
  });
}

export function calcCooking(fuel: CookingFuel, hours: number) {
  const factor = COOKING_FACTORS_KG_PER_HOUR[fuel];
  const co2kg = factor * hours;
  return buildEntry({
    category: "cooking",
    co2kg,
    label: `Cooking · ${fuel.replace("_", " ")} · ${hours} hr`,
    detail: `${hours} hour(s) of use`,
    formula: `${factor} kg CO₂/hr × ${hours} hr`,
    alternatives: [
      "Use a pressure cooker to cut cooking time",
      "Batch-cook to reduce total burner hours",
      "Consider induction if electricity is cleaner in your area",
    ],
    meta: { fuel, hours },
  });
}

export function calcFood(type: FoodType, servings: number) {
  const factor = FOOD_FACTORS_KG_PER_SERVING[type];
  const co2kg = factor * servings;
  return buildEntry({
    category: "food",
    co2kg,
    label: `${FOOD_LABELS[type]} × ${servings}`,
    detail: `${servings} serving(s)`,
    formula: `${factor} kg CO₂/serving × ${servings} serving(s)`,
    alternatives: foodAlternatives(type),
    meta: { type, servings },
  });
}

function foodAlternatives(type: FoodType): string[] {
  if (type === "vegan") return ["Already among the lowest-footprint choices"];
  if (type === "beef") return ["Try lentils or beans", "Try chicken instead (~4x lower)", "Try a plant-based mince"];
  if (type === "pork" || type === "seafood" || type === "chicken")
    return ["Try a vegetarian meal instead", "Reduce portion size", "Choose seasonal, local produce sides"];
  return ["Try a fully plant-based version of this meal"];
}

export function calcShopping(type: ShoppingType, quantity: number) {
  const factor = SHOPPING_FACTORS_KG_PER_ITEM[type];
  const co2kg = factor * quantity;
  return buildEntry({
    category: "shopping",
    co2kg,
    label: `${SHOPPING_LABELS[type]} × ${quantity}`,
    detail: `${quantity} item(s)`,
    formula: `${factor} kg CO₂/item × ${quantity} item(s)`,
    alternatives: [
      "Buy secondhand or refurbished where possible",
      "Choose durable items over fast fashion/disposables",
      "Repair before replacing",
    ],
    meta: { type, quantity },
  });
}

export function calcWaste(type: WasteType, kg: number) {
  const factor = WASTE_FACTORS_KG_PER_KG[type];
  const co2kg = factor * kg;
  return buildEntry({
    category: "waste",
    co2kg,
    label: `${WASTE_LABELS[type]} · ${kg} kg`,
    detail: `${kg} kg disposed`,
    formula: `${factor} kg CO₂/kg × ${kg} kg`,
    alternatives: [
      "Sort and recycle where local facilities accept it",
      "Compost food waste instead of landfill",
      "Reduce single-use packaging at the source",
    ],
    meta: { type, kg },
  });
}

export function calcWater(litres: number) {
  const co2kg = litres * WATER_KG_PER_LITRE;
  return buildEntry({
    category: "water",
    co2kg,
    label: `Water · ${litres} L`,
    detail: `${litres} litres used`,
    formula: `${WATER_KG_PER_LITRE} kg CO₂/L × ${litres} L`,
    alternatives: [
      "Fix leaks — a slow drip wastes litres a day",
      "Shorter showers save water and water-heating energy",
      "Reuse greywater for plants where safe",
    ],
    meta: { litres },
  });
}
