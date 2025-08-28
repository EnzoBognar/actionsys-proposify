import { useState, useEffect, createContext, useContext } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isBlocked: (email: string) => Promise<boolean>;
  recordLoginAttempt: (email: string, success: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isBlocked = async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('login_attempts')
        .select('attempts_count, blocked_until')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking login attempts:', error);
        return false;
      }

      if (!data) return false;

      // Check if blocked and still within block period
      if (data.blocked_until && new Date(data.blocked_until) > new Date()) {
        return true;
      }

      // Check if attempts exceed limit
      return data.attempts_count >= 5;
    } catch (error) {
      console.error('Error checking if user is blocked:', error);
      return false;
    }
  };

  const recordLoginAttempt = async (email: string, success: boolean) => {
    try {
      const { data: existingAttempt } = await supabase
        .from('login_attempts')
        .select('*')
        .eq('email', email)
        .single();

      if (success) {
        // Reset attempts on successful login
        if (existingAttempt) {
          await supabase
            .from('login_attempts')
            .update({ 
              attempts_count: 0, 
              blocked_until: null,
              updated_at: new Date().toISOString()
            })
            .eq('email', email);
        }
      } else {
        // Increment failed attempts
        if (existingAttempt) {
          const newCount = existingAttempt.attempts_count + 1;
          const blockedUntil = newCount >= 5 
            ? new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
            : null;

          await supabase
            .from('login_attempts')
            .update({ 
              attempts_count: newCount,
              blocked_until: blockedUntil,
              updated_at: new Date().toISOString()
            })
            .eq('email', email);
        } else {
          await supabase
            .from('login_attempts')
            .insert({
              email,
              attempts_count: 1,
              ip_address: 'unknown'
            });
        }
      }
    } catch (error) {
      console.error('Error recording login attempt:', error);
    }
  };

  const signIn = async (email: string, password: string, rememberMe = false) => {
    try {
      // Check if user is blocked
      const blocked = await isBlocked(email);
      if (blocked) {
        const error = new Error('Conta temporariamente bloqueada devido a múltiplas tentativas de login incorretas. Tente novamente em 15 minutos.');
        toast({
          title: "Conta Bloqueada",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        await recordLoginAttempt(email, false);
        
        let errorMessage = 'Erro ao fazer login. Verifique suas credenciais.';
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email ou senha incorretos.';
        }
        
        toast({
          title: "Erro de Login",
          description: errorMessage,
          variant: "destructive",
        });
        return { error: new Error(errorMessage) };
      }

      await recordLoginAttempt(email, true);
      
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
      const errorMessage = 'Erro interno do sistema. Tente novamente.';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: new Error(errorMessage) };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
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
    session,
    loading,
    signIn,
    signOut,
    isBlocked,
    recordLoginAttempt,
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