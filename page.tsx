"use client";

import { useRef, useState } from "react";
import { Camera, Upload, Recycle, Ban, Loader2, ScanLine, Receipt } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { useAppStore } from "@/lib/store";
import { classifyImage, SCAN_CATEGORIES, type ScanCategory } from "@/lib/ecoscan";
import { SHOPPING_LABELS, calcShopping } from "@/lib/emissions";
import type { ShoppingType } from "@/lib/types";

interface ScanResult {
  category: ScanCategory;
  confidence: number;
  imageUrl: string;
}

const RECEIPT_KEYWORDS: Record<ShoppingType, string[]> = {
  clothing: ["shirt", "tee", "jeans", "dress", "jacket", "apparel", "wear"],
  electronics: ["phone", "charger", "cable", "electronic", "battery", "headphone", "earbud"],
  furniture: ["chair", "table", "shelf", "sofa", "furniture", "desk"],
  household: ["soap", "detergent", "tissue", "cleaner", "kitchen", "household", "plastic", "bottle"],
};

export default function ScanPage() {
  const [mode, setMode] = useState<"object" | "receipt">("object");
  return (
    <div className="pb-6">
      <PageHeader title="AI Eco Scan" subtitle="Identify and log from a photo" back />
      <div className="px-5 flex gap-2 mb-4">
        <button
          onClick={() => setMode("object")}
          className={`flex-1 rounded-2xl py-2.5 text-sm font-medium border ${mode === "object" ? "bg-moss text-mist border-moss" : "bg-surface border-border-soft"}`}
        >
          Scan object
        </button>
        <button
          onClick={() => setMode("receipt")}
          className={`flex-1 rounded-2xl py-2.5 text-sm font-medium border ${mode === "receipt" ? "bg-moss text-mist border-moss" : "bg-surface border-border-soft"}`}
        >
          Scan receipt
        </button>
      </div>
      {mode === "object" ? <ObjectScan /> : <ReceiptScan />}
    </div>
  );
}

function ObjectScan() {
  const inputRef = useRef<HTMLInputElement>(null);
  const addActivity = useAppStore((s) => s.addActivity);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [correctedId, setCorrectedId] = useState<string | null>(null);
  const [logged, setLogged] = useState(false);

  async function handleFile(file: File) {
    setLoading(true);
    setResult(null);
    setLogged(false);
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = async () => {
      const { category, confidence } = await classifyImage(img);
      setResult({ category, confidence, imageUrl: url });
      setCorrectedId(category.id);
      setLoading(false);
    };
    img.src = url;
  }

  const activeCategory = SCAN_CATEGORIES.find((c) => c.id === correctedId) ?? result?.category;

  function logScan() {
    if (!activeCategory) return;
    addActivity({
      category: "waste",
      label: `Eco Scan · ${activeCategory.label}`,
      detail: "Identified via AI Eco Scan",
      co2kg: activeCategory.co2kgEstimate,
      formula: `Estimated typical footprint for ${activeCategory.label.toLowerCase()}`,
      treeDaysEquivalent: Math.round((activeCategory.co2kgEstimate / 21) * 365 * 10) / 10,
      alternatives: activeCategory.alternatives,
      meta: { scanCategory: activeCategory.id },
    });
    setLogged(true);
    setTimeout(() => setLogged(false), 1800);
  }

  return (
    <div className="px-5">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      {!result && !loading && (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full aspect-square rounded-3xl border-2 border-dashed border-moss/40 flex flex-col items-center justify-center gap-3 text-moss"
        >
          <Camera size={36} strokeWidth={1.5} />
          <span className="text-sm font-medium">Capture or upload a photo</span>
          <span className="text-[11px] text-foreground-soft flex items-center gap-1">
            <Upload size={12} /> Object, food, appliance, or waste
          </span>
        </button>
      )}

      {loading && (
        <div className="w-full aspect-square rounded-3xl bg-surface border border-border-soft flex flex-col items-center justify-center gap-3">
          <Loader2 size={28} className="animate-spin text-moss" />
          <span className="text-sm text-foreground-soft">Analyzing image…</span>
        </div>
      )}

      {result && activeCategory && (
        <div className="rise-fade">
          <div className="w-full aspect-square rounded-3xl overflow-hidden border border-border-soft relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={result.imageUrl} alt="Scanned item" className="w-full h-full object-cover" />
          </div>

          <div className="mt-4 rounded-3xl bg-surface border border-border-soft p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="font-medium">{activeCategory.label}</p>
              <span className="text-[11px] text-foreground-soft">{Math.round(result.confidence * 100)}% confidence</span>
            </div>
            <p className="text-xs text-foreground-soft mb-3">Not quite right? Correct the category below.</p>
            <select
              value={correctedId ?? ""}
              onChange={(e) => setCorrectedId(e.target.value)}
              className="w-full rounded-xl bg-background border border-border-soft px-3 py-2.5 text-sm mb-4"
            >
              {SCAN_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2 mb-3">
              <span className={`h-8 w-8 rounded-full flex items-center justify-center ${activeCategory.recyclable ? "bg-moss/15 text-moss" : "bg-ember/15 text-ember"}`}>
                {activeCategory.recyclable ? <Recycle size={15} /> : <Ban size={15} />}
              </span>
              <p className="text-sm">{activeCategory.recyclable ? "Recyclable" : "Not typically recyclable"}</p>
            </div>
            <p className="text-xs text-foreground-soft leading-relaxed mb-3">{activeCategory.disposal}</p>

            <p className="font-mono text-lg font-semibold mb-1">~{activeCategory.co2kgEstimate}kg CO₂</p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {activeCategory.alternatives.map((a, i) => (
                <span key={i} className="text-[11px] bg-moss/10 text-moss rounded-full px-2.5 py-1">
                  {a}
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setResult(null);
                  inputRef.current?.click();
                }}
                className="flex-1 rounded-xl border border-border-soft py-3 text-sm"
              >
                Scan another
              </button>
              <button onClick={logScan} className="flex-1 rounded-xl bg-moss text-mist py-3 text-sm font-medium">
                Log this
              </button>
            </div>
            {logged && <p className="text-center text-xs text-moss mt-2">Logged ✓</p>}
          </div>
        </div>
      )}

      <p className="text-[11px] text-foreground-soft text-center mt-4">
        Eco Scan uses on-device image analysis to estimate a category — it&apos;s a helpful guess, not certified recognition, so please confirm before logging.
      </p>
    </div>
  );
}

function ReceiptScan() {
  const inputRef = useRef<HTMLInputElement>(null);
  const addActivity = useAppStore((s) => s.addActivity);
  const [status, setStatus] = useState<"idle" | "reading" | "done">("idle");
  const [lines, setLines] = useState<string[]>([]);
  const [counts, setCounts] = useState<Record<ShoppingType, number>>({
    clothing: 0,
    electronics: 0,
    furniture: 0,
    household: 0,
  });
  const [logged, setLogged] = useState(false);

  async function handleFile(file: File) {
    setStatus("reading");
    setLogged(false);
    const { createWorker } = await import("tesseract.js");
    const worker = await createWorker("eng");
    const {
      data: { text },
    } = await worker.recognize(file);
    await worker.terminate();

    const rawLines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    setLines(rawLines);

    const nextCounts: Record<ShoppingType, number> = { clothing: 0, electronics: 0, furniture: 0, household: 0 };
    for (const line of rawLines) {
      const lower = line.toLowerCase();
      for (const [category, keywords] of Object.entries(RECEIPT_KEYWORDS) as [ShoppingType, string[]][]) {
        if (keywords.some((k) => lower.includes(k))) nextCounts[category] += 1;
      }
    }
    setCounts(nextCounts);
    setStatus("done");
  }

  function logEntries() {
    let any = false;
    (Object.entries(counts) as [ShoppingType, number][]).forEach(([type, qty]) => {
      if (qty > 0) {
        any = true;
        addActivity(calcShopping(type, qty));
      }
    });
    if (any) {
      setLogged(true);
      setTimeout(() => setLogged(false), 1800);
    }
  }

  const totalItems = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="px-5">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      {status === "idle" && (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full aspect-[3/4] rounded-3xl border-2 border-dashed border-moss/40 flex flex-col items-center justify-center gap-3 text-moss"
        >
          <Receipt size={36} strokeWidth={1.5} />
          <span className="text-sm font-medium">Upload a shopping receipt</span>
          <span className="text-[11px] text-foreground-soft">Runs OCR on-device — nothing is uploaded to a server</span>
        </button>
      )}

      {status === "reading" && (
        <div className="w-full aspect-[3/4] rounded-3xl bg-surface border border-border-soft flex flex-col items-center justify-center gap-3">
          <Loader2 size={28} className="animate-spin text-moss" />
          <span className="text-sm text-foreground-soft">Reading receipt…</span>
        </div>
      )}

      {status === "done" && (
        <div className="rise-fade">
          <div className="rounded-3xl bg-surface border border-border-soft p-4 mb-3">
            <p className="text-sm font-medium mb-2 flex items-center gap-2">
              <ScanLine size={15} className="text-moss" /> Detected purchases
            </p>
            {totalItems === 0 ? (
              <p className="text-sm text-foreground-soft">
                I couldn&apos;t confidently match any product categories on this receipt. Try a clearer photo, or log items manually.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {(Object.entries(counts) as [ShoppingType, number][])
                  .filter(([, qty]) => qty > 0)
                  .map(([type, qty]) => (
                    <div key={type} className="flex items-center justify-between text-sm">
                      <span>{SHOPPING_LABELS[type]}</span>
                      <span className="font-mono">{qty} item(s)</span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <details className="mb-3">
            <summary className="text-xs text-foreground-soft cursor-pointer">Show raw OCR text ({lines.length} lines)</summary>
            <div className="mt-2 rounded-xl bg-surface border border-border-soft p-3 max-h-32 overflow-y-auto text-[11px] text-foreground-soft">
              {lines.map((l, i) => (
                <p key={i}>{l}</p>
              ))}
            </div>
          </details>

          <div className="flex gap-2">
            <button
              onClick={() => setStatus("idle")}
              className="flex-1 rounded-xl border border-border-soft py-3 text-sm"
            >
              Scan another
            </button>
            {totalItems > 0 && (
              <button onClick={logEntries} className="flex-1 rounded-xl bg-moss text-mist py-3 text-sm font-medium">
                Log all
              </button>
            )}
          </div>
          {logged && <p className="text-center text-xs text-moss mt-2">Logged ✓</p>}
        </div>
      )}
    </div>
  );
}
