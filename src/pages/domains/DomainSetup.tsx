import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Plus, Edit, Trash2, Power, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useToast } from "@/hooks/use-toast";
import { Dominio, DominioValor, DominioStatus } from "@/types/domains";
import {
  findDomainByName,
  patchDomain,
  listDomainValues,
  createDomainValue,
  patchDomainValue,
  deleteDomainValue,
} from "@/services/domains";
import { format } from "date-fns";

type FilterStatus = "all" | "active" | "suspended";

export default function DomainSetup() {
  const { domainName } = useParams<{ domainName: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [domain, setDomain] = useState<Dominio | null>(null);
  const [values, setValues] = useState<DominioValor[]>([]);
  const [filteredValues, setFilteredValues] = useState<DominioValor[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("active");

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [currentValue, setCurrentValue] = useState<DominioValor | null>(null);
  const [formData, setFormData] = useState({
    codigo: "",
    rotulo: "",
    descricao: "",
    ordem: "" as string,
    status: "A" as DominioStatus,
  });
  const [formErrors, setFormErrors] = useState({ codigo: "", rotulo: "" });
  const [submitting, setSubmitting] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<DominioValor | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 50;

  useEffect(() => {
    if (domainName) {
      loadDomainAndValues();
    }
  }, [domainName, filterStatus]);

  useEffect(() => {
    applyFilters();
  }, [values, searchTerm]);

  async function loadDomainAndValues() {
    setLoading(true);
    try {
      // Carregar o domínio
      const foundDomain = await findDomainByName(domainName!);
      if (!foundDomain) {
        toast({
          title: "Domínio não encontrado",
          description: `Não foi possível localizar o domínio "${domainName}".`,
          variant: "destructive",
        });
        navigate("/dominios");
        return;
      }
      setDomain(foundDomain);

      // Carregar valores
      const all = filterStatus === "all";
      const valuesData = await listDomainValues(domainName!, { all });
      
      let filtered = valuesData;
      if (filterStatus === "active") {
        filtered = valuesData.filter(v => v.status === "A");
      } else if (filterStatus === "suspended") {
        filtered = valuesData.filter(v => v.status === "S");
      }
      
      setValues(filtered);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message || "Não foi possível carregar os dados do domínio.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let result = values;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        v =>
          v.codigo.toLowerCase().includes(term) ||
          v.rotulo.toLowerCase().includes(term) ||
          v.descricao?.toLowerCase().includes(term)
      );
    }

    setFilteredValues(result);
    setPage(1);
  }

  function openCreateModal() {
    setFormMode("create");
    setCurrentValue(null);
    setFormData({
      codigo: "",
      rotulo: "",
      descricao: "",
      ordem: "",
      status: "A",
    });
    setFormErrors({ codigo: "", rotulo: "" });
    setIsFormOpen(true);
  }

  function openEditModal(value: DominioValor) {
    setFormMode("edit");
    setCurrentValue(value);
    setFormData({
      codigo: value.codigo,
      rotulo: value.rotulo,
      descricao: value.descricao || "",
      ordem: value.ordem !== null && value.ordem !== undefined ? String(value.ordem) : "",
      status: value.status || "A",
    });
    setFormErrors({ codigo: "", rotulo: "" });
    setIsFormOpen(true);
  }

  async function handleFormSubmit() {
    // Validação
    const errors = { codigo: "", rotulo: "" };
    if (!formData.codigo.trim()) {
      errors.codigo = "Código é obrigatório";
    } else if (formData.codigo.trim().length < 1 || formData.codigo.length > 10) {
      errors.codigo = "Código deve ter entre 1 e 10 caracteres";
    }

    if (!formData.rotulo.trim()) {
      errors.rotulo = "Rótulo é obrigatório";
    } else if (formData.rotulo.trim().length < 2) {
      errors.rotulo = "Rótulo deve ter pelo menos 2 caracteres";
    } else if (formData.rotulo.length > 80) {
      errors.rotulo = "Rótulo deve ter no máximo 80 caracteres";
    }

    setFormErrors(errors);
    if (errors.codigo || errors.rotulo) return;

    setSubmitting(true);
    try {
      const payload = {
        codigo: formData.codigo.trim().toUpperCase(),
        rotulo: formData.rotulo.trim(),
        descricao: formData.descricao.trim() || null,
        ordem: formData.ordem ? parseInt(formData.ordem, 10) : null,
        status: formData.status,
      };

      if (formMode === "create") {
        await createDomainValue(domain!.id_dominio!, payload);
        toast({
          title: "Valor criado com sucesso",
          variant: "default",
        });
      } else if (currentValue) {
        await patchDomainValue(currentValue.id_valor!, payload);
        toast({
          title: "Valor atualizado com sucesso",
          variant: "default",
        });
      }

      setIsFormOpen(false);
      loadDomainAndValues();
    } catch (error: any) {
      const detail = error.message || "Não foi possível concluir a operação.";
      toast({
        title: "Erro",
        description: detail,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleStatus(value: DominioValor) {
    const newStatus: DominioStatus = value.status === "A" ? "S" : "A";
    try {
      await patchDomainValue(value.id_valor!, { status: newStatus });
      toast({
        title: newStatus === "A" ? "Valor ativado" : "Valor suspenso",
        variant: "default",
      });
      loadDomainAndValues();
    } catch (error: any) {
      toast({
        title: "Erro ao alterar status",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteDomainValue(deleteTarget.id_valor!);
      toast({
        title: "Valor excluído com sucesso",
        variant: "default",
      });
      setDeleteTarget(null);
      loadDomainAndValues();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir valor",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  async function handleToggleDomainStatus() {
    if (!domain) return;
    const newStatus: DominioStatus = domain.status_dominio === "A" ? "S" : "A";
    try {
      await patchDomain(domain.id_dominio!, { status_dominio: newStatus });
      toast({
        title: newStatus === "A" ? "Domínio ativado" : "Domínio suspenso",
        variant: "default",
      });
      setDomain({ ...domain, status_dominio: newStatus });
    } catch (error: any) {
      toast({
        title: "Erro ao alterar status do domínio",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  const paginatedValues = filteredValues.slice(
    (page - 1) * pageSize,
    page * pageSize
  );
  const totalPages = Math.ceil(filteredValues.length / pageSize);

  if (!domain && !loading) {
    return null;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/dominios">Segurança</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/dominios">Domínios</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{domainName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dominios")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Layers className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Setup de Domínio</h1>
            <p className="text-muted-foreground">{domainName}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleToggleDomainStatus}>
            {domain?.status_dominio === "A" ? "Suspender Domínio" : "Ativar Domínio"}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Registros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{values.length}</div>
          </CardContent>
        </Card>

        {domain && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Status do Domínio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={domain.status_dominio === "A" ? "default" : "secondary"}>
                {domain.status_dominio === "A" ? "Ativo" : "Suspenso"}
              </Badge>
            </CardContent>
          </Card>
        )}

        {domain?.data_status && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Última Modificação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {format(new Date(domain.data_status), "dd/MM/yyyy, HH:mm")}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Input
            placeholder="Buscar por código, rótulo ou descrição..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
          <div className="flex gap-2">
            <Button
              variant={filterStatus === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("active")}
            >
              Ativos
            </Button>
            <Button
              variant={filterStatus === "suspended" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("suspended")}
            >
              Suspensos
            </Button>
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("all")}
            >
              Todos
            </Button>
          </div>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Valor
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12">Carregando...</div>
      ) : paginatedValues.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Nenhum valor encontrado.
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Rótulo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Ordem</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedValues.map(value => (
                  <TableRow key={value.id_valor}>
                    <TableCell>
                      <Badge variant="outline">{value.codigo}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{value.rotulo}</TableCell>
                    <TableCell className="max-w-md truncate">
                      {value.descricao || "—"}
                    </TableCell>
                    <TableCell>{value.ordem ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={value.status === "A" ? "default" : "secondary"}>
                        {value.status === "A" ? "Ativo" : "Suspenso"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(value)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(value)}
                          title={value.status === "A" ? "Suspender" : "Ativar"}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(value)}
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Anterior
              </Button>
              <span className="px-4 py-2 text-sm">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Próxima
              </Button>
            </div>
          )}
        </>
      )}

      {/* Form Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {formMode === "create" ? "Novo Valor" : "Editar Valor"}
            </DialogTitle>
            <DialogDescription>
              {formMode === "create"
                ? "Preencha os dados para criar um novo valor."
                : "Atualize os dados do valor."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="codigo">Código *</Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={e =>
                  setFormData({ ...formData, codigo: e.target.value.toUpperCase() })
                }
                placeholder="Ex: A"
                maxLength={10}
              />
              {formErrors.codigo && (
                <p className="text-sm text-destructive mt-1">
                  {formErrors.codigo}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="rotulo">Rótulo *</Label>
              <Input
                id="rotulo"
                value={formData.rotulo}
                onChange={e =>
                  setFormData({ ...formData, rotulo: e.target.value })
                }
                placeholder="Ex: Ativo"
                maxLength={80}
              />
              {formErrors.rotulo && (
                <p className="text-sm text-destructive mt-1">
                  {formErrors.rotulo}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={e =>
                  setFormData({ ...formData, descricao: e.target.value })
                }
                placeholder="Descrição opcional"
                maxLength={255}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="ordem">Ordem</Label>
              <Input
                id="ordem"
                type="number"
                min="0"
                value={formData.ordem}
                onChange={e =>
                  setFormData({ ...formData, ordem: e.target.value })
                }
                placeholder="Ex: 1"
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v: DominioStatus) =>
                  setFormData({ ...formData, status: v })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Ativo</SelectItem>
                  <SelectItem value="S">Suspenso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsFormOpen(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button onClick={handleFormSubmit} disabled={submitting}>
              {submitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o valor{" "}
              <strong>{deleteTarget?.rotulo}</strong>? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
