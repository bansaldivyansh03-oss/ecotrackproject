export interface ScanCategory {
  id: string;
  label: string;
  co2kgEstimate: number;
  recyclable: boolean;
  disposal: string;
  alternatives: string[];
}

export const SCAN_CATEGORIES: ScanCategory[] = [
  {
    id: "plastic_packaging",
    label: "Plastic packaging",
    co2kgEstimate: 1.2,
    recyclable: true,
    disposal: "Rinse and place in dry/recyclable waste — check for a recycling code on the item.",
    alternatives: ["Choose refill or bulk options", "Switch to a reusable container", "Look for compostable packaging"],
  },
  {
    id: "food_organic",
    label: "Food / organic waste",
    co2kgEstimate: 0.6,
    recyclable: false,
    disposal: "Compost if possible — food waste in landfill produces methane.",
    alternatives: ["Plan portions to reduce leftovers", "Start a small compost bin", "Freeze extras instead of discarding"],
  },
  {
    id: "paper_cardboard",
    label: "Paper / cardboard",
    co2kgEstimate: 0.4,
    recyclable: true,
    disposal: "Flatten and place in dry/recyclable waste, keep free of food residue.",
    alternatives: ["Reuse boxes for storage or shipping", "Switch to digital receipts/bills"],
  },
  {
    id: "electronics",
    label: "Electronics / e-waste",
    co2kgEstimate: 18,
    recyclable: true,
    disposal: "Take to a certified e-waste collection point — never bin electronics with regular waste.",
    alternatives: ["Repair instead of replacing", "Donate or resell working devices", "Recycle batteries separately"],
  },
  {
    id: "glass",
    label: "Glass",
    co2kgEstimate: 0.5,
    recyclable: true,
    disposal: "Rinse and place in glass recycling; glass is infinitely recyclable without quality loss.",
    alternatives: ["Reuse jars for storage", "Buy concentrates to reduce glass volume shipped"],
  },
  {
    id: "textile",
    label: "Textile / clothing",
    co2kgEstimate: 8,
    recyclable: true,
    disposal: "Donate if wearable; textile recycling bins accept worn-out fabric.",
    alternatives: ["Repair or upcycle", "Buy secondhand", "Choose durable, natural fibers"],
  },
  {
    id: "metal",
    label: "Metal / cans",
    co2kgEstimate: 1.5,
    recyclable: true,
    disposal: "Rinse and place in recyclable waste — aluminum and steel are highly recyclable.",
    alternatives: ["Choose reusable bottles over cans", "Crush cans to save collection space"],
  },
];

/**
 * Lightweight, fully client-side heuristic: samples average color/brightness
 * from the image and maps it to the closest waste/object category. This is a
 * best-effort estimate (not real object recognition) — the UI lets the user
 * confirm or correct the category before it's logged.
 */
export async function classifyImage(imageEl: HTMLImageElement): Promise<{
  category: ScanCategory;
  confidence: number;
}> {
  const canvas = document.createElement("canvas");
  const size = 32;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return { category: SCAN_CATEGORIES[0], confidence: 0.4 };
  }
  ctx.drawImage(imageEl, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);

  let r = 0, g = 0, b = 0;
  const n = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }
  r /= n; g /= n; b /= n;

  const brightness = (r + g + b) / 3;
  const greenness = g - (r + b) / 2;
  const blueness = b - (r + g) / 2;
  const saturation = Math.max(r, g, b) - Math.min(r, g, b);

  let category: ScanCategory;
  let confidence = 0.55;

  if (greenness > 12 && brightness > 60) {
    category = SCAN_CATEGORIES.find((c) => c.id === "food_organic")!;
    confidence = 0.62;
  } else if (brightness > 195 && saturation < 25) {
    category = SCAN_CATEGORIES.find((c) => c.id === "paper_cardboard")!;
    confidence = 0.58;
  } else if (brightness < 70 && saturation < 30) {
    category = SCAN_CATEGORIES.find((c) => c.id === "electronics")!;
    confidence = 0.5;
  } else if (blueness > 10 && brightness > 120) {
    category = SCAN_CATEGORIES.find((c) => c.id === "glass")!;
    confidence = 0.5;
  } else if (saturation > 60) {
    category = SCAN_CATEGORIES.find((c) => c.id === "textile")!;
    confidence = 0.48;
  } else if (brightness > 150 && saturation < 40 && r > g) {
    category = SCAN_CATEGORIES.find((c) => c.id === "metal")!;
    confidence = 0.45;
  } else {
    category = SCAN_CATEGORIES.find((c) => c.id === "plastic_packaging")!;
    confidence = 0.5;
  }

  return { category, confidence };
}
