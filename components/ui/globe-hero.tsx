"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import React, { useRef } from "react";
import * as THREE from "three";
import { cn } from "@/lib/utils";

interface DotGlobeHeroProps {
  rotationSpeed?: number;
  globeRadius?: number;
  globeColor?: string;
  className?: string;
  children?: React.ReactNode;
}

const Globe: React.FC<{
  rotationSpeed: number;
  radius: number;
  color: string;
}> = ({ rotationSpeed, radius, color }) => {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += rotationSpeed;
      groupRef.current.rotation.x += rotationSpeed * 0.3;
      groupRef.current.rotation.z += rotationSpeed * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} wireframe />
      </mesh>
    </group>
  );
};

const DotGlobeHero = React.forwardRef<HTMLDivElement, DotGlobeHeroProps>(
  (
    {
      rotationSpeed = 0.005,
      globeRadius = 1,
      globeColor = "#0f172a",
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative h-screen w-full overflow-hidden bg-background",
          className
        )}
        {...props}
      >
        <div className="relative z-10 flex h-full flex-col items-center justify-center">
          {children}
        </div>

        <div className="pointer-events-none absolute inset-0 z-0">
          <Canvas>
            <PerspectiveCamera makeDefault position={[0, 0, 3]} fov={75} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <Globe
              rotationSpeed={rotationSpeed}
              radius={globeRadius}
              color={globeColor}
            />
          </Canvas>
        </div>
      </div>
    );
  }
);

DotGlobeHero.displayName = "DotGlobeHero";

export { DotGlobeHero, type DotGlobeHeroProps };
