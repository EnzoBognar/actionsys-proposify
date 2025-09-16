import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Shield, Smartphone, Mail, Key, CheckCircle, XCircle } from "lucide-react";

const Preferences = () => {
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaMethod, setMfaMethod] = useState("email");

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Minhas Preferências</h1>
        <p className="text-muted-foreground mt-2">
          Configure suas preferências pessoais, tema, idioma e segurança
        </p>
      </div>
      
      <div className="grid gap-6">
        {/* Configurações de Aparência */}
        <Card>
          <CardHeader>
            <CardTitle>Aparência e Interface</CardTitle>
            <CardDescription>
              Personalize a aparência e o idioma da aplicação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Tema */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Tema</Label>
                <div className="border rounded-lg p-4">
                  <ThemeToggle />
                </div>
              </div>

              {/* Idioma */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Idioma</Label>
                <div className="border rounded-lg p-4">
                  <LanguageSelector />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Segurança - MFA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Autenticação Multifator (MFA)
            </CardTitle>
            <CardDescription>
              Configure a autenticação de dois fatores para maior segurança da sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status do MFA */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${mfaEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
                <div>
                  <p className="font-medium">Status do MFA</p>
                  <p className="text-sm text-muted-foreground">
                    {mfaEnabled ? 'Ativado e protegendo sua conta' : 'Desativado - sua conta está vulnerável'}
                  </p>
                </div>
              </div>
              <Badge variant={mfaEnabled ? "default" : "destructive"}>
                {mfaEnabled ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ativo
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 mr-1" />
                    Inativo
                  </>
                )}
              </Badge>
            </div>

            {/* Ativar/Desativar MFA */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="mfa-toggle" className="text-sm font-medium">
                  Ativar Autenticação Multifator
                </Label>
                <p className="text-sm text-muted-foreground">
                  Adicione uma camada extra de segurança à sua conta
                </p>
              </div>
              <Switch
                id="mfa-toggle"
                checked={mfaEnabled}
                onCheckedChange={setMfaEnabled}
              />
            </div>

            {/* Configurações do Método MFA */}
            {mfaEnabled && (
              <>
                <Separator />
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Método de Verificação</Label>
                  <Select value={mfaMethod} onValueChange={setMfaMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>E-mail</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="sms">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4" />
                          <span>SMS</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="app">
                        <div className="flex items-center gap-2">
                          <Key className="h-4 w-4" />
                          <span>App Autenticador</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Descrição do método selecionado */}
                  <div className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                    {mfaMethod === "email" && "Códigos de verificação serão enviados para o seu e-mail cadastrado."}
                    {mfaMethod === "sms" && "Códigos de verificação serão enviados por SMS para o seu celular."}
                    {mfaMethod === "app" && "Use um aplicativo autenticador como Google Authenticator ou similar."}
                  </div>

                  {/* Botão para redefinir MFA */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline">
                      Configurar Método
                    </Button>
                    <Button variant="destructive" size="sm">
                      Redefinir MFA
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Alerta de segurança quando MFA está desativado */}
            {!mfaEnabled && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800">Recomendação de Segurança</p>
                    <p className="text-yellow-700 mt-1">
                      Ative a autenticação multifator para proteger melhor sua conta contra acessos não autorizados.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Preferences;