import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ComponentType } from "react";

export const Route = createFileRoute("/")({
  ssr: false,
  component: Home,
});

function Home() {
  const [View, setView] = useState<ComponentType | null>(null);

  useEffect(() => {
    let live = true;
    void import("@/playground/Playground").then((mod) => {
      if (live) setView(() => mod.Playground);
    });
    return () => {
      live = false;
    };
  }, []);

  if (!View) return <Boot />;
  return <View />;
}

function Boot() {
  return (
    <main className="flex h-dvh flex-col items-center justify-center gap-2 bg-bg text-fg">
      <p className="font-display text-3xl tracking-tight">Mass Yard</p>
      <p className="text-sm text-muted">Setting the table…</p>
    </main>
  );
}
