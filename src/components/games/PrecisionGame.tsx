import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import type { GameSetting } from "@/data/studio-data";
import type { TattooWork } from "@/data/studio-data";

const CANVAS_SIZE = 400;
const LOGICAL_SIZE = 400;
const GUIDE_OPACITY = 0.2;
const INK_WIDTH = 6;
const TOLERANCE_PX = 12;
const DEVIATION_TO_ACCURACY = 2.5;
const SHAKE_AMOUNT = 2;

type ShapeType = "line" | "circle" | "triangle";
type GamePhase = "shapes" | "results" | "won";

const NEEDLE_CURSOR =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="%23fff" stroke="%23e85d04" stroke-width="1.5" d="M12 2L12 22M12 2l-2 4M12 2l2 4M12 22l-2-4M12 22l2-4"/><circle cx="12" cy="4" r="2" fill="%23e85d04"/></svg>'
  );

interface PrecisionGameProps {
  tattooWorks: TattooWork[];
  gameSetting: GameSetting;
  onWin: (discountRate: number, code: string) => void;
}

const SHAPES: { type: ShapeType; label: string }[] = [
  { type: "line", label: "Düz çizgi" },
  { type: "circle", label: "Çember" },
  { type: "triangle", label: "Üçgen" },
];

const LINE = { x1: 80, y1: 200, x2: 320, y2: 200 };
const CIRCLE = { cx: 200, cy: 200, r: 100 };
const TRIANGLE = [
  { x: 200, y: 110 },
  { x: 320, y: 310 },
  { x: 80, y: 310 },
];

function distPointToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1e-6;
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (len * len)));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);
}

function distPointToCircle(px: number, py: number, cx: number, cy: number, r: number): number {
  const d = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
  return Math.abs(d - r);
}

function distPointToTriangle(px: number, py: number, tri: { x: number; y: number }[]): number {
  const d1 = distPointToSegment(px, py, tri[0].x, tri[0].y, tri[1].x, tri[1].y);
  const d2 = distPointToSegment(px, py, tri[1].x, tri[1].y, tri[2].x, tri[2].y);
  const d3 = distPointToSegment(px, py, tri[2].x, tri[2].y, tri[0].x, tri[0].y);
  return Math.min(d1, d2, d3);
}

function distanceToShape(x: number, y: number, shape: ShapeType): number {
  switch (shape) {
    case "line":
      return distPointToSegment(x, y, LINE.x1, LINE.y1, LINE.x2, LINE.y2);
    case "circle":
      return distPointToCircle(x, y, CIRCLE.cx, CIRCLE.cy, CIRCLE.r);
    case "triangle":
      return distPointToTriangle(x, y, TRIANGLE);
    default:
      return 0;
  }
}

function drawGuide(ctx: CanvasRenderingContext2D, shape: ShapeType) {
  ctx.save();
  ctx.strokeStyle = "hsl(0 0% 100%)";
  ctx.globalAlpha = GUIDE_OPACITY;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  switch (shape) {
    case "line":
      ctx.beginPath();
      ctx.moveTo(LINE.x1, LINE.y1);
      ctx.lineTo(LINE.x2, LINE.y2);
      ctx.stroke();
      break;
    case "circle":
      ctx.beginPath();
      ctx.arc(CIRCLE.cx, CIRCLE.cy, CIRCLE.r, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case "triangle":
      ctx.beginPath();
      ctx.moveTo(TRIANGLE[0].x, TRIANGLE[0].y);
      ctx.lineTo(TRIANGLE[1].x, TRIANGLE[1].y);
      ctx.lineTo(TRIANGLE[2].x, TRIANGLE[2].y);
      ctx.closePath();
      ctx.stroke();
      break;
  }
  ctx.restore();
}

export function PrecisionGame({ gameSetting, onWin }: PrecisionGameProps) {
  const guideCanvasRef = useRef<HTMLCanvasElement>(null);
  const strokeCanvasRef = useRef<HTMLCanvasElement>(null);
  const [shapeIndex, setShapeIndex] = useState(0);
  const [phase, setPhase] = useState<GamePhase>("shapes");
  const [accuracies, setAccuracies] = useState<number[]>([]);
  const [tremorRates, setTremorRates] = useState<number[]>([]);
  const [shake, setShake] = useState(0);
  const [isDrawingState, setIsDrawingState] = useState(false);
  const isDrawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const pointsRef = useRef<{ x: number; y: number }[]>([]);
  const wonFired = useRef(false);
  const shakeId = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafId = useRef<number | null>(null);
  const pendingDraw = useRef<{ x: number; y: number } | null>(null);

  const currentShape = SHAPES[shapeIndex]?.type ?? "line";
  const rawTarget =
    gameSetting?.difficulty_target != null
      ? Number(gameSetting.difficulty_target)
      : gameSetting?.min_accuracy != null
        ? Number(gameSetting.min_accuracy)
        : 90;
  const minAccuracy = Math.min(100, Math.max(0, Number.isFinite(rawTarget) ? rawTarget : 90));
  const avgAccuracy =
    accuracies.length > 0 ? accuracies.reduce((a, b) => a + b, 0) / accuracies.length : 0;
  const avgTremor =
    tremorRates.length > 0 ? tremorRates.reduce((a, b) => a + b, 0) / tremorRates.length : 0;

  const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio ?? 1, 2) : 1;

  const setupCanvases = useCallback(() => {
    const guide = guideCanvasRef.current;
    const stroke = strokeCanvasRef.current;
    if (!guide || !stroke) return;
    const size = LOGICAL_SIZE * dpr;
    guide.width = size;
    guide.height = size;
    stroke.width = size;
    stroke.height = size;
    const gCtx = guide.getContext("2d");
    const sCtx = stroke.getContext("2d");
    if (gCtx) {
      gCtx.scale(dpr, dpr);
      gCtx.fillStyle = "hsl(0 0% 8%)";
      gCtx.fillRect(0, 0, LOGICAL_SIZE, LOGICAL_SIZE);
      drawGuide(gCtx, currentShape);
    }
    if (sCtx) sCtx.scale(dpr, dpr);
  }, [currentShape, shapeIndex]);

  useEffect(() => {
    setupCanvases();
  }, [setupCanvases]);

  useEffect(() => {
    const onResize = () => setupCanvases();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [setupCanvases]);

  useEffect(() => {
    if (!isDrawingState) {
      setShake(0);
      return;
    }
    shakeId.current = setInterval(() => {
      setShake((s) => (s === 0 ? SHAKE_AMOUNT : 0));
    }, 50);
    return () => {
      if (shakeId.current) clearInterval(shakeId.current);
      setShake(0);
    };
  }, [isDrawingState]);

  const evaluateStroke = useCallback(
    (points: { x: number; y: number }[], shape: ShapeType) => {
      if (points.length < 2) return { accuracy: 0, tremor: 100 };
      const deviations = points.map((p) => distanceToShape(p.x, p.y, shape));
      const avgDev = deviations.reduce((a, b) => a + b, 0) / deviations.length;
      const accuracy = Math.round(Math.max(0, 100 - avgDev * DEVIATION_TO_ACCURACY));
      const variance =
        deviations.reduce((s, d) => s + (d - avgDev) ** 2, 0) / deviations.length;
      const stdDev = Math.sqrt(variance);
      const tremor = Math.min(100, Math.round(stdDev * 3));
      return { accuracy, tremor };
    },
    []
  );

  const drawInkImmediate = useCallback((canvas: HTMLCanvasElement, x: number, y: number) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#0a0a0a";
    ctx.lineWidth = INK_WIDTH;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (lastPoint.current) {
      ctx.beginPath();
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(x, y, INK_WIDTH / 2, 0, Math.PI * 2);
      ctx.fillStyle = "#0a0a0a";
      ctx.fill();
    }
    lastPoint.current = { x, y };
  }, []);

  const drawInk = useCallback(
    (canvas: HTMLCanvasElement, x: number, y: number) => {
      pendingDraw.current = { x, y };
      if (rafId.current !== null) return;
      rafId.current = requestAnimationFrame(() => {
        rafId.current = null;
        const p = pendingDraw.current;
        if (p && strokeCanvasRef.current) drawInkImmediate(strokeCanvasRef.current, p.x, p.y);
        pendingDraw.current = null;
      });
    },
    [drawInkImmediate]
  );

  const getCoordsFromClient = useCallback((clientX: number, clientY: number, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(rect.width / LOGICAL_SIZE, rect.height / LOGICAL_SIZE);
    const contentWidth = LOGICAL_SIZE * scale;
    const contentHeight = LOGICAL_SIZE * scale;
    const contentLeft = rect.left + (rect.width - contentWidth) / 2;
    const contentTop = rect.top + (rect.height - contentHeight) / 2;
    const x = (clientX - contentLeft) * (LOGICAL_SIZE / contentWidth);
    const y = (clientY - contentTop) * (LOGICAL_SIZE / contentHeight);
    return { x, y };
  }, []);

  const getCoords = useCallback(
    (e: React.PointerEvent, canvas: HTMLCanvasElement) => getCoordsFromClient(e.clientX, e.clientY, canvas),
    [getCoordsFromClient]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const canvas = strokeCanvasRef.current;
      if (!canvas || phase !== "shapes") return;
      e.preventDefault();
      const { x, y } = getCoords(e, canvas);
      isDrawing.current = true;
      setIsDrawingState(true);
      pointsRef.current = [{ x, y }];
      lastPoint.current = { x, y };
      drawInkImmediate(canvas, x, y);
    },
    [phase, getCoords, drawInkImmediate]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDrawing.current || !strokeCanvasRef.current) return;
      e.preventDefault();
      const canvas = strokeCanvasRef.current;
      const { x, y } = getCoords(e, canvas);
      pointsRef.current.push({ x, y });
      drawInk(canvas, x, y);
    },
    [getCoords, drawInk]
  );

  const handlePointerUp = useCallback(() => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    setIsDrawingState(false);
    lastPoint.current = null;
    const points = pointsRef.current;
    if (points.length >= 2 && shapeIndex < SHAPES.length) {
      const { accuracy, tremor } = evaluateStroke(points, currentShape);
      setAccuracies((a) => [...a, accuracy]);
      setTremorRates((t) => [...t, tremor]);
      if (shapeIndex < SHAPES.length - 1) {
        setShapeIndex((i) => i + 1);
        const strokeCanvas = strokeCanvasRef.current;
        if (strokeCanvas) {
          const ctx = strokeCanvas.getContext("2d");
          ctx?.clearRect(0, 0, LOGICAL_SIZE, LOGICAL_SIZE);
        }
      } else {
        setPhase("results");
      }
    }
  }, [shapeIndex, currentShape, evaluateStroke]);

  useEffect(() => {
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointerleave", handlePointerUp);
    return () => {
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointerleave", handlePointerUp);
    };
  }, [handlePointerUp]);

  useEffect(() => {
    const canvas = strokeCanvasRef.current;
    if (!canvas) return;
    const onTouchMove = (e: TouchEvent) => {
      if (isDrawing.current && e.touches.length > 0) e.preventDefault();
    };
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => canvas.removeEventListener("touchmove", onTouchMove);
  }, []);

  useEffect(() => {
    if (phase !== "results") return;
    if (avgAccuracy >= minAccuracy && !wonFired.current) {
      wonFired.current = true;
      const rate = Number(gameSetting?.discount_rate) || 0;
      const code =
        typeof gameSetting?.promo_code === "string" && gameSetting.promo_code.trim()
          ? gameSetting.promo_code.trim()
          : "TATTOO15";
      onWin(rate, code);
      setPhase("won");
    }
  }, [phase, avgAccuracy, minAccuracy, gameSetting, onWin]);

  const handleNextShape = useCallback(() => {
    if (shapeIndex < SHAPES.length - 1) {
      setShapeIndex((i) => i + 1);
      const strokeCanvas = strokeCanvasRef.current;
      if (strokeCanvas) {
        const ctx = strokeCanvas.getContext("2d");
        ctx?.clearRect(0, 0, LOGICAL_SIZE, LOGICAL_SIZE);
      }
    }
  }, [shapeIndex]);

  if (phase === "results" || phase === "won") {
    return (
      <div className="rounded-xl bg-zinc-900/80 border border-zinc-700 p-6 space-y-6">
        <h3 className="font-heading font-bold text-lg text-foreground">Sonuçlar</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-zinc-800/80 p-4 border border-zinc-700">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Hassasiyet (ortalama)</p>
            <p className="text-2xl font-mono font-bold text-primary">%{Math.round(avgAccuracy)}</p>
          </div>
          <div className="rounded-lg bg-zinc-800/80 p-4 border border-zinc-700">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">El titreme oranı</p>
            <p className="text-2xl font-mono font-bold text-muted-foreground">{Math.round(avgTremor)}%</p>
          </div>
        </div>
        <div className="text-sm text-muted-foreground space-y-1">
          {SHAPES.map((s, i) => (
            <p key={s.type}>
              {s.label}: %{accuracies[i] ?? 0} hassasiyet
            </p>
          ))}
        </div>
        {phase === "won" && (
          <p className="text-primary font-heading font-bold">
            Tebrikler! %{minAccuracy} ve üzeri hassasiyetle indirim kazandınız.
          </p>
        )}
        {phase === "results" && avgAccuracy < minAccuracy && (
          <p className="text-muted-foreground text-sm">
            Ortalama hassasiyet %{minAccuracy} olmalıydı. Şu an %{Math.round(avgAccuracy)}.
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className="relative rounded-xl overflow-hidden select-none"
      style={{
        cursor: `url('${NEEDLE_CURSOR}') 12 2, crosshair`,
        background:
          "linear-gradient(145deg, hsl(0 0% 10%) 0%, hsl(0 0% 6%) 100%)",
      }}
    >
      <div className="absolute top-3 left-3 z-20 rounded-lg bg-black/80 px-3 py-2 min-h-[44px] flex items-center font-mono text-xs text-muted-foreground border border-white/10">
        {shapeIndex + 1} / 3 · {SHAPES[shapeIndex].label}
      </div>
      <div className="absolute top-3 right-3 z-20 rounded-lg bg-black/80 px-3 py-2 min-h-[44px] flex items-center font-mono text-xs text-primary border border-primary/40">
        Şeklin üzerinden tek seferde geçin
      </div>

      <motion.div
        className="relative w-full mx-auto aspect-square max-w-[90vw] max-h-[min(70vh,420px)]"
        style={{ aspectRatio: "1" }}
        animate={{ x: shake, y: shake }}
        transition={{ type: "tween", duration: 0.05 }}
      >
        <canvas
          ref={guideCanvasRef}
          className="absolute inset-0 w-full h-full object-contain rounded-lg pointer-events-none"
          style={{ background: "hsl(0 0% 8%)", width: "100%", height: "100%" }}
        />
        <canvas
          ref={strokeCanvasRef}
          className="absolute inset-0 w-full h-full object-contain rounded-lg touch-none"
          style={{ cursor: "inherit", touchAction: "none", width: "100%", height: "100%" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
      </motion.div>
    </div>
  );
}
