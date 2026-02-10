import type { Artist } from "@/data/studio-data";
import { motion } from "framer-motion";
import { Instagram, Twitter, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { useLayoutContext } from "@/hooks/useLayoutContext";
import { useStudioData } from "@/hooks/useStudioData";

const SanatcilarPage = () => {
  const { data } = useStudioData();
  const artists = data.artists;
  const { openBooking } = useLayoutContext();

  return (
    <div className="pt-16">
      <section className="py-20 px-4 md:px-8 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-primary text-sm tracking-[0.3em] uppercase font-heading mb-2">Ekibimiz</p>
          <h1 className="text-4xl md:text-6xl font-heading font-bold">Sanatçılarımız</h1>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Her biri kendi alanında uzman, tutkulu ve deneyimli sanatçılarımızla tanışın.
          </p>
        </motion.div>
      </section>

      <section className="container mx-auto px-4 md:px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {artists.map((artist, i) => (
            <ArtistFullCard key={artist.id} artist={artist} index={i} onBook={() => openBooking(artist)} />
          ))}
        </div>
      </section>
    </div>
  );
};

const ArtistFullCard = ({ artist, index, onBook }: { artist: Artist; index: number; onBook: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.15 }}
    className="bg-card border border-border overflow-hidden hover:border-primary transition-colors duration-300 group"
  >
    <div className="aspect-square overflow-hidden bg-zinc-800">
      {artist.image ? (
        <img
          src={artist.image}
          alt={artist.name}
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0 grayscale"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-5xl font-heading font-bold text-zinc-500">
          {artist.name.charAt(0)}
        </div>
      )}
    </div>
    <div className="p-6">
      <h3 className="font-heading font-bold text-xl mb-1">{artist.name}</h3>
      <p className="text-primary text-sm font-heading mb-1">{artist.specialty}</p>
      <p className="text-muted-foreground text-xs mb-4">{artist.experience} deneyim</p>
      <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-3">{artist.bio}</p>

      <div className="flex gap-3 mb-5">
        {artist.socials.instagram && (
          <a href={`https://instagram.com/${artist.socials.instagram}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
            <Instagram size={18} />
          </a>
        )}
        {artist.socials.twitter && (
          <a href={`https://twitter.com/${artist.socials.twitter}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
            <Twitter size={18} />
          </a>
        )}
        {artist.socials.behance && (
          <a href={`https://behance.net/${artist.socials.behance}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
            <Globe size={18} />
          </a>
        )}
      </div>

      <div className="flex gap-3">
        <Link
          to={`/sanatci/${artist.slug || artist.id}`}
          className="flex-1 text-center border border-primary text-primary text-xs py-2.5 font-heading tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          Profili Gör
        </Link>
        <button
          onClick={onBook}
          className="flex-1 bg-primary text-primary-foreground text-xs py-2.5 font-heading tracking-wider hover:brightness-110 transition-all"
        >
          Randevu Al
        </button>
      </div>
    </div>
  </motion.div>
);

export default SanatcilarPage;
