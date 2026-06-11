"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

/* ───────────────────────── augmented-ui 스타일 코너 클립 패널 ───────────────────────── */

function AugPanel({
  children,
  className = "",
  glow = false,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={`relative border border-[#00ff9c]/30 bg-[#00ff9c]/[0.03] backdrop-blur-sm ${
        glow ? "shadow-[0_0_24px_rgba(0,255,156,0.15)]" : ""
      } ${className}`}
      style={{
        clipPath:
          "polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px)",
      }}
    >
      {/* 코너 브래킷 */}
      <span className="pointer-events-none absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2 border-[#00ff9c]/70" />
      <span className="pointer-events-none absolute bottom-4 left-0 h-4 w-[2px] bg-[#00ff9c]/70" />
      {children}
    </div>
  );
}

/* ───────────────────────── 타이핑 텍스트 ───────────────────────── */

function TypeLine({ text, delay = 0 }: { text: string; delay?: number }) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    let i = 0;
    const start = setTimeout(() => {
      const t = setInterval(() => {
        i += 1;
        setShown(text.slice(0, i));
        if (i >= text.length) clearInterval(t);
      }, 24);
    }, delay);
    return () => clearTimeout(start);
  }, [text, delay]);
  return (
    <span>
      {shown}
      <span className="animate-pulse text-[#00ff9c]">▌</span>
    </span>
  );
}

/* ───────────────────────── 터미널 로그 (image63 우측 코드 패널) ───────────────────────── */

const LOG_LINES = [
  { tag: "LOAD", text: "tabler(table).glb … OK", color: "text-[#00ff9c]" },
  { tag: "LOAD", text: "tabler(fix).glb … OK", color: "text-[#00ff9c]" },
  { tag: "LOAD", text: "tabler(extention).glb … OK", color: "text-[#00ff9c]" },
  { tag: "MAT", text: "baseColorFactor → #00FF9C", color: "text-cyan-300" },
  { tag: "UV", text: "decal compose 1024×1024 baked", color: "text-cyan-300" },
  { tag: "CAM", text: "orbit 360° free — drag enabled", color: "text-[#00ff9c]" },
  { tag: "PDF", text: "proposal renderer standby", color: "text-amber-300" },
  { tag: "SYS", text: "ALL SYSTEMS NOMINAL", color: "text-[#00ff9c]" },
];

function TerminalLog() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
      setCount((c) => (c < LOG_LINES.length ? c + 1 : c));
    }, 450);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="space-y-1.5 font-mono text-[11px] leading-relaxed">
      {LOG_LINES.slice(0, count).map((l, i) => (
        <div key={i} className="flex gap-2">
          <span className="shrink-0 text-[#00ff9c]/50">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="shrink-0 rounded-sm bg-[#00ff9c]/10 px-1 text-[#00ff9c]/80">
            {l.tag}
          </span>
          <span className={l.color}>{l.text}</span>
        </div>
      ))}
    </div>
  );
}

/* ───────────────────────── 중앙 레티클 (image63 원형 HUD) ───────────────────────── */

function Reticle() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[420px]">
      {/* 회전 점선 링 */}
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 h-full w-full animate-[spin_24s_linear_infinite]"
      >
        <circle
          cx="100"
          cy="100"
          r="96"
          fill="none"
          stroke="#00ff9c"
          strokeOpacity="0.4"
          strokeWidth="1"
          strokeDasharray="2 6"
        />
      </svg>
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 h-full w-full animate-[spin_16s_linear_infinite_reverse]"
      >
        <circle
          cx="100"
          cy="100"
          r="84"
          fill="none"
          stroke="#00ff9c"
          strokeOpacity="0.25"
          strokeWidth="6"
          strokeDasharray="40 80"
        />
      </svg>
      {/* 고정 링 + 틱 */}
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full">
        <circle
          cx="100"
          cy="100"
          r="70"
          fill="none"
          stroke="#00ff9c"
          strokeOpacity="0.5"
          strokeWidth="0.8"
        />
        <circle cx="100" cy="100" r="58" fill="rgba(0,255,156,0.05)" />
        {Array.from({ length: 36 }).map((_, i) => {
          const a = (i / 36) * Math.PI * 2;
          const r1 = 74;
          const r2 = i % 9 === 0 ? 80 : 77;
          return (
            <line
              key={i}
              x1={100 + r1 * Math.cos(a)}
              y1={100 + r1 * Math.sin(a)}
              x2={100 + r2 * Math.cos(a)}
              y2={100 + r2 * Math.sin(a)}
              stroke="#00ff9c"
              strokeOpacity="0.6"
              strokeWidth="0.8"
            />
          );
        })}
      </svg>
      {/* 중앙 제품 이미지 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-[46%] w-[46%] overflow-hidden rounded-full border border-[#00ff9c]/40 bg-[#020c08] shadow-[0_0_40px_rgba(0,255,156,0.25)]">
          <Image
            src="/img/tabler.png"
            alt="테블러 텀블러"
            fill
            className="object-contain p-3"
          />
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── 페이지 ───────────────────────── */

const STATUS_ITEMS = [
  { k: "MODEL", v: "3 UNITS" },
  { k: "COLOR", v: "HEX FREE" },
  { k: "ORBIT", v: "360°" },
  { k: "DECAL", v: "DRAG·BAKE" },
];

const METRICS = [
  { label: "제작 가능 수량", value: "100+", sub: "소량 제작 지원" },
  { label: "시안 확인", value: "실시간", sub: "3D 360° 미리보기" },
  { label: "제안서 출력", value: "PDF", sub: "목업 포함 자동 생성" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.5 },
  }),
};

export default function Main2() {
  const [clock, setClock] = useState("--:--:--");
  useEffect(() => {
    const t = setInterval(
      () => setClock(new Date().toLocaleTimeString("ko-KR", { hour12: false })),
      1000
    );
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020c08] text-[#d8ffe9]">
      {/* 배경 그리드 + 스캔라인 + 비네트 */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.13]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,255,156,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,156,.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent 0 2px, rgba(0,255,156,.6) 2px 3px)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,#020c08_95%)]" />

      <div className="relative mx-auto max-w-6xl px-4 py-10">
        {/* ── 상단 상태 바 ── */}
        <motion.div
          variants={fadeUp}
          custom={0}
          initial="hidden"
          animate="show"
        >
          <AugPanel className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 font-mono text-[11px] tracking-widest">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2 w-2">
                <span className="absolute h-full w-full animate-ping rounded-full bg-[#00ff9c]/60" />
                <span className="h-2 w-2 rounded-full bg-[#00ff9c]" />
              </span>
              <span className="text-[#00ff9c]">SYSTEM ONLINE</span>
              <span className="text-[#00ff9c]/40">TBLR-OS v2.0</span>
            </div>
            <div className="flex items-center gap-4 text-[#00ff9c]/60">
              <span>VOICE OUTPUT : STREAMING</span>
              <span className="text-[#00ff9c]">{clock}</span>
            </div>
          </AugPanel>
        </motion.div>

        {/* ── 히어로 그리드 ── */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_minmax(320px,420px)_1fr]">
          {/* 좌: 스펙 리드아웃 */}
          <motion.div
            variants={fadeUp}
            custom={1}
            initial="hidden"
            animate="show"
            className="order-2 space-y-3 lg:order-1"
          >
            {STATUS_ITEMS.map((s) => (
              <AugPanel key={s.k} className="px-4 py-3">
                <div className="font-mono text-[10px] tracking-[0.3em] text-[#00ff9c]/50">
                  {s.k}
                </div>
                <div className="mt-1 font-mono text-lg text-[#00ff9c]">
                  {s.v}
                </div>
              </AugPanel>
            ))}
            <AugPanel className="px-4 py-3">
              <div className="font-mono text-[10px] tracking-[0.3em] text-[#00ff9c]/50">
                USER INPUT
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-[#d8ffe9]/80">
                컬러를 고르고, 로고를 끌어다 놓고, 360°로 돌려서 확인하세요.
                완성된 시안은 그대로 제안서가 됩니다.
              </p>
            </AugPanel>
          </motion.div>

          {/* 중앙: 레티클 + 타이틀 */}
          <motion.div
            variants={fadeUp}
            custom={2}
            initial="hidden"
            animate="show"
            className="order-1 text-center lg:order-2"
          >
            <div className="font-mono text-[11px] tracking-[0.5em] text-[#00ff9c]/60">
              WHISPERFLOW STATUS
            </div>
            <h1 className="mt-2 font-mono text-3xl font-bold tracking-[0.2em] text-[#00ff9c] [text-shadow:0_0_18px_rgba(0,255,156,0.6)] sm:text-4xl">
              SPEAKING
            </h1>
            <div className="mt-1 font-mono text-[11px] tracking-[0.35em] text-[#00ff9c]/50">
              3D MOCKUP : STREAMING
            </div>
            <div className="mt-8">
              <Reticle />
            </div>
            <div className="mx-auto mt-8 max-w-sm font-mono text-sm text-[#d8ffe9]/80">
              <TypeLine
                text="텀블러 3D 목업 시스템 가동 중 — 시안을 실시간으로 확인하세요."
                delay={600}
              />
            </div>
          </motion.div>

          {/* 우: 터미널 로그 */}
          <motion.div
            variants={fadeUp}
            custom={3}
            initial="hidden"
            animate="show"
            className="order-3 space-y-3"
          >
            <AugPanel glow className="px-4 py-3">
              <div className="mb-3 flex items-center justify-between border-b border-[#00ff9c]/20 pb-2 font-mono text-[10px] tracking-[0.3em]">
                <span className="text-[#00ff9c]">CODE ACTIONS</span>
                <span className="text-[#00ff9c]/40">EDITING</span>
              </div>
              <TerminalLog />
            </AugPanel>
            <AugPanel className="px-4 py-3">
              <div className="font-mono text-[10px] tracking-[0.3em] text-[#00ff9c]/50">
                RIG OUTPUT
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-[#d8ffe9]/80">
                테이블형 · 고정형 · 확장형 3종 모델 로드 완료. 에디터에서 부위별
                컬러와 데칼 위치를 직접 편집할 수 있습니다.
              </p>
            </AugPanel>
          </motion.div>
        </div>

        {/* ── 메트릭 (Cosmic UI 대시보드 느낌) ── */}
        <motion.div
          variants={fadeUp}
          custom={4}
          initial="hidden"
          animate="show"
          className="mt-10 grid gap-4 sm:grid-cols-3"
        >
          {METRICS.map((m) => (
            <AugPanel key={m.label} className="px-5 py-4">
              <div className="font-mono text-[10px] tracking-[0.3em] text-[#00ff9c]/50">
                {m.label}
              </div>
              <div className="mt-1 text-2xl font-bold text-[#00ff9c] [text-shadow:0_0_12px_rgba(0,255,156,0.4)]">
                {m.value}
              </div>
              <div className="mt-1 text-xs text-[#d8ffe9]/60">{m.sub}</div>
            </AugPanel>
          ))}
        </motion.div>

        {/* ── CTA ── */}
        <motion.div
          variants={fadeUp}
          custom={5}
          initial="hidden"
          animate="show"
          className="mt-10 flex flex-wrap items-center justify-center gap-4 pb-6"
        >
          <Link
            href="/proposal"
            className="border border-[#00ff9c] bg-[#00ff9c]/10 px-8 py-3.5 font-mono text-sm font-bold tracking-[0.2em] text-[#00ff9c] shadow-[0_0_20px_rgba(0,255,156,0.3)] transition hover:bg-[#00ff9c]/25"
            style={{
              clipPath:
                "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)",
            }}
          >
            ▶ 3D 에디터 진입
          </Link>
          <Link
            href="/"
            className="border border-[#00ff9c]/40 px-8 py-3.5 font-mono text-sm tracking-[0.2em] text-[#00ff9c]/70 transition hover:border-[#00ff9c] hover:text-[#00ff9c]"
            style={{
              clipPath:
                "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)",
            }}
          >
            기존 메인으로
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
