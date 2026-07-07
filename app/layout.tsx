import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";
import HeaderNav from "@/components/HeaderNav";
import Footer from "@/components/Footer";

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
        <LanguageProvider>
          <HeaderNav />
          <main>{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
