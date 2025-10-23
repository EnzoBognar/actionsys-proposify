import { useState } from "react";
import { 
  Users, 
  Shield, 
  Key, 
  UserCheck, 
  Settings, 
  FileText, 
  BarChart3, 
  ChevronRight,
  Home
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const securityItems = [
  { title: "Dashboard de Segurança", url: "/dashboard-seguranca", icon: BarChart3 },
  { title: "Usuários", url: "/usuarios", icon: Users },
  { title: "Perfis", url: "/perfis", icon: Shield },
  { title: "Permissões", url: "/permissoes", icon: Key },
  { title: "Auditoria e Logs", url: "/auditoria-logs", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const [securityOpen, setSecurityOpen] = useState(() => 
    securityItems.some(item => currentPath.startsWith(item.url))
  );

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent";
  
  // Controle de visibilidade baseado em nav
  const showSecuritySection = user?.nav?.sections?.security ?? false;
  const showAuditItem = user?.nav?.items?.audit ?? false;

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent className="pt-2">
        {/* Painel Principal */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/" className={getNavCls}>
                    <Home className="h-4 w-4" />
                    {!isCollapsed && <span>Painel Principal</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Módulo de Segurança */}
        {showSecuritySection && (
          <SidebarGroup>
            <Collapsible 
              open={securityOpen} 
              onOpenChange={setSecurityOpen}
              className="group/collapsible"
            >
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    {!isCollapsed && <span>Bancada de Segurança</span>}
                  </div>
                  {!isCollapsed && (
                    <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                  )}
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {securityItems.filter(item => {
                      // Oculta "Auditoria e Logs" se audit === false
                      if (item.url === "/auditoria-logs") {
                        return showAuditItem;
                      }
                      return true;
                    }).map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <NavLink to={item.url} className={getNavCls}>
                            <item.icon className="h-4 w-4" />
                            {!isCollapsed && <span>{item.title}</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        )}

        {/* Propostas */}
        <SidebarGroup>
          <SidebarGroupLabel>
            <FileText className="h-4 w-4" />
            {!isCollapsed && <span>Propostas</span>}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/propostas" className={getNavCls}>
                    <FileText className="h-4 w-4" />
                    {!isCollapsed && <span>Lista de Propostas</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>


      </SidebarContent>
      
      {/* Copyright no final da sidebar */}
      <div className="mt-auto p-4 border-t">
        <p className="text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()} Actionsys. Todos os direitos reservados.
        </p>
      </div>
    </Sidebar>
  );
}
