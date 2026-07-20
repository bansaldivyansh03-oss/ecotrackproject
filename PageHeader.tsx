"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Moon, Sun } from "lucide-react";
import { useAppStore } from "@/lib/store";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, back, right }: PageHeaderProps) {
  const router = useRouter();
  const darkMode = useAppStore((s) => s.darkMode);
  const toggleDarkMode = useAppStore((s) => s.toggleDarkMode);

  return (
    <div className="flex items-center justify-between px-5 pt-6 pb-2">
      <div className="flex items-center gap-2">
        {back && (
          <button
            onClick={() => router.back()}
            className="h-8 w-8 -ml-2 flex items-center justify-center rounded-full active:bg-black/5"
            aria-label="Go back"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-foreground-soft mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {right}
        <button
          onClick={toggleDarkMode}
          aria-label="Toggle dark mode"
          className="h-9 w-9 rounded-full bg-surface border border-border-soft flex items-center justify-center"
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </div>
  );
}
