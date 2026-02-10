import type { LucideIcon } from "lucide-react";
import {
  Palette,
  Shield,
  Heart,
  Star,
  Award,
  Pen,
  Sparkles,
  MessageSquare,
  Target,
  Zap,
} from "lucide-react";

/** Değerlerimiz bölümünde kullanılabilir Lucide ikon isimleri (alfabetik). */
export const VALUE_ICON_NAMES = [
  "Award",
  "Heart",
  "MessageSquare",
  "Palette",
  "Pen",
  "Shield",
  "Sparkles",
  "Star",
  "Target",
  "Zap",
] as const;

const VALUE_ICON_MAP: Record<string, LucideIcon> = {
  Palette,
  Shield,
  Heart,
  Star,
  Award,
  Pen,
  Sparkles,
  MessageSquare,
  Target,
  Zap,
};

export type ValueIconName = (typeof VALUE_ICON_NAMES)[number];

/** İkon adına göre Lucide bileşenini döndürür; bilinmiyorsa Star kullanılır. */
export function getValueIcon(name: string): LucideIcon {
  return VALUE_ICON_MAP[name] ?? Star;
}
