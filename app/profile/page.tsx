import type { Metadata } from "next";
import Image from "next/image";
import RotatingEarth from "@/components/ui/wireframe-dotted-globe";

export const metadata: Metadata = {
  title: "프로필 | 테블러",
  description: "테블러의 모든 채널을 한 곳에서 확인하세요.",
};

const links = [
  { label: "🛒 공식 스토어", href: "https://www.example.com", desc: "텀블러 주문 · 굿즈샵" },
  { label: "📑 제안서 · 3D 목업", href: "/proposal", desc: "제작 사양과 견적 안내" },
  { label: "📷 인스타그램", href: "https://www.instagram.com", desc: "제작 사례 · 비하인드" },
  { label: "💬 카카오톡 채널", href: "https://pf.kakao.com", desc: "실시간 상담" },
  { label: "📧 이메일 문의", href: "mailto:jh6385@tkcnco.com", desc: "견적 · 제휴 문의" },
];

export default function ProfilePage() {
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

        <h1 className="mt-5 text-2xl font-bold text-zinc-900">테블러</h1>
        <p className="mt-2 text-center text-sm leading-relaxed text-zinc-500">
          커스텀 텀블러 3D 목업 스튜디오
          <br />
          만들기 전에 먼저, 3D로 확인하세요 🧊
        </p>

        {/* Links */}
        <div className="mt-10 flex w-full flex-col gap-3.5">
          {links.map((l) => (
            <a
              key={l.label}
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
