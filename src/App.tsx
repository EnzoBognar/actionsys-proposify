import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AppLayout } from "@/components/layout/AppLayout";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { MfaProvider } from "@/contexts/MfaContext";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MfaVerify from "./pages/MfaVerify";
import NotFound from "./pages/NotFound";
import Users from "./pages/security/Users";
import Profiles from "./pages/security/Profiles";
import Permissions from "./pages/security/Permissions";
import SecurityDashboard from "./pages/security/SecurityDashboard";
import AuditLogs from "./pages/security/AuditLogs";
import Preferences from "./pages/Preferences";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <LanguageProvider>
        <MfaProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/mfa-verify" element={<MfaVerify />} />
          <Route path="/dashboard-seguranca" element={
            <ProtectedRoute>
              <AppLayout>
                <SecurityDashboard />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/usuarios" element={
            <ProtectedRoute>
              <AppLayout>
                <Users />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/perfis" element={
            <ProtectedRoute>
              <AppLayout>
                <Profiles />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/permissoes" element={
            <ProtectedRoute>
              <AppLayout>
                <Permissions />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/auditoria-logs" element={
            <ProtectedRoute>
              <AppLayout>
                <AuditLogs />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/preferencias" element={
            <ProtectedRoute>
              <AppLayout>
                <Preferences />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/perfil" element={
            <ProtectedRoute>
              <AppLayout>
                <Profile />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/propostas" element={
            <ProtectedRoute>
              <AppLayout>
                <div className="p-6">
                  <h1 className="text-3xl font-bold">Propostas</h1>
                  <p className="text-muted-foreground mt-2">Gestão de propostas comerciais - Em desenvolvimento</p>
                </div>
              </AppLayout>
            </ProtectedRoute>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </MfaProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
