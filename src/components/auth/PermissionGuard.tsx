import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface PermissionGuardProps {
  children: React.ReactNode;
  permission: string;
  redirectTo?: string;
}

export function PermissionGuard({ 
  children, 
  permission, 
  redirectTo = "/dashboard" 
}: PermissionGuardProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && user) {
      const hasPermission = user.permissions?.includes(permission);
      
      if (!hasPermission) {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para acessar esta página.",
          variant: "destructive",
        });
        navigate(redirectTo);
      }
    }
  }, [user, loading, permission, navigate, redirectTo, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const hasPermission = user?.permissions?.includes(permission);

  if (!hasPermission) {
    return null;
  }

  return <>{children}</>;
}
