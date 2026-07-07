"use client";

import dynamic from "next/dynamic";

const TumblerEditor = dynamic(() => import("./editor/TumblerEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm text-slate-400 shadow-sm">
      3D 에디터 로딩 중...
    </div>
  ),
});

export default function ViewerSection() {
  return <TumblerEditor />;
}
