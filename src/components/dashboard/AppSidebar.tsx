import { NavLink, useLocation } from "react-router-dom";
import { 
  MapPin, 
  AlertTriangle, 
  Radio, 
  BarChart3, 
  Settings, 
  TreePine,
  Activity
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Live Alerts & Map", url: "/", icon: AlertTriangle },
  { title: "Device Status", url: "/devices", icon: Radio },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium border-l-2 border-sidebar-primary" 
      : "hover:bg-sidebar-accent/50 text-sidebar-foreground";

  return (
    <Sidebar
      collapsible="icon"
    >
      <SidebarContent>
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <TreePine className="h-8 w-8 text-sidebar-primary" />
            {!collapsed && (
              <div>
                <h2 className="text-lg font-bold text-sidebar-foreground">Forest Guard</h2>
                <p className="text-xs text-sidebar-foreground/70">Wildlife Protection</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-sidebar-foreground/70">
            {!collapsed && "Navigation"}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-12">
                    <NavLink to={item.url} end className={getNavClass}>
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span className="ml-3">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <div className="mt-auto p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-2 text-sidebar-foreground/70">
              <Activity className="h-4 w-4 text-success" />
              <div className="text-xs">
                <div>System Status: Active</div>
                <div>Devices: 24 online</div>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}