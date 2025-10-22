import { useState, useEffect, createContext, useContext } from "react";
import { useToast } from "@/hooks/use-toast";
import * as authService from "@/services/auth";

export interface User {
  id: number;
  email: string;
  nome?: string | null;
  telefone?: string | null;
  status: string;
  url_avatar?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Verifica se há token salvo e carrega o usuário
    const checkAuth = async () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          const userData = await authService.getCurrentUser();
          setUser({
            id: userData.id_user,
            email: userData.email_user,
            nome: userData.nome_user,
            telefone: userData.telefone_user,
            status: userData.status_user,
            url_avatar: userData.url_avatar_user,
          });
        } catch (error) {
          console.error("Error loading user:", error);
          localStorage.removeItem("access_token");
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const signIn = async (email: string, password: string, rememberMe = false) => {
    try {
      const response = await authService.login(email, password);
      
      // Salva o token
      localStorage.setItem("access_token", response.access_token);

      // Carrega os dados do usuário
      const userData = await authService.getCurrentUser();
      setUser({
        id: userData.id_user,
        email: userData.email_user,
        nome: userData.nome_user,
        telefone: userData.telefone_user,
        status: userData.status_user,
        url_avatar: userData.url_avatar_user,
      });

      if (rememberMe) {
        localStorage.setItem('actionsys_remember_email', email);
      } else {
        localStorage.removeItem('actionsys_remember_email');
      }

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao Actionsys Proposal Manager",
      });

      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer login. Verifique suas credenciais.';
      
      toast({
        title: "Erro de Login",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: new Error(errorMessage) };
    }
  };

  const signOut = async () => {
    try {
      await authService.logout();
      setUser(null);
      
      toast({
        title: "Logout realizado com sucesso!",
        description: "Até a próxima!",
      });
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer logout",
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}