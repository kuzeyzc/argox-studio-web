import { useState } from "react";
import type { Product } from "@/data/studio-data";
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

/** Telefon numarasını WhatsApp wa.me linki için normalize eder (sadece rakam, 90 öneki). */
function phoneToWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("90") ? digits : digits ? `90${digits}` : "";
}

/** Ürün için kullanılacak WhatsApp numarası: ürüne özel varsa o (normalize), yoksa fallback (zaten normalize stüdyo numarası). */
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      className="relative rounded-xl border border-border bg-card overflow-hidden group"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="aspect-[3/4] overflow-hidden bg-muted">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
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
                  <Button size="sm" className="w-full gap-2 bg-green-600 hover:bg-green-700">
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
      <div className="p-4">
        <p className="text-xs text-primary font-heading tracking-wider uppercase">{product.category}</p>
        <h3 className="font-heading font-bold text-lg text-foreground mt-0.5">{product.name}</h3>
        <p className="text-primary font-semibold mt-1">{product.price}</p>
      </div>
    </motion.div>
  );
}

export default function CollectionSection() {
  const { data } = useStudioData();
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const products = data.products.filter((p) => p.stockStatus === "Var" || p.stockStatus === "Yok"); // show all, but "sipariş" only when Var
  const phone = data.contact?.phone ?? "";
  const whatsappNumber = phone ? phoneToWhatsApp(phone) : "";

  if (products.length === 0) return null;

  return (
    <section id="koleksiyon" className="py-24 px-4 md:px-8 bg-muted/30 scroll-mt-20">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <p className="text-primary text-sm tracking-[0.3em] uppercase font-heading mb-2">Tasarım Ürünler</p>
          <h2 className="text-3xl md:text-5xl font-heading font-bold">Koleksiyon</h2>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Kıyafet ve aksesuar koleksiyonumuzdan seçtiklerinizi inceleyin, WhatsApp üzerinden sipariş verebilirsiniz.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              fallbackWhatsappNumber={whatsappNumber}
              onViewDetails={() => setDetailProduct(product)}
            />
          ))}
        </div>
      </div>

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
    </section>
  );
}
