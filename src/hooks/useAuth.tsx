import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  activateAdminDemoLocal,
  activateGuestDemoLocal,
  getAuthSnapshot,
  getCurrentAuthUser,
  signInLocal,
  signOutLocal,
  signUpLocal,
  subscribeToLocalBackend,
  type AuthUser,
} from "@/lib/local-backend";

type AppMode = "user" | "admin";

interface AuthContextType {
  user: AuthUser | null;
  isAdmin: boolean;
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  signOut: () => Promise<void>;
  loading: boolean;
  session: { user: AuthUser } | null;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  refreshUser: () => Promise<void>;
  activateAdminDemo: () => Promise<void>;
  activateGuestDemo: (options?: { forceNew?: boolean }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getCurrentAuthUser());
  const [loading, setLoading] = useState(false);
  const [mode, setModeState] = useState<AppMode>("user");

  const refreshUser = async () => {
    setLoading(true);
    const nextUser = await getAuthSnapshot();
    setUser(nextUser);
    setLoading(false);
  };

  useEffect(() => {
    refreshUser();
    const unsubscribe = subscribeToLocalBackend(() => {
      void refreshUser();
    });
    return unsubscribe;
  }, []);

  const setMode = (nextMode: AppMode) => setModeState(nextMode);

  const signIn: AuthContextType["signIn"] = async (email, password) => {
    const { error } = await signInLocal(email, password);
    await refreshUser();
    return { error };
  };

  const signUp: AuthContextType["signUp"] = async (email, password, fullName) => {
    const { error } = await signUpLocal(email, password, fullName);
    await refreshUser();
    return { error };
  };

  const signOut = async () => {
    await signOutLocal();
    await refreshUser();
    setModeState("user");
  };

  const activateAdminDemo = async () => {
    await activateAdminDemoLocal();
    await refreshUser();
    setModeState("admin");
  };

  const activateGuestDemo = async (options?: { forceNew?: boolean }) => {
    await activateGuestDemoLocal(options);
    await refreshUser();
    setModeState("user");
  };

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAdmin: user?.role === "admin" && mode === "admin",
      mode,
      setMode,
      signOut,
      loading,
      session: user ? { user } : null,
      signUp,
      signIn,
      refreshUser,
      activateAdminDemo,
      activateGuestDemo,
    }),
    [loading, mode, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
