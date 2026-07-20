"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, User } from "lucide-react";
import { useAppStore } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const login = useAppStore((s) => s.login);
  const [mode, setMode] = useState<"choose" | "email">("choose");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  function finish(method: "google" | "email" | "guest", n: string, e?: string) {
    login(method, n, e);
    router.push("/dashboard");
  }

  return (
    <div className="min-h-dvh flex flex-col justify-center px-6 bg-background">
      <div className="mb-10 text-center">
        <div className="h-16 w-16 rounded-3xl bg-moss mx-auto mb-5 flex items-center justify-center text-2xl">
          🌍
        </div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Welcome to EcoTracker</h1>
        <p className="text-foreground-soft text-sm mt-1.5">
          Sign in to save your progress and grow your forest
        </p>
      </div>

      {mode === "choose" && (
        <div className="flex flex-col gap-3 rise-fade">
          <button
            onClick={() => finish("google", "Alex Green", "alex@gmail.com")}
            className="flex items-center justify-center gap-3 rounded-2xl border border-border-soft bg-surface py-3.5 font-medium active:scale-[0.98] transition-transform"
          >
            <GoogleG />
            Continue with Google
          </button>
          <button
            onClick={() => setMode("email")}
            className="flex items-center justify-center gap-3 rounded-2xl border border-border-soft bg-surface py-3.5 font-medium active:scale-[0.98] transition-transform"
          >
            <Mail size={18} />
            Continue with email
          </button>
          <button
            onClick={() => finish("guest", "Guest")}
            className="flex items-center justify-center gap-3 rounded-2xl py-3.5 font-medium text-foreground-soft active:scale-[0.98] transition-transform"
          >
            <User size={18} />
            Continue as guest
          </button>
        </div>
      )}

      {mode === "email" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (name && email) finish("email", name, email);
          }}
          className="flex flex-col gap-3 rise-fade"
        >
          <input
            required
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-2xl border border-border-soft bg-surface px-4 py-3.5 outline-none focus:border-moss"
          />
          <input
            required
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-2xl border border-border-soft bg-surface px-4 py-3.5 outline-none focus:border-moss"
          />
          <button
            type="submit"
            className="rounded-2xl bg-moss text-mist font-medium py-3.5 mt-1 active:scale-[0.98] transition-transform"
          >
            Continue
          </button>
          <button
            type="button"
            onClick={() => setMode("choose")}
            className="text-sm text-foreground-soft py-2"
          >
            Back
          </button>
        </form>
      )}

      <p className="text-[11px] text-foreground-soft/70 text-center mt-8">
        This demo build stores your account and activity locally on this device.
      </p>
    </div>
  );
}

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.5 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.6 6.1 29.6 4 24 4 16.1 4 9.3 8.4 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 45c5.5 0 10.4-1.9 14.2-5l-6.6-5.4C29.6 36.3 26.9 37 24 37c-5.3 0-9.7-3.3-11.3-8l-6.6 5C9.2 40.6 16 45 24 45z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.6 5.4C40.8 36 44 30.6 44 24c0-1.2-.1-2.4-.4-3.5z" />
    </svg>
  );
}
