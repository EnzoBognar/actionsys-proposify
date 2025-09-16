import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Search, 
  Filter, 
  Download,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";

export default function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock data
  const auditLogs = [
    {
      id: 1,
      timestamp: "2024-01-15 14:30:25",
      user: "João Silva",
      ip: "192.168.1.100",
      action: "Login no sistema",
      result: "Sucesso",
      details: "Autenticação bem-sucedida via email/senha"
    },
    {
      id: 2,
      timestamp: "2024-01-15 14:28:12",
      user: "Maria Santos",
      ip: "192.168.1.101",
      action: "Tentativa de login",
      result: "Falha",
      details: "Senha incorreta - 3ª tentativa"
    },
    {
      id: 3,
      timestamp: "2024-01-15 14:25:45",
      user: "Admin",
      ip: "192.168.1.50",
      action: "Criação de usuário",
      result: "Sucesso",
      details: "Novo usuário: carlos.lima@empresa.com"
    },
    {
      id: 4,
      timestamp: "2024-01-15 14:20:18",
      user: "Ana Costa",
      ip: "192.168.1.102",
      action: "Alteração de perfil",
      result: "Sucesso",
      details: "Perfil alterado de Consultor para Analista"
    },
    {
      id: 5,
      timestamp: "2024-01-15 14:15:33",
      user: "Carlos Lima",
      ip: "192.168.1.103",
      action: "Acesso a documento",
      result: "Sucesso",
      details: "Documento: Relatório_Confidencial_Q4.pdf"
    },
    {
      id: 6,
      timestamp: "2024-01-15 14:10:07",
      user: "Usuário Desconhecido",
      ip: "203.45.67.89",
      action: "Tentativa de acesso",
      result: "Bloqueado",
      details: "IP bloqueado por múltiplas tentativas"
    },
    {
      id: 7,
      timestamp: "2024-01-15 14:05:52",
      user: "João Silva",
      ip: "192.168.1.100",
      action: "Configuração MFA",
      result: "Sucesso",
      details: "MFA habilitado via SMS"
    },
    {
      id: 8,
      timestamp: "2024-01-15 14:00:15",
      user: "Maria Santos",
      ip: "192.168.1.101",
      action: "Download de arquivo",
      result: "Sucesso",
      details: "Arquivo: Manual_Usuario_v2.pdf"
    }
  ];

  const getStatusBadge = (result: string) => {
    switch (result) {
      case "Sucesso":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="h-3 w-3 mr-1" />
          Sucesso
        </Badge>;
      case "Falha":
        return <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Falha
        </Badge>;
      case "Bloqueado":
        return <Badge variant="secondary">
          <AlertCircle className="h-3 w-3 mr-1" />
          Bloqueado
        </Badge>;
      default:
        return <Badge variant="outline">{result}</Badge>;
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip.includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || log.result === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Auditoria e Logs</h1>
        <p className="text-muted-foreground mt-2">
          Registro completo de atividades e eventos de segurança
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Logs de Auditoria</CardTitle>
          <CardDescription>
            Histórico detalhado de todas as ações realizadas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por usuário, ação ou IP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por resultado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os resultados</SelectItem>
                <SelectItem value="Sucesso">Sucesso</SelectItem>
                <SelectItem value="Falha">Falha</SelectItem>
                <SelectItem value="Bloqueado">Bloqueado</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Período
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Resultado</TableHead>
                <TableHead>Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-sm">
                    {log.timestamp}
                  </TableCell>
                  <TableCell className="font-medium">
                    {log.user}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {log.ip}
                  </TableCell>
                  <TableCell>
                    {log.action}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(log.result)}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                    {log.details}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum log encontrado com os filtros aplicados.
            </div>
          )}

          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Exibindo {filteredLogs.length} de {auditLogs.length} registros
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Anterior
              </Button>
              <Button variant="outline" size="sm">
                Próximo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}