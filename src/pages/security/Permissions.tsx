import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Eye, Check, X } from "lucide-react";
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
  patchPermissao,
  suspendPermissao,
  addRoleToPermission,
  removeRoleFromPermission,
  type PermissaoRead,
  type PermissaoWithRolesRead,
} from "@/services/permissions";
import {
  listPerfis,
  type PerfilRead,
} from "@/services/roles";
import { Checkbox } from "@/components/ui/checkbox";

interface Permission {
  id: number;
  name: string;
  description: string;
  status: 'ativo' | 'inativo' | 'suspenso';
  createdAt: string;
  roleIds: number[];
}

interface Profile {
  id: number;
  name: string;
  description: string;
}

const statusMap: Record<string, Permission['status']> = {
  'A': 'ativo',
  'I': 'inativo',
  'S': 'suspenso',
};

const apiToUiPermission = (p: PermissaoRead | PermissaoWithRolesRead): Permission => ({
  id: p.id_permissao,
  name: p.nome_permissao,
  description: p.desc_permissao || "",
  status: statusMap[p.status_permissao] || 'inativo',
  createdAt: p.data_cadastro,
  roleIds: 'role_ids' in p ? p.role_ids : [],
});

const apiToUiProfile = (p: PerfilRead): Profile => ({
  id: p.id_perfil,
  name: p.desc_perfil,
  description: p.desc_perfil,
});

export default function Permissions() {
  const { toast } = useToast();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);

  // Form states
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const data = await listPermissoes();
      
      // Buscar detalhes de cada permissão para obter role_ids
      const permissionsWithRoles = await Promise.all(
        data.map(async (p) => {
          try {
            const details = await getPermissao(p.id_permissao);
            return apiToUiPermission(details);
          } catch {
            return apiToUiPermission(p);
          }
        })
      );
      
      setPermissions(permissionsWithRoles);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar permissões",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProfiles = async () => {
    try {
      const data = await listPerfis({ status: "A" });
      const mapped = data.map(apiToUiProfile);
      setAllProfiles(mapped);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar perfis",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadPermissions();
    loadProfiles();
  }, []);

  const filteredPermissions = permissions.filter(permission =>
    permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants = {
      ativo: "default",
      inativo: "secondary",
      suspenso: "destructive"
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {status}
      </Badge>
    );
  };

  const handleView = (permission: Permission) => {
    setSelectedPermission(permission);
    setSelectedRoleIds(permission.roleIds);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (permission: Permission) => {
    setSelectedPermission(permission);
    setEditName(permission.name);
    setEditDescription(permission.description);
    setSelectedRoleIds(permission.roleIds);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (permission: Permission) => {
    setSelectedPermission(permission);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedPermission) return;
    
    try {
      await suspendPermissao(selectedPermission.id);
      toast({
        title: "Permissão suspensa com sucesso",
        description: "A permissão foi suspensa e não está mais disponível.",
      });
      setIsDeleteDialogOpen(false);
      setSelectedPermission(null);
      await loadPermissions();
    } catch (error: any) {
      toast({
        title: "Erro ao suspender permissão",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreatePermission = async () => {
    if (!newName.trim()) {
      toast({
        title: "Erro",
        description: "O nome da permissão é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      await createPermissao({
        nome_permissao: newName,
        desc_permissao: newDescription || undefined,
        status_permissao: "A"
      });
      
      toast({
        title: "Permissão criada com sucesso",
        description: "A nova permissão foi adicionada ao sistema.",
      });
      
      setNewName("");
      setNewDescription("");
      setIsDialogOpen(false);
      await loadPermissions();
    } catch (error: any) {
      toast({
        title: "Erro ao criar permissão",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedPermission) return;

    try {
      await patchPermissao(selectedPermission.id, {
        desc_permissao: editDescription || undefined
      });
      
      toast({
        title: "Permissão atualizada",
        description: "As alterações foram salvas com sucesso.",
      });
      
      setIsEditDialogOpen(false);
      await loadPermissions();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar permissão",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRoleToggle = async (roleId: number, checked: boolean) => {
    if (!selectedPermission) return;

    try {
      if (checked) {
        await addRoleToPermission(selectedPermission.id, roleId);
        setSelectedRoleIds(prev => [...prev, roleId]);
        toast({
          title: "Perfil vinculado",
          description: "O perfil foi vinculado à permissão com sucesso.",
        });
      } else {
        await removeRoleFromPermission(selectedPermission.id, roleId);
        setSelectedRoleIds(prev => prev.filter(id => id !== roleId));
        toast({
          title: "Perfil desvinculado",
          description: "O perfil foi desvinculado da permissão com sucesso.",
        });
      }
      await loadPermissions();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar vínculo",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getRolesByIds = (roleIds: number[]) => {
    return allProfiles.filter(p => roleIds.includes(p.id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Permissões</h1>
          <p className="text-muted-foreground">
            Gerencie as permissões do sistema
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
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
                <Label htmlFor="name">Nome da Permissão</Label>
                <Input
                  id="name"
                  placeholder="Digite o nome da permissão"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea 
                  id="description" 
                  placeholder="Descreva o que esta permissão permite fazer"
                  className="resize-none"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreatePermission}>
                Salvar Permissão
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Permissões</CardTitle>
          <CardDescription>
            {loading ? "Carregando..." : `Total de ${permissions.length} permissões cadastradas`}
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
                className="pl-8"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Perfis Vinculados</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPermissions.map((permission) => (
                  <TableRow key={permission.id}>
                    <TableCell className="font-medium">{permission.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{permission.description}</TableCell>
                    <TableCell>{getStatusBadge(permission.status)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{permission.roleIds.length}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleView(permission)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(permission)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(permission)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && filteredPermissions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Nenhuma permissão encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
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
            
            <div>
              <Label className="text-sm font-medium">Perfis Vinculados</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {getRolesByIds(selectedPermission?.roleIds || []).map((profile) => (
                  <Badge key={profile.id} variant="secondary">
                    {profile.name}
                  </Badge>
                ))}
                {(selectedPermission?.roleIds.length === 0) && (
                  <p className="text-sm text-muted-foreground">Nenhum perfil vinculado</p>
                )}
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
              <Label htmlFor="edit-name">Nome da Permissão</Label>
              <Input 
                id="edit-name" 
                value={editName}
                disabled
                placeholder="O nome não pode ser alterado" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea 
                id="edit-description" 
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Descreva o que esta permissão permite fazer"
                className="resize-none"
              />
            </div>
            
            <div className="space-y-3">
              <Label>Perfis Vinculados</Label>
              <div className="space-y-2 border rounded-lg p-3">
                {allProfiles.map((profile) => (
                  <div key={profile.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={`role-${profile.id}`}
                      checked={selectedRoleIds.includes(profile.id)}
                      onCheckedChange={(checked) =>
                        handleRoleToggle(profile.id, checked as boolean)
                      }
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={`role-${profile.id}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {profile.name}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {profile.description}
                      </p>
                    </div>
                  </div>
                ))}
                {allProfiles.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    Nenhum perfil disponível
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog para confirmar exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Suspensão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja suspender a permissão "{selectedPermission?.name}"? 
              Esta ação pode afetar {selectedPermission?.roleIds.length} perfil(is) vinculado(s).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Suspender Permissão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
