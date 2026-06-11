import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";

export const metadata: Metadata = {
  title: "테블러 | 커스텀 텀블러 3D 목업 스튜디오",
  description:
    "커스텀 텀블러 디자인을 3D로 미리 확인하고, 제안서와 함께 받아보세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen antialiased">
        <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur">
          <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
            <Link href="/" className="flex items-center">
              <Image
                src="/img/logo.png"
                alt="테블러"
                width={115}
                height={28}
                priority
              />
            </Link>
            <div className="flex items-center gap-6 text-sm text-zinc-500">
              <Link href="/" className="transition hover:text-zinc-900">
                홈
              </Link>
              <Link href="/main2" className="transition hover:text-zinc-900">
                메인 II
              </Link>
              <Link href="/proposal" className="transition hover:text-zinc-900">
                3D 모델 · 제안서
              </Link>
              <Link href="/profile" className="transition hover:text-zinc-900">
                프로필
              </Link>
            </div>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="border-t border-zinc-200 py-8 text-center text-sm text-zinc-400">
          © {new Date().getFullYear()} 테블러. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
