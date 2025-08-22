import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { MfaSelector } from "@/components/ui/MfaSelector";
import { Separator } from "@/components/ui/separator";

const Preferences = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Preferências</h1>
        <p className="text-muted-foreground mt-2">
          Configure suas preferências pessoais e de segurança
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {/* Tema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-gradient-to-r from-primary to-primary-blue-light" />
              Tema
            </CardTitle>
            <CardDescription>
              Escolha entre o tema claro ou escuro da aplicação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeToggle />
          </CardContent>
        </Card>

        {/* Idioma */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-gradient-to-r from-secondary-blue to-accent-blue" />
              Idioma
            </CardTitle>
            <CardDescription>
              Selecione o idioma da interface
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LanguageSelector />
          </CardContent>
        </Card>

        {/* MFA */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-gradient-to-r from-primary-blue-dark to-primary" />
              Autenticação Multifator (MFA)
            </CardTitle>
            <CardDescription>
              Configure seu método preferido para autenticação de dois fatores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MfaSelector />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Preferences;