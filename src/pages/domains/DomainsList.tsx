import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layers, Plus, Edit, Eye, Trash2, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { useToast } from "@/hooks/use-toast";
import { Dominio, DominioStatus } from "@/types/domains";
import { listDomains, createDomain, patchDomain, deleteDomain } from "@/services/domains";
import { format } from "date-fns";

type FilterStatus = "all" | "active" | "suspended";

export default function DomainsList() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [domains, setDomains] = useState<Dominio[]>([]);
  const [filteredDomains, setFilteredDomains] = useState<Dominio[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("active");

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [currentDomain, setCurrentDomain] = useState<Dominio | null>(null);
  const [formData, setFormData] = useState({
    nome_dominio: "",
    desc_dominio: "",
    status_dominio: "A" as DominioStatus,
  });
  const [formErrors, setFormErrors] = useState({ nome_dominio: "" });
  const [submitting, setSubmitting] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Dominio | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 50;

  useEffect(() => {
    loadDomains();
  }, [filterStatus]);

  useEffect(() => {
    applyFilters();
  }, [domains, searchTerm]);

  async function loadDomains() {
    setLoading(true);
    try {
      const all = filterStatus === "all";
      const data = await listDomains({ all });
      
      let filtered = data;
      if (filterStatus === "active") {
        filtered = data.filter(d => d.status_dominio === "A");
      } else if (filterStatus === "suspended") {
        filtered = data.filter(d => d.status_dominio === "S");
      }
      
      setDomains(filtered);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar domínios",
        description: error.message || "Não foi possível carregar a lista de domínios.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let result = domains;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        d =>
          d.nome_dominio.toLowerCase().includes(term) ||
          d.desc_dominio?.toLowerCase().includes(term)
      );
    }

    setFilteredDomains(result);
    setPage(1);
  }

  function openCreateModal() {
    setFormMode("create");
    setCurrentDomain(null);
    setFormData({
      nome_dominio: "",
      desc_dominio: "",
      status_dominio: "A",
    });
    setFormErrors({ nome_dominio: "" });
    setIsFormOpen(true);
  }

  function openEditModal(domain: Dominio) {
    setFormMode("edit");
    setCurrentDomain(domain);
    setFormData({
      nome_dominio: domain.nome_dominio,
      desc_dominio: domain.desc_dominio || "",
      status_dominio: domain.status_dominio || "A",
    });
    setFormErrors({ nome_dominio: "" });
    setIsFormOpen(true);
  }

  async function handleFormSubmit() {
    // Validação
    const errors = { nome_dominio: "" };
    if (!formData.nome_dominio.trim()) {
      errors.nome_dominio = "Nome é obrigatório";
    } else if (formData.nome_dominio.trim().length < 2) {
      errors.nome_dominio = "Nome deve ter pelo menos 2 caracteres";
    } else if (formData.nome_dominio.length > 80) {
      errors.nome_dominio = "Nome deve ter no máximo 80 caracteres";
    }

    setFormErrors(errors);
    if (errors.nome_dominio) return;

    setSubmitting(true);
    try {
      const payload = {
        nome_dominio: formData.nome_dominio.trim(),
        desc_dominio: formData.desc_dominio.trim() || null,
        status_dominio: formData.status_dominio,
      };

      if (formMode === "create") {
        await createDomain(payload);
        toast({
          title: "Domínio criado com sucesso",
          variant: "default",
        });
      } else if (currentDomain) {
        await patchDomain(currentDomain.id_dominio!, payload);
        toast({
          title: "Domínio atualizado com sucesso",
          variant: "default",
        });
      }

      setIsFormOpen(false);
      loadDomains();
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

  async function handleToggleStatus(domain: Dominio) {
    const newStatus: DominioStatus = domain.status_dominio === "A" ? "S" : "A";
    try {
      await patchDomain(domain.id_dominio!, { status_dominio: newStatus });
      toast({
        title: newStatus === "A" ? "Domínio ativado" : "Domínio suspenso",
        variant: "default",
      });
      loadDomains();
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
      await deleteDomain(deleteTarget.id_dominio!);
      toast({
        title: "Domínio excluído com sucesso",
        variant: "default",
      });
      setDeleteTarget(null);
      loadDomains();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir domínio",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  const paginatedDomains = filteredDomains.slice(
    (page - 1) * pageSize,
    page * pageSize
  );
  const totalPages = Math.ceil(filteredDomains.length / pageSize);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Layers className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Gerenciamento de Domínios</h1>
            <p className="text-muted-foreground">
              Gerencie domínios e seus valores de configuração
            </p>
          </div>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Domínio
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Buscar domínios por nome ou descrição..."
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
            Todas
          </Button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12">Carregando...</div>
      ) : paginatedDomains.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Nenhum domínio encontrado.
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Última Modificação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedDomains.map(domain => (
                  <TableRow key={domain.id_dominio}>
                    <TableCell className="font-medium">
                      {domain.nome_dominio}
                    </TableCell>
                    <TableCell className="max-w-md truncate">
                      {domain.desc_dominio || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={domain.status_dominio === "A" ? "default" : "secondary"}>
                        {domain.status_dominio === "A" ? "Ativo" : "Suspenso"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {domain.data_status
                        ? format(new Date(domain.data_status), "dd/MM/yyyy, HH:mm")
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/dominios/${domain.nome_dominio}`)}
                          title="Ver Setup"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(domain)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(domain)}
                          title={
                            domain.status_dominio === "A"
                              ? "Suspender"
                              : "Ativar"
                          }
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(domain)}
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
              {formMode === "create" ? "Novo Domínio" : "Editar Domínio"}
            </DialogTitle>
            <DialogDescription>
              {formMode === "create"
                ? "Preencha os dados para criar um novo domínio."
                : "Atualize os dados do domínio."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="nome_dominio">Nome *</Label>
              <Input
                id="nome_dominio"
                value={formData.nome_dominio}
                onChange={e =>
                  setFormData({ ...formData, nome_dominio: e.target.value })
                }
                placeholder="Ex: status_user"
                maxLength={80}
              />
              {formErrors.nome_dominio && (
                <p className="text-sm text-destructive mt-1">
                  {formErrors.nome_dominio}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="desc_dominio">Descrição</Label>
              <Textarea
                id="desc_dominio"
                value={formData.desc_dominio}
                onChange={e =>
                  setFormData({ ...formData, desc_dominio: e.target.value })
                }
                placeholder="Descrição opcional do domínio"
                maxLength={255}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="status_dominio">Status</Label>
              <Select
                value={formData.status_dominio}
                onValueChange={(v: DominioStatus) =>
                  setFormData({ ...formData, status_dominio: v })
                }
              >
                <SelectTrigger id="status_dominio">
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
              Tem certeza que deseja excluir o domínio{" "}
              <strong>{deleteTarget?.nome_dominio}</strong>? Esta ação não pode
              ser desfeita.
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
