import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ForgotPasswordProps {
  onBack: () => void;
}

export function ForgotPassword({ onBack }: ForgotPasswordProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First check if user exists and get their MFA preference
      const { data: profile } = await supabase
        .from('profiles')
        .select('mfa_method')
        .eq('email', email)
        .single();

      if (!profile) {
        toast({
          title: "Email não encontrado",
          description: "Este email não está cadastrado no sistema.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao enviar email de recuperação. Tente novamente.",
          variant: "destructive",
        });
      } else {
        setSent(true);
        toast({
          title: "Email enviado!",
          description: `Instruções de recuperação enviadas via ${
            profile.mfa_method === 'sms' ? 'SMS' : 'Email'
          }.`,
        });
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: "Erro",
        description: "Erro interno do sistema. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-xl">Email Enviado!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-sm text-muted-foreground">
            Enviamos instruções de recuperação para:
          </p>
          <p className="font-medium">{email}</p>
          
          <div className="text-xs text-muted-foreground">
            <p>Verifique sua caixa de entrada e spam.</p>
            <p>O link expira em 24 horas.</p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>
        <CardTitle className="text-xl">Recuperar Senha</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground text-center">
          Digite seu email para receber instruções de recuperação baseadas na sua preferência de MFA cadastrada.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-actionsys-blue hover:bg-actionsys-blue/90"
            disabled={loading}
          >
            {loading ? "Enviando..." : "Enviar Instruções"}
          </Button>
        </form>

        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground w-full"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao login
        </button>
      </CardContent>
    </Card>
  );
}