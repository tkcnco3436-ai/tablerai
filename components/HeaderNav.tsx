"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useLang, type Lang } from "@/lib/i18n";

export default function HeaderNav() {
  const { lang, setLang, t } = useLang();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  // main2 = 다크 네온 테마 (바디와 동일 스타일)
  const dark = pathname === "/main2";

  const links = [
    { href: "/", label: t("홈", "Home") },
    { href: "/main2", label: t("메인 II", "Main II") },
    { href: "/proposal", label: t("3D 모델 · 제안서", "3D Model · Proposal") },
  ];

  const langSelect = (
    <select
      value={lang}
      onChange={(e) => setLang(e.target.value as Lang)}
      aria-label={t("언어 선택", "Select language")}
      className={
        dark
          ? "cursor-pointer rounded-lg border border-[#3b82f6]/40 bg-[#060d1a] px-2 py-1.5 font-mono text-xs text-[#dbe9ff]/80 outline-none transition hover:border-[#3b82f6] focus:border-[#3b82f6]"
          : "cursor-pointer rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-600 outline-none transition hover:border-blue-400 focus:border-blue-500"
      }
    >
      <option value="ko">🇰🇷 한국어</option>
      <option value="en">🇺🇸 English</option>
    </select>
  );

  return (
    <header
      className={
        dark
          ? "sticky top-0 z-50 border-b border-[#3b82f6]/30 bg-[#060d1a]/80 font-mono backdrop-blur"
          : "sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur"
      }
    >
      <nav
        className={`flex h-14 items-center justify-between ${
          dark ? "w-full px-6 sm:px-10 lg:px-16" : "mx-auto max-w-6xl px-4"
        }`}
      >
        <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
          <Image
            src="/img/logo.png"
            alt="테블러"
            width={115}
            height={28}
            priority
            className={dark ? "brightness-0 invert" : ""}
          />
        </Link>

        {/* 데스크톱 */}
        <div
          className={`hidden items-center gap-6 text-sm md:flex ${
            dark ? "tracking-widest text-[#dbe9ff]/70" : "text-slate-500"
          }`}
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={
                dark
                  ? "uppercase transition hover:text-[#3b82f6]"
                  : "transition hover:text-slate-900"
              }
            >
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
          className={
            dark
              ? "rounded-lg p-2 text-[#dbe9ff] transition hover:bg-[#3b82f6]/15 md:hidden"
              : "rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 md:hidden"
          }
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* 모바일 드롭다운 */}
      {open && (
        <div
          className={
            dark
              ? "border-t border-[#3b82f6]/20 bg-[#060d1a]/95 font-mono backdrop-blur md:hidden"
              : "border-t border-slate-100 bg-white/95 backdrop-blur md:hidden"
          }
        >
          <div
            className={`flex flex-col py-3 ${
              dark ? "w-full px-6 sm:px-10" : "mx-auto max-w-6xl px-4"
            }`}
          >
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={
                  dark
                    ? "rounded-lg px-3 py-3 text-sm uppercase tracking-widest text-[#dbe9ff]/70 transition hover:bg-[#3b82f6]/15 hover:text-[#3b82f6]"
                    : "rounded-lg px-3 py-3 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                }
              >
                {l.label}
              </Link>
            ))}
            <div
              className={`mt-2 border-t px-3 pt-3 ${
                dark ? "border-[#3b82f6]/20" : "border-slate-100"
              }`}
            >
              {langSelect}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
