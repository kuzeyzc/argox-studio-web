import { useLocation } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useStudioDataContext } from "@/context/StudioDataContext";

const SKIP_GATE_PATHS = ["/login", "/sanatci-sifre"];

export function StudioDataLoadingScreen() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <header className="border-b border-zinc-800 p-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-28 bg-zinc-800" />
          <nav className="flex gap-4">
            <Skeleton className="h-4 w-20 bg-zinc-800" />
            <Skeleton className="h-4 w-16 bg-zinc-800" />
            <Skeleton className="h-4 w-20 bg-zinc-800" />
            <Skeleton className="h-4 w-24 bg-zinc-800" />
          </nav>
        </div>
      </header>
      <main className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-12 w-3/4 max-w-md bg-zinc-800" />
          <Skeleton className="h-6 w-full max-w-2xl bg-zinc-800" />
          <Skeleton className="h-6 w-4/5 max-w-xl bg-zinc-800" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 rounded-lg bg-zinc-800" />
          ))}
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-12 w-40 rounded-lg bg-zinc-800" />
          <Skeleton className="h-12 w-32 rounded-lg bg-zinc-800" />
        </div>
      </main>
      <footer className="border-t border-zinc-800 p-4">
        <Skeleton className="h-4 w-64 bg-zinc-800 mx-auto" />
      </footer>
    </div>
  );
}

/**
 * Veriler yüklenene kadar skeleton gösterir. /login ve /sanatci-sifre için gate atlanır,
 * böylece giriş ekranı Supabase yüklenmeden hemen görünür (titreme önlenir).
 */
export function StudioDataGate({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { isLoading } = useStudioDataContext();
  if (SKIP_GATE_PATHS.includes(location.pathname)) return <>{children}</>;
  if (isLoading) return <StudioDataLoadingScreen />;
  return <>{children}</>;
}
