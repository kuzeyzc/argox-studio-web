import { useParams, Link, Navigate } from "react-router-dom";
import { TattooWork } from "@/data/studio-data";
import { useArtistBySlug } from "@/hooks/useStudioData";
import { motion } from "framer-motion";
import { ArrowLeft, Instagram, Twitter, Globe, Mail, Phone } from "lucide-react";
import { useState, useCallback } from "react";
import PortfolioModal from "@/components/PortfolioModal";
import { useLayoutContext } from "@/hooks/useLayoutContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const categories = ["Tümü", "Dövme", "Piercing", "Sanat"] as const;

const ArtistPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const artist = useArtistBySlug(slug);
  const { openBooking } = useLayoutContext();

  const [activeCategory, setActiveCategory] = useState<string>("Tümü");
  const [selectedWork, setSelectedWork] = useState<TattooWork | null>(null);
  const [videoReady, setVideoReady] = useState(false);

  const handleVideoCanPlay = useCallback(() => setVideoReady(true), []);
  const handleVideoError = useCallback(() => setVideoReady(false), []);

  if (!artist) {
    return <Navigate to="/sanatcilar" replace />;
  }

  const filtered = activeCategory === "Tümü" ? artist.portfolio : artist.portfolio.filter((w) => w.category === activeCategory);
  const hasBannerVideo = !!(artist.bannerVideoUrl && artist.bannerVideoUrl.trim());
  const showFallback = !hasBannerVideo || !videoReady;

  return (
    <div className="pt-16">
      {/* Hero: video (varsa) + fallback görsel, koyu overlay, gradient, metin */}
      <div className="relative h-[60vh] overflow-hidden bg-zinc-800">
        {/* Fallback: profil fotoğrafı veya baş harf (video yoksa / yüklenene kadar) */}
        {showFallback && (
          <div className="absolute inset-0 w-full h-full">
            {artist.image ? (
              <img src={artist.image} alt="" className="w-full h-full object-cover" aria-hidden />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl font-heading font-bold text-zinc-600">
                {artist.name.charAt(0)}
              </div>
            )}
          </div>
        )}
        {/* Banner video: autoPlay, muted, loop, playsInline, object-cover */}
        {hasBannerVideo && (
          <video
            key={artist.bannerVideoUrl}
            src={artist.bannerVideoUrl}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            onCanPlay={handleVideoCanPlay}
            onError={handleVideoError}
            aria-hidden
          />
        )}
        {/* Koyu overlay: video netliği için düşük opacity (0.4) */}
        <div className="absolute inset-0 bg-black/40 z-[1]" aria-hidden />
        {/* Sadece en alt kısımda siteyle bütünleşme geçişi, orta/üst net kalır */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-background to-transparent z-[2]" aria-hidden />
        <div className="absolute top-6 left-6 z-10">
          <Link to="/sanatcilar" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-heading text-sm">
            <ArrowLeft size={18} /> Geri
          </Link>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 z-[10]">
          <div className="container mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="opacity-100 flex items-center gap-6 md:gap-8" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}>
              <Avatar className="h-20 w-20 md:h-24 md:w-24 flex-shrink-0 rounded-full ring-2 ring-white/30 ring-offset-2 ring-offset-transparent">
                <AvatarImage src={artist.image} alt={artist.name} className="object-cover" />
                <AvatarFallback className="bg-zinc-600 text-white text-2xl font-heading font-bold">
                  {artist.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-primary text-sm tracking-[0.3em] uppercase font-heading mb-2">{artist.specialty}</p>
                <h1 className="text-[#FFFFFF] text-4xl md:text-6xl font-heading font-bold">{artist.name}</h1>
                <p className="text-primary text-sm mt-2 opacity-100">{artist.experience} deneyim</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-2">
            <h2 className="font-heading font-bold text-xl mb-4">Biyografi</h2>
            <p className="text-muted-foreground leading-relaxed">{artist.bio}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border p-6 space-y-4">
            <h3 className="font-heading font-bold text-sm">İletişim & Sosyal Medya</h3>
            <div className="space-y-3 text-sm">
              <a href={`mailto:${artist.email}`} className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                <Mail size={16} /> {artist.email}
              </a>
              <a href={`tel:${artist.phone}`} className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                <Phone size={16} /> {artist.phone}
              </a>
              {artist.socials.instagram && (
                <a href={`https://instagram.com/${artist.socials.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                  <Instagram size={16} /> @{artist.socials.instagram}
                </a>
              )}
              {artist.socials.twitter && (
                <a href={`https://twitter.com/${artist.socials.twitter}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                  <Twitter size={16} /> @{artist.socials.twitter}
                </a>
              )}
              {artist.socials.behance && (
                <a href={`https://behance.net/${artist.socials.behance}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                  <Globe size={16} /> Behance
                </a>
              )}
            </div>
            <button
              onClick={() => openBooking(artist)}
              className="w-full bg-primary text-primary-foreground py-2.5 text-sm font-heading font-bold tracking-wider hover:brightness-110 transition-all mt-4"
            >
              Randevu Al
            </button>
          </motion.div>
        </div>

        <div>
          <h2 className="font-heading font-bold text-xl mb-6">Portfolyo</h2>
          <div className="flex gap-3 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs font-heading tracking-wider px-4 py-2 transition-colors ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-muted-foreground hover:text-foreground hover:border-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((work) => (
              <motion.div
                key={work.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="aspect-square overflow-hidden group cursor-pointer"
                onClick={() => setSelectedWork(work)}
              >
                <img src={work.image} alt={work.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <PortfolioModal
        isOpen={!!selectedWork}
        onClose={() => setSelectedWork(null)}
        initialWork={selectedWork}
        artist={null}
      />
    </div>
  );
};

export default ArtistPage;
