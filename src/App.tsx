import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { StudioDataProvider } from "@/context/StudioDataContext";
import LoadingScreen from "@/components/LoadingScreen";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import GaleriPage from "./pages/GaleriPage";
import HizmetlerPage from "./pages/HizmetlerPage";
import HakkimizdaPage from "./pages/HakkimizdaPage";
import SanatcilarPage from "./pages/SanatcilarPage";
import TarihcePage from "./pages/TarihcePage";
import PiercingPage from "./pages/PiercingPage";
import OyunlarPage from "./pages/OyunlarPage";
import CollectionPage from "./pages/CollectionPage";
import ArtistPage from "./pages/ArtistPage";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";
import ArtistSignupPage from "./pages/ArtistSignupPage";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminLayout } from "./components/AdminLayout";
import { StudioDataGate } from "./components/StudioDataLoadingScreen";

const queryClient = new QueryClient();

const EXIT_DELAY_MS = 2000;

const App = () => {
  const [showLoading, setShowLoading] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, EXIT_DELAY_MS);
    return () => clearTimeout(exitTimer);
  }, []);

  const handleLoadingComplete = () => {
    setShowLoading(false);
  };

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {showLoading && (
        <LoadingScreen
          isExiting={isExiting}
          onComplete={handleLoadingComplete}
        />
      )}
      <StudioDataProvider>
        <BrowserRouter>
          <StudioDataGate>
          <AnimatePresence mode="wait">
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route path="/hizmetler" element={<HizmetlerPage />} />
                <Route path="/galeri" element={<GaleriPage />} />
                <Route path="/hakkimizda" element={<HakkimizdaPage />} />
                <Route path="/sanatcilar" element={<SanatcilarPage />} />
                <Route path="/tarihce" element={<TarihcePage />} />
                <Route path="/piercing" element={<PiercingPage />} />
                <Route path="/oyunlar" element={<OyunlarPage />} />
                <Route path="/koleksiyon" element={<CollectionPage />} />
                <Route path="/sanatci/:slug" element={<ArtistPage />} />
                <Route path="/artist/:slug" element={<ArtistPage />} />
              </Route>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/sanatci-sifre" element={<ArtistSignupPage />} />
              <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                <Route index element={<AdminPage />} />
                <Route path="homepage" element={<AdminPage />} />
                <Route path="artists" element={<AdminPage />} />
                <Route path="gallery" element={<AdminPage />} />
                <Route path="history" element={<AdminPage />} />
                <Route path="appointments" element={<AdminPage />} />
                <Route path="budget" element={<AdminPage />} />
                <Route path="testimonials" element={<AdminPage />} />
                <Route path="services" element={<AdminPage />} />
                <Route path="products" element={<AdminPage />} />
                <Route path="piercings" element={<AdminPage />} />
                <Route path="games" element={<AdminPage />} />
                <Route path="contact" element={<AdminPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
          </StudioDataGate>
        </BrowserRouter>
      </StudioDataProvider>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
