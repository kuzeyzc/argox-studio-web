import { useState } from "react";
import type { Piercing, PiercingBodyRegion } from "@/data/studio-data";
import { useStudioData } from "@/hooks/useStudioData";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, User, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const FILTERS: { value: "Tümü" | PiercingBodyRegion; label: string }[] = [
  { value: "Tümü", label: "Tümü" },
  { value: "Kulak", label: "Kulak" },
  { value: "Burun", label: "Burun" },
  { value: "Dudak", label: "Dudak" },
  { value: "Kaş", label: "Kaş" },
  { value: "Dil", label: "Dil" },
  { value: "Göbek", label: "Göbek" },
  { value: "Diğer", label: "Diğer" },
];

function phoneToWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("90") ? digits : digits ? `90${digits}` : "";
}

const WA_MSG = (name: string) => `Merhaba, ${name} hakkında bilgi almak istiyorum.`;

/** Piercing için WhatsApp numarası: piercing'e özel varsa o (normalize), yoksa fallback (stüdyo). */
function getPiercingWhatsAppNumber(piercing: Piercing, fallbackNormalized: string): string {
  const num = piercing.whatsappNumber?.trim();
  if (num) {
    const digits = num.replace(/\D/g, "");
    return digits.startsWith("90") ? digits : digits ? `90${digits}` : fallbackNormalized;
  }
  return fallbackNormalized;
}

function PiercingCard({
  piercing,
  fallbackWhatsappNumber,
  onImageClick,
}: {
  piercing: Piercing;
  fallbackWhatsappNumber: string;
  onImageClick: (src: string, alt: string) => void;
}) {
  const [showModel, setShowModel] = useState(true);
  const productSrc = piercing.productImageUrl;
  const modelSrc = piercing.modelImageUrl;
  const hasBoth = !!(productSrc && modelSrc);
  const displaySrc = showModel && modelSrc ? modelSrc : productSrc;
  const whatsappNumber = getPiercingWhatsAppNumber(piercing, fallbackWhatsappNumber);
  const waUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(WA_MSG(piercing.name))}`
    : "#";

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-zinc-800 bg-zinc-900/80 overflow-hidden flex flex-col"
    >
      <div
        className="relative aspect-[3/4] bg-zinc-800 overflow-hidden group cursor-pointer"
        onClick={() => displaySrc && onImageClick(displaySrc, piercing.name)}
      >
        {displaySrc ? (
          <motion.img
            key={displaySrc}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
            src={displaySrc}
            alt={piercing.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-500 text-sm">Görsel yok</div>
        )}
        {hasBoth && (
          <div className="absolute bottom-3 left-3 right-3 flex gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowModel(true);
              }}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors",
                showModel ? "bg-primary text-primary-foreground" : "bg-zinc-800/90 text-zinc-300 hover:bg-zinc-700"
              )}
            >
              <User className="h-3.5 w-3.5" />
              Modelde Gör
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowModel(false);
              }}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors",
                !showModel ? "bg-primary text-primary-foreground" : "bg-zinc-800/90 text-zinc-300 hover:bg-zinc-700"
              )}
            >
              <Package className="h-3.5 w-3.5" />
              Ürün
            </button>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <p className="text-xs text-primary font-heading tracking-wider uppercase">{piercing.bodyRegion}</p>
        <h3 className="font-heading font-bold text-lg text-foreground">{piercing.name}</h3>
        <p className="text-sm text-muted-foreground">{piercing.bodyPart} · {piercing.material}</p>
        {piercing.price && (
          <p className="text-primary font-semibold">{piercing.price}</p>
        )}
        {piercing.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{piercing.description}</p>
        )}
        {whatsappNumber && (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto"
          >
            <Button size="sm" className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white">
              <MessageCircle className="h-4 w-4" />
              WhatsApp ile Bilgi Al
            </Button>
          </a>
        )}
      </div>
    </motion.article>
  );
}

export default function PiercingPage() {
  const { data } = useStudioData();
  const [filter, setFilter] = useState<"Tümü" | PiercingBodyRegion>("Tümü");
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  const phone = data.contact?.phone ?? "";
  const whatsappNumber = phone ? phoneToWhatsApp(phone) : "";
  const piercings = data.piercings;
  const filtered =
    filter === "Tümü" ? piercings : piercings.filter((p) => p.bodyRegion === filter);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pt-16">
      {/* Hero */}
      <section className="py-16 md:py-24 px-4 md:px-8 border-b border-zinc-800/50">
        <div className="container mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-primary text-sm tracking-[0.3em] uppercase font-heading mb-3"
          >
            Piercing
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-4xl md:text-6xl font-heading font-bold mb-4"
          >
            Tanıtım ve Görselleme
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground max-w-xl mx-auto"
          >
            Takılarımızı inceleyin; ürün fotoğrafı ile modeldeki duruşu arasında geçiş yapabilir, detay için görsele tıklayabilirsiniz.
          </motion.p>
        </div>
      </section>

      {/* Filters */}
      <div className="sticky top-16 z-20 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur py-4">
        <div className="container mx-auto px-4 md:px-8">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Vücut bölgesine göre filtrele</p>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                className={cn(
                  "text-xs font-heading tracking-wider px-4 py-2.5 rounded-full transition-colors",
                  filter === f.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700/50"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="container mx-auto px-4 md:px-8 py-12 md:py-16">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            {piercings.length === 0
              ? "Henüz piercing eklenmemiş."
              : "Bu bölgede kayıt bulunamadı."}
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((piercing) => (
                <PiercingCard
                  key={piercing.id}
                  piercing={piercing}
                  fallbackWhatsappNumber={whatsappNumber}
                  onImageClick={(src, alt) => setLightbox({ src, alt })}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Lightbox */}
      <Dialog open={!!lightbox} onOpenChange={(open) => !open && setLightbox(null)}>
        <DialogContent className="max-w-4xl w-[95vw] p-0 bg-transparent border-0 shadow-none overflow-hidden">
          <div className="relative rounded-xl overflow-hidden bg-zinc-900">
            {lightbox && (
              <img
                src={lightbox.src}
                alt={lightbox.alt}
                className="w-full h-auto max-h-[85vh] object-contain"
              />
            )}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 rounded-full bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setLightbox(null)}
              aria-label="Kapat"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
