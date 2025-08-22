import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface Permission {
  id: number;
  name: string;
  description: string;
  process: string;
  status: 'ativo' | 'inativo';
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  report: boolean;
  createdAt: string;
}

const mockPermissions: Permission[] = [
  {
    id: 1,
    name: "Gerenciar Usuários",
    description: "Permite criar, editar e excluir usuários",
    process: "usuarios",
    status: "ativo",
    create: true,
    read: true,
    update: true,
    delete: true,
    report: true,
    createdAt: "2024-01-01 10:00:00"
  },
  {
    id: 2,
    name: "Visualizar Usuários",
    description: "Permite apenas visualizar a lista de usuários",
    process: "usuarios",
    status: "ativo",
    create: false,
    read: true,
    update: false,
    delete: false,
    report: true,
    createdAt: "2024-01-01 10:00:00"
  },
  {
    id: 3,
    name: "Gerenciar Propostas",
    description: "Controle total sobre propostas comerciais",
    process: "propostas",
    status: "ativo",
    create: true,
    read: true,
    update: true,
    delete: false,
    report: true,
    createdAt: "2024-01-01 10:00:00"
  },
  {
    id: 4,
    name: "Visualizar Relatórios",
    description: "Acesso aos relatórios do sistema",
    process: "relatorios",
    status: "ativo",
    create: false,
    read: true,
    update: false,
    delete: false,
    report: true,
    createdAt: "2024-01-01 10:00:00"
  }
];

export default function Permissions() {
  const [permissions, setPermissions] = useState<Permission[]>(mockPermissions);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredPermissions = permissions.filter(permission =>
    permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.process.toLowerCase().includes(searchTerm.toLowerCase())
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

  const PermissionIcon = ({ allowed }: { allowed: boolean }) => (
    allowed ? (
      <Check className="h-4 w-4 text-green-600" />
    ) : (
      <X className="h-4 w-4 text-red-500" />
    )
  );

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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Permissão</Label>
                  <Input id="name" placeholder="Digite o nome da permissão" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="process">Processo</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o processo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usuarios">Usuários</SelectItem>
                      <SelectItem value="perfis">Perfis</SelectItem>
                      <SelectItem value="propostas">Propostas</SelectItem>
                      <SelectItem value="relatorios">Relatórios</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea 
                  id="description" 
                  placeholder="Descreva o que esta permissão permite fazer"
                  className="resize-none"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Operações Permitidas</Label>
                <div className="grid grid-cols-5 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="create" />
                    <Label htmlFor="create" className="text-sm">Criar</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="read" />
                    <Label htmlFor="read" className="text-sm">Consultar</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="update" />
                    <Label htmlFor="update" className="text-sm">Atualizar</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="delete" />
                    <Label htmlFor="delete" className="text-sm">Excluir</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="report" />
                    <Label htmlFor="report" className="text-sm">Relatórios</Label>
                  </div>
                </div>
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
            Total de {permissions.length} permissões cadastradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, descrição ou processo..."
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
                  <TableHead>Processo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">C</TableHead>
                  <TableHead className="text-center">R</TableHead>
                  <TableHead className="text-center">U</TableHead>
                  <TableHead className="text-center">D</TableHead>
                  <TableHead className="text-center">Rep</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPermissions.map((permission) => (
                  <TableRow key={permission.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{permission.name}</div>
                        <div className="text-sm text-muted-foreground max-w-xs truncate">
                          {permission.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{permission.process}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(permission.status)}</TableCell>
                    <TableCell className="text-center">
                      <PermissionIcon allowed={permission.create} />
                    </TableCell>
                    <TableCell className="text-center">
                      <PermissionIcon allowed={permission.read} />
                    </TableCell>
                    <TableCell className="text-center">
                      <PermissionIcon allowed={permission.update} />
                    </TableCell>
                    <TableCell className="text-center">
                      <PermissionIcon allowed={permission.delete} />
                    </TableCell>
                    <TableCell className="text-center">
                      <PermissionIcon allowed={permission.report} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
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
    </div>
  );
}