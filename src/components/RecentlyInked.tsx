import { TattooWork } from "@/data/studio-data";
import { useStudioData } from "@/hooks/useStudioData";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface RecentlyInkedProps {
  onViewDetails: (work: TattooWork) => void;
}

const RecentlyInked = ({ onViewDetails }: RecentlyInkedProps) => {
  const {
    data: { tattooWorks, artists, sectionLabels },
  } = useStudioData();
  const labels = sectionLabels.recentlyInked;
  const lastFour = tattooWorks.slice(0, 4);

  return (
    <section className="w-full max-w-[100vw] overflow-x-hidden" style={{ padding: "clamp(1rem, 2vw, 2rem) clamp(1rem, 2vw, 2rem) clamp(3rem, 8vw, 6rem)" }}>
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6 md:mb-12 flex items-end justify-between"
        >
          <div>
            <p className="text-primary text-sm tracking-[0.3em] uppercase font-heading mb-2">{labels.sectionLabel}</p>
            <h2 className="text-3xl md:text-5xl font-heading font-bold">{labels.sectionTitle}</h2>
          </div>
          <Link
            to="/galeri"
            className="hidden md:inline-flex items-center gap-2 text-primary text-sm font-heading font-bold tracking-wider hover:underline"
          >
            {labels.viewAllText} <ArrowRight size={16} />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-2 gap-[10px] sm:gap-4 md:gap-6">
          {lastFour.map((work, i) => {
            const artist = artists.find((a) => a.id === work.artistId);
            return (
              <motion.div
                key={work.id}
                initial={{ opacity: 0, y: 28, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                whileHover={{ y: -8, scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ delay: i * 0.08, type: "spring", stiffness: 120, damping: 28 }}
                className="flex flex-col md:flex-row gap-0 bg-card border border-border overflow-hidden group cursor-pointer hover:border-primary transition-colors duration-300 rounded-lg md:rounded-none"
                onClick={() => onViewDetails(work)}
              >
                <div className="w-full md:w-1/2 aspect-square flex-shrink-0 overflow-hidden">
                  <img
                    src={work.image}
                    alt={work.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="w-full md:w-1/2 p-3 sm:p-4 md:p-5 lg:p-6 flex flex-col justify-center gap-2 sm:gap-3 min-w-0">
                  {artist && (
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-border flex-shrink-0 bg-zinc-700 flex items-center justify-center">
                        {artist.image ? (
                          <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs sm:text-sm font-heading font-bold text-zinc-400">{artist.name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-primary font-heading font-bold text-xs sm:text-sm truncate">{artist.name}</p>
                        <p className="text-muted-foreground text-[10px] sm:text-xs truncate">{artist.specialty}</p>
                      </div>
                    </div>
                  )}
                  <h3 className="font-heading font-bold text-sm sm:text-base md:text-lg text-foreground line-clamp-2">{work.title}</h3>
                  <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">{work.category}</span>
                  <span className="mt-auto border border-primary text-primary text-[10px] sm:text-xs px-3 py-1 sm:px-4 sm:py-1.5 font-heading tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors self-start">
                    Detaylar
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link
            to="/galeri"
            className="inline-flex items-center gap-2 text-primary text-sm font-heading font-bold tracking-wider hover:underline"
          >
            {labels.viewAllText} <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RecentlyInked;
