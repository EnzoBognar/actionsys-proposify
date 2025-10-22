import { useState, useEffect } from "react";
import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { MfaVerification } from "@/components/auth/MfaVerification";
import { ForgotPassword } from "@/components/auth/ForgotPassword";
import { useNavigate } from "react-router-dom";
import actionsysLogo from "@/assets/actionsys-logo.png";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [currentView, setCurrentView] = useState<'login' | 'mfa' | 'forgot'>('login');
  const [loading, setLoading] = useState(false);
  
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already authenticated
    if (user) {
      navigate('/');
    }

    // Load remembered email
    const rememberedEmail = localStorage.getItem('actionsys_remember_email');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password, rememberMe);
      
      if (!error) {
        // For this demo, we'll simulate MFA for all users
        // In production, this would check user's MFA preference
        setCurrentView('mfa');
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMfaComplete = () => {
    navigate('/');
  };

  const handleBackToLogin = () => {
    setCurrentView('login');
    setLoading(false);
  };

  if (currentView === 'mfa') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <MfaVerification
          email={email}
          onVerificationComplete={handleMfaComplete}
          onBack={handleBackToLogin}
        />
      </div>
    );
  }

  if (currentView === 'forgot') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <ForgotPassword onBack={handleBackToLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-strong">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Logo */}
            <div className="flex justify-center">
              <img 
                src={actionsysLogo} 
                alt="Actionsys Logo" 
                className="h-16 w-auto object-contain"
              />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Actionsys Proposal Manager
              </h1>
              <p className="text-sm text-muted-foreground">
                Sistema de Gerenciamento de Propostas – acesso restrito a usuários cadastrados.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Lembrar-me
                </label>
              </div>

              {/* Login Button */}
              <Button 
                type="submit" 
                className="w-full bg-actionsys-blue hover:bg-actionsys-blue/90 text-white"
                disabled={loading}
              >
                {loading ? "Entrando..." : (
                  <>
                    Fazer Login
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            {/* Forgot Password Link */}
            <div className="text-center">
              <button 
                type="button"
                onClick={() => setCurrentView('forgot')}
                className="text-primary hover:text-primary/80 text-sm font-medium"
              >
                Esqueci minha senha
              </button>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}