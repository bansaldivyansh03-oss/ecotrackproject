import {
  Car,
  Zap,
  Flame,
  UtensilsCrossed,
  ShoppingBag,
  Trash2,
  Droplets,
  type LucideIcon,
} from "lucide-react";
import type { ActivityCategory } from "@/lib/types";

export const CATEGORY_ICON: Record<ActivityCategory, LucideIcon> = {
  transport: Car,
  electricity: Zap,
  cooking: Flame,
  food: UtensilsCrossed,
  shopping: ShoppingBag,
  waste: Trash2,
  water: Droplets,
};

export const CATEGORY_LABEL: Record<ActivityCategory, string> = {
  transport: "Transport",
  electricity: "Electricity",
  cooking: "Cooking",
  food: "Food",
  shopping: "Shopping",
  waste: "Waste",
  water: "Water",
};

export const CATEGORY_COLOR: Record<ActivityCategory, string> = {
  transport: "#3E7C8C",
  electricity: "#D9713C",
  cooking: "#6B5340",
  food: "#4C7A5B",
  shopping: "#A8886B",
  waste: "#8C6E3E",
  water: "#5FA3B8",
};
