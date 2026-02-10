import tattoo1 from "@/assets/tattoo-1.jpg";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useStudioData } from "@/hooks/useStudioData";

const MARQUEE_MAX = 15;
const MARQUEE_REPEAT = 4;
const MARQUEE_BASE_DURATION = 25;
const MARQUEE_DURATION_PER_ITEM = 1.5;

const Hero = () => {
  const { data } = useStudioData();
  const { hero: h, tattooWorks } = data;
  const dövmeWorks = tattooWorks.filter((w) => w.category === "Dövme").slice(0, MARQUEE_MAX);
  const marqueeItems = dövmeWorks.length > 0 ? dövmeWorks : [];
  const repeated =
    marqueeItems.length > 0
      ? Array.from({ length: MARQUEE_REPEAT }, () => marqueeItems).flat()
      : [];
  const marqueeDuration = Math.max(
    MARQUEE_BASE_DURATION,
    marqueeItems.length > 0
      ? MARQUEE_BASE_DURATION + marqueeItems.length * MARQUEE_DURATION_PER_ITEM
      : 30
  );

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background video */}
      <div className="absolute inset-0">
        <video
          className="h-full w-full object-cover blur-sm scale-105"
          autoPlay
          muted
          loop
          playsInline
          poster={tattoo1}
          aria-label="ArgoX studio background"
        >
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50" aria-hidden />
      </div>

      {/* Foreground content: pointer-events-none so marquee (z-10) receives clicks at bottom */}
      <div className="relative z-20 flex min-h-[100vh] items-center justify-center px-4 pb-20 pointer-events-none">
        <div className="flex flex-col items-center justify-center gap-5 max-w-3xl pointer-events-auto">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground text-sm tracking-[0.3em] uppercase font-heading"
        >
          {h.tagline}
        </motion.p>

        <div className="flex flex-col items-center gap-3 md:gap-4">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl md:text-6xl font-heading font-bold text-center leading-tight tracking-tight md:tracking-tighter"
          >
            {h.titleLine1}
            <br />
            <span className="text-primary">{h.titleLine2}</span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="h-1 w-20 bg-primary/80"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-muted-foreground max-w-md text-center"
          >
            {h.subtitle}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-4 flex gap-4"
        >
          <Link
            to="/galeri"
            className="bg-primary text-primary-foreground px-6 py-3 text-sm font-heading font-bold tracking-wider hover:brightness-110 transition-all"
          >
            {h.ctaGallery}
          </Link>
          <Link
            to="/sanatcilar"
            className="border border-primary text-primary px-6 py-3 text-sm font-heading font-bold tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            {h.ctaArtists}
          </Link>
        </motion.div>
        </div>
      </div>

      {/* Marquee: galerideki görseller 4x tekrarlı; tıklanınca ilgili kategori veya galeriye gider */}
      <div
        className="absolute inset-x-0 bottom-0 z-10 overflow-hidden py-4 md:py-6 pointer-events-auto"
        style={{ isolation: "isolate" }}
        aria-hidden={repeated.length === 0}
      >
        <div
          className="flex animate-marquee w-max gap-4 pointer-events-auto"
          key="marquee-track"
          style={{ ["--marquee-duration" as string]: `${marqueeDuration}s` }}
        >
          {repeated.length > 0 ? (
            repeated.map((work, i) => (
              <Link
                to={`/galeri?kategori=${encodeURIComponent(work.category)}`}
                key={`${work.id}-${i}`}
                className="w-32 h-32 md:w-48 md:h-48 flex-shrink-0 overflow-hidden rounded-md border border-border/40 bg-background/10 aspect-square pointer-events-auto cursor-pointer hover:border-primary/60 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary block group"
              >
                <img
                  src={work.image}
                  alt={work.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
              </Link>
            ))
          ) : (
            Array.from({ length: 6 * MARQUEE_REPEAT }).map((_, i) => (
              <div
                key={`placeholder-${i}`}
                className="w-32 h-32 md:w-48 md:h-48 flex-shrink-0 overflow-hidden rounded-md border border-border/40 bg-background/10 aspect-square flex items-center justify-center"
              >
                <span className="text-xs text-muted-foreground font-heading tracking-wider">Yakında</span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
