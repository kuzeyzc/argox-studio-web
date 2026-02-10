import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { TattooWork } from "@/data/studio-data";
import { useStudioData } from "@/hooks/useStudioData";
import PortfolioModal from "@/components/PortfolioModal";

const categories = ["Tümü", "Dövme", "Piercing", "Sanat"] as const;

const GaleriPage = () => {
  const { data } = useStudioData();
  const { tattooWorks, artists } = data;
  const [searchParams, setSearchParams] = useSearchParams();
  const kategoriFromUrl = searchParams.get("kategori");
  const [activeCategory, setActiveCategory] = useState<string>(() => {
    if (kategoriFromUrl && categories.includes(kategoriFromUrl as typeof categories[number])) return kategoriFromUrl;
    return "Tümü";
  });

  useEffect(() => {
    if (kategoriFromUrl && categories.includes(kategoriFromUrl as typeof categories[number])) {
      setActiveCategory(kategoriFromUrl);
    }
  }, [kategoriFromUrl]);
  const [selectedWork, setSelectedWork] = useState<TattooWork | null>(null);

  const filtered = activeCategory === "Tümü"
    ? tattooWorks
    : tattooWorks.filter((w) => w.category === activeCategory);

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="py-20 px-4 md:px-8 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-primary text-sm tracking-[0.3em] uppercase font-heading mb-2">Portfolyomuz</p>
          <h1 className="text-4xl md:text-6xl font-heading font-bold">Galeri</h1>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Sanatçılarımızın en son çalışmalarını keşfedin. Her eser, bir hikâyenin mürekkeple anlatımıdır.
          </p>
        </motion.div>
      </section>

      {/* Filters */}
      <div className="container mx-auto px-4 md:px-8 mb-8">
        <div className="flex gap-3 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setSearchParams(cat === "Tümü" ? {} : { kategori: cat });
              }}
              className={`text-xs font-heading tracking-wider px-5 py-2.5 transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:text-foreground hover:border-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="container mx-auto px-4 md:px-8 pb-24">
        <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <AnimatePresence>
            {filtered.map((work) => {
              const artist = artists.find((a) => a.id === work.artistId);
              return (
                <motion.div
                  key={work.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="aspect-square overflow-hidden group cursor-pointer relative"
                  onClick={() => setSelectedWork(work)}
                >
                  <img src={work.image} alt={work.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <p className="font-heading font-bold text-sm text-foreground">{work.title}</p>
                    {artist && <p className="text-primary text-xs">{artist.name}</p>}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      <PortfolioModal
        isOpen={!!selectedWork}
        onClose={() => setSelectedWork(null)}
        initialWork={selectedWork}
      />
    </div>
  );
};

export default GaleriPage;
