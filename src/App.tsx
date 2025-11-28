// src/App.tsx
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import { supabase } from "@/lib/supabaseClient";

import Login from "./pages/Login";
import LiveAlertsMap from "./pages/LiveAlertsMap";
import DeviceStatus from "./pages/DeviceStatus";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const authEnabled = Boolean(supabase);
  const [loading, setLoading] = useState(authEnabled);
  const [session, setSession] = useState<any | null>(null);

  useEffect(() => {
    if (!authEnabled || !supabase) {
      setSession({ demo: true });
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (error) {
          console.warn("Failed to fetch Supabase session:", error);
          setSession(null);
          return;
        }

        setSession(data.session ?? null);
      } catch (err) {
        if (!isMounted) return;
        console.warn("Supabase session fetch threw an error:", err);
        setSession(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) return;
      setSession(nextSession ?? null);
    });

    return () => {
      isMounted = false;
      try {
        listener?.subscription.unsubscribe();
      } catch {
        /* ignore cleanup errors */
      }
    };
  }, [authEnabled]);

  if (!authEnabled) {
    return children;
  }

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;

  // if no session redirect to login
  if (!session) return <Navigate to="/login" replace />;

  // user is authenticated
  return children;
}

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<LiveAlertsMap />} />
              <Route path="devices" element={<DeviceStatus />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
