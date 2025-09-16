import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Shield, 
  Users, 
  AlertTriangle, 
  FileText, 
  Activity,
  Eye,
  Download
} from "lucide-react";

export default function SecurityDashboard() {
  // Mock data
  const recentActivities = [
    { id: 1, time: "10:30", user: "João Silva", action: "Login realizado", status: "success" },
    { id: 2, time: "10:15", user: "Maria Santos", action: "Tentativa de acesso negada", status: "warning" },
    { id: 3, time: "09:45", user: "Admin", action: "Usuário bloqueado", status: "error" },
    { id: 4, time: "09:30", user: "Carlos Lima", action: "MFA configurado", status: "success" },
    { id: 5, time: "09:15", user: "Ana Costa", action: "Documento classificado", status: "info" },
  ];

  const securityEvents = [
    { event: "Login com sucesso", count: 156, trend: "up" },
    { event: "Tentativas de login falharam", count: 8, trend: "down" },
    { event: "Documentos acessados", count: 89, trend: "up" },
    { event: "Alterações de perfil", count: 12, trend: "stable" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard de Segurança</h1>
        <p className="text-muted-foreground mt-2">
          Monitoramento e métricas de segurança do sistema
        </p>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Eventos
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +20.1% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Usuários com MFA
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">
              78% dos usuários ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Requisições Suspeitas
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Últimos 7 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Arquivos Confidenciais
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">
              Com classificação restrita
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Atividades Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>
              Últimas ações de segurança registradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm">
                      <p className="font-medium">{activity.user}</p>
                      <p className="text-muted-foreground">{activity.action}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        activity.status === "success"
                          ? "default"
                          : activity.status === "warning"
                          ? "secondary"
                          : activity.status === "error"
                          ? "destructive"
                          : "outline"
                      }
                    >
                      {activity.time}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Eventos de Segurança */}
        <Card>
          <CardHeader>
            <CardTitle>Eventos de Segurança</CardTitle>
            <CardDescription>
              Resumo dos eventos nas últimas 24 horas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Evento</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {securityEvents.map((event, index) => (
                  <TableRow key={index}>
                    <TableCell>{event.event}</TableCell>
                    <TableCell className="text-right font-mono">
                      {event.count}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-between mt-4">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Ver Detalhes
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar Relatório
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}