import type { Artist } from "@/data/studio-data";
import { useStudioData } from "@/hooks/useStudioData";
import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { Instagram, Twitter, Globe, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface ArtistsSectionProps {
  onBookArtist: (artist: Artist) => void;
  compact?: boolean;
}

const ArtistsSection = ({ onBookArtist, compact }: ArtistsSectionProps) => {
  const { data } = useStudioData();
  const artists = data.artists;
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

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
            <p className="text-primary text-sm tracking-[0.3em] uppercase font-heading mb-2">Ekibimiz</p>
            <h2 className="text-3xl md:text-5xl font-heading font-bold">Sanatçılarımız</h2>
          </div>
          {/* Mobile scroll controls */}
          <div className="flex gap-2 md:hidden">
            <button onClick={() => scroll(-1)} className="w-9 h-9 border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => scroll(1)} className="w-9 h-9 border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        </motion.div>

        {/* Mobile: horizontal scroll / Desktop: grid */}
        <div
          ref={scrollRef}
          className="flex md:grid md:grid-cols-3 gap-[10px] sm:gap-4 md:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory scrollbar-hide pb-4 md:pb-0"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {artists.map((artist) => {
            const isHovered = hoveredId === artist.id;
            const otherHovered = hoveredId !== null && !isHovered;

            return (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                onMouseEnter={() => setHoveredId(artist.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="flex-shrink-0 w-[min(280px,85vw)] md:w-auto snap-start transition-all duration-500"
                style={{
                  filter: otherHovered ? "blur(2px)" : "none",
                }}
              >
                <div
                  className="relative overflow-hidden aspect-square transition-all duration-500 bg-zinc-800"
                  style={{
                    border: isHovered ? "2px solid hsl(var(--primary))" : "2px solid transparent",
                    transform: isHovered ? "scale(1.03)" : "scale(1)",
                  }}
                >
                  {artist.image ? (
                    <img
                      src={artist.image}
                      alt={artist.name}
                      className="w-full h-full object-cover transition-all duration-500"
                      loading="lazy"
                      style={{
                        filter: isHovered ? "grayscale(0) opacity(1)" : "grayscale(1) opacity(0.8)",
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-heading font-bold text-zinc-500">
                      {artist.name.charAt(0)}
                    </div>
                  )}
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent flex flex-col justify-end p-5 transition-opacity duration-300"
                    style={{ opacity: isHovered ? 1 : 0 }}
                  >
                    <div className="flex gap-3 mb-4">
                      {artist.socials.instagram && (
                        <a href={`https://instagram.com/${artist.socials.instagram}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" onClick={(e) => e.stopPropagation()}>
                          <Instagram size={18} />
                        </a>
                      )}
                      {artist.socials.twitter && (
                        <a href={`https://twitter.com/${artist.socials.twitter}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" onClick={(e) => e.stopPropagation()}>
                          <Twitter size={18} />
                        </a>
                      )}
                      {artist.socials.behance && (
                        <a href={`https://behance.net/${artist.socials.behance}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" onClick={(e) => e.stopPropagation()}>
                          <Globe size={18} />
                        </a>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <Link
                        to={`/sanatci/${artist.slug || artist.id}`}
                        className="border border-primary text-primary text-xs px-4 py-2 font-heading tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        Profili Gör
                      </Link>
                      <button
                        onClick={() => onBookArtist(artist)}
                        className="bg-primary text-primary-foreground text-xs px-4 py-2 font-heading tracking-wider hover:brightness-110 transition-all"
                      >
                        Randevu
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="font-heading font-bold text-lg text-foreground">{artist.name}</h3>
                  <p className="text-muted-foreground text-sm">{artist.specialty}</p>
                  <p className="text-muted-foreground text-xs mt-1">{artist.experience} deneyim</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {compact && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-8 text-center"
          >
            <Link
              to="/sanatcilar"
              className="inline-flex items-center gap-2 border border-primary text-primary px-6 py-3 text-sm font-heading font-bold tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Tüm Sanatçıları Gör <ArrowRight size={16} />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default ArtistsSection;
