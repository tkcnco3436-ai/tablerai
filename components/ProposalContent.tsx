"use client";

import ViewerSection from "@/components/ViewerSection";
import { getSpecs } from "@/lib/specs";
import { useLang } from "@/lib/i18n";

export default function ProposalContent() {
  const { lang, t } = useLang();

  const steps = [
    {
      step: "01",
      title: t("상담 · 요구사항 정리", "Consultation & requirements"),
      desc: t(
        "용도, 수량, 예산, 납기를 확인합니다.",
        "We confirm purpose, quantity, budget, and timeline."
      ),
    },
    {
      step: "02",
      title: t("디자인 · 3D 목업", "Design & 3D mockup"),
      desc: t(
        "로고와 컬러를 적용한 3D 목업을 제작해 공유합니다.",
        "We build and share a 3D mockup with your logo and colors."
      ),
    },
    {
      step: "03",
      title: t("제안서 · 견적 확정", "Proposal & quote"),
      desc: t(
        "사양과 단가를 정리한 제안서로 최종 확정합니다.",
        "Finalize with a proposal covering specs and pricing."
      ),
    },
    {
      step: "04",
      title: t("생산 · 납품", "Production & delivery"),
      desc: t(
        "샘플 검수 후 본 생산을 진행하고 납품합니다.",
        "After sample approval, we run production and deliver."
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
          {t("3D 모델 · 제안서", "3D Model · Proposal")}
        </h1>
        <p className="mt-3 text-zinc-500">
          {t(
            "컬러와 이미지를 직접 입혀보고, 완성된 디자인을 PDF 제안서로 내려받으세요. 편집 내용은 자동 저장됩니다.",
            "Apply colors and images yourself, then download the finished design as a PDF proposal. Edits are saved automatically."
          )}
        </p>
      </div>

      {/* 3D editor */}
      <ViewerSection />

      {/* 제안 개요 + 사양 */}
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">
            {t("제안 개요", "Proposal overview")}
          </h2>
          <p className="text-sm leading-relaxed text-zinc-500">
            {t(
              "귀사의 브랜드 아이덴티티를 반영한 커스텀 텀블러 제작을 제안드립니다. 위 3D 목업은 실제 제작 사양 기준으로 모델링되며, 로고 · 컬러 · 마감 변경 시 즉시 반영하여 다시 공유드립니다.",
              "We propose custom tumbler production reflecting your brand identity. The 3D mockup above is modeled to real production specs, and any logo, color, or finish changes are applied and shared right away."
            )}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">
            {t("제작 사양", "Production specs")}
          </h2>
          <dl className="space-y-3 text-sm">
            {getSpecs(lang).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4">
                <dt className="shrink-0 text-zinc-400">{k}</dt>
                <dd className="text-right text-zinc-700">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Process */}
      <section className="mt-16">
        <h2 className="mb-6 text-2xl font-bold text-zinc-900">
          {t("진행 절차", "How it works")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div
              key={s.step}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-3 text-sm font-bold text-emerald-600">{s.step}</div>
              <h3 className="mb-2 font-semibold text-zinc-900">{s.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="mt-16 rounded-3xl border border-zinc-200 bg-gradient-to-br from-emerald-50 to-cyan-50 p-10 text-center">
        <h2 className="text-2xl font-bold text-zinc-900">
          {t("견적이 필요하신가요?", "Need a quote?")}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-zinc-500">
          {t(
            "수량과 용도를 알려주시면 1영업일 내 맞춤 견적과 제안서를 보내드립니다.",
            "Tell us your quantity and use case, and we'll send a tailored quote and proposal within one business day."
          )}
        </p>
        <a
          href="/profile"
          className="mt-7 inline-block rounded-xl bg-emerald-500 px-7 py-3.5 font-semibold text-white transition hover:bg-emerald-400"
        >
          {t("문의 채널 보기", "View contact channels")}
        </a>
      </section>
    </div>
  );
}
