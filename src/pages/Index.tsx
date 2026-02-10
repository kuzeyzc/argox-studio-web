import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Hero from "@/components/Hero";
import ServicesSection from "@/components/ServicesSection";
import StudioSection from "@/components/StudioSection";
import RecentlyInked from "@/components/RecentlyInked";
import AboutSection from "@/components/AboutSection";
import ArtistsSection from "@/components/ArtistsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import PortfolioModal from "@/components/PortfolioModal";
import type { TattooWork } from "@/data/studio-data";
import { useLayoutContext } from "@/hooks/useLayoutContext";

const CONTACT_SECTION_ID = "iletisim";

const Index = () => {
  const { openBooking } = useLayoutContext();
  const [portfolioOpen, setPortfolioOpen] = useState(false);
  const [portfolioWork, setPortfolioWork] = useState<TattooWork | null>(null);

  // Scroll to contact section when hash is #iletisim
  const location = useLocation();
  useEffect(() => {
    const hash = location.hash?.slice(1) || "";
    if (hash !== CONTACT_SECTION_ID) return;
    const el = document.getElementById(CONTACT_SECTION_ID);
    if (!el) return;
    const t = requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(t);
  }, [location.pathname, location.hash]);

  const openWorkDetail = (work: TattooWork) => {
    setPortfolioWork(work);
    setPortfolioOpen(true);
  };

  return (
    <>
      <Hero />
      <ServicesSection compact />
      <RecentlyInked onViewDetails={openWorkDetail} />
      <AboutSection compact />
      <ArtistsSection onBookArtist={(artist) => openBooking(artist)} compact />
      <TestimonialsSection />

      <section id={CONTACT_SECTION_ID} className="scroll-mt-20">
        <StudioSection />
      </section>

      <PortfolioModal
        isOpen={portfolioOpen}
        onClose={() => setPortfolioOpen(false)}
        initialWork={portfolioWork}
      />
    </>
  );
};

export default Index;
