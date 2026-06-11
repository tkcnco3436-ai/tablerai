"use client";

import Link from "next/link";
import { AnimatedMarqueeHero } from "@/components/ui/hero-3";
import { DotGlobeHero } from "@/components/ui/globe-hero";
import { useLang } from "@/lib/i18n";

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1521302080334-4bebac2763a6?w=600&auto=format&fit=crop&q=60",
];

export default function Home() {
  const { t } = useLang();

  const features = [
    {
      title: t("3D 실시간 미리보기", "Real-time 3D preview"),
      desc: t(
        "제작 전에 텀블러 디자인을 360°로 돌려보며 색상과 로고 위치를 확인합니다.",
        "Rotate your design 360° before production to check colors and logo placement."
      ),
      icon: "🧊",
    },
    {
      title: t("맞춤 제안서 제공", "Tailored proposals"),
      desc: t(
        "수량, 단가, 납기까지 정리된 제안서를 3D 목업과 함께 PDF로 받아보세요.",
        "Get a PDF proposal covering quantity, pricing, and lead time with your 3D mockup."
      ),
      icon: "📑",
    },
    {
      title: t("소량부터 대량까지", "From small batches to bulk"),
      desc: t(
        "기업 굿즈, 행사 기념품, 카페 MD까지 규모에 맞는 제작 플랜을 제안합니다.",
        "Production plans for corporate goods, event giveaways, and cafe merchandise at any scale."
      ),
      icon: "📦",
    },
  ];

  return (
    <div>
      {/* Hero — animated marquee */}
      <AnimatedMarqueeHero
        tagline={t(
          "커스텀 텀블러 3D 목업 스튜디오",
          "Custom Tumbler 3D Mockup Studio"
        )}
        title={
          <>
            {t("만들기 전에 먼저,", "Before you make it,")}
            <br />
            <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
              {t("3D로 확인하세요", "see it in 3D")}
            </span>
          </>
        }
        description={t(
          "테블러는 커스텀 텀블러 디자인을 3D 목업으로 미리 보여드리고, 견적과 제안서까지 한 번에 전달하는 제작 파트너입니다.",
          "TABLER shows your custom tumbler design as a 3D mockup first, then delivers the quote and proposal in one go."
        )}
        ctaText={t("3D 모델 · 제안서 보기", "View 3D Model · Proposal")}
        ctaHref="/proposal"
        images={HERO_IMAGES}
      />

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-24">
        <div className="grid gap-6 sm:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
            >
              <div className="mb-4 text-3xl">{f.icon}</div>
              <h3 className="mb-2 text-lg font-semibold text-zinc-900">{f.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Globe section */}
      <DotGlobeHero
        rotationSpeed={0.004}
        globeColor="#10b981"
        className="h-[70vh] bg-gradient-to-br from-white via-emerald-50/40 to-cyan-50/40"
      >
        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <span className="mb-4 inline-block rounded-full border border-emerald-300 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
            {t("어디서든, 온라인으로", "Anywhere, online")}
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
            {t("전국 어디서나", "Wherever you are,")}
            <br />
            <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
              {t("비대면 제작 진행", "fully remote production")}
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-zinc-500">
            {t(
              "상담부터 3D 시안 확인, 제안서 전달, 납품까지 전 과정을 온라인으로 진행합니다. 지역 제한 없이 어디서든 함께할 수 있습니다.",
              "From consultation and 3D proofs to proposals and delivery — the entire process runs online, with no regional limits."
            )}
          </p>
          <Link
            href="/profile"
            className="mt-8 inline-block rounded-xl border border-zinc-300 bg-white/80 px-7 py-3.5 font-semibold text-zinc-700 backdrop-blur transition hover:border-emerald-400 hover:text-emerald-600"
          >
            {t("문의 채널 보기", "View contact channels")}
          </Link>
        </div>
      </DotGlobeHero>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-24">
        <div className="rounded-3xl border border-zinc-200 bg-gradient-to-br from-emerald-50 to-cyan-50 p-12 text-center">
          <h2 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
            {t(
              "지금 바로 제안서를 확인해 보세요",
              "Check out the proposal right now"
            )}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-zinc-500">
            {t(
              "3D 목업 에디터로 직접 컬러와 로고를 입혀보고, 그대로 PDF 제안서로 내려받을 수 있습니다.",
              "Apply colors and logos in the 3D mockup editor, then download it as a PDF proposal."
            )}
          </p>
          <Link
            href="/proposal"
            className="mt-8 inline-block rounded-xl bg-zinc-900 px-7 py-3.5 font-semibold text-white transition hover:bg-zinc-700"
          >
            {t("제안서 페이지로 이동", "Go to proposal page")}
          </Link>
        </div>
      </section>
    </div>
  );
}
