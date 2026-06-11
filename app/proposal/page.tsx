import type { Metadata } from "next";
import ViewerSection from "@/components/ViewerSection";
import { SPECS } from "@/lib/specs";

export const metadata: Metadata = {
  title: "3D 모델 · 제안서 | 테블러",
  description:
    "커스텀 텀블러 3D 목업 에디터로 컬러와 로고를 입혀보고 PDF 제안서로 내보내세요.",
};

const steps = [
  { step: "01", title: "상담 · 요구사항 정리", desc: "용도, 수량, 예산, 납기를 확인합니다." },
  { step: "02", title: "디자인 · 3D 목업", desc: "로고와 컬러를 적용한 3D 목업을 제작해 공유합니다." },
  { step: "03", title: "제안서 · 견적 확정", desc: "사양과 단가를 정리한 제안서로 최종 확정합니다." },
  { step: "04", title: "생산 · 납품", desc: "샘플 검수 후 본 생산을 진행하고 납품합니다." },
];

export default function ProposalPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
          3D 모델 · 제안서
        </h1>
        <p className="mt-3 text-zinc-500">
          컬러와 이미지를 직접 입혀보고, 완성된 디자인을 PDF 제안서로
          내려받으세요. 편집 내용은 자동 저장됩니다.
        </p>
      </div>

      {/* 3D editor (컬러 · 이미지 · PDF 내보내기) */}
      <ViewerSection />

      {/* 제안 개요 + 사양 */}
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">제안 개요</h2>
          <p className="text-sm leading-relaxed text-zinc-500">
            귀사의 브랜드 아이덴티티를 반영한 커스텀 텀블러 제작을
            제안드립니다. 위 3D 목업은 실제 제작 사양 기준으로 모델링되며,
            로고 · 컬러 · 마감 변경 시 즉시 반영하여 다시 공유드립니다.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">제작 사양</h2>
          <dl className="space-y-3 text-sm">
            {SPECS.map(([k, v]) => (
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
        <h2 className="mb-6 text-2xl font-bold text-zinc-900">진행 절차</h2>
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
        <h2 className="text-2xl font-bold text-zinc-900">견적이 필요하신가요?</h2>
        <p className="mx-auto mt-3 max-w-md text-zinc-500">
          수량과 용도를 알려주시면 1영업일 내 맞춤 견적과 제안서를
          보내드립니다.
        </p>
        <a
          href="/profile"
          className="mt-7 inline-block rounded-xl bg-emerald-500 px-7 py-3.5 font-semibold text-white transition hover:bg-emerald-400"
        >
          문의 채널 보기
        </a>
      </section>
    </div>
  );
}
