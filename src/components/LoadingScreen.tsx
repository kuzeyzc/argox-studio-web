import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

const DURATION_DRAW = 1.5;
const SMILE_PATH = "M 40 28 Q 160 52 280 28";

// Gülümseme kavisi: P0=(40,28), P1=(160,52), P2=(280,28) — ortada aşağı
const pathProgressToX = (t: number) =>
  40 * (1 - t) ** 2 + 2 * 160 * (1 - t) * t + 280 * t ** 2;
const pathProgressToY = (t: number) =>
  28 * (1 - t) ** 2 + 2 * 52 * (1 - t) * t + 28 * t ** 2;

interface LoadingScreenProps {
  onComplete?: () => void;
  isExiting?: boolean;
}

const LoadingScreen = ({ isExiting = false, onComplete }: LoadingScreenProps) => {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(260);
  const progress = useMotionValue(0);
  const cx = useTransform(progress, pathProgressToX);
  const cy = useTransform(progress, pathProgressToY);
  const needleTransform = useTransform(
    [cx, cy],
    (x, y) => `translate(${x}, ${y})`
  );
  const strokeDashoffset = useTransform(progress, (p) => pathLength * (1 - p));
  const textOpacity = useTransform(progress, (p) => 0.2 + 0.8 * p);
  const [xGlow, setXGlow] = useState(false);

  useEffect(() => {
    const el = pathRef.current;
    if (el) setPathLength(el.getTotalLength());
  }, []);

  useEffect(() => {
    const controls = animate(progress, 1, {
      duration: DURATION_DRAW,
      ease: [0.2, 1, 0.35, 1],
    });
    return () => controls.stop();
  }, [progress]);

  useEffect(() => {
    const t = setTimeout(() => setXGlow(true), DURATION_DRAW * 1000);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
      initial={false}
      animate={
        isExiting
          ? {
              opacity: 0,
              y: "-100%",
              transition: {
                duration: 0.75,
                ease: [0.16, 1, 0.3, 1],
              },
            }
          : {}
      }
      onAnimationComplete={() => {
        if (isExiting) onComplete?.();
      }}
    >
      <div className="relative flex flex-col items-center justify-center min-h-[100vh] gap-0">
        {/* ARGOX: dikeyde tam merkez — sadece X turuncu */}
        <motion.h1
          className="font-heading text-4xl font-bold tracking-[0.35em] text-foreground md:text-5xl"
          style={{ opacity: textOpacity }}
        >
          ARGO
          <motion.span
            className="text-primary inline-block"
            animate={
              xGlow
                ? {
                    filter: "drop-shadow(0 0 14px hsl(var(--primary)))",
                    scale: 1.08,
                  }
                : {}
            }
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            X
          </motion.span>
        </motion.h1>

        {/* Gülümseme kavisi — yazının altında dengeli boşlukla; çizgi sadece iğne arkasından görünür */}
        <svg
          width={320}
          height={56}
          viewBox="0 0 320 56"
          className="overflow-visible shrink-0 mt-8"
          aria-hidden
        >
          <defs>
            <linearGradient id="lineGradPrimary" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--primary))" />
            </linearGradient>
          </defs>
          <motion.path
            ref={pathRef}
            d={SMILE_PATH}
            fill="none"
            stroke="url(#lineGradPrimary)"
            strokeWidth="2"
            strokeLinecap="butt"
            strokeLinejoin="round"
            strokeDasharray={`${pathLength} ${pathLength}`}
            style={{ strokeDashoffset }}
          />
          <motion.g style={{ transform: needleTransform }}>
            <motion.g
              animate={{ y: [0, -0.5, 0.5, 0] }}
              transition={{
                repeat: Infinity,
                duration: 0.06,
                ease: "easeInOut",
              }}
            >
              <path
                d="M 0 -5 L 0.6 5 L -0.6 5 Z"
                fill="hsl(var(--primary))"
                stroke="hsl(var(--primary))"
                strokeWidth="0.4"
                strokeOpacity="0.9"
              />
            </motion.g>
          </motion.g>
        </svg>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
