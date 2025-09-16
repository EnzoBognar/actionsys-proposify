import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Camera,
  Edit3,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Building2,
  CreditCard,
  Shield,
} from "lucide-react";

// Mock data - in real app this would come from props/params and API
const mockUser = {
  id: "current-user",
  name: "João Silva Santos",
  treatment: "Sr.", // Nova propriedade para forma de tratamento
  email: "joao.silva@actionsys.com.br",
  role: "Analista de Sistemas",
  department: "Tecnologia da Informação",
  status: "ativo",
  phone: "+55 11 99999-9999",
  cpf: "123.456.789-00",
  joinDate: "2023-01-15",
  location: "São Paulo, SP",
  bio: "Desenvolvedor Full Stack com experiência em React, Node.js e sistemas distribuídos. Apaixonado por tecnologia e inovação.",
  avatarUrl: "",
  bannerUrl: "",
  isActive: true,
};

// This would be determined by comparing current user ID with profile user ID
const isOwnProfile = true; // Mock - in real app: currentUserId === profileUserId

export default function Profile() {
  const [user, setUser] = useState(mockUser);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [isEditingBanner, setIsEditingBanner] = useState(false);

  const getStatusBadge = (status: string) => {
    return status === "ativo" ? (
      <Badge variant="default" className="bg-green-500 hover:bg-green-600">
        Ativo
      </Badge>
    ) : (
      <Badge variant="secondary">
        Inativo
      </Badge>
    );
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In real app, upload to server/storage
      const reader = new FileReader();
      reader.onload = (e) => {
        setUser({ ...user, avatarUrl: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In real app, upload to server/storage
      const reader = new FileReader();
      reader.onload = (e) => {
        setUser({ ...user, bannerUrl: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Banner Section */}
      <div className="relative h-48 bg-gradient-to-r from-primary/20 to-primary/10 overflow-hidden">
        {user.bannerUrl ? (
          <img 
            src={user.bannerUrl} 
            alt="Banner do perfil" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary/20 to-primary/10" />
        )}
        
        {/* Edit Banner Button - Only for own profile */}
        {isOwnProfile && (
          <div className="absolute top-4 right-4">
            <Dialog open={isEditingBanner} onOpenChange={setIsEditingBanner}>
              <DialogTrigger asChild>
                <Button variant="secondary" size="sm" className="backdrop-blur-sm bg-background/80">
                  <Camera className="h-4 w-4 mr-2" />
                  Editar Banner
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Alterar Banner</DialogTitle>
                  <DialogDescription>
                    Escolha uma nova imagem para o banner do seu perfil
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Label htmlFor="banner-upload">Nova imagem do banner</Label>
                  <Input
                    id="banner-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleBannerChange}
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsEditingBanner(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={() => setIsEditingBanner(false)}>
                      Salvar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-6 -mt-16 relative z-10">
        {/* Profile Photo and Basic Info */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              {/* Edit Photo Button - Only for own profile */}
              {isOwnProfile && (
                <Dialog open={isEditingPhoto} onOpenChange={setIsEditingPhoto}>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Alterar Foto de Perfil</DialogTitle>
                      <DialogDescription>
                        Escolha uma nova foto para o seu perfil
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Label htmlFor="photo-upload">Nova foto de perfil</Label>
                      <Input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsEditingPhoto(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={() => setIsEditingPhoto(false)}>
                          Salvar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    {user.treatment && user.treatment !== "Sem tratamento" 
                      ? `${user.treatment} ${user.name}` 
                      : user.name}
                  </h1>
                  <p className="text-lg text-muted-foreground mt-1">{user.role}</p>
                </div>
                
                {/* Edit Profile Button - Only for own profile */}
                {isOwnProfile && (
                  <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Edit3 className="h-4 w-4 mr-2" />
                        Editar Perfil
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Editar Perfil</DialogTitle>
                        <DialogDescription>
                          Atualize suas informações pessoais
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="treatment">Forma de Tratamento</Label>
                          <Select defaultValue={user.treatment}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma forma de tratamento" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Sr.">Sr.</SelectItem>
                              <SelectItem value="Sra.">Sra.</SelectItem>
                              <SelectItem value="Mx.">Mx.</SelectItem>
                              <SelectItem value="Prof.">Prof.</SelectItem>
                              <SelectItem value="Dr.">Dr.</SelectItem>
                              <SelectItem value="Dra.">Dra.</SelectItem>
                              <SelectItem value="Sem tratamento">Sem tratamento definido</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="name">Nome Completo</Label>
                          <Input id="name" defaultValue={user.name} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role">Cargo</Label>
                          <Input id="role" defaultValue={user.role} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="department">Departamento</Label>
                          <Input id="department" defaultValue={user.department} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Telefone</Label>
                          <Input id="phone" defaultValue={user.phone} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="bio">Biografia</Label>
                          <Textarea id="bio" defaultValue={user.bio} rows={3} />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={() => setIsEditingProfile(false)}>
                          Salvar Alterações
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {user.department}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Desde {new Date(user.joinDate).toLocaleDateString('pt-BR')}
                </div>
                {getStatusBadge(user.status)}
              </div>

              {user.bio && (
                <p className="text-muted-foreground">{user.bio}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Public Information */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações de Contato
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.department}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.location}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Private Information - Only visible to own profile */}
          {isOwnProfile && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Informações Pessoais
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">CPF: {user.cpf}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Data de admissão: {new Date(user.joinDate).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}