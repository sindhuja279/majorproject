import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Bell, LogOut, Shield, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

export function DashboardHeader() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold text-foreground">Wildlife Protection Dashboard</h1>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Wifi className="h-4 w-4 text-success" />
          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
            Online
          </Badge>
        </div>
        
        <Button variant="outline" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 h-2 w-2 bg-destructive rounded-full"></span>
        </Button>
        
        <div className="text-sm text-muted-foreground">
          <div>Bandipur National Park</div>
          <div className="text-xs">Zone Commander: Ranger Station 1</div>
        </div>

        <Button variant="ghost" size="sm" onClick={handleLogout} title="Log out">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </header>
  );
}