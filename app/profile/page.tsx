import type { Metadata } from "next";
import ProfileContent from "@/components/ProfileContent";

export const metadata: Metadata = {
  title: "프로필 | 테블러",
  description: "테블러의 모든 채널을 한 곳에서 확인하세요.",
};

export default function ProfilePage() {
  return <ProfileContent />;
}
