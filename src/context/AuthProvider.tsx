import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

interface AuthContextType {
  user: any;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function loadSession() {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Auth session error:", error);
      }

      setUser(data?.session?.user ?? null);
    } catch (err) {
      console.error("Failed to load session:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
