import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AppLayout } from "@/components/layout/AppLayout";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { MfaProvider } from "@/contexts/MfaContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Users from "./pages/security/Users";
import Profiles from "./pages/security/Profiles";
import Permissions from "./pages/security/Permissions";
import Preferences from "./pages/Preferences";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <LanguageProvider>
        <MfaProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/usuarios" element={
            <AppLayout>
              <Users />
            </AppLayout>
          } />
          <Route path="/perfis" element={
            <AppLayout>
              <Profiles />
            </AppLayout>
          } />
          <Route path="/permissoes" element={
            <AppLayout>
              <Permissions />
            </AppLayout>
          } />
          <Route path="/preferencias" element={
            <AppLayout>
              <Preferences />
            </AppLayout>
          } />
          <Route path="/propostas" element={
            <AppLayout>
              <div className="p-6">
                <h1 className="text-3xl font-bold">Propostas</h1>
                <p className="text-muted-foreground mt-2">Gestão de propostas comerciais - Em desenvolvimento</p>
              </div>
            </AppLayout>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
          </TooltipProvider>
        </MfaProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
