import { Outlet, Link } from "react-router-dom";
import { useState } from "react";
import Header from "./Header";
import BookingModal from "./BookingModal";
import type { Artist } from "@/data/studio-data";
import { useStudioData } from "@/hooks/useStudioData";

const footerNavLinks = [
  { label: "Koleksiyon", path: "/koleksiyon" },
  { label: "Piercing", path: "/piercing" },
  { label: "İletişim", path: "/", hash: "iletisim" },
];

const Footer = () => {
  const { data } = useStudioData();
  return (
    <footer className="border-t border-border py-12 px-4">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <span className="font-heading font-bold tracking-widest text-foreground">
          ARGO<span className="text-primary">X</span>
        </span>
        <nav className="flex items-center gap-6">
          {footerNavLinks.map((link) => (
            <Link
              key={link.path + (link.hash ?? "")}
              to={link.hash ? `${link.path}#${link.hash}` : link.path}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="text-sm text-muted-foreground">{data.footer.copyright}</p>
      </div>
    </footer>
  );
};

const Layout = () => {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingArtist, setBookingArtist] = useState<Artist | null>(null);

  const openBooking = (artist?: Artist) => {
    setBookingArtist(artist || null);
    setBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onBookNow={() => openBooking()} />
      <main className="flex-1">
        <Outlet context={{ openBooking }} />
      </main>
      <Footer />
      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        lockedArtist={bookingArtist}
      />
    </div>
  );
};

export default Layout;
