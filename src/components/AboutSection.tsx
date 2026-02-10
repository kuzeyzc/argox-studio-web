import { motion, useScroll, useTransform } from "framer-motion";
import { MapPin, Clock, Shield, ArrowRight } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { useStudioData } from "@/hooks/useStudioData";
import { defaultAboutContent } from "@/data/studio-data";

interface AboutSectionProps {
  compact?: boolean;
}

const AboutSection = ({ compact }: AboutSectionProps) => {
  const { data } = useStudioData();
  const about = data.about;
  const d = defaultAboutContent;
  const locationLabel = about.locationLabel?.trim() || d.locationLabel;
  const locationValue = about.locationValue?.trim() || d.locationValue;
  const hoursLabel = about.hoursLabel?.trim() || d.hoursLabel;
  const hoursValue = about.hoursValue?.trim() || d.hoursValue;
  const certificationLabel = about.certificationLabel?.trim() || d.certificationLabel;
  const certificationValue = about.certificationValue?.trim() || d.certificationValue;
  const moreLinkText = about.moreLinkText?.trim() || d.moreLinkText;
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden w-full max-w-[100vw]" style={{ padding: "clamp(1rem, 2vw, 2rem) clamp(1rem, 2vw, 2rem) clamp(3rem, 8vw, 6rem)" }}>
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        <div className="absolute top-10 left-10 w-64 h-64 border border-primary/10 rotate-12" />
        <div className="absolute bottom-20 right-20 w-48 h-48 border border-primary/10 -rotate-6" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className="outline-text text-[12vw] font-heading font-bold opacity-20">ARGO</span>
        </div>
      </motion.div>

      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6 md:mb-12"
        >
          <p className="text-primary text-sm tracking-[0.3em] uppercase font-heading mb-2">{about.sectionLabel}</p>
          <h2 className="text-3xl md:text-5xl font-heading font-bold">{about.sectionTitle}</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {compact ? (
              <p className="text-muted-foreground leading-relaxed mb-6">
                {about.paragraph1}
              </p>
            ) : (
              <>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {about.paragraph1}
                </p>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  {about.paragraph2}
                </p>
              </>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-[10px] sm:gap-3 md:gap-4">
              <div className="border border-border hover:border-primary transition-colors rounded-lg" style={{ padding: "clamp(0.75rem, 2vw, 1rem)" }}>
                <MapPin size={20} className="text-primary mb-2" />
                <p className="font-heading font-bold text-sm">{locationLabel}</p>
                <p className="text-muted-foreground text-xs">{locationValue}</p>
              </div>
              <div className="border border-border hover:border-primary transition-colors rounded-lg" style={{ padding: "clamp(0.75rem, 2vw, 1rem)" }}>
                <Clock size={20} className="text-primary mb-2" />
                <p className="font-heading font-bold text-sm">{hoursLabel}</p>
                <p className="text-muted-foreground text-xs">{hoursValue}</p>
              </div>
              <div className="border border-border hover:border-primary transition-colors rounded-lg" style={{ padding: "clamp(0.75rem, 2vw, 1rem)" }}>
                <Shield size={20} className="text-primary mb-2" />
                <p className="font-heading font-bold text-sm">{certificationLabel}</p>
                <p className="text-muted-foreground text-xs">{certificationValue}</p>
              </div>
            </div>

            {compact && (
              <Link
                to="/hakkimizda"
                className="inline-flex items-center gap-2 border border-primary text-primary px-6 py-3 text-sm font-heading font-bold tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors mt-8"
              >
                {moreLinkText} <ArrowRight size={16} />
              </Link>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-[10px] sm:gap-3 md:gap-4">
              <div className="bg-card border border-border text-center rounded-lg" style={{ padding: "clamp(1rem, 3vw, 2rem)" }}>
                <p className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-primary">{about.statTattoos}</p>
                <p className="text-muted-foreground text-xs sm:text-sm mt-1">Yapılan Dövme</p>
              </div>
              <div className="bg-card border border-border text-center rounded-lg" style={{ padding: "clamp(1rem, 3vw, 2rem)" }}>
                <p className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-primary">{about.statArtists}</p>
                <p className="text-muted-foreground text-xs sm:text-sm mt-1">Usta Sanatçı</p>
              </div>
              <div className="bg-card border border-border text-center rounded-lg" style={{ padding: "clamp(1rem, 3vw, 2rem)" }}>
                <p className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-primary">{about.statYears}</p>
                <p className="text-muted-foreground text-xs sm:text-sm mt-1">Yıl Tecrübe</p>
              </div>
              <div className="bg-card border border-border text-center rounded-lg" style={{ padding: "clamp(1rem, 3vw, 2rem)" }}>
                <p className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-primary">{about.statAwards}</p>
                <p className="text-muted-foreground text-xs sm:text-sm mt-1">Kazanılan Ödül</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
