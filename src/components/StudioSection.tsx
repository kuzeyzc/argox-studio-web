import { motion } from "framer-motion";
import { Clock3, Mail, MapPin, Phone } from "lucide-react";
import { useStudioData } from "@/hooks/useStudioData";

const StudioSection = () => {
  const { data } = useStudioData();
  const c = data.contact;
  return (
    <section className="w-full max-w-[100vw] overflow-x-hidden bg-background" style={{ padding: "clamp(1rem, 2vw, 2rem) clamp(1rem, 2vw, 2rem) clamp(3rem, 8vw, 6rem)" }}>
      <div className="container mx-auto space-y-6 md:space-y-10">
        <div className="flex flex-col gap-2 md:gap-4">
          <p className="text-primary text-sm tracking-[0.3em] uppercase font-heading">
            {c.studioSectionTitle}
          </p>
          <h2 className="text-3xl md:text-5xl font-heading font-bold leading-tight">
            {c.studioSectionSubtitle}
          </h2>
        </div>

        {/* Üst: 4 stüdyo fotoğrafı */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-[10px] sm:gap-3 md:gap-4"
        >
          {[0, 1, 2, 3].map((i) => {
            const src = c.studioPhotos?.[i];
            return (
              <div
                key={i}
                className="rounded-xl border border-border bg-card/60 overflow-hidden"
              >
                <div className="aspect-video w-full overflow-hidden bg-zinc-800/50">
                  {src ? (
                    <img
                      src={src}
                      alt={`Stüdyo fotoğrafı ${i + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-500 text-sm">
                      Stüdyo {i + 1}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Alt: İletişim Bilgileri + Harita */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="grid gap-4 md:gap-6 lg:grid-cols-2 items-stretch"
        >
          <div className="rounded-2xl bg-card/80 border border-border flex flex-col gap-6 h-full" style={{ padding: "clamp(1rem, 3vw, 2.5rem)" }}>
            <h3 className="text-2xl font-heading font-bold mb-2">{c.contactTitle}</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-3 rounded-xl bg-background/60 border border-border px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-heading text-xs tracking-[0.2em] uppercase text-muted-foreground">
                    {c.phoneLabel}
                  </span>
                  <span className="font-mono text-base text-foreground">{c.phone}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-background/60 border border-border px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-heading text-xs tracking-[0.2em] uppercase text-muted-foreground">
                    {c.locationLabel}
                  </span>
                  <span>{c.address}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-background/60 border border-border px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-heading text-xs tracking-[0.2em] uppercase text-muted-foreground">
                    {c.emailLabel}
                  </span>
                  <a
                    href={`mailto:${c.email}`}
                    className="text-foreground underline underline-offset-4 decoration-primary/60"
                  >
                    {c.email}
                  </a>
                </div>
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-background/60 border border-border px-4 py-3">
              <div className="flex items-center gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Clock3 className="h-5 w-5" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {c.workingHours.map((wh) => (
                    <div
                      key={wh.day}
                      className="min-w-[80px] rounded-2xl bg-card px-3 py-2 text-[0.7rem] text-foreground shadow-sm flex flex-col items-center"
                    >
                      <span className="font-heading font-semibold">{wh.day}</span>
                      <span>{wh.isClosed ? "KAPALI" : wh.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="map-container rounded-2xl border border-border bg-card/40 max-w-[100vw]">
            <div className="map-iframe-wrapper">
              <iframe
                src={c.mapEmbedUrl || "about:blank"}
                className="grayscale transition duration-300 hover:grayscale-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="ArgoX Studio Konum"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StudioSection;

