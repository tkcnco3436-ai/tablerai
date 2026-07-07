"use client";

import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const dark = pathname === "/main2";
  const year = new Date().getFullYear();

  return (
    <footer
      className={
        dark
          ? "border-t border-[#3b82f6]/20 bg-[#060d1a] py-8 text-center font-mono text-sm uppercase tracking-widest text-[#dbe9ff]/40"
          : "border-t border-slate-200 py-8 text-center text-sm text-slate-400"
      }
    >
      © {year} TABLER. All rights reserved.
    </footer>
  );
}
