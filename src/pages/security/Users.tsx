import { useState } from "react";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: 'ativo' | 'inativo' | 'bloqueado' | 'cancelado' | 'pre-registro';
  lastLogin: string;
  createdAt: string;
  profiles: Profile[];
}

interface Profile {
  id: number;
  name: string;
  description: string;
}

const mockProfiles: Profile[] = [
  { id: 1, name: "Administrador", description: "Acesso total ao sistema" },
  { id: 2, name: "Gerente", description: "Gerenciamento de equipes e projetos" },
  { id: 3, name: "Consultor / Analista", description: "Criação e análise de propostas" }
];

const mockUsers: User[] = [
  {
    id: 1,
    name: "João Silva",
    email: "joao.silva@actionsys.com.br",
    phone: "11999999999",
    status: "ativo",
    lastLogin: "2024-01-15 14:30:00",
    createdAt: "2024-01-01 10:00:00",
    profiles: [mockProfiles[0], mockProfiles[1]]
  },
  {
    id: 2,
    name: "Maria Santos",
    email: "maria.santos@actionsys.com.br", 
    phone: "11888888888",
    status: "ativo",
    lastLogin: "2024-01-15 09:15:00",
    createdAt: "2024-01-05 16:30:00",
    profiles: [mockProfiles[1]]
  },
  {
    id: 3,
    name: "Pedro Oliveira",
    email: "pedro.oliveira@actionsys.com.br",
    phone: "11777777777", 
    status: "inativo",
    lastLogin: "2024-01-10 11:45:00",
    createdAt: "2024-01-03 14:20:00",
    profiles: [mockProfiles[2]]
  }
];

export default function Users() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedProfiles, setSelectedProfiles] = useState<Profile[]>([]);

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setSelectedProfiles(user.profiles);
    setIsEditDialogOpen(true);
  };

  const handleProfileToggle = (profile: Profile, checked: boolean) => {
    if (checked) {
      setSelectedProfiles(prev => [...prev, profile]);
    } else {
      setSelectedProfiles(prev => prev.filter(p => p.id !== profile.id));
    }
  };

  const addNewProfile = () => {
    // Find profiles not yet selected
    const availableProfiles = mockProfiles.filter(
      profile => !selectedProfiles.some(sp => sp.id === profile.id)
    );
    if (availableProfiles.length > 0) {
      setSelectedProfiles(prev => [...prev, availableProfiles[0]]);
    }
  };

  const saveUserProfiles = () => {
    if (selectedUser) {
      setUsers(prev => prev.map(user => 
        user.id === selectedUser.id 
          ? { ...user, profiles: selectedProfiles }
          : user
      ));
    }
    setIsEditDialogOpen(false);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants = {
      ativo: "default",
      inativo: "secondary", 
      bloqueado: "destructive",
      cancelado: "destructive",
      "pre-registro": "outline"
    } as const;

    const labels = {
      ativo: "Ativo",
      inativo: "Inativo",
      bloqueado: "Bloqueado",
      cancelado: "Cancelado", 
      "pre-registro": "Pré-Registro"
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie os usuários do sistema
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Novo Usuário</DialogTitle>
              <DialogDescription>
                Preencha as informações do novo usuário
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" placeholder="Digite o nome completo" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" placeholder="usuario@actionsys.com.br" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" placeholder="(11) 99999-9999" />
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
                    <SelectItem value="bloqueado">Bloqueado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" placeholder="Digite a senha" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input id="confirmPassword" type="password" placeholder="Confirme a senha" />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setIsDialogOpen(false)}>
                Salvar Usuário
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>
            Total de {users.length} usuários cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou e-mail..."
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
                  <TableHead>E-mail</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Último Login</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>{new Date(user.lastLogin).toLocaleString('pt-BR')}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleViewUser(user)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
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

      {/* Modal de Visualização */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Usuário</DialogTitle>
            <DialogDescription>
              Informações completas do usuário selecionado
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <p className="p-2 bg-muted rounded">{selectedUser.name}</p>
              </div>
              
              <div className="space-y-2">
                <Label>E-mail</Label>
                <p className="p-2 bg-muted rounded">{selectedUser.email}</p>
              </div>
              
              <div className="space-y-2">
                <Label>Telefone</Label>
                <p className="p-2 bg-muted rounded">{selectedUser.phone}</p>
              </div>
              
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="p-2">
                  {getStatusBadge(selectedUser.status)}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Último Login</Label>
                <p className="p-2 bg-muted rounded">
                  {new Date(selectedUser.lastLogin).toLocaleString('pt-BR')}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Data de Criação</Label>
                <p className="p-2 bg-muted rounded">
                  {new Date(selectedUser.createdAt).toLocaleString('pt-BR')}
                </p>
              </div>
              
              <div className="col-span-2 space-y-2">
                <Label>Perfis Atribuídos</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.profiles.map((profile) => (
                    <Badge key={profile.id} variant="secondary">
                      {profile.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button onClick={() => setIsViewDialogOpen(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Edite as informações e perfis do usuário
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editName">Nome Completo</Label>
                  <Input id="editName" defaultValue={selectedUser.name} />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="editEmail">E-mail</Label>
                  <Input id="editEmail" type="email" defaultValue={selectedUser.email} />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="editPhone">Telefone</Label>
                  <Input id="editPhone" defaultValue={selectedUser.phone} />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="editStatus">Status</Label>
                  <Select defaultValue={selectedUser.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                      <SelectItem value="bloqueado">Bloqueado</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                      <SelectItem value="pre-registro">Pré-Registro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Perfis do Usuário</Label>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="outline" 
                    onClick={addNewProfile}
                    className="gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Adicionar Perfil
                  </Button>
                </div>
                
                <div className="space-y-2 border rounded-lg p-3">
                  {mockProfiles.map((profile) => (
                    <div key={profile.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={`profile-${profile.id}`}
                        checked={selectedProfiles.some(sp => sp.id === profile.id)}
                        onCheckedChange={(checked) => 
                          handleProfileToggle(profile, checked as boolean)
                        }
                      />
                      <div className="flex-1">
                        <Label 
                          htmlFor={`profile-${profile.id}`} 
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
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveUserProfiles}>
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}