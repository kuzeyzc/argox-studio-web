import { useState } from "react";
import type { Product, ProductCategory } from "@/data/studio-data";
import { useStudioData } from "@/hooks/useStudioData";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const CATEGORY_FILTERS: { value: "Tümü" | ProductCategory; label: string }[] = [
  { value: "Tümü", label: "Tümü" },
  { value: "Kıyafet", label: "Kıyafet" },
  { value: "Aksesuar", label: "Aksesuar" },
];

function phoneToWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("90") ? digits : digits ? `90${digits}` : "";
}

function getProductWhatsAppNumber(product: Product, fallbackNormalized: string): string {
  const productNum = product.whatsappNumber?.trim();
  if (productNum) {
    const digits = productNum.replace(/\D/g, "");
    return digits.startsWith("90") ? digits : digits ? `90${digits}` : fallbackNormalized;
  }
  return fallbackNormalized;
}

const WHATSAPP_MESSAGE = (productName: string) =>
  `Merhaba, ${productName} ürünü hakkında bilgi almak istiyorum.`;

function ProductCard({
  product,
  fallbackWhatsappNumber,
  onViewDetails,
}: {
  product: Product;
  fallbackWhatsappNumber: string;
  onViewDetails: () => void;
}) {
  const [hover, setHover] = useState(false);
  const inStock = product.stockStatus === "Var";
  const whatsappNumber = getProductWhatsAppNumber(product, fallbackWhatsappNumber);
  const waText = encodeURIComponent(WHATSAPP_MESSAGE(product.name));
  const waUrl = whatsappNumber ? `https://wa.me/${whatsappNumber}?text=${waText}` : "#";

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-zinc-800 bg-zinc-900/80 overflow-hidden flex flex-col"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-zinc-800 group">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-500 text-sm">
            Görsel yok
          </div>
        )}
        <AnimatePresence>
          {hover && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3 p-4"
            >
              <Button
                size="sm"
                variant="secondary"
                className="w-full max-w-[200px] gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails();
                }}
              >
                <Eye className="h-4 w-4" />
                Detayları Gör
              </Button>
              {inStock && whatsappNumber && (
                <a href={waUrl} target="_blank" rel="noopener noreferrer" className="w-full max-w-[200px]">
                  <Button size="sm" className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white">
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp ile Sipariş Ver
                  </Button>
                </a>
              )}
              {!inStock && (
                <span className="text-sm text-zinc-400">Şu an stokta yok</span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="p-4 flex flex-col gap-1 flex-1">
        <p className="text-xs text-primary font-heading tracking-wider uppercase">{product.category}</p>
        <h3 className="font-heading font-bold text-lg text-foreground">{product.name}</h3>
        <p className="text-primary font-semibold">{product.price}</p>
      </div>
    </motion.article>
  );
}

export default function CollectionPage() {
  const { data } = useStudioData();
  const [filter, setFilter] = useState<"Tümü" | ProductCategory>("Tümü");
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const products = data.products.filter((p) => p.stockStatus === "Var" || p.stockStatus === "Yok");
  const filtered =
    filter === "Tümü" ? products : products.filter((p) => p.category === filter);
  const phone = data.contact?.phone ?? "";
  const whatsappNumber = phone ? phoneToWhatsApp(phone) : "";

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
            Tasarım Ürünler
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-4xl md:text-6xl font-heading font-bold mb-4"
          >
            Koleksiyon
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground max-w-xl mx-auto"
          >
            Kıyafet ve aksesuar koleksiyonumuzdan seçtiklerinizi inceleyin, WhatsApp üzerinden sipariş verebilirsiniz.
          </motion.p>
        </div>
      </section>

      {/* Category filters */}
      <div className="sticky top-16 z-20 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur py-4">
        <div className="container mx-auto px-4 md:px-8">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Kategoriye göre filtrele</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_FILTERS.map((f) => (
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

      {/* Product grid */}
      <div className="container mx-auto px-4 md:px-8 py-12 md:py-16">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            {products.length === 0
              ? "Henüz ürün eklenmemiş."
              : "Bu kategoride kayıt bulunamadı."}
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  fallbackWhatsappNumber={whatsappNumber}
                  onViewDetails={() => setDetailProduct(product)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Detail modal */}
      <Dialog open={!!detailProduct} onOpenChange={(open) => !open && setDetailProduct(null)}>
        <DialogContent className="max-w-md bg-background border-border text-foreground">
          <DialogHeader className="flex flex-row items-start justify-between gap-4">
            <DialogTitle className="text-xl font-heading">{detailProduct?.name}</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 -mr-2 -mt-2"
              onClick={() => setDetailProduct(null)}
              aria-label="Kapat"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          {detailProduct && (
            <div className="space-y-4">
              {detailProduct.imageUrl && (
                <div className="rounded-lg overflow-hidden aspect-square max-h-64 bg-muted">
                  <img
                    src={detailProduct.imageUrl}
                    alt={detailProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <p className="text-sm text-primary font-heading tracking-wider uppercase">{detailProduct.category}</p>
              <p className="text-muted-foreground text-sm">{detailProduct.description || "—"}</p>
              <p className="text-lg font-heading font-bold text-primary">{detailProduct.price}</p>
              {detailProduct.stockStatus === "Var" && (() => {
                const num = getProductWhatsAppNumber(detailProduct, whatsappNumber);
                const msg = WHATSAPP_MESSAGE(detailProduct.name);
                return num ? (
                  <a href={`https://wa.me/${num}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full gap-2 bg-green-600 hover:bg-green-700">
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp ile Sipariş Ver
                    </Button>
                  </a>
                ) : null;
              })()}
              {detailProduct.stockStatus === "Yok" && (
                <p className="text-sm text-muted-foreground">Şu an stokta bulunmamaktadır.</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
