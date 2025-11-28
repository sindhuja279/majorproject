import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const hasLocalSession = useMemo(() => {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i) || "";
        if (key.startsWith("sb-") && key.includes("auth-token")) {
          const value = localStorage.getItem(key);
          if (!value) continue;
          const token = JSON.parse(value);
          if (token?.access_token) return true;
        }
      }
    } catch (_) {}
    return false;
  }, []);

  useEffect(() => {
    let isMounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setIsAuthenticated(Boolean(data.session) || hasLocalSession);
      setIsLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session));
    });

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [hasLocalSession]);

  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
