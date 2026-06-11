"use client";

import Link from "next/link";
import Image from "next/image";
import { useLang, type Lang } from "@/lib/i18n";

export default function HeaderNav() {
  const { lang, setLang, t } = useLang();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center">
          <Image src="/img/logo.png" alt="테블러" width={115} height={28} priority />
        </Link>
        <div className="flex items-center gap-6 text-sm text-zinc-500">
          <Link href="/" className="transition hover:text-zinc-900">
            {t("홈", "Home")}
          </Link>
          <Link href="/main2" className="transition hover:text-zinc-900">
            {t("메인 II", "Main II")}
          </Link>
          <Link href="/proposal" className="transition hover:text-zinc-900">
            {t("3D 모델 · 제안서", "3D Model · Proposal")}
          </Link>
          <Link href="/profile" className="transition hover:text-zinc-900">
            {t("프로필", "Profile")}
          </Link>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as Lang)}
            aria-label={t("언어 선택", "Select language")}
            className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-600 outline-none transition hover:border-emerald-400 focus:border-emerald-500"
          >
            <option value="ko">🇰🇷 한국어</option>
            <option value="en">🇺🇸 English</option>
          </select>
        </div>
      </nav>
    </header>
  );
}
