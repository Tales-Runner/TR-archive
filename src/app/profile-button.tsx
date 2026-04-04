"use client";

import Link from "next/link";
import Image from "next/image";
import { useProfile } from "@/lib/use-profile";

export function ProfileButton() {
  const { profile, ready } = useProfile();

  if (!ready) {
    return (
      <Link
        href="/my"
        className="shrink-0 h-7 w-7 rounded-full bg-white/5 skeleton"
        aria-label="마이페이지"
      />
    );
  }

  if (profile?.avatarUrl) {
    return (
      <Link
        href="/my"
        className="shrink-0 rounded-full ring-1 ring-white/10 hover:ring-teal-500/40 transition-all"
        aria-label="마이페이지"
      >
        <Image
          src={profile.avatarUrl}
          alt=""
          width={28}
          height={28}
          className="rounded-full"
        />
      </Link>
    );
  }

  return (
    <Link
      href="/my"
      className="shrink-0 flex items-center justify-center h-7 w-7 rounded-full bg-white/5 text-white/30 hover:bg-white/10 hover:text-white/50 transition-colors"
      aria-label="마이페이지"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <circle cx="8" cy="5" r="3" />
        <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      </svg>
    </Link>
  );
}
