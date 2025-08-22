import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Users from "./pages/security/Users";
import Profiles from "./pages/security/Profiles";
import Permissions from "./pages/security/Permissions";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
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
          <Route path="/perfil-usuario" element={
            <AppLayout>
              <div className="p-6">
                <h1 className="text-3xl font-bold">Perfil-Usuário</h1>
                <p className="text-muted-foreground mt-2">Associação entre perfis e usuários - Em desenvolvimento</p>
              </div>
            </AppLayout>
          } />
          <Route path="/preferencias" element={
            <AppLayout>
              <div className="p-6">
                <h1 className="text-3xl font-bold">Preferências</h1>
                <p className="text-muted-foreground mt-2">Preferências do usuário - Em desenvolvimento</p>
              </div>
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
          <Route path="/relatorios" element={
            <AppLayout>
              <div className="p-6">
                <h1 className="text-3xl font-bold">Relatórios</h1>
                <p className="text-muted-foreground mt-2">Dashboard de relatórios - Em desenvolvimento</p>
              </div>
            </AppLayout>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
