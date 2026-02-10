import { useEffect, useState } from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const AUTH_LOADING_TIMEOUT_MS = 5000;

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Admin rotalarını sarar. Kimlik doğrulama yoksa /login'e yönlendirir.
 * Yükleme sonsuz döngüye girmez; zaman aşımı ve hata durumunda kullanıcıya bilgi verilir.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, authError } = useAuth();
  const location = useLocation();
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setLoadingTimedOut(false);
      return;
    }
    const t = setTimeout(() => setLoadingTimedOut(true), AUTH_LOADING_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [isLoading]);

  if (isLoading && !loadingTimedOut) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400 font-heading">Yükleniyor…</div>
      </div>
    );
  }

  if (loadingTimedOut || authError) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 p-4">
        <p className="text-zinc-400 text-center max-w-md">
          {authError || "Oturum kontrolü zaman aşımına uğradı."}
        </p>
        <Link
          to="/login"
          className="text-primary hover:underline font-heading"
        >
          Giriş sayfasına git
        </Link>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
