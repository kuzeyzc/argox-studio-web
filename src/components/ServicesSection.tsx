import { motion } from "framer-motion";
import { useStudioData } from "@/hooks/useStudioData";
import { Pen, RefreshCw, Sparkles, MessageSquare, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const iconMap: Record<string, React.ReactNode> = {
  Pen: <Pen size={28} />,
  RefreshCw: <RefreshCw size={28} />,
  Sparkles: <Sparkles size={28} />,
  MessageSquare: <MessageSquare size={28} />,
};

interface ServicesSectionProps {
  compact?: boolean;
}

const ServicesSection = ({ compact }: ServicesSectionProps) => {
  const { data } = useStudioData();
  const services = data.services;
  const labels = data.sectionLabels.services;
  const [activeId, setActiveId] = useState<string | null>(null);
  const items = compact ? services.slice(0, 4) : services;

  return (
    <section className="w-full max-w-[100vw] overflow-x-hidden" style={{ padding: "clamp(1rem, 2vw, 2rem) clamp(1rem, 2vw, 2rem) clamp(3rem, 8vw, 6rem)" }}>
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6 md:mb-12"
        >
          <p className="text-primary text-sm tracking-[0.3em] uppercase font-heading mb-2">{labels.sectionLabel}</p>
          <h2 className="text-3xl md:text-5xl font-heading font-bold">{labels.sectionTitle}</h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-2 gap-[10px] sm:gap-3 md:gap-4">
          {items.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onMouseEnter={() => setActiveId(service.id)}
              onMouseLeave={() => setActiveId(null)}
              className={`border rounded-xl transition-all duration-300 cursor-pointer group min-h-[44px] touch-manipulation ${
                compact ? "p-4 sm:p-5 md:p-6" : "p-4 sm:p-5 md:p-6 lg:p-8"
              } ${
                activeId === service.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground"
              }`}
            >
              <div className="flex items-start gap-2 sm:gap-4 md:gap-5">
                <div className={`shrink-0 transition-colors duration-300 ${activeId === service.id ? "text-primary" : "text-muted-foreground"}`}>
                  {iconMap[service.icon]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1 sm:mb-2">
                    <h3 className="font-heading font-bold text-sm sm:text-base md:text-lg truncate">{service.title}</h3>
                    <span className="text-primary font-heading text-xs sm:text-sm font-bold shrink-0">{service.price}</span>
                  </div>
                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-none">{service.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {compact && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-8 text-center"
          >
            <Link
              to="/hizmetler"
              className="inline-flex items-center gap-2 border border-primary text-primary px-6 py-3 text-sm font-heading font-bold tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {labels.moreLinkText} <ArrowRight size={16} />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default ServicesSection;
