import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  FileText,
  Database,
  Paperclip
} from "lucide-react";

export default function DataClassification() {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data
  const dataItems = [
    {
      id: 1,
      name: "Contrato_Cliente_ABC.pdf",
      type: "Arquivo",
      classification: "Confidencial",
      icon: FileText,
      lastModified: "2024-01-15"
    },
    {
      id: 2,
      name: "CPF - Campo Formulário",
      type: "Campo",
      classification: "Pessoal",
      icon: Database,
      lastModified: "2024-01-14"
    },
    {
      id: 3,
      name: "Relatório Financeiro Q4",
      type: "Anexo",
      classification: "Interno",
      icon: Paperclip,
      lastModified: "2024-01-13"
    },
    {
      id: 4,
      name: "Manual do Usuário",
      type: "Arquivo",
      classification: "Público",
      icon: FileText,
      lastModified: "2024-01-12"
    },
    {
      id: 5,
      name: "Dados Bancários",
      type: "Campo",
      classification: "Confidencial",
      icon: Database,
      lastModified: "2024-01-11"
    },
  ];

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case "Público": return "default";
      case "Interno": return "secondary";
      case "Confidencial": return "destructive";
      case "Pessoal": return "outline";
      default: return "default";
    }
  };

  const filteredItems = dataItems.filter(item => {
    const matchesFilter = filter === "all" || item.classification === filter;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Classificação de Dados</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie a classificação de segurança dos dados do sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Itens Classificados</CardTitle>
          <CardDescription>
            Documentos, campos e anexos com classificação de segurança
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por classificação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as classificações</SelectItem>
                <SelectItem value="Público">Público</SelectItem>
                <SelectItem value="Interno">Interno</SelectItem>
                <SelectItem value="Confidencial">Confidencial</SelectItem>
                <SelectItem value="Pessoal">Pessoal</SelectItem>
              </SelectContent>
            </Select>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Classificação
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nova Classificação de Dados</DialogTitle>
                  <DialogDescription>
                    Adicione uma nova classificação de segurança para um item.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome do Item</Label>
                    <Input id="name" placeholder="Ex: Contrato_Cliente_XYZ.pdf" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="type">Tipo</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="arquivo">Arquivo</SelectItem>
                        <SelectItem value="campo">Campo</SelectItem>
                        <SelectItem value="anexo">Anexo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="classification">Classificação</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a classificação" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="publico">Público</SelectItem>
                        <SelectItem value="interno">Interno</SelectItem>
                        <SelectItem value="confidencial">Confidencial</SelectItem>
                        <SelectItem value="pessoal">Pessoal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Cancelar</Button>
                  <Button>Salvar Classificação</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Classificação</TableHead>
                <TableHead>Última Modificação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{item.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>
                      <Badge variant={getClassificationColor(item.classification)}>
                        {item.classification}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.lastModified}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredItems.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum item encontrado com os filtros aplicados.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}