import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import { API_CONFIG } from "@/config/api";
import logoActionSys from "@/assets/actionsys-logo.png";

export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome_user: "",
    email_user: "",
    telefone_user: "",
    senha_user: "",
    confirmar_senha: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!formData.email_user || !formData.senha_user) {
      toast({
        title: "Erro",
        description: "Email e senha são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if (formData.senha_user !== formData.confirmar_senha) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email_user)) {
      toast({
        title: "Erro",
        description: "Email inválido",
        variant: "destructive",
      });
      return;
    }

    // Validação de telefone (se preenchido)
    if (formData.telefone_user) {
      const telefoneNumeros = formData.telefone_user.replace(/\D/g, "");
      if (telefoneNumeros.length < 10 || telefoneNumeros.length > 13) {
        toast({
          title: "Erro",
          description: "Telefone deve ter entre 10 e 13 dígitos",
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        nome_user: formData.nome_user || null,
        email_user: formData.email_user,
        telefone_user: formData.telefone_user || null,
        senha_user: formData.senha_user,
      };

      const response = await fetch(`${API_CONFIG.BASE_URL}/usuarios/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(errorText || "Erro ao criar conta");
      }

      toast({
        title: "Sucesso!",
        description: "Enviamos um código para seu e-mail.",
      });

      navigate(`/mfa-verify?email=${encodeURIComponent(formData.email_user)}`);
    } catch (error) {
      console.error("Register error:", error);
      toast({
        title: "Erro ao criar conta",
        description: error instanceof Error ? error.message : "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
            <CardTitle className="text-2xl">Criar Conta</CardTitle>
            <CardDescription>
              Preencha os dados para criar sua conta
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome_user">Nome Completo</Label>
              <Input
                id="nome_user"
                name="nome_user"
                type="text"
                placeholder="Seu nome completo"
                value={formData.nome_user}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email_user">Email *</Label>
              <Input
                id="email_user"
                name="email_user"
                type="email"
                placeholder="seu@email.com"
                value={formData.email_user}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone_user">Telefone</Label>
              <Input
                id="telefone_user"
                name="telefone_user"
                type="tel"
                placeholder="(00) 00000-0000"
                value={formData.telefone_user}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha_user">Senha *</Label>
              <Input
                id="senha_user"
                name="senha_user"
                type="password"
                placeholder="••••••••"
                value={formData.senha_user}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmar_senha">Confirmar Senha *</Label>
              <Input
                id="confirmar_senha"
                name="confirmar_senha"
                type="password"
                placeholder="••••••••"
                value={formData.confirmar_senha}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                "Criar Conta"
              )}
            </Button>

            <div className="text-center text-sm">
              <Link 
                to="/login" 
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar para login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
