import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Shield, 
  FileText, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Plus
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo ao Portal de Propostas Actionsys
          </p>
        </div>
        <Button asChild>
          <Link to="/propostas" className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Proposta
          </Link>
        </Button>
      </div>

      {/* Cartões de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">19</div>
            <p className="text-xs text-muted-foreground">
              +2 este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Propostas Ativas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">
              +12% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Aprovação</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-muted-foreground">
              +5% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Perfis de Acesso</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              Administrador, Gerente, Analista, Consultor
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Propostas Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Propostas Recentes</CardTitle>
            <CardDescription>Últimas propostas criadas no sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div>
                  <div className="font-medium">Proposta Sistema ERP - Empresa ABC</div>
                  <div className="text-sm text-muted-foreground">Criada há 2 horas</div>
                </div>
              </div>
              <Badge variant="outline">
                <Clock className="w-3 h-3 mr-1" />
                Em Análise
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <div className="font-medium">Consultoria BI - Tech Solutions</div>
                  <div className="text-sm text-muted-foreground">Criada há 5 horas</div>
                </div>
              </div>
              <Badge variant="default">
                <CheckCircle className="w-3 h-3 mr-1" />
                Aprovada
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div>
                  <div className="font-medium">Desenvolvimento Mobile - StartupXYZ</div>
                  <div className="text-sm text-muted-foreground">Criada há 1 dia</div>
                </div>
              </div>
              <Badge variant="secondary">
                <AlertCircle className="w-3 h-3 mr-1" />
                Pendente
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Módulo de Segurança */}
        <Card>
          <CardHeader>
            <CardTitle>Módulo de Segurança</CardTitle>
            <CardDescription>Acesso rápido às funcionalidades de segurança</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" asChild className="w-full justify-start">
              <Link to="/usuarios">
                <Users className="mr-2 h-4 w-4" />
                Gerenciar Usuários (19)
              </Link>
            </Button>

            <Button variant="outline" asChild className="w-full justify-start">
              <Link to="/perfis">
                <Shield className="mr-2 h-4 w-4" />
                Gerenciar Perfis (4)
              </Link>
            </Button>

            <Button variant="outline" asChild className="w-full justify-start">
              <Link to="/permissoes">
                <Shield className="mr-2 h-4 w-4" />
                Configurar Permissões
              </Link>
            </Button>

            <Button variant="outline" asChild className="w-full justify-start">
              <Link to="/perfil-usuario">
                <Users className="mr-2 h-4 w-4" />
                Associar Perfil-Usuário
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Informações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
          <CardDescription>
            Portal de Propostas Comerciais - Actionsys
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium">Versão do Sistema</div>
              <div className="text-muted-foreground">v1.0.0</div>
            </div>
            <div>
              <div className="font-medium">Último Backup</div>
              <div className="text-muted-foreground">Hoje, 03:00</div>
            </div>
            <div>
              <div className="font-medium">Status do Sistema</div>
              <div className="flex items-center gap-1 text-green-600">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                Operacional
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}