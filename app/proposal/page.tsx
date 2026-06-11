import type { Metadata } from "next";
import ProposalContent from "@/components/ProposalContent";

export const metadata: Metadata = {
  title: "3D 모델 · 제안서 | 테블러",
  description:
    "커스텀 텀블러 3D 목업 에디터로 컬러와 로고를 입혀보고 PDF 제안서로 내보내세요.",
};

export default function ProposalPage() {
  return <ProposalContent />;
}
