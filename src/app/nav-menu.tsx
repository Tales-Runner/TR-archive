"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavGroup {
  label: string;
  items: { href: string; label: string }[];
}

export function NavMenu({ groups }: { groups: NavGroup[] }) {
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    setOpenGroup(null);
    setMobileOpen(false);
  }, [pathname]);

  // Close on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenGroup(null);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpenGroup(null);
        setMobileOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* Desktop */}
      <nav ref={menuRef} className="hidden md:flex gap-1 items-center">
        {groups.map((group) => (
          <div key={group.label} className="relative">
            <button
              onClick={() =>
                setOpenGroup(openGroup === group.label ? null : group.label)
              }
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                openGroup === group.label || group.items.some((i) => isActive(i.href))
                  ? "bg-white/10 text-white/80"
                  : "text-white/50 hover:bg-white/5 hover:text-white/80"
              }`}
            >
              {group.label}
              <span className="ml-1 text-[10px]">
                {openGroup === group.label ? "▲" : "▼"}
              </span>
            </button>
            {openGroup === group.label && (
              <div className="absolute top-full left-0 mt-1 min-w-[160px] rounded-xl border border-white/10 bg-[#1a1530]/95 backdrop-blur-md py-1 shadow-xl animate-slide-down">
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block px-4 py-2 text-sm transition-colors ${
                      isActive(item.href)
                        ? "text-teal-300 bg-white/5"
                        : "text-white/60 hover:bg-white/5 hover:text-white/80"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden rounded-md p-2 text-white/50 hover:bg-white/5 hover:text-white/80"
        aria-label="메뉴"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          {mobileOpen ? (
            <path d="M5 5l10 10M15 5L5 15" />
          ) : (
            <path d="M3 5h14M3 10h14M3 15h14" />
          )}
        </svg>
      </button>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 z-40 md:hidden border-b border-white/10 bg-[#0f0b1a]/95 backdrop-blur-md max-h-[70vh] overflow-y-auto animate-slide-down">
          {groups.map((group) => (
            <div key={group.label} className="px-4 py-2">
              <div className="text-[10px] uppercase tracking-wider text-white/30 mb-1">
                {group.label}
              </div>
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-md px-3 py-2 text-sm ${
                    isActive(item.href)
                      ? "text-teal-300 bg-white/5"
                      : "text-white/60 hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
          {/* External link */}
          <div className="px-4 py-2 border-t border-white/5">
            <a
              href="https://tr.rhaon.co.kr/news/notices"
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-md px-3 py-2 text-sm text-white/40 hover:bg-white/5"
            >
              공지사항 ↗
            </a>
          </div>
        </div>
      )}
    </>
  );
}
