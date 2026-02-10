import { useState, useRef, useEffect, useCallback } from "react";
import type { GameSetting } from "@/data/studio-data";

const TIME_LIMIT_S = 10;
const MAX_RGB_DISTANCE = Math.sqrt(3 * 255 * 255);

type RGB = { r: number; g: number; b: number };

const TARGET_COLORS: { name: string; rgb: RGB }[] = [
  { name: "Kirli Bordo", rgb: { r: 101, g: 28, b: 38 } },
  { name: "Eski Yeşil", rgb: { r: 72, g: 98, b: 65 } },
  { name: "Gece Mavisi", rgb: { r: 25, g: 35, b: 85 } },
  { name: "Sıcak Turuncu", rgb: { r: 220, g: 95, b: 45 } },
  { name: "Soluk Mor", rgb: { r: 120, g: 85, b: 130 } },
  { name: "Koyu Zeytin", rgb: { r: 55, g: 62, b: 35 } },
];

const TUBES: { id: string; label: string; rgb: RGB; add: (c: RGB) => RGB }[] = [
  {
    id: "red",
    label: "Kırmızı",
    rgb: { r: 255, g: 0, b: 0 },
    add: (c) => ({ r: Math.min(255, c.r + 28), g: Math.max(0, c.g - 4), b: Math.max(0, c.b - 4) }),
  },
  {
    id: "blue",
    label: "Mavi",
    rgb: { r: 0, g: 0, b: 255 },
    add: (c) => ({ r: Math.max(0, c.r - 4), g: Math.max(0, c.g - 4), b: Math.min(255, c.b + 28) }),
  },
  {
    id: "yellow",
    label: "Sarı",
    rgb: { r: 255, g: 255, b: 0 },
    add: (c) => ({ r: Math.min(255, c.r + 18), g: Math.min(255, c.g + 18), b: Math.max(0, c.b - 6) }),
  },
  {
    id: "black",
    label: "Siyah",
    rgb: { r: 0, g: 0, b: 0 },
    add: (c) => ({ r: Math.max(0, c.r - 22), g: Math.max(0, c.g - 22), b: Math.max(0, c.b - 22) }),
  },
  {
    id: "white",
    label: "Beyaz",
    rgb: { r: 255, g: 255, b: 255 },
    add: (c) => ({ r: Math.min(255, c.r + 18), g: Math.min(255, c.g + 18), b: Math.min(255, c.b + 18) }),
  },
];

function rgbDistance(a: RGB, b: RGB): number {
  const rDiff = a.r - b.r;
  const gDiff = a.g - b.g;
  const bDiff = a.b - b.b;
  return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
}

function similarityPercent(current: RGB, target: RGB): number {
  const dist = rgbDistance(current, target);
  return Math.round(Math.max(0, 100 - (dist / MAX_RGB_DISTANCE) * 100));
}

function rgbToCss(rgb: RGB): string {
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

interface InkMixGameProps {
  gameSetting: GameSetting;
  onWin: (discountRate: number, code: string) => void;
}

export function InkMixGame({ gameSetting, onWin }: InkMixGameProps) {
  const [target] = useState<{ name: string; rgb: RGB }>(() =>
    TARGET_COLORS[Math.floor(Math.random() * TARGET_COLORS.length)]
  );
  const [mix, setMix] = useState<RGB>(() => ({ r: 128, g: 128, b: 128 }));
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_S);
  const [phase, setPhase] = useState<"playing" | "won" | "lost">("playing");
  const wonFired = useRef(false);
  const timerId = useRef<ReturnType<typeof setInterval> | null>(null);

  const sim = similarityPercent(mix, target.rgb);
  const targetSimilarity = gameSetting.difficulty_target ?? 95;

  // Countdown: single interval while playing, no dependency on sim so timer doesn't reset on each click
  useEffect(() => {
    if (phase !== "playing") return;
    timerId.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerId.current) clearInterval(timerId.current);
          timerId.current = null;
          setPhase("lost");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerId.current) clearInterval(timerId.current);
      timerId.current = null;
    };
  }, [phase]);

  // Win check: when similarity reaches target, award code once and stop
  useEffect(() => {
    if (phase !== "playing" || sim < targetSimilarity) return;
    if (wonFired.current) return;
    wonFired.current = true;
    if (timerId.current) {
      clearInterval(timerId.current);
      timerId.current = null;
    }
    onWin(gameSetting.discount_rate, gameSetting.promo_code?.trim() || "INKMIX10");
    setPhase("won");
  }, [phase, sim, targetSimilarity, gameSetting.discount_rate, gameSetting.promo_code, onWin]);

  const handleTubeClick = useCallback((tube: (typeof TUBES)[number]) => {
    if (phase !== "playing") return;
    setMix((prev) => tube.add(prev));
  }, [phase]);

  if (phase === "won") {
    return (
      <div className="rounded-xl bg-primary/10 border border-primary/30 p-6 text-center">
        <h3 className="font-heading font-bold text-lg text-primary mb-2">Tebrikler!</h3>
        <p className="text-foreground text-sm">Hedef rengi {TIME_LIMIT_S} saniye altında tutturdunuz. İndirim kodunuzu kazandınız.</p>
      </div>
    );
  }

  if (phase === "lost") {
    return (
      <div className="rounded-xl bg-zinc-800/80 border border-zinc-600 p-6 text-center">
        <h3 className="font-heading font-bold text-lg text-foreground mb-2">Süre doldu</h3>
        <p className="text-muted-foreground text-sm">Hedef: &quot;{target.name}&quot; — Bir daha deneyin!</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-zinc-900/80 border border-zinc-700 p-6 space-y-6 w-full max-w-[100vw]">
      <div className="flex items-center justify-between min-h-[44px]">
        <span className="font-mono text-sm text-muted-foreground">{timeLeft}s</span>
        <span className="font-mono text-sm text-primary font-bold">Benzerlik: %{sim} (hedef %{targetSimilarity})</span>
      </div>

      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Hedef renk</p>
        <div
          className="h-16 rounded-xl border-2 border-zinc-600 shadow-inner"
          style={{ backgroundColor: rgbToCss(target.rgb) }}
        />
        <p className="text-sm font-medium text-foreground mt-1">{target.name}</p>
      </div>

      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Karışım kabı</p>
        <div
          className="h-16 rounded-xl border-2 border-primary/50 shadow-inner transition-colors duration-150"
          style={{ backgroundColor: rgbToCss(mix) }}
        />
      </div>

      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Mürekkep tüpleri — tıklayarak karıştırın</p>
        <div className="grid grid-cols-5 gap-2">
          {TUBES.map((tube) => (
            <button
              key={tube.id}
              type="button"
              onClick={() => handleTubeClick(tube)}
              className="flex flex-col items-center justify-center gap-1.5 min-h-[44px] min-w-[44px] p-3 rounded-xl border-2 border-zinc-600 hover:border-primary/60 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 touch-manipulation"
              style={{ backgroundColor: rgbToCss(tube.rgb), touchAction: "manipulation" }}
            >
              <span
                className={`text-xs font-medium ${tube.id === "white" || tube.id === "yellow" ? "text-zinc-900" : "text-white"} drop-shadow-sm`}
              >
                {tube.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
