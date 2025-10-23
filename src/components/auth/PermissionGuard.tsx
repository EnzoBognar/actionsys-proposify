import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface PermissionGuardProps {
  children: React.ReactNode;
  permission: string;
  navItem?: 'users' | 'roles' | 'permissions' | 'audit';
  redirectTo?: string;
}

export function PermissionGuard({ 
  children, 
  permission,
  navItem,
  redirectTo = "/dashboard" 
}: PermissionGuardProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && user) {
      // Verificar nav.items se fornecido
      let hasAccess = true;
      
      if (navItem && user.nav?.items) {
        hasAccess = user.nav.items[navItem] === true;
      }
      
      // Verificar permissão
      const hasPermission = user.permissions?.includes(permission);
      
      if (!hasAccess || !hasPermission) {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para acessar esta página.",
          variant: "destructive",
        });
        navigate(redirectTo);
      }
    }
  }, [user, loading, permission, navItem, navigate, redirectTo, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Verificar nav.items se fornecido
  let hasAccess = true;
  if (navItem && user?.nav?.items) {
    hasAccess = user.nav.items[navItem] === true;
  }
  
  const hasPermission = user?.permissions?.includes(permission);

  if (!hasAccess || !hasPermission) {
    return null;
  }

  return <>{children}</>;
}
