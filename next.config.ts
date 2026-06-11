import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // dev에서 StrictMode 이중 마운트가 r3f WebGL 컨텍스트를 dispose해서
  // 새로고침 직후 3D 캔버스가 사라지는 문제 회피 (프로덕션은 영향 없음)
  reactStrictMode: false,
};

export default nextConfig;
