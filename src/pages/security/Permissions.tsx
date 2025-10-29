import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Eye, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  listPermissoes,
  getPermissao,
  createPermissao,
  updatePermissao,
  softDeletePermissao,
  type PermissaoRead,
} from "@/services/permissions";

interface Permission {
  id: number;
  name: string;
  description: string;
  status: 'A' | 'S';
  createdAt: string;
  updatedAt: string;
}

const apiToUiPermission = (p: PermissaoRead): Permission => ({
  id: p.id_permissao,
  name: p.nome_permissao,
  description: p.descricao || "",
  status: p.status,
  createdAt: p.criado_em,
  updatedAt: p.atualizado_em,
});

export default function Permissions() {
  const { toast } = useToast();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Modais
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [confirmAction, setConfirmAction] = useState<'suspend' | 'activate'>('suspend');

  // Form states
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [nameError, setNameError] = useState("");

  const loadPermissions = async (searchQuery = searchTerm, currentPage = page) => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * pageSize;
      const response = await listPermissoes({
        limit: pageSize,
        offset,
        q: searchQuery || undefined,
      });
      
      const mapped = response.items.map(apiToUiPermission);
      setPermissions(mapped);
      setTotal(response.total);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar permissões",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermissions();
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    loadPermissions(searchTerm, 1);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getStatusBadge = (status: 'A' | 'S') => {
    if (status === 'A') {
      return <Badge variant="default">Ativo</Badge>;
    }
    return <Badge variant="destructive">Suspenso</Badge>;
  };

  const validateName = (name: string): string => {
    const trimmed = name.trim();
    if (!trimmed) {
      return "O nome da permissão é obrigatório";
    }
    if (trimmed.length < 3) {
      return "O nome deve ter pelo menos 3 caracteres";
    }
    if (trimmed.length > 80) {
      return "O nome deve ter no máximo 80 caracteres";
    }
    return "";
  };

  const handleOpenCreate = () => {
    setFormName("");
    setFormDescription("");
    setNameError("");
    setIsCreateDialogOpen(true);
  };

  const handleView = (permission: Permission) => {
    setSelectedPermission(permission);
    setIsViewDialogOpen(true);
  };

  const handleOpenEdit = (permission: Permission) => {
    setSelectedPermission(permission);
    setFormName(permission.name);
    setFormDescription(permission.description);
    setNameError("");
    setIsEditDialogOpen(true);
  };

  const handleOpenConfirm = (permission: Permission, action: 'suspend' | 'activate') => {
    setSelectedPermission(permission);
    setConfirmAction(action);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedPermission) return;
    
    try {
      setSubmitting(true);
      
      if (confirmAction === 'suspend') {
        await softDeletePermissao(selectedPermission.id);
        toast({
          title: "Permissão suspensa com sucesso",
          description: "A permissão foi suspensa.",
        });
      } else {
        await updatePermissao(selectedPermission.id, { status: 'A' });
        toast({
          title: "Permissão ativada com sucesso",
          description: "A permissão foi reativada.",
        });
      }
      
      setIsConfirmDialogOpen(false);
      setSelectedPermission(null);
      await loadPermissions();
    } catch (error: any) {
      const errorMessage = error.message || "Ocorreu um erro. Tente novamente.";
      toast({
        title: confirmAction === 'suspend' ? "Erro ao suspender permissão" : "Erro ao ativar permissão",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreatePermission = async () => {
    const error = validateName(formName);
    if (error) {
      setNameError(error);
      return;
    }

    if (formDescription && formDescription.length > 255) {
      toast({
        title: "Erro",
        description: "A descrição deve ter no máximo 255 caracteres",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      await createPermissao({
        nome_permissao: formName.trim(),
        descricao: formDescription.trim() || undefined,
      });
      
      toast({
        title: "Permissão criada com sucesso",
        description: "A nova permissão foi adicionada ao sistema.",
      });
      
      setIsCreateDialogOpen(false);
      await loadPermissions();
    } catch (error: any) {
      const errorMessage = error.message || "Ocorreu um erro. Tente novamente.";
      
      // Detectar erro 409 (nome duplicado)
      if (errorMessage.includes("409") || errorMessage.toLowerCase().includes("já existe") || errorMessage.toLowerCase().includes("duplicad")) {
        setNameError("Já existe uma permissão com esse nome");
        toast({
          title: "Nome duplicado",
          description: "Já existe uma permissão com esse nome",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao criar permissão",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedPermission) return;

    const error = validateName(formName);
    if (error) {
      setNameError(error);
      return;
    }

    if (formDescription && formDescription.length > 255) {
      toast({
        title: "Erro",
        description: "A descrição deve ter no máximo 255 caracteres",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      
      // Montar payload com apenas os campos alterados
      const payload: any = {};
      if (formName.trim() !== selectedPermission.name) {
        payload.nome_permissao = formName.trim();
      }
      if (formDescription.trim() !== selectedPermission.description) {
        payload.descricao = formDescription.trim();
      }

      // Se nada mudou, apenas fecha o modal
      if (Object.keys(payload).length === 0) {
        setIsEditDialogOpen(false);
        return;
      }

      await updatePermissao(selectedPermission.id, payload);
      
      toast({
        title: "Permissão atualizada",
        description: "As alterações foram salvas com sucesso.",
      });
      
      setIsEditDialogOpen(false);
      await loadPermissions();
    } catch (error: any) {
      const errorMessage = error.message || "Ocorreu um erro. Tente novamente.";
      
      // Detectar erro 409 (nome duplicado)
      if (errorMessage.includes("409") || errorMessage.toLowerCase().includes("já existe") || errorMessage.toLowerCase().includes("duplicad")) {
        setNameError("Já existe uma permissão com esse nome");
        toast({
          title: "Nome duplicado",
          description: "Já existe uma permissão com esse nome",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao atualizar permissão",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize);
  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Permissões</h1>
          <p className="text-muted-foreground">
            Gerencie as permissões do sistema
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={handleOpenCreate}>
              <Plus className="h-4 w-4" />
              Nova Permissão
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nova Permissão</DialogTitle>
              <DialogDescription>
                Configure uma nova permissão do sistema
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Permissão *</Label>
                <Input
                  id="name"
                  placeholder="Ex: security.users.view"
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    setNameError("");
                  }}
                  className={nameError ? "border-destructive" : ""}
                />
                {nameError && (
                  <p className="text-sm text-destructive">{nameError}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Formato recomendado: dominio.subdominio.acao (3-80 caracteres)
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea 
                  id="description" 
                  placeholder="Descreva o que esta permissão permite fazer"
                  className="resize-none"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  maxLength={255}
                />
                <p className="text-xs text-muted-foreground">
                  {formDescription.length}/255 caracteres
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={submitting}>
                Cancelar
              </Button>
              <Button onClick={handleCreatePermission} disabled={submitting}>
                {submitting ? "Salvando..." : "Salvar Permissão"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Permissões</CardTitle>
          <CardDescription>
            {loading ? "Carregando..." : `${total} permissões encontradas (página ${page} de ${totalPages})`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="pl-8"
              />
            </div>
            <Button onClick={handleSearch} variant="outline">
              Buscar
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[150px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions.map((permission) => (
                  <TableRow key={permission.id}>
                    <TableCell className="font-medium">{permission.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{permission.description || "—"}</TableCell>
                    <TableCell>{getStatusBadge(permission.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleView(permission)} title="Visualizar">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(permission)} title="Editar">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {permission.status === 'A' ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleOpenConfirm(permission, 'suspend')}
                            title="Suspender"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => handleOpenConfirm(permission, 'activate')}
                            title="Reativar"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && permissions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Nenhuma permissão encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {((page - 1) * pageSize) + 1} a {Math.min(page * pageSize, total)} de {total} resultados
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p - 1)}
                  disabled={!canGoPrevious}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <div className="text-sm">
                  Página {page} de {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={!canGoNext}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para visualizar permissão */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Permissão</DialogTitle>
            <DialogDescription>
              Visualize as informações da permissão {selectedPermission?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Nome da Permissão</Label>
                <p className="text-sm text-muted-foreground">{selectedPermission?.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <div className="mt-1">
                  {selectedPermission && getStatusBadge(selectedPermission.status)}
                </div>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Descrição</Label>
              <p className="text-sm text-muted-foreground">{selectedPermission?.description || "Sem descrição"}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Criado em</Label>
                <p className="text-sm text-muted-foreground">
                  {selectedPermission?.createdAt ? new Date(selectedPermission.createdAt).toLocaleString('pt-BR') : "—"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Atualizado em</Label>
                <p className="text-sm text-muted-foreground">
                  {selectedPermission?.updatedAt ? new Date(selectedPermission.updatedAt).toLocaleString('pt-BR') : "—"}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar permissão */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Permissão</DialogTitle>
            <DialogDescription>
              Altere as informações da permissão {selectedPermission?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome da Permissão *</Label>
              <Input 
                id="edit-name" 
                value={formName}
                onChange={(e) => {
                  setFormName(e.target.value);
                  setNameError("");
                }}
                placeholder="Ex: security.users.view"
                className={nameError ? "border-destructive" : ""}
              />
              {nameError && (
                <p className="text-sm text-destructive">{nameError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Formato recomendado: dominio.subdominio.acao (3-80 caracteres)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea 
                id="edit-description" 
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Descreva o que esta permissão permite fazer"
                className="resize-none"
                maxLength={255}
              />
              <p className="text-xs text-muted-foreground">
                {formDescription.length}/255 caracteres
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={submitting}>
              {submitting ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog para confirmar suspensão/ativação */}
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === 'suspend' ? 'Confirmar Suspensão' : 'Confirmar Ativação'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === 'suspend' 
                ? `Tem certeza que deseja suspender a permissão "${selectedPermission?.name}"?`
                : `Tem certeza que deseja reativar a permissão "${selectedPermission?.name}"?`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              disabled={submitting}
              className={confirmAction === 'suspend' 
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" 
                : "bg-green-600 text-white hover:bg-green-700"
              }
            >
              {submitting 
                ? "Processando..." 
                : confirmAction === 'suspend' 
                  ? 'Suspender Permissão' 
                  : 'Ativar Permissão'
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
