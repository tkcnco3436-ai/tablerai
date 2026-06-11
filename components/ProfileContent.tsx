"use client";

import Image from "next/image";
import RotatingEarth from "@/components/ui/wireframe-dotted-globe";
import { useLang } from "@/lib/i18n";

export default function ProfileContent() {
  const { t } = useLang();

  const links = [
    {
      label: t("🛒 공식 스토어", "🛒 Official store"),
      href: "https://www.example.com",
      desc: t("텀블러 주문 · 굿즈샵", "Tumbler orders · goods shop"),
    },
    {
      label: t("📑 제안서 · 3D 목업", "📑 Proposal · 3D mockup"),
      href: "/proposal",
      desc: t("제작 사양과 견적 안내", "Production specs and quotes"),
    },
    {
      label: t("📷 인스타그램", "📷 Instagram"),
      href: "https://www.instagram.com",
      desc: t("제작 사례 · 비하인드", "Case studies · behind the scenes"),
    },
    {
      label: t("💬 카카오톡 채널", "💬 KakaoTalk channel"),
      href: "https://pf.kakao.com",
      desc: t("실시간 상담", "Live chat support"),
    },
    {
      label: t("📧 이메일 문의", "📧 Email"),
      href: "mailto:jh6385@tkcnco.com",
      desc: t("견적 · 제휴 문의", "Quotes & partnerships"),
    },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* 배경: 회전하는 점 지구본 */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-15">
        <RotatingEarth width={900} height={900} />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.10),transparent_55%)]"
      />

      <div className="relative mx-auto flex min-h-[80vh] max-w-md flex-col items-center px-4 py-16">
        {/* Avatar */}
        <div className="relative h-28 w-28 overflow-hidden rounded-full border-2 border-emerald-400/60 bg-white shadow-md">
          <Image
            src="/tabler.png"
            alt="테블러 프로필"
            fill
            sizes="112px"
            className="object-cover"
            priority
          />
        </div>

        <h1 className="mt-5 text-2xl font-bold text-zinc-900">
          {t("테블러", "TABLER")}
        </h1>
        <p className="mt-2 text-center text-sm leading-relaxed text-zinc-500">
          {t("커스텀 텀블러 3D 목업 스튜디오", "Custom Tumbler 3D Mockup Studio")}
          <br />
          {t("만들기 전에 먼저, 3D로 확인하세요 🧊", "Before you make it, see it in 3D 🧊")}
        </p>

        {/* Links */}
        <div className="mt-10 flex w-full flex-col gap-3.5">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target={l.href.startsWith("/") ? undefined : "_blank"}
              rel={l.href.startsWith("/") ? undefined : "noopener noreferrer"}
              className="group rounded-2xl border border-zinc-200 bg-white/90 px-6 py-4 text-center shadow-sm backdrop-blur transition hover:border-emerald-400 hover:shadow-md"
            >
              <span className="block font-semibold text-zinc-800 group-hover:text-emerald-600">
                {l.label}
              </span>
              <span className="mt-0.5 block text-xs text-zinc-400">{l.desc}</span>
            </a>
          ))}
        </div>

        <p className="mt-10 text-xs text-zinc-400">@tabler.studio</p>
      </div>
    </div>
  );
}
