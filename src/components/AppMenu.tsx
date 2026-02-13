"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type MenuItem = { label: string; href: string };

const MENU: MenuItem[] = [
  { label: "New Blueprint", href: "/intake" },
  { label: "My Blueprints", href: "/blueprints" },
  { label: "Home", href: "/" },
];

export function AppMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] transition"
      >
        <div className="flex flex-col gap-1">
          <span className="block h-0.5 w-5 bg-white/80" />
          <span className="block h-0.5 w-5 bg-white/80" />
          <span className="block h-0.5 w-5 bg-white/80" />
        </div>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={[
          "fixed right-0 top-0 z-50 h-full w-[320px] max-w-[85vw]",
          "border-l border-white/10 bg-black/90 backdrop-blur",
          "transition-transform duration-200",
          open ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div className="text-sm font-semibold text-[#e1b369]">
            Discipleship by Design
          </div>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-white/80 hover:bg-white/[0.07] transition"
          >
            Close
          </button>
        </div>

        <nav className="p-5 space-y-2">
          {MENU.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/85 hover:bg-white/[0.06] transition"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
