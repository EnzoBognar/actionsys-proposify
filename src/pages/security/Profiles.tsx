import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Eye, Users } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  listPerfis,
  getPerfil,
  createPerfil,
  patchPerfil,
  setPerfilStatus,
  suspendPerfil,
  type PerfilRead,
  type PerfilWithUsersRead,
} from "@/services/roles";

interface Profile {
  id: number;
  name: string;
  description: string;
  status: 'ativo' | 'inativo' | 'suspenso';
  userCount: number;
  updatedAt: string;
  userIds?: number[];
}

const statusMap: Record<string, Profile['status']> = {
  'A': 'ativo',
  'I': 'inativo',
  'S': 'suspenso',
};

const apiToUiProfile = (p: PerfilRead, userIds?: number[]): Profile => ({
  id: p.id_perfil,
  name: p.desc_perfil,
  description: p.desc_perfil,
  status: statusMap[p.status_perfil] || 'inativo',
  userCount: userIds?.length || 0,
  updatedAt: p.data_status,
  userIds,
});

export default function Profiles() {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  // Form states
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

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

  useEffect(() => {
    loadProfiles();
  }, []);

  const filteredProfiles = profiles.filter(profile =>
    profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.description.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleView = (profile: Profile) => {
    setSelectedProfile(profile);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (profile: Profile) => {
    setSelectedProfile(profile);
    setEditName(profile.name);
    setEditDescription(profile.description);
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

  const toggleProfileStatus = async () => {
    if (!selectedProfile) return;
    
    const newStatus = selectedProfile.status === 'ativo' ? 'I' : 'A';
    
    try {
      await setPerfilStatus(selectedProfile.id, newStatus);
      await loadProfiles();
      
      const updatedProfile = {
        ...selectedProfile,
        status: newStatus === 'A' ? 'ativo' as const : 'inativo' as const
      };
      setSelectedProfile(updatedProfile);
      
      toast({
        title: "Status atualizado",
        description: `Perfil ${newStatus === 'A' ? 'ativado' : 'inativado'} com sucesso.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreateProfile = async () => {
    if (!newName.trim()) {
      toast({
        title: "Erro",
        description: "O nome do perfil é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      await createPerfil({
        desc_perfil: newName,
        status_perfil: "A"
      });
      
      toast({
        title: "Perfil criado com sucesso",
        description: "O novo perfil foi adicionado ao sistema.",
      });
      
      setNewName("");
      setNewDescription("");
      setIsDialogOpen(false);
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
    if (!selectedProfile || !editName.trim()) {
      toast({
        title: "Erro",
        description: "O nome do perfil é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      await patchPerfil(selectedProfile.id, {
        desc_perfil: editName
      });
      
      toast({
        title: "Perfil atualizado",
        description: "As alterações foram salvas com sucesso.",
      });
      
      setIsEditDialogOpen(false);
      await loadProfiles();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const activeProfiles = profiles.filter(p => p.status === 'ativo');
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
                <Label htmlFor="name">Nome do Perfil</Label>
                <Input
                  id="name"
                  placeholder="Digite o nome do perfil"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea 
                  id="description" 
                  placeholder="Descreva as responsabilidades deste perfil"
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
              <Button onClick={handleCreateProfile}>
                Salvar Perfil
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
                  <TableHead>Descrição</TableHead>
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
                    <TableCell className="max-w-xs truncate">{profile.description}</TableCell>
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
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Perfil</DialogTitle>
            <DialogDescription>
              Visualize as informações do perfil {selectedProfile?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
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
              <Label className="text-sm font-medium">Descrição</Label>
              <p className="text-sm text-muted-foreground">{selectedProfile?.description}</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Usuários Vinculados</Label>
              <p className="text-sm text-muted-foreground">{selectedProfile?.userCount} usuário(s)</p>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar perfil */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
            <DialogDescription>
              Altere as informações do perfil {selectedProfile?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome do Perfil</Label>
              <Input 
                id="edit-name" 
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Digite o nome do perfil" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea 
                id="edit-description" 
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Descreva as responsabilidades deste perfil"
                className="resize-none"
              />
            </div>
            
            <div className="flex items-center justify-between space-y-0">
              <div className="space-y-1">
                <Label>Status do Perfil</Label>
                <p className="text-sm text-muted-foreground">
                  {selectedProfile?.status === 'ativo' ? 'Perfil ativo no sistema' : 'Perfil inativo no sistema'}
                </p>
              </div>
              <Switch
                checked={selectedProfile?.status === 'ativo'}
                onCheckedChange={toggleProfileStatus}
              />
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
