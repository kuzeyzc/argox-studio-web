import { motion, useScroll, useTransform } from "framer-motion";
import { useStudioData } from "@/hooks/useStudioData";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

const TestimonialsSection = () => {
  const { data } = useStudioData();
  const { testimonials } = data;
  const labels = data.sectionLabels.testimonials;
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [80, -80]);

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <section ref={sectionRef} className="py-24 px-4 md:px-8 relative overflow-hidden">
      <motion.div
        style={{ y }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
      >
        <span className="outline-text text-[15vw] font-heading font-bold opacity-30">YORUMLAR</span>
      </motion.div>

      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 flex items-end justify-between"
        >
          <div>
            <p className="text-primary text-sm tracking-[0.3em] uppercase font-heading mb-2">{labels.sectionLabel}</p>
            <h2 className="text-3xl md:text-5xl font-heading font-bold">{labels.sectionTitle}</h2>
          </div>
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
          className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex-shrink-0 w-[300px] md:w-auto snap-start bg-card border border-border p-6 hover:border-primary transition-colors duration-300"
            >
              <Quote size={20} className="text-primary mb-4" />
              <p className="text-foreground text-sm leading-relaxed mb-4">"{t.text}"</p>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="font-heading font-bold text-sm">{t.name}</p>
                  <p className="text-primary text-xs font-medium">{t.artistName}</p>
                </div>
                <div className="flex gap-0.5 shrink-0" aria-label={`${t.rating} yıldız`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < t.rating ? "text-primary fill-primary" : "text-muted-foreground/30"}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
