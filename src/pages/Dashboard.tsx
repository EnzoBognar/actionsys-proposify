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
  Plus,
  Activity,
  BarChart3,
  UserCheck
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Propostas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">
              +15% este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Propostas em Andamento</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">
              +8 em relação à semana anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Propostas Aceitas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">73</div>
            <p className="text-xs text-muted-foreground">
              Taxa de aprovação: 68%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Elaboração</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              Aguardando informações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">19</div>
            <p className="text-xs text-muted-foreground">
              +2 este mês
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Atividades Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>Últimas atividades realizadas pelos usuários</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium">João Silva</div>
                  <div className="text-sm text-muted-foreground">Criou nova proposta - ERP Sistema ABC</div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline">Gerente</Badge>
                <div className="text-xs text-muted-foreground">2 horas atrás</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <div className="font-medium">Maria Santos</div>
                  <div className="text-sm text-muted-foreground">Aprovou proposta de Consultoria BI</div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="default">Administrador</Badge>
                <div className="text-xs text-muted-foreground">5 horas atrás</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Activity className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium">Carlos Oliveira</div>
                  <div className="text-sm text-muted-foreground">Atualizou permissões do sistema</div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="secondary">Analista</Badge>
                <div className="text-xs text-muted-foreground">1 dia atrás</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <UserCheck className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <div className="font-medium">Ana Costa</div>
                  <div className="text-sm text-muted-foreground">Cadastrou novo usuário no sistema</div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline">Consultor</Badge>
                <div className="text-xs text-muted-foreground">2 dias atrás</div>
              </div>
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
              <Link to="/preferencias">
                <Users className="mr-2 h-4 w-4" />
                Preferências do Sistema
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