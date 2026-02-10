import { useState } from "react";
import { useLocation, Link, Navigate } from "react-router-dom";
import { Eye } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminHomepageContent } from "@/components/admin/AdminHomepageContent";
import { AdminArtists } from "@/components/admin/AdminArtists";
import { AdminGallery } from "@/components/admin/AdminGallery";
import { AdminServices } from "@/components/admin/AdminServices";
import { AdminContactHours } from "@/components/admin/AdminContactHours";
import { AdminTestimonials } from "@/components/admin/AdminTestimonials";
import { AdminHistory } from "@/components/admin/AdminHistory";
import { AdminAppointments } from "@/components/admin/AdminAppointments";
import { AdminBudgetSettings } from "@/components/admin/AdminBudgetSettings";
import { AdminProducts } from "@/components/admin/AdminProducts";
import { AdminPiercings } from "@/components/admin/AdminPiercings";
import { AdminGameSettings } from "@/components/admin/AdminGameSettings";
import { useStudioData } from "@/hooks/useStudioData";

const SECTION_TITLES: Record<string, string> = {
  "/admin": "Kontrol Paneli",
  "/admin/homepage": "Ana Sayfa İçeriği",
  "/admin/artists": "Sanatçılar",
  "/admin/gallery": "Galeri",
  "/admin/history": "Tarihçe Yönetimi",
  "/admin/testimonials": "Müşteri Yorumları",
  "/admin/services": "Hizmetlerimiz",
  "/admin/products": "Ürün Yönetimi",
  "/admin/piercings": "Piercing Yönetimi",
  "/admin/contact": "İletişim ve Saatler",
  "/admin/appointments": "Randevularım",
  "/admin/budget": "Bütçe Ayarları",
  "/admin/games": "Minigame Ayarları",
};

const AdminPage = () => {
  const { pathname } = useLocation();
  const { isManager, isArtist } = useAuth();
  const { currentUser } = useStudioData();
  const [previewMode, setPreviewMode] = useState(false);

  const title =
    isArtist && pathname === "/admin/artists"
      ? "Profil Ayarları"
      : isArtist && pathname === "/admin/gallery"
        ? "Portfolyo"
        : SECTION_TITLES[pathname] ?? "Yönetim";

  const renderContent = () => {
    switch (pathname) {
      case "/admin":
        return <AdminDashboard />;
      case "/admin/homepage":
        return isManager ? <AdminHomepageContent /> : null;
      case "/admin/artists":
        return <AdminArtists />;
      case "/admin/gallery":
        return <AdminGallery />;
      case "/admin/history":
        return isManager ? <AdminHistory /> : null;
      case "/admin/testimonials":
        return isManager ? <AdminTestimonials /> : null;
      case "/admin/services":
        return isManager ? <AdminServices /> : null;
      case "/admin/products":
        return <AdminProducts />;
      case "/admin/piercings":
        return <AdminPiercings />;
      case "/admin/contact":
        return isManager ? <AdminContactHours /> : null;
      case "/admin/appointments":
        return (
          <AdminAppointments
            mode={isManager ? "all" : "artist"}
            artistId={currentUser.artistId}
          />
        );
      case "/admin/budget":
        return <AdminBudgetSettings />;
      case "/admin/games":
        return isManager ? <AdminGameSettings /> : null;
      default:
        return <AdminDashboard />;
    }
  };

  const artistAllowedPaths = ["/admin", "/admin/artists", "/admin/gallery", "/admin/appointments", "/admin/budget", "/admin/products", "/admin/piercings"];
  if (!isManager && !artistAllowedPaths.includes(pathname)) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur px-6 py-4 flex items-center justify-between">
        <h2 className="font-heading font-bold text-xl">{title}</h2>
        <Button
          variant="outline"
          size="sm"
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          onClick={() => setPreviewMode((p) => !p)}
        >
          <Eye className="h-4 w-4 mr-2" />
          {previewMode ? "Düzenle Modu" : "Önizleme"}
        </Button>
      </header>
      <div className="p-6">
        {previewMode ? (
          <div className="rounded-xl border border-zinc-700 bg-zinc-900/50 p-8 text-center text-zinc-500">
            <p className="text-sm">Önizleme modu — değişiklikler kaydedilmeden önce burada görünecek.</p>
            <Link to="/" target="_blank" className="text-primary hover:underline mt-2 inline-block">
              Ana sayfayı yeni sekmede aç →
            </Link>
          </div>
        ) : (
          renderContent()
        )}
      </div>
    </>
  );
};

export default AdminPage;
