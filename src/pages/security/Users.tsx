import { useEffect, useMemo, useState } from "react";
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
import {
  listUsuarios,
  getUsuario,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  type Usuario
} from "../../services/users"; // ajuste o caminho se necessário

// --- Tipos locais (UI) ---
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
  profiles: Profile[]; // mock (não integrado ainda)
}

// --- Mocks de perfis (mantidos só para UI local) ---
const mockProfiles: Profile[] = [
  { id: 1, name: "Administrador", description: "Acesso total ao sistema" },
  { id: 2, name: "Gerente", description: "Gerenciamento de equipes e projetos" },
  { id: 3, name: "Consultor / Analista", description: "Criação e análise de propostas" }
];

// --- Helpers de mapeamento ---
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
  createdAt: (u as any).data_cadastro ?? null, // o schema Read expõe data_cadastro
  profiles: [] // não integrado ainda
});

export default function Users() {
  // estado principal
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // busca
  const [searchTerm, setSearchTerm] = useState("");

  // dialogs
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // seleção e perfis (mock)
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedProfiles, setSelectedProfiles] = useState<Profile[]>([]);

  // form - novo usuário
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  // status no create não é enviado para o backend (mantemos a UI mas ignoramos no submit)
  const [newStatusUi, setNewStatusUi] = useState<User["status"] | undefined>(undefined);

  // form - edição
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState(""); // desabilitado (não editamos e-mail no backend)
  const [editPhone, setEditPhone] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  // status no edit NÃO é enviado
  const [editStatusUi, setEditStatusUi] = useState<User["status"] | undefined>(undefined);

  // carregar lista
  const load = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await listUsuarios();
      const mapped = data.map(apiToUiUser);
      setUsers(mapped);
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.detail || "Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // filtros
  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return users;
    return users.filter((u) =>
      u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  // dialogs actions
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setSelectedProfiles(user.profiles);
    // preencher formulário
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPhone(user.phone);
    setEditAvatar("");
    setEditStatusUi(user.status); // somente visual
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
    const availableProfiles = mockProfiles.filter(
      profile => !selectedProfiles.some(sp => sp.id === profile.id)
    );
    if (availableProfiles.length > 0) {
      setSelectedProfiles(prev => [...prev, availableProfiles[0]]);
    }
  };

  const saveUserProfiles = async () => {
    // Aqui o backend ainda não recebe perfis, então apenas fecha modal
    setIsEditDialogOpen(false);
  };

  // criar usuário
  const handleCreateUser = async () => {
    if (!newEmail || !newPassword) {
      alert("E-mail e senha são obrigatórios.");
      return;
    }
    if (newPassword !== newPassword2) {
      alert("As senhas não conferem.");
      return;
    }
    try {
      await createUsuario({
        nome_user: newName || undefined,
        email_user: newEmail,
        telefone_user: newPhone || undefined,
        senha_user: newPassword,
      });
      // limpar form e fechar
      setNewName("");
      setNewEmail("");
      setNewPhone("");
      setNewPassword("");
      setNewPassword2("");
      setNewStatusUi(undefined);
      setIsDialogOpen(false);
      // recarregar
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.detail || "Erro ao criar usuário");
    }
  };

  // excluir usuário
  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Excluir o usuário ${user.name || user.email}?`)) return;
    try {
      await deleteUsuario(user.id);
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.detail || "Erro ao excluir usuário");
    }
  };

  // editar usuário
  const handleSaveEdit = async () => {
    if (!selectedUser) return;
    try {
      await updateUsuario(selectedUser.id, {
        nome_user: editName || undefined,
        telefone_user: editPhone || undefined,
        url_avatar_user: editAvatar || undefined,
        // status_user NÃO é enviado no PATCH
      });
      setIsEditDialogOpen(false);
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.detail || "Erro ao salvar alterações");
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

              {/* Status NÃO é enviado no POST; mantido apenas visual */}
              <div className="space-y-2 opacity-60">
                <Label htmlFor="status">Status (somente visual)</Label>
                <Select
                  value={newStatusUi}
                  onValueChange={(v) => setNewStatusUi(v as User["status"])}
                  disabled
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pré-Registro" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pre-registro">Pré-Registro (default)</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                    <SelectItem value="bloqueado">Bloqueado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                    <SelectItem value="visitante">Visitante</SelectItem>
                  </SelectContent>
                </Select>
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
            {errorMsg && <span className="text-red-600 ml-2">{errorMsg}</span>}
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
                    disabled // e-mail não é editável no backend atual
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editPhone">Telefone</Label>
                  <Input
                    id="editPhone"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editStatus">Status</Label>
                  <Select value={editStatusUi} disabled>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pre-registro">Pré-Registro</SelectItem>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                      <SelectItem value="bloqueado">Bloqueado</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                      <SelectItem value="visitante">Visitante</SelectItem>
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
            <Button onClick={handleSaveEdit}>
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
