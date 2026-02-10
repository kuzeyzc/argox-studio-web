import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import type { Artist, TattooWork } from "@/data/studio-data";
import { useStudioData } from "@/hooks/useStudioData";

interface PortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  artist?: Artist | null;
  initialWork?: TattooWork | null;
}

const PortfolioModal = ({ isOpen, onClose, artist, initialWork }: PortfolioModalProps) => {
  const { data } = useStudioData();
  const artists = data.artists;
  const work = initialWork;
  const workArtist = work ? artists.find((a) => a.id === work.artistId) : artist;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="relative z-10 bg-card border border-border w-full max-w-3xl flex flex-col md:flex-row overflow-hidden"
          >
            <button onClick={onClose} className="absolute top-4 right-4 z-20 text-muted-foreground hover:text-foreground transition-colors">
              <X size={24} />
            </button>

            {work ? (
              <>
                <div className="w-full md:w-1/2 aspect-square flex-shrink-0">
                  <img src={work.image} alt={work.title} className="w-full h-full object-cover" />
                </div>
                <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                  <h3 className="font-heading font-bold text-xl mb-1">{work.title}</h3>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider mb-6">{work.category}</span>

                  {workArtist && (
                    <div className="border-t border-border pt-5 mt-2">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden border border-border flex-shrink-0">
                          <img src={workArtist.image} alt={workArtist.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-heading font-bold">{workArtist.name}</p>
                          <p className="text-muted-foreground text-xs">{workArtist.specialty}</p>
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-5 line-clamp-3">{workArtist.bio}</p>
                      <Link
                        to={`/sanatci/${workArtist.slug || workArtist.id}`}
                        onClick={onClose}
                        className="border border-primary text-primary text-xs px-4 py-2 font-heading tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        Tam Profili Gör →
                      </Link>
                    </div>
                  )}
                </div>
              </>
            ) : artist ? (
              <div className="p-6 md:p-8 w-full">
                <h2 className="text-2xl font-heading font-bold mb-6">{artist.name} Portfolyosu</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto">
                  {artist.portfolio.map((w) => (
                    <div key={w.id} className="aspect-square overflow-hidden">
                      <img src={w.image} alt={w.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PortfolioModal;
