import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Smartphone, ArrowLeft } from "lucide-react";
import { useMfa } from "@/contexts/MfaContext";

interface MfaVerificationProps {
  email: string;
  onVerificationComplete: () => void;
  onBack: () => void;
}

export function MfaVerification({ email, onVerificationComplete, onBack }: MfaVerificationProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { mfaMethod } = useMfa();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate MFA verification
    setTimeout(() => {
      if (code === "123456") {
        onVerificationComplete();
      } else {
        alert("Código inválido. Use 123456 para teste.");
      }
      setLoading(false);
    }, 1000);
  };

  const resendCode = () => {
    alert(`Código reenviado via ${mfaMethod === 'sms' ? 'SMS' : 'Email'}`);
  };

  const Icon = mfaMethod === 'sms' ? Smartphone : Mail;
  const methodLabel = mfaMethod === 'sms' ? 'SMS' : 'Email';

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <Icon className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>
        <CardTitle className="text-xl">Verificação em Duas Etapas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Enviamos um código de verificação via {methodLabel} para:
          </p>
          <p className="font-medium">{email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Digite o código de 6 dígitos"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="text-center text-lg tracking-widest"
              maxLength={6}
              required
            />
          </div>

          <Button type="submit" className="w-full bg-actionsys-blue hover:bg-actionsys-blue/90" disabled={code.length !== 6 || loading}>
            {loading ? "Verificando..." : "Verificar Código"}
          </Button>
        </form>

        <div className="flex flex-col space-y-2 text-center">
          <button
            type="button"
            onClick={resendCode}
            className="text-sm text-primary hover:text-primary/80"
          >
            Reenviar código
          </button>
          
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao login
          </button>
        </div>

        <div className="text-xs text-center text-muted-foreground">
          <p>Para teste, use o código: <strong>123456</strong></p>
        </div>
      </CardContent>
    </Card>
  );
}