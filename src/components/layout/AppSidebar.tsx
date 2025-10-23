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
  Home,
  Lock
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

export function AppSidebar() {
  const { state } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const [securityOpen, setSecurityOpen] = useState(() => {
    const securityPaths = [
      "/dashboard-seguranca",
      "/usuarios", 
      "/perfis",
      "/permissoes",
      "/auditoria-logs"
    ];
    return securityPaths.some(path => currentPath.startsWith(path));
  });

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent";
  
  // Controle de visibilidade baseado em nav
  const showSecuritySection = user?.nav?.sections?.security ?? false;
  const showUsersItem = user?.nav?.items?.users ?? false;
  const showRolesItem = user?.nav?.items?.roles ?? false;
  const showPermissionsItem = user?.nav?.items?.permissions ?? false;
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
                    {/* Dashboard de Segurança */}
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <NavLink to="/dashboard-seguranca" className={getNavCls}>
                          <BarChart3 className="h-4 w-4" />
                          {!isCollapsed && <span>Dashboard de Segurança</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    
                    {/* Usuários */}
                    {showUsersItem && (
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <NavLink to="/usuarios" className={getNavCls}>
                            <Users className="h-4 w-4" />
                            {!isCollapsed && <span>Usuários</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                    
                    {/* Perfis */}
                    {showRolesItem && (
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <NavLink to="/perfis" className={getNavCls}>
                            <Shield className="h-4 w-4" />
                            {!isCollapsed && <span>Perfis</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                    
                    {/* Permissões */}
                    {showPermissionsItem && (
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <NavLink to="/permissoes" className={getNavCls}>
                            <Lock className="h-4 w-4" />
                            {!isCollapsed && <span>Permissões</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                    
                    {/* Auditoria e Logs */}
                    {showAuditItem && (
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <NavLink to="/auditoria-logs" className={getNavCls}>
                            <Settings className="h-4 w-4" />
                            {!isCollapsed && <span>Auditoria e Logs</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
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
