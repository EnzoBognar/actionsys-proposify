import { useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface Profile {
  id: number;
  name: string;
  description: string;
  status: 'ativo' | 'inativo';
  userCount: number;
  createdAt: string;
  updatedAt: string;
  permissions: string[];
}

const mockProfiles: Profile[] = [
  {
    id: 1,
    name: "Administrador",
    description: "Acesso total ao sistema",
    status: "ativo",
    userCount: 2,
    createdAt: "2024-01-01 10:00:00",
    updatedAt: "2024-01-01 10:00:00",
    permissions: [
      "Gerenciar usuários",
      "Gerenciar perfis",
      "Gerenciar permissões",
      "Criar propostas",
      "Editar propostas",
      "Arquivar propostas",
      "Ver valores monetários",
      "Ver relatórios",
      "Ver atividades de outros usuários",
      "Configurações do sistema"
    ]
  },
  {
    id: 2,
    name: "Gerente",
    description: "Gerenciamento de propostas e equipes",
    status: "ativo", 
    userCount: 5,
    createdAt: "2024-01-01 10:00:00",
    updatedAt: "2024-01-05 14:30:00",
    permissions: [
      "Gerenciar usuários",
      "Criar propostas",
      "Editar propostas",
      "Arquivar propostas",
      "Ver valores monetários",
      "Ver relatórios",
      "Ver atividades de outros usuários",
      "Aprovar propostas de analistas"
    ]
  },
  {
    id: 3,
    name: "Analista",
    description: "Criação e edição de propostas",
    status: "ativo",
    userCount: 12,
    createdAt: "2024-01-01 10:00:00",
    updatedAt: "2024-01-10 09:15:00",
    permissions: [
      "Criar propostas",
      "Ver próprias propostas",
      "Editar próprias propostas"
    ]
  },
  {
    id: 4,
    name: "Consultor",
    description: "Visualização de propostas",
    status: "inativo",
    userCount: 0,
    createdAt: "2024-01-01 10:00:00",
    updatedAt: "2024-01-12 16:45:00",
    permissions: [
      "Ver propostas",
      "Ver relatórios básicos"
    ]
  }
];

export default function Profiles() {
  const [profiles, setProfiles] = useState<Profile[]>(mockProfiles);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  const filteredProfiles = profiles.filter(profile =>
    profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants = {
      ativo: "default",
      inativo: "secondary"
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
    setIsEditDialogOpen(true);
  };

  const handleDelete = (profile: Profile) => {
    setSelectedProfile(profile);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedProfile) {
      setProfiles(profiles.filter(p => p.id !== selectedProfile.id));
      setIsDeleteDialogOpen(false);
      setSelectedProfile(null);
    }
  };

  const toggleProfileStatus = () => {
    if (selectedProfile) {
      const updatedProfiles = profiles.map(p => 
        p.id === selectedProfile.id 
          ? { ...p, status: p.status === 'ativo' ? 'inativo' as const : 'ativo' as const }
          : p
      );
      setProfiles(updatedProfiles);
      setSelectedProfile({
        ...selectedProfile,
        status: selectedProfile.status === 'ativo' ? 'inativo' : 'ativo'
      });
    }
  };

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
                <Input id="name" placeholder="Digite o nome do perfil" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea 
                  id="description" 
                  placeholder="Descreva as responsabilidades deste perfil"
                  className="resize-none"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setIsDialogOpen(false)}>
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
            <Badge variant="default">{profiles.filter(p => p.status === 'ativo').length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profiles.filter(p => p.status === 'ativo').length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Vinculados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profiles.reduce((acc, p) => acc + p.userCount, 0)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Perfis</CardTitle>
          <CardDescription>
            Gerencie os perfis de acesso e suas permissões
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
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog para visualizar permissões */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Permissões do Perfil</DialogTitle>
            <DialogDescription>
              Visualize todas as permissões do perfil {selectedProfile?.name}
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
              <Label className="text-sm font-medium">Permissões</Label>
              <div className="mt-2 grid grid-cols-1 gap-2">
                {selectedProfile?.permissions.map((permission, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                    <Badge variant="outline" className="text-xs">
                      {permission}
                    </Badge>
                  </div>
                ))}
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
                defaultValue={selectedProfile?.name}
                placeholder="Digite o nome do perfil" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea 
                id="edit-description" 
                defaultValue={selectedProfile?.description}
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
            <Button onClick={() => setIsEditDialogOpen(false)}>
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog para confirmar exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o perfil "{selectedProfile?.name}"? 
              Esta ação não pode ser desfeita e pode afetar {selectedProfile?.userCount} usuário(s) vinculado(s) a este perfil.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir Perfil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}