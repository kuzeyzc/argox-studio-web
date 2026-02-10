import { useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Home,
  Users,
  ImagePlus,
  Briefcase,
  Contact,
  MessageSquare,
  History,
  ArrowLeft,
  LogOut,
  Calendar,
  Banknote,
  Package,
  Sparkles,
  Gamepad2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useStudioData } from "@/hooks/useStudioData";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MANAGER_NAV = [
  { path: "/admin", label: "Kontrol Paneli", icon: LayoutDashboard },
  { path: "/admin/homepage", label: "Ana Sayfa İçeriği", icon: Home },
  { path: "/admin/artists", label: "Sanatçılar", icon: Users },
  { path: "/admin/gallery", label: "Galeri", icon: ImagePlus },
  { path: "/admin/history", label: "Tarihçe Yönetimi", icon: History },
  { path: "/admin/testimonials", label: "Müşteri Yorumları", icon: MessageSquare },
  { path: "/admin/services", label: "Hizmetlerimiz", icon: Briefcase },
  { path: "/admin/products", label: "Ürün Yönetimi", icon: Package },
  { path: "/admin/piercings", label: "Piercing Yönetimi", icon: Sparkles },
  { path: "/admin/budget", label: "Bütçe Ayarları", icon: Banknote },
  { path: "/admin/games", label: "Minigame Ayarları", icon: Gamepad2 },
  { path: "/admin/contact", label: "İletişim ve Saatler", icon: Contact },
] as const;

const ARTIST_NAV = [
  { path: "/admin", label: "Kontrol Paneli", icon: LayoutDashboard },
  { path: "/admin/appointments", label: "Randevularım", icon: Calendar },
  { path: "/admin/budget", label: "Bütçe Ayarları", icon: Banknote },
  { path: "/admin/artists", label: "Profil Ayarları", icon: Users },
  { path: "/admin/gallery", label: "Portfolyo", icon: ImagePlus },
  { path: "/admin/products", label: "Ürün Yönetimi", icon: Package },
  { path: "/admin/piercings", label: "Piercing Yönetimi", icon: Sparkles },
] as const;

export function AdminLayout() {
  const { user, logout, isManager } = useAuth();
  const { setCurrentUser, data } = useStudioData();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    setCurrentUser(
      user.role === "MANAGER"
        ? { role: "MANAGER" }
        : { role: "ARTIST", artistId: user.artistId }
    );
  }, [user, setCurrentUser]);

  const navItems = isManager ? MANAGER_NAV : ARTIST_NAV;
  const currentPath = location.pathname;

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
      <aside className="w-64 border-r border-zinc-800 flex flex-col bg-zinc-900/50">
        <div className="p-4 border-b border-zinc-800">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Siteye Dön
          </Link>
          <h1 className="font-heading font-bold text-lg mt-3 tracking-tight">Admin Panel</h1>
          <p className="text-xs text-zinc-500 mt-1 truncate" title={user?.email}>
            {user?.name}
          </p>
          <p className="text-xs text-zinc-600">
            {isManager ? "Yönetici" : "Sanatçı"}
          </p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors",
                currentPath === item.path
                  ? "bg-primary text-primary-foreground"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-zinc-800">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Çıkış Yap
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
