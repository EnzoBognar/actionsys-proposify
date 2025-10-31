import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Eye, Users, X } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  listPerfis,
  getPerfil,
  createPerfil,
  patchPerfil,
  setPerfilStatus,
  suspendPerfil,
  listRolePermissions,
  listAvailablePermissions,
  addPermissionToRole,
  removePermissionFromRole,
  type PerfilRead,
} from "@/services/roles";
import { listDomainValues, type DominioValor } from "@/services/domains";
import { type Permissao } from "@/services/permissions";

interface Profile {
  id: number;
  name: string;
  description: string;
  status: string;
  userCount: number;
  updatedAt: string;
  userIds?: number[];
}

const statusMap: Record<string, string> = {
  'A': 'ativo',
  'I': 'inativo',
  'S': 'suspenso',
};

const apiToUiProfile = (p: PerfilRead, userIds?: number[]): Profile => ({
  id: p.id_perfil,
  name: p.desc_perfil,
  description: p.desc_perfil,
  status: p.status_perfil,
  userCount: userIds?.length || 0,
  updatedAt: p.data_status,
  userIds,
});

export default function Profiles() {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formStatus, setFormStatus] = useState<string>("A");
  
  // Domain values for status
  const [statusOptions, setStatusOptions] = useState<DominioValor[]>([]);
  const [loadingStatus, setLoadingStatus] = useState(false);
  
  // Permissions states
  const [activeTab, setActiveTab] = useState("dados");
  const [assignedPermissions, setAssignedPermissions] = useState<Permissao[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<Permissao[]>([]);
  const [selectedPermissionId, setSelectedPermissionId] = useState<string>("");
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [addingPermission, setAddingPermission] = useState(false);
  const [removingPermissionId, setRemovingPermissionId] = useState<number | null>(null);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const data = await listPerfis();
      
      // Buscar detalhes de cada perfil para obter user_ids
      const profilesWithUsers = await Promise.all(
        data.map(async (p) => {
          try {
            const details = await getPerfil(p.id_perfil);
            return apiToUiProfile(p, details.user_ids);
          } catch {
            return apiToUiProfile(p, []);
          }
        })
      );
      
      setProfiles(profilesWithUsers);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar perfis",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStatusOptions = async () => {
    try {
      setLoadingStatus(true);
      const values = await listDomainValues("status_perfil", { all: false });
      setStatusOptions(values);
    } catch (err: any) {
      console.error("Erro ao carregar opções de status:", err);
      // Fallback
      setStatusOptions([
        { codigo: "A", rotulo: "Ativo", id_dominio: 0, status: "A" },
        { codigo: "I", rotulo: "Inativo", id_dominio: 0, status: "A" },
      ]);
    } finally {
      setLoadingStatus(false);
    }
  };

  const loadRolePermissions = async (perfilId: number) => {
    try {
      setLoadingPermissions(true);
      const [assigned, available] = await Promise.all([
        listRolePermissions(perfilId),
        listAvailablePermissions(perfilId),
      ]);
      setAssignedPermissions(assigned);
      setAvailablePermissions(available);
    } catch (err: any) {
      toast({
        title: "Erro ao carregar permissões",
        description: err.message || "Ocorreu um erro ao carregar as permissões.",
        variant: "destructive",
      });
    } finally {
      setLoadingPermissions(false);
    }
  };

  useEffect(() => {
    loadProfiles();
    loadStatusOptions();
  }, []);

  const filteredProfiles = profiles.filter(profile =>
    profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'A': { variant: "default", label: "Ativo" },
      'I': { variant: "secondary", label: "Inativo" },
      'S': { variant: "destructive", label: "Suspenso" }
    };
    
    const config = variants[status] || { variant: "secondary", label: "Desconhecido" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleView = async (profile: Profile) => {
    setSelectedProfile(profile);
    setActiveTab("dados");
    await loadRolePermissions(profile.id);
    setIsViewDialogOpen(true);
  };

  const handleEdit = async (profile: Profile) => {
    setSelectedProfile(profile);
    setFormName(profile.name);
    setFormStatus(profile.status);
    setActiveTab("dados");
    await loadRolePermissions(profile.id);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (profile: Profile) => {
    setSelectedProfile(profile);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedProfile) return;
    
    try {
      await suspendPerfil(selectedProfile.id);
      toast({
        title: "Perfil suspenso com sucesso",
        description: "O perfil foi suspenso e não está mais disponível.",
      });
      setIsDeleteDialogOpen(false);
      setSelectedProfile(null);
      await loadProfiles();
    } catch (error: any) {
      toast({
        title: "Erro ao suspender perfil",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreateProfile = async () => {
    if (!formName.trim()) {
      toast({
        title: "Erro",
        description: "O nome do perfil é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      const newProfile = await createPerfil({
        desc_perfil: formName,
        status_perfil: formStatus as "A" | "I",
      });
      
      toast({
        title: "Perfil criado com sucesso",
        description: "O novo perfil foi adicionado ao sistema.",
      });
      
      // Manter modal aberto e ir para aba de permissões
      const uiProfile = apiToUiProfile(newProfile);
      setSelectedProfile(uiProfile);
      setActiveTab("permissoes");
      await loadRolePermissions(newProfile.id_perfil!);
      setIsDialogOpen(false);
      setIsEditDialogOpen(true);
      await loadProfiles();
    } catch (error: any) {
      toast({
        title: "Erro ao criar perfil",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedProfile || !formName.trim()) {
      toast({
        title: "Erro",
        description: "O nome do perfil é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      await patchPerfil(selectedProfile.id, {
        desc_perfil: formName
      });
      
      // Atualizar status se foi alterado
      if (formStatus !== selectedProfile.status) {
        await setPerfilStatus(selectedProfile.id, formStatus as "A" | "I");
      }
      
      toast({
        title: "Perfil atualizado",
        description: "As alterações foram salvas com sucesso.",
      });
      
      // Atualizar estado local sem fechar modal
      setSelectedProfile({ ...selectedProfile, name: formName, status: formStatus });
      await loadProfiles();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddPermission = async () => {
    if (!selectedProfile || !selectedPermissionId) return;

    const permId = Number(selectedPermissionId);
    const permToAdd = availablePermissions.find(p => p.id_permissao === permId);
    if (!permToAdd) return;

    // Update otimista
    setAssignedPermissions(prev => [...prev, permToAdd]);
    setAvailablePermissions(prev => prev.filter(p => p.id_permissao !== permId));
    setSelectedPermissionId("");

    try {
      setAddingPermission(true);
      await addPermissionToRole(selectedProfile.id, permId);
      toast({
        title: "Permissão adicionada",
        description: "A permissão foi adicionada com sucesso.",
      });
    } catch (err: any) {
      // Rollback
      setAssignedPermissions(prev => prev.filter(p => p.id_permissao !== permId));
      setAvailablePermissions(prev => [...prev, permToAdd].sort((a, b) => 
        a.nome_permissao.localeCompare(b.nome_permissao)
      ));
      toast({
        title: "Erro ao adicionar permissão",
        description: err.response?.data?.detail || err.message || "Ocorreu um erro ao adicionar a permissão.",
        variant: "destructive",
      });
    } finally {
      setAddingPermission(false);
    }
  };

  const handleRemovePermission = async (permId: number) => {
    if (!selectedProfile) return;

    const permToRemove = assignedPermissions.find(p => p.id_permissao === permId);
    if (!permToRemove) return;

    // Update otimista
    setAssignedPermissions(prev => prev.filter(p => p.id_permissao !== permId));
    setAvailablePermissions(prev => [...prev, permToRemove].sort((a, b) => 
      a.nome_permissao.localeCompare(b.nome_permissao)
    ));

    try {
      setRemovingPermissionId(permId);
      await removePermissionFromRole(selectedProfile.id, permId);
      toast({
        title: "Permissão removida",
        description: "A permissão foi removida com sucesso.",
      });
    } catch (err: any) {
      // Rollback
      setAvailablePermissions(prev => prev.filter(p => p.id_permissao !== permId));
      setAssignedPermissions(prev => [...prev, permToRemove].sort((a, b) => 
        a.nome_permissao.localeCompare(b.nome_permissao)
      ));
      toast({
        title: "Erro ao remover permissão",
        description: err.response?.data?.detail || err.message || "Ocorreu um erro ao remover a permissão.",
        variant: "destructive",
      });
    } finally {
      setRemovingPermissionId(null);
    }
  };

  const activeProfiles = profiles.filter(p => p.status === 'A');
  const totalUsers = profiles.reduce((acc, p) => acc + p.userCount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Perfis</h1>
          <p className="text-muted-foreground">
            Gerencie os perfis de acesso do sistema
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Perfil
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Novo Perfil</DialogTitle>
              <DialogDescription>
                Preencha as informações do novo perfil de acesso
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Perfil *</Label>
                <Input
                  id="name"
                  placeholder="Digite o nome do perfil"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                {loadingStatus ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select value={formStatus} onValueChange={setFormStatus}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((opt) => (
                        <SelectItem key={opt.codigo} value={opt.codigo}>
                          {opt.rotulo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setIsDialogOpen(false);
                setFormName("");
                setFormStatus("A");
              }}>
                Cancelar
              </Button>
              <Button onClick={handleCreateProfile}>
                Criar Perfil
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Perfis</CardTitle>
            <Badge variant="outline">{profiles.length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profiles.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Perfis Ativos</CardTitle>
            <Badge variant="default">{activeProfiles.length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProfiles.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Vinculados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Perfis</CardTitle>
          <CardDescription>
            {loading ? "Carregando..." : "Gerencie os perfis de acesso e suas permissões"}
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
                  <TableHead>Status</TableHead>
                  <TableHead>Usuários</TableHead>
                  <TableHead>Atualizado em</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">{profile.name}</TableCell>
                    <TableCell>{getStatusBadge(profile.status)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{profile.userCount}</Badge>
                    </TableCell>
                    <TableCell>{new Date(profile.updatedAt).toLocaleString('pt-BR')}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleView(profile)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEdit(profile)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(profile)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && filteredProfiles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Nenhum perfil encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog para visualizar perfil */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Perfil</DialogTitle>
            <DialogDescription>
              Visualize as informações do perfil {selectedProfile?.name}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="dados">Dados do Perfil</TabsTrigger>
              <TabsTrigger value="permissoes">Permissões do Perfil</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dados" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Nome do Perfil</Label>
                  <p className="text-sm text-muted-foreground">{selectedProfile?.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">
                    {selectedProfile && getStatusBadge(selectedProfile.status)}
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Usuários Vinculados</Label>
                <p className="text-sm text-muted-foreground">{selectedProfile?.userCount} usuário(s)</p>
              </div>
            </TabsContent>
            
            <TabsContent value="permissoes" className="space-y-4 mt-4">
              {loadingPermissions ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Permissões Atribuídas</Label>
                    {assignedPermissions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Nenhuma permissão atribuída.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {assignedPermissions.map((perm) => (
                          <Badge key={perm.id_permissao} variant="secondary">
                            {perm.nome_permissao}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar perfil */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
            <DialogDescription>
              Altere as informações do perfil {selectedProfile?.name}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="dados">Dados do Perfil</TabsTrigger>
              <TabsTrigger value="permissoes">Permissões do Perfil</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dados" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome do Perfil *</Label>
                <Input 
                  id="edit-name" 
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Digite o nome do perfil" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                {loadingStatus ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select value={formStatus} onValueChange={setFormStatus}>
                    <SelectTrigger id="edit-status">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((opt) => (
                        <SelectItem key={opt.codigo} value={opt.codigo}>
                          {opt.rotulo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="permissoes" className="space-y-4 mt-4">
              {loadingPermissions ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Permissões Atribuídas</Label>
                    {assignedPermissions.length === 0 ? (
                      <p className="text-sm text-muted-foreground mb-4">Nenhuma permissão atribuída.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {assignedPermissions.map((perm) => (
                          <Badge 
                            key={perm.id_permissao} 
                            variant="secondary"
                            className="gap-1"
                          >
                            {perm.nome_permissao}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 p-0 hover:bg-transparent"
                              onClick={() => handleRemovePermission(perm.id_permissao!)}
                              disabled={removingPermissionId === perm.id_permissao}
                              aria-label="Remover permissão"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Adicionar Permissão</Label>
                    <div className="flex gap-2">
                      <Select 
                        value={selectedPermissionId} 
                        onValueChange={setSelectedPermissionId}
                        disabled={availablePermissions.length === 0}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder={
                            availablePermissions.length === 0 
                              ? "Todas as permissões já foram atribuídas" 
                              : "Selecione uma permissão"
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {availablePermissions.map((perm) => (
                            <SelectItem 
                              key={perm.id_permissao} 
                              value={String(perm.id_permissao)}
                            >
                              {perm.nome_permissao}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button 
                        onClick={handleAddPermission}
                        disabled={!selectedPermissionId || addingPermission}
                      >
                        {addingPermission ? "Adicionando..." : "Adicionar"}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
          
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
              Tem certeza que deseja suspender o perfil "{selectedProfile?.name}"? 
              Esta ação pode afetar {selectedProfile?.userCount} usuário(s) vinculado(s) a este perfil.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Suspender Perfil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
