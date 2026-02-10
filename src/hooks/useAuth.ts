import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

export type AuthRole = "MANAGER" | "ARTIST";

export interface AuthUser {
  role: AuthRole;
  email: string;
  name: string;
  artistId?: string;
}

export interface UseAuthResult {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isManager: boolean;
  isArtist: boolean;
}

interface AdminProfileRow {
  role: string;
  artist_id: string | null;
}

/**
 * Supabase Auth ile giriş. Giriş sonrası admin_profiles'tan role/artist_id alınır.
 * Bağlantı hatasında sonsuz yükleme yapmaz; isLoading bir kez false yapılır.
 */
export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const initialCheckDone = useRef(false);

  useEffect(() => {
    if (initialCheckDone.current) return;
    initialCheckDone.current = true;

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (session?.user) {
          return applySessionToUser(session.user).then((u) => {
            setUser(u ?? null);
          });
        }
        setUser(null);
      })
      .catch((err) => {
        console.error("[useAuth] getSession hatası:", err);
        setUser(null);
        setAuthError("Oturum kontrol edilemedi. Bağlantıyı kontrol edin.");
      })
      .finally(() => {
        setIsLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION") return;
      if (session?.user) {
        applySessionToUser(session.user).then(setUser).catch(() => setUser(null));
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function applySessionToUser(supabaseUser: User): Promise<AuthUser | null> {
    const { data: profile, error: profileError } = await supabase
      .from("admin_profiles")
      .select("role, artist_id")
      .eq("user_id", supabaseUser.id)
      .single();

    if (profileError || !profile) {
      const { data: rpcData, error: rpcError } = await supabase.rpc("ensure_admin_profile");
      if (rpcError || !rpcData?.ok) {
        return null;
      }
      const r = rpcData as { role: string; artist_id: string | null };
      let name = r.role === "MANAGER" ? "Yönetici" : (supabaseUser.email ?? "");
      if (r.role === "ARTIST" && r.artist_id) {
        const { data: artist } = await supabase.from("artists").select("name").eq("id", r.artist_id).single();
        if (artist?.name) name = artist.name as string;
      }
      return {
        role: r.role as AuthRole,
        email: supabaseUser.email ?? "",
        name,
        artistId: r.artist_id ?? undefined,
      };
    }

    const row = profile as AdminProfileRow;
    let name = supabaseUser.email ?? "";
    if (row.role === "MANAGER") name = "Yönetici";
    else if (row.artist_id) {
      const { data: artist } = await supabase.from("artists").select("name").eq("id", row.artist_id).single();
      if (artist?.name) name = artist.name as string;
    }
    return {
      role: row.role as AuthRole,
      email: supabaseUser.email ?? "",
      name,
      artistId: row.artist_id ?? undefined,
    };
  }

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const e = email.trim();
    if (!e || !password) return { success: false, error: "E-posta ve şifre gerekli." };
    const { data, error } = await supabase.auth.signInWithPassword({ email: e, password });
    if (error) {
      const msg = error.message === "Invalid login credentials" ? "Geçersiz e-posta veya şifre." : error.message;
      return { success: false, error: msg };
    }
    if (!data.user) return { success: false, error: "Giriş yapılamadı." };
    const authUser = await applySessionToUser(data.user);
    if (!authUser) {
      await supabase.auth.signOut();
      return { success: false, error: "Bu e-posta için yetki bulunamadı. Yönetici veya sanatçı olarak tanımlı olmalısınız." };
    }
    setUser(authUser);
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      authError,
      login,
      logout,
      isManager: user?.role === "MANAGER",
      isArtist: user?.role === "ARTIST",
    }),
    [user, isLoading, authError, login, logout]
  );
}
