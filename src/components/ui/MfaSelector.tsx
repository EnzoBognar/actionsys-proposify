import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Smartphone } from "lucide-react";
import { useMfa } from "@/contexts/MfaContext";

export function MfaSelector() {
  const { mfaMethod, setMfaMethod } = useMfa();

  const mfaMethods = [
    { value: "sms", label: "SMS", icon: Smartphone, description: "Receber códigos por mensagem de texto" },
    { value: "email", label: "Email", icon: Mail, description: "Receber códigos por email" },
  ];

  return (
    <div className="space-y-4">
      <Select value={mfaMethod} onValueChange={setMfaMethod}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione o método de MFA" />
        </SelectTrigger>
        <SelectContent>
          {mfaMethods.map((method) => {
            const Icon = method.icon;
            return (
              <SelectItem key={method.value} value={method.value}>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{method.label}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      
      {mfaMethod && (
        <div className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
          {mfaMethods.find(m => m.value === mfaMethod)?.description}
        </div>
      )}
    </div>
  );
}