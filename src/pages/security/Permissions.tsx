import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Badge } from "@/components/ui/badge";
import { Eye, Pencil, Trash2, Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  listPermissions,
  getPermission,
  createPermission,
  updatePermission,
  deletePermission,
  Permissao,
} from "@/services/permissions";

export default function Permissions() {
  const [allPermissions, setAllPermissions] = useState<Permissao[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // Paginação local
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Busca local
  const [searchTerm, setSearchTerm] = useState("");

  // Estado para visualização
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permissao | null>(null);

  // Estado para criação/edição
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permissao | null>(null);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState<"A" | "S">("A");
  const [nameError, setNameError] = useState("");

  // Estado para confirmação de exclusão
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmPermission, setConfirmPermission] = useState<Permissao | null>(null);

  // Carregar todas as permissões (sem paginação no backend)
  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const data = await listPermissions();
      setAllPermissions(data);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar permissões",
        description: error.message || "Ocorreu um erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrar e paginar localmente
  const filteredPermissions = useMemo(() => {
    const filtered = allPermissions.filter((p) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        p.nome_permissao.toLowerCase().includes(searchLower) ||
        (p.desc_permissao && p.desc_permissao.toLowerCase().includes(searchLower))
      );
    });
    return filtered;
  }, [allPermissions, searchTerm]);

  const paginatedPermissions = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredPermissions.slice(start, end);
  }, [filteredPermissions, page]);

  const totalPages = Math.ceil(filteredPermissions.length / pageSize);

  const handleViewPermission = async (id: number) => {
    try {
      const perm = await getPermission(id);
      setSelectedPermission(perm);
      setIsViewDialogOpen(true);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar permissão",
        description: error.message || "Ocorreu um erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const handleEditPermission = async (id: number) => {
    try {
      const perm = await getPermission(id);
      setEditingPermission(perm);
      setFormName(perm.nome_permissao);
      setFormDescription(perm.desc_permissao || "");
      setFormStatus(perm.status_permissao || "A");
      setNameError("");
      setIsEditDialogOpen(true);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar permissão",
        description: error.message || "Ocorreu um erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const handleOpenCreateDialog = () => {
    setFormName("");
    setFormDescription("");
    setFormStatus("A");
    setNameError("");
    setIsCreateDialogOpen(true);
  };

  const validateForm = () => {
    const trimmedName = formName.trim();
    if (!trimmedName) {
      setNameError("Nome é obrigatório");
      return false;
    }
    if (trimmedName.length < 3) {
      setNameError("Nome deve ter pelo menos 3 caracteres");
      return false;
    }
    if (trimmedName.length > 80) {
      setNameError("Nome deve ter no máximo 80 caracteres");
      return false;
    }
    if (formDescription.length > 120) {
      setNameError("");
      toast({
        title: "Erro de validação",
        description: "Descrição deve ter no máximo 120 caracteres",
        variant: "destructive",
      });
      return false;
    }
    setNameError("");
    return true;
  };

  const handleCreateSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      await createPermission({
        nome_permissao: formName.trim(),
        desc_permissao: formDescription.trim() || null,
        status_permissao: formStatus,
      });
      toast({
        title: "Permissão criada",
        description: "A permissão foi criada com sucesso",
      });
      setIsCreateDialogOpen(false);
      loadPermissions();
    } catch (error: any) {
      if (error.message.includes("409")) {
        setNameError("Já existe uma permissão com esse nome");
        toast({
          title: "Erro ao criar permissão",
          description: "Já existe uma permissão com esse nome",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao criar permissão",
          description: error.message || "Ocorreu um erro desconhecido",
          variant: "destructive",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!editingPermission) return;
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const updateData: any = {};
      if (formName.trim() !== editingPermission.nome_permissao) {
        updateData.nome_permissao = formName.trim();
      }
      if (formDescription.trim() !== (editingPermission.desc_permissao || "")) {
        updateData.desc_permissao = formDescription.trim() || null;
      }
      if (formStatus !== editingPermission.status_permissao) {
        updateData.status_permissao = formStatus;
      }

      if (Object.keys(updateData).length === 0) {
        toast({
          title: "Nenhuma alteração detectada",
          variant: "default",
        });
        setIsEditDialogOpen(false);
        return;
      }

      await updatePermission(editingPermission.id_permissao!, updateData);
      toast({
        title: "Permissão atualizada",
        description: "A permissão foi atualizada com sucesso",
      });
      setIsEditDialogOpen(false);
      loadPermissions();
    } catch (error: any) {
      if (error.message.includes("409")) {
        setNameError("Já existe uma permissão com esse nome");
        toast({
          title: "Erro ao atualizar permissão",
          description: "Já existe uma permissão com esse nome",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao atualizar permissão",
          description: error.message || "Ocorreu um erro desconhecido",
          variant: "destructive",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePermission = (permission: Permissao) => {
    setConfirmPermission(permission);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!confirmPermission) return;

    try {
      setSubmitting(true);
      await deletePermission(confirmPermission.id_permissao!);
      toast({
        title: "Permissão excluída",
        description: "A permissão foi excluída com sucesso",
      });
      setIsConfirmDialogOpen(false);
      loadPermissions();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir permissão",
        description: error.message || "Ocorreu um erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Permissões</h1>
        <Button onClick={handleOpenCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Permissão
        </Button>
      </div>

      {/* Busca local */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou descrição..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-9"
          />
        </div>
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="text-center py-8">Carregando...</div>
      ) : filteredPermissions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhuma permissão encontrada
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPermissions.map((perm) => (
                <TableRow key={perm.id_permissao}>
                  <TableCell className="font-medium">{perm.nome_permissao}</TableCell>
                  <TableCell>{perm.desc_permissao || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={perm.status_permissao === "A" ? "default" : "secondary"}>
                      {perm.status_permissao === "A" ? "Ativo" : "Suspenso"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewPermission(perm.id_permissao!)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditPermission(perm.id_permissao!)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeletePermission(perm)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Paginação local */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Página {page} de {totalPages} ({filteredPermissions.length} resultados)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de Visualização */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes da Permissão</DialogTitle>
            <DialogDescription>Visualização completa da permissão</DialogDescription>
          </DialogHeader>
          {selectedPermission && (
            <div className="space-y-4">
              <div>
                <Label>Nome</Label>
                <p className="mt-1">{selectedPermission.nome_permissao}</p>
              </div>
              <div>
                <Label>Descrição</Label>
                <p className="mt-1">{selectedPermission.desc_permissao || "—"}</p>
              </div>
              <div>
                <Label>Status</Label>
                <p className="mt-1">
                  <Badge variant={selectedPermission.status_permissao === "A" ? "default" : "secondary"}>
                    {selectedPermission.status_permissao === "A" ? "Ativo" : "Suspenso"}
                  </Badge>
                </p>
              </div>
              <div>
                <Label>Cadastrado em</Label>
                <p className="mt-1">
                  {new Date(selectedPermission.data_cadastro).toLocaleString("pt-BR")}
                </p>
              </div>
              <div>
                <Label>Última atualização</Label>
                <p className="mt-1">
                  {new Date(selectedPermission.data_status).toLocaleString("pt-BR")}
                </p>
              </div>
              {selectedPermission.atualizado_por && (
                <div>
                  <Label>Atualizado por</Label>
                  <p className="mt-1">{selectedPermission.atualizado_por}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Criação */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Permissão</DialogTitle>
            <DialogDescription>Crie uma nova permissão no sistema</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="create-name">Nome *</Label>
              <Input
                id="create-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="security.users.view"
              />
              {nameError && <p className="text-sm text-destructive mt-1">{nameError}</p>}
            </div>
            <div>
              <Label htmlFor="create-description">Descrição</Label>
              <Input
                id="create-description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Descrição da permissão (até 120 caracteres)"
              />
            </div>
            <div>
              <Label htmlFor="create-status">Status</Label>
              <Select value={formStatus} onValueChange={(v: "A" | "S") => setFormStatus(v)}>
                <SelectTrigger id="create-status">
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
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateSubmit} disabled={submitting}>
              {submitting ? "Criando..." : "Criar Permissão"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Permissão</DialogTitle>
            <DialogDescription>Altere os dados da permissão</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nome *</Label>
              <Input
                id="edit-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
              {nameError && <p className="text-sm text-destructive mt-1">{nameError}</p>}
            </div>
            <div>
              <Label htmlFor="edit-description">Descrição</Label>
              <Input
                id="edit-description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select value={formStatus} onValueChange={(v: "A" | "S") => setFormStatus(v)}>
                <SelectTrigger id="edit-status">
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
              onClick={() => setIsEditDialogOpen(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button onClick={handleEditSubmit} disabled={submitting}>
              {submitting ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Permissão</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja excluir esta permissão? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={submitting}>
              {submitting ? "Excluindo..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
