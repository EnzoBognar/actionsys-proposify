import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { verifyMfaCode, sendMfaCode } from "@/services/mfa";
import logoActionSys from "@/assets/actionsys-logo.png";

export default function MfaVerify() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [code, setCode] = useState("");
  const email = searchParams.get("email") || "";

  useEffect(() => {
    if (!email) {
      toast({
        title: "Erro",
        description: "Email não informado",
        variant: "destructive",
      });
      navigate("/login");
    }
  }, [email, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code || code.length !== 6) {
      toast({
        title: "Erro",
        description: "Digite o código de 6 dígitos",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await verifyMfaCode({
        email,
        code,
      });

      if (response.verified) {
        toast({
          title: "Sucesso!",
          description: "Conta ativada com sucesso!",
        });
        navigate("/login");
      }
    } catch (error) {
      console.error("MFA verification error:", error);
      toast({
        title: "Erro na verificação",
        description: error instanceof Error ? error.message : "Código inválido ou expirado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);

    try {
      await sendMfaCode({
        email,
        channel: "email",
      });

      toast({
        title: "Código reenviado",
        description: "Verifique seu e-mail",
      });
    } catch (error) {
      console.error("Resend code error:", error);
      toast({
        title: "Erro ao reenviar código",
        description: error instanceof Error ? error.message : "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <img 
              src={logoActionSys} 
              alt="Actionsys Logo" 
              className="h-16 object-contain"
            />
          </div>
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Verificação de Conta</CardTitle>
            <CardDescription>
              Enviamos um código de 6 dígitos para seu e-mail
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Código de Verificação</Label>
              <Input
                id="code"
                type="text"
                placeholder="000000"
                value={code}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setCode(value);
                }}
                disabled={loading}
                maxLength={6}
                className="text-center text-2xl tracking-widest font-mono"
                autoFocus
              />
              <p className="text-xs text-muted-foreground text-center">
                Digite o código de 6 dígitos recebido por e-mail
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || code.length !== 6}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Confirmar"
              )}
            </Button>

            <div className="text-center space-y-2">
              <Button
                type="button"
                variant="link"
                onClick={handleResendCode}
                disabled={resending}
                className="text-sm"
              >
                {resending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Reenviando...
                  </>
                ) : (
                  "Reenviar código"
                )}
              </Button>
              
              <div>
                <Link 
                  to="/login" 
                  className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar para login
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
