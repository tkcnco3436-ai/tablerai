import { LayeredText } from "@/components/ui/layered-text";

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center overflow-hidden px-4">
      <LayeredText
        lines={[
          { top: " ", bottom: "TABLER" },
          { top: "TABLER", bottom: "CUSTOM" },
          { top: "CUSTOM", bottom: "TUMBLER" },
          { top: "TUMBLER", bottom: "FOR YOUR" },
          { top: "FOR YOUR", bottom: "BRAND" },
          { top: "BRAND", bottom: "IN 3D" },
          { top: "IN 3D", bottom: " " },
        ]}
      />
    </main>
  );
}
