"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, NotebookPen, BarChart3, Trees, CircleUserRound, Plus } from "lucide-react";

const TABS = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/log", icon: NotebookPen, label: "Log" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/forest", icon: Trees, label: "Forest" },
  { href: "/profile", icon: CircleUserRound, label: "Profile" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40">
      <div className="relative mx-3 mb-3">
        <nav className="grid grid-cols-5 items-center rounded-[28px] bg-surface/95 backdrop-blur border border-border-soft shadow-[0_8px_30px_rgba(0,0,0,0.12)] px-1 py-2">
          {TABS.slice(0, 2).map((tab) => (
            <NavItem key={tab.href} tab={tab} active={pathname === tab.href} />
          ))}
          <div />
          {TABS.slice(2).map((tab) => (
            <NavItem key={tab.href} tab={tab} active={pathname === tab.href} />
          ))}
        </nav>
        <button
          aria-label="Quick log activity"
          onClick={() => router.push("/log?quick=1")}
          className="absolute -top-6 left-1/2 -translate-x-1/2 h-14 w-14 rounded-full bg-moss text-mist shadow-[0_10px_24px_rgba(76,122,91,0.45)] flex items-center justify-center active:scale-95 transition-transform"
        >
          <Plus size={26} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

function NavItem({
  tab,
  active,
}: {
  tab: { href: string; icon: typeof Home; label: string };
  active: boolean;
}) {
  const Icon = tab.icon;
  return (
    <Link
      href={tab.href}
      className="flex flex-col items-center justify-center gap-1 py-1 rounded-2xl transition-colors"
    >
      <Icon
        size={22}
        strokeWidth={active ? 2.4 : 1.8}
        className={active ? "text-moss" : "text-foreground-soft"}
      />
      <span
        className={`text-[10px] font-medium ${active ? "text-moss" : "text-foreground-soft"}`}
      >
        {tab.label}
      </span>
    </Link>
  );
}
