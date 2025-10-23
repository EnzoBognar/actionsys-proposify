import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { listAuditLogs, AuditLog } from "@/services/audit";
import { 
  Search, 
  Filter, 
  Download,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from "lucide-react";

export default function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const loadLogs = async () => {
    setLoading(true);
    try {
      const response = await listAuditLogs({
        q: searchTerm || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      setAuditLogs(response?.logs || []);
      setTotal(response?.total || 0);
    } catch (error) {
      console.error("Error loading audit logs:", error);
      
      // Se for 403, redirecionar para dashboard
      if (error instanceof Error && error.message.includes("403")) {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para visualizar os logs de auditoria.",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }
      
      toast({
        title: "Erro ao carregar logs",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      
      // Garantir que auditLogs seja um array vazio em caso de erro
      setAuditLogs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [searchTerm, statusFilter]);

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

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
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
              {auditLogs?.map((log) => (
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
          )}

          {!loading && auditLogs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum log encontrado com os filtros aplicados.
            </div>
          )}

          {!loading && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Exibindo {auditLogs.length} de {total} registros
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}