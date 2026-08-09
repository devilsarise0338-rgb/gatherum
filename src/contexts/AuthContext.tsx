import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { AuthService } from "../services/api";

export type Role = "student" | "organizer" | "admin";

export interface User {
  id: string;
  email: string;
  role: Role;
  isBanned: boolean;
  profileCompleted: boolean;
}

export interface PlatformSettings {
  allowGlobalSignups: boolean;
  allowedEmailDomain: string;
  maintenanceMode: boolean;
}

export type AuthError =
  | "invalid_email"
  | "domain_restricted"
  | "signups_disabled"
  | "user_banned"
  | "unknown";

interface AuthContextType {
  user: User | null;
  users: User[];
  settings: PlatformSettings;
  authError: AuthError | null;
  isLoading: boolean;
  login: (email: string) => Promise<{ success: boolean; error?: AuthError }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: AuthError }>;
  logout: () => Promise<void>;
  clearAuthError: () => void;
  updateUserRole: (userId: string, role: Role) => Promise<void>;
  toggleUserBan: (userId: string, currentBanStatus: boolean) => Promise<void>;
  updateSettings: (newSettings: PlatformSettings) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_SETTINGS: PlatformSettings = {
  allowGlobalSignups: true,
  allowedEmailDomain: "@poornima.org",
  maintenanceMode: false,
};

async function buildUserFromSession(userId: string, email: string): Promise<User | null> {
  try {
    const profile = await AuthService.getProfile(userId);
    if (!profile) return null;
    return {
      id: userId,
      email: profile.email || email,
      role: profile.role as Role,
      isBanned: profile.is_banned ?? false,
      profileCompleted: profile.profile_completed ?? false,
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [users, setUsers]     = useState<User[]>([]);
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<AuthError | null>(null);

  const fetchSettings = useCallback(async () => {
    const { data } = await supabase
      .from("platform_settings")
      .select("*")
      .eq("id", 1)
      .single();
    if (data) {
      setSettings({
        allowGlobalSignups: data.allow_global_signups ?? true,
        allowedEmailDomain: data.allowed_email_domain ?? "",
        maintenanceMode: data.maintenance_mode ?? false,
      });
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    const { data } = await supabase.rpc("admin_fetch_users");
    if (data) {
      setUsers(
        data.map((d: any) => ({
          id: d.id,
          email: d.email,
          role: d.role as Role,
          isBanned: d.is_banned ?? false,
        }))
      );
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setUser(null); return; }
    const u = await buildUserFromSession(session.user.id, session.user.email ?? "");
    setUser(u);
  }, []);

  // Initial load + auth state listener
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && mounted) {
          const u = await buildUserFromSession(session.user.id, session.user.email ?? "");
          if (u && u.isBanned) { setAuthError("user_banned"); await supabase.auth.signOut(); }
          else if (mounted) setUser(u);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    init();
    fetchSettings();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (event === "SIGNED_IN" && session) {
        setIsLoading(true);
        const u = await buildUserFromSession(session.user.id, session.user.email ?? "");
        if (u?.isBanned) {
          setAuthError("user_banned");
          await supabase.auth.signOut();
          setUser(null);
        } else {
          setUser(u);
          if (u?.role === "admin") fetchUsers();
        }
        setIsLoading(false);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      } else if (event === "TOKEN_REFRESHED" && session) {
        // Silently refresh — no UI update needed
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchSettings, fetchUsers]);

  // Fetch users when role becomes admin
  useEffect(() => {
    if (user?.role === "admin") fetchUsers();
  }, [user?.role, fetchUsers]);

  // ─── Auth Actions ────────────────────────────────────────────────────────────

  const login = async (email: string): Promise<{ success: boolean; error?: AuthError }> => {
    const trimmed = email.trim().toLowerCase();

    if (!trimmed.includes("@") || !trimmed.includes(".")) {
      return { success: false, error: "invalid_email" };
    }
    if (!settings.allowGlobalSignups) {
      return { success: false, error: "signups_disabled" };
    }
    if (settings.allowedEmailDomain && !trimmed.endsWith(settings.allowedEmailDomain)) {
      return { success: false, error: "domain_restricted" };
    }

    try {
      await AuthService.loginWithOtp(trimmed);
      return { success: true };
    } catch {
      return { success: false, error: "unknown" };
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: AuthError }> => {
    if (!settings.allowGlobalSignups) {
      return { success: false, error: "signups_disabled" };
    }
    try {
      await AuthService.loginWithGoogle();
      return { success: true };
    } catch {
      return { success: false, error: "unknown" };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const clearAuthError = () => setAuthError(null);

  const updateUserRole = async (userId: string, role: Role) => {
    // UX guard - security is handled by the RPC
    if (user?.role !== 'admin') return;

    const { error } = await supabase.rpc("admin_update_user_role", { p_user_id: userId, p_role: role });
    if (!error) {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
      if (user?.id === userId) setUser({ ...user, role });
    }
  };

  const toggleUserBan = async (userId: string, currentBanStatus: boolean) => {
    // UX guard - security is handled by the RPC
    if (user?.role !== 'admin') return;

    const { error } = await supabase.rpc("admin_toggle_user_ban", { p_user_id: userId, p_is_banned: !currentBanStatus });
    if (!error) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isBanned: !currentBanStatus } : u))
      );
    }
  };

  const updateSettings = async (newSettings: PlatformSettings) => {
    // UX guard - security is handled by the RPC
    if (user?.role !== 'admin') return;

    const { error } = await supabase.rpc("admin_update_settings", {
      p_allow_global_signups: newSettings.allowGlobalSignups,
      p_allowed_email_domain: newSettings.allowedEmailDomain,
      p_maintenance_mode: newSettings.maintenanceMode
    });
    if (!error) setSettings(newSettings);
  };

  return (
    <AuthContext.Provider
      value={{
        user, users, settings, authError, isLoading,
        login, loginWithGoogle, logout, clearAuthError,
        updateUserRole, toggleUserBan, updateSettings, refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
