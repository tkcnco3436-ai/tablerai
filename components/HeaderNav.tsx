"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useLang, type Lang } from "@/lib/i18n";

export default function HeaderNav() {
  const { lang, setLang, t } = useLang();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: t("홈", "Home") },
    { href: "/main2", label: t("메인 II", "Main II") },
    { href: "/proposal", label: t("3D 모델 · 제안서", "3D Model · Proposal") },
    { href: "/profile", label: t("프로필", "Profile") },
  ];

  const langSelect = (
    <select
      value={lang}
      onChange={(e) => setLang(e.target.value as Lang)}
      aria-label={t("언어 선택", "Select language")}
      className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-600 outline-none transition hover:border-emerald-400 focus:border-emerald-500"
    >
      <option value="ko">🇰🇷 한국어</option>
      <option value="en">🇺🇸 English</option>
    </select>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
          <Image src="/img/logo.png" alt="테블러" width={115} height={28} priority />
        </Link>

        {/* 데스크톱 */}
        <div className="hidden items-center gap-6 text-sm text-zinc-500 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="transition hover:text-zinc-900">
              {l.label}
            </Link>
          ))}
          {langSelect}
        </div>

        {/* 모바일: 버거 버튼 */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={t("메뉴 열기", "Toggle menu")}
          aria-expanded={open}
          className="rounded-lg p-2 text-zinc-600 transition hover:bg-zinc-100 md:hidden"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* 모바일 드롭다운 */}
      {open && (
        <div className="border-t border-zinc-100 bg-white/95 backdrop-blur md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col px-4 py-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-zinc-100 px-3 pt-3">{langSelect}</div>
          </div>
        </div>
      )}
    </header>
  );
}
