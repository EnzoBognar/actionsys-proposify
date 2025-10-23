import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Edit, Trash2, Eye, X } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import {
  listUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  getUserRoles,
  addRoleToUserDirect,
  removeRoleFromUserDirect,
  type Usuario
} from "@/services/users";
import {
  listPerfis,
  type PerfilRead
} from "@/services/roles";

interface Profile {
  id: number;
  name: string;
  description: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: 'ativo' | 'inativo' | 'bloqueado' | 'cancelado' | 'pre-registro' | 'visitante';
  lastLogin: string | null;
  createdAt: string | null;
  profileIds: number[];
}

const statusCodeToUi = (code?: string): User["status"] => {
  switch ((code || "P").toUpperCase()) {
    case "A": return "ativo";
    case "I": return "inativo";
    case "B": return "bloqueado";
    case "C": return "cancelado";
    case "P": return "pre-registro";
    case "V": return "visitante";
    default:  return "pre-registro";
  }
};

const apiToUiUser = (u: Usuario): User => ({
  id: u.id_user,
  name: u.nome_user ?? "",
  email: u.email_user,
  phone: u.telefone_user ?? "",
  status: statusCodeToUi(u.status_user),
  lastLogin: u.data_ult_login ?? null,
  createdAt: (u as any).data_cadastro ?? null,
  profileIds: [],
});

const apiToUiProfile = (p: PerfilRead): Profile => ({
  id: p.id_perfil,
  name: p.desc_perfil,
  description: p.desc_perfil,
});

export default function Users() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingRoles, setLoadingRoles] = useState<boolean>(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedProfileIds, setSelectedProfileIds] = useState<number[]>([]);
  const [selectedProfileForAdd, setSelectedProfileForAdd] = useState<string>("");

  // Form - novo usuário
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");

  // Form - edição
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await listUsuarios();
      const mapped = data.map(apiToUiUser);
      setUsers(mapped);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar usuários",
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
    loadUsers();
    loadProfiles();
  }, []);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return users;
    return users.filter((u) =>
      u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  const loadUserRoles = async (userId: number) => {
    try {
      setLoadingRoles(true);
      const roles = await getUserRoles(userId);
      const roleIds = roles.map(r => r.id_perfil);
      setSelectedProfileIds(roleIds);
      
      // Atualizar o usuário selecionado com os papéis carregados
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, profileIds: roleIds });
      }
    } catch (error: any) {
      toast({
        title: "Erro ao carregar papéis",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleViewUser = async (user: User) => {
    setSelectedUser(user);
    setSelectedProfileIds([]);
    setIsViewDialogOpen(true);
    await loadUserRoles(user.id);
  };

  const handleEditUser = async (user: User) => {
    setSelectedUser(user);
    setSelectedProfileIds([]);
    setSelectedProfileForAdd("");
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPhone(user.phone);
    setIsEditDialogOpen(true);
    await loadUserRoles(user.id);
  };

  const handleAddRole = async () => {
    if (!selectedUser || !selectedProfileForAdd) return;

    const perfilId = parseInt(selectedProfileForAdd);
    
    try {
      await addRoleToUserDirect(selectedUser.id, perfilId);
      toast({
        title: "Perfil atribuído",
        description: "O perfil foi vinculado ao usuário com sucesso.",
      });
      setSelectedProfileForAdd("");
      await loadUserRoles(selectedUser.id);
    } catch (error: any) {
      toast({
        title: "Erro ao atribuir perfil",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRemoveRole = async (perfilId: number) => {
    if (!selectedUser) return;

    if (!confirm("Deseja realmente remover este perfil do usuário?")) return;

    try {
      await removeRoleFromUserDirect(selectedUser.id, perfilId);
      toast({
        title: "Perfil removido",
        description: "O perfil foi desvinculado do usuário com sucesso.",
      });
      await loadUserRoles(selectedUser.id);
    } catch (error: any) {
      toast({
        title: "Erro ao remover perfil",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreateUser = async () => {
    if (!newEmail || !newPassword) {
      toast({
        title: "Erro",
        description: "E-mail e senha são obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    if (newPassword !== newPassword2) {
      toast({
        title: "Erro",
        description: "As senhas não conferem.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await createUsuario({
        nome_user: newName || undefined,
        email_user: newEmail,
        telefone_user: newPhone || undefined,
        senha_user: newPassword,
      });
      
      toast({
        title: "Usuário criado com sucesso",
        description: "O novo usuário foi adicionado ao sistema.",
      });
      
      setNewName("");
      setNewEmail("");
      setNewPhone("");
      setNewPassword("");
      setNewPassword2("");
      setIsDialogOpen(false);
      await loadUsers();
    } catch (error: any) {
      toast({
        title: "Erro ao criar usuário",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Excluir o usuário ${user.name || user.email}?`)) return;
    
    try {
      await deleteUsuario(user.id);
      toast({
        title: "Usuário excluído",
        description: "O usuário foi removido do sistema.",
      });
      await loadUsers();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir usuário",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;
    
    try {
      await updateUsuario(selectedUser.id, {
        nome_user: editName || undefined,
        telefone_user: editPhone || undefined,
      });
      
      toast({
        title: "Usuário atualizado",
        description: "As alterações foram salvas com sucesso.",
      });
      
      setIsEditDialogOpen(false);
      await loadUsers();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar alterações",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      ativo: "default",
      inativo: "secondary",
      bloqueado: "destructive",
      cancelado: "destructive",
      "pre-registro": "outline",
      visitante: "outline",
    } as const;

    const labels = {
      ativo: "Ativo",
      inativo: "Inativo",
      bloqueado: "Bloqueado",
      cancelado: "Cancelado",
      "pre-registro": "Pré-Registro",
      visitante: "Visitante",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getUserProfiles = (profileIds: number[]) => {
    return allProfiles.filter(p => profileIds.includes(p.id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
          <p className="text-muted-foreground">Gerencie os usuários do sistema</p>
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
              <DialogDescription>Preencha as informações do novo usuário</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  placeholder="Digite o nome completo"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@actionsys.com.br"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  placeholder="(11) 99999-9999"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite a senha"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirme a senha"
                  value={newPassword2}
                  onChange={(e) => setNewPassword2(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateUser}>
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
            {loading ? "Carregando..." : `Total de ${users.length} usuários cadastrados`}
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
                  <TableHead className="w-[120px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleString('pt-BR') : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleViewUser(user)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteUser(user)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Nenhum usuário encontrado.
                    </TableCell>
                  </TableRow>
                )}
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
                <p className="p-2 bg-muted rounded">{selectedUser.name || "-"}</p>
              </div>

              <div className="space-y-2">
                <Label>E-mail</Label>
                <p className="p-2 bg-muted rounded">{selectedUser.email}</p>
              </div>

              <div className="space-y-2">
                <Label>Telefone</Label>
                <p className="p-2 bg-muted rounded">{selectedUser.phone || "-"}</p>
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
                  {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString('pt-BR') : "-"}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Data de Criação</Label>
                <p className="p-2 bg-muted rounded">
                  {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString('pt-BR') : "-"}
                </p>
              </div>

              <div className="col-span-2 space-y-2">
                <Label>Perfis Atribuídos</Label>
                {loadingRoles ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Carregando papéis...
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {getUserProfiles(selectedProfileIds).map((profile) => (
                      <Badge key={profile.id} variant="secondary">
                        {profile.name}
                      </Badge>
                    ))}
                    {selectedProfileIds.length === 0 && (
                      <p className="text-sm text-muted-foreground">Nenhum perfil atribuído</p>
                    )}
                  </div>
                )}
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
                  <Input
                    id="editName"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editEmail">E-mail</Label>
                  <Input
                    id="editEmail"
                    type="email"
                    value={editEmail}
                    disabled
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="editPhone">Telefone</Label>
                  <Input
                    id="editPhone"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Perfis Atribuídos</Label>
                
                {loadingRoles ? (
                  <div className="p-4 text-center text-muted-foreground border rounded-lg">
                    Carregando papéis...
                  </div>
                ) : (
                  <>
                    {/* Lista de papéis atuais */}
                    <div className="space-y-2 border rounded-lg p-3">
                      {selectedProfileIds.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          Nenhum perfil atribuído
                        </p>
                      ) : (
                        getUserProfiles(selectedProfileIds).map((profile) => (
                          <div key={profile.id} className="flex items-center justify-between p-2 bg-muted rounded">
                            <div>
                              <p className="text-sm font-medium">{profile.name}</p>
                              <p className="text-xs text-muted-foreground">{profile.description}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleRemoveRole(profile.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Atribuir novo perfil */}
                    <div className="space-y-2">
                      <Label>Atribuir Novo Perfil</Label>
                      <div className="flex gap-2">
                        <Select value={selectedProfileForAdd} onValueChange={setSelectedProfileForAdd}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Selecione um perfil" />
                          </SelectTrigger>
                          <SelectContent>
                            {allProfiles
                              .filter(p => !selectedProfileIds.includes(p.id))
                              .map((profile) => (
                                <SelectItem key={profile.id} value={profile.id.toString()}>
                                  {profile.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <Button 
                          onClick={handleAddRole}
                          disabled={!selectedProfileForAdd}
                        >
                          Atribuir
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

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
    </div>
  );
}
