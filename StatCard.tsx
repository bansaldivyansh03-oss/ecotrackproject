import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}

export default function StatCard({ icon: Icon, label, value, sub, accent }: StatCardProps) {
  return (
    <div className="rounded-2xl bg-surface border border-border-soft p-3.5 flex flex-col gap-2">
      <div
        className="h-8 w-8 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `${accent ?? "var(--moss)"}22`, color: accent ?? "var(--moss)" }}
      >
        <Icon size={16} strokeWidth={2.2} />
      </div>
      <div>
        <p className="font-mono text-lg font-semibold leading-tight">{value}</p>
        <p className="text-[11px] text-foreground-soft leading-tight mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-foreground-soft/70 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
