import React, { createContext, useContext, useState } from "react";

type MfaMethod = "sms" | "email";

interface MfaContextType {
  mfaMethod: MfaMethod;
  setMfaMethod: (method: MfaMethod) => void;
}

const MfaContext = createContext<MfaContextType | undefined>(undefined);

export function MfaProvider({ children }: { children: React.ReactNode }) {
  const [mfaMethod, setMfaMethod] = useState<MfaMethod>("sms"); // SMS as default

  return (
    <MfaContext.Provider value={{ mfaMethod, setMfaMethod }}>
      {children}
    </MfaContext.Provider>
  );
}

export function useMfa() {
  const context = useContext(MfaContext);
  if (context === undefined) {
    throw new Error("useMfa must be used within a MfaProvider");
  }
  return context;
}