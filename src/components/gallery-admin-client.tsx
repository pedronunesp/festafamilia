'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Trash2, Plus, Save, Eye, EyeOff, Upload, Image as ImageIcon, Info } from 'lucide-react';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';


type Photo = {
    id?: string;
    src: string;
    alt: string;
    description?: string;
    hint?: string;
    isVisible: boolean;
};

interface GalleryAdminClientProps {
  initialPhotos: Photo[];
  initialHeroImage: string;
}

export function GalleryAdminClient({ initialPhotos, initialHeroImage }: GalleryAdminClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [heroImage, setHeroImageState] = useState(initialHeroImage);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const heroFileInputRef = useRef<HTMLInputElement | null>(null);

  // Authentication check (still client-side)
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAdminAuthenticated');
    if (isAuthenticated !== 'true') {
      router.push('/admin/login');
    }
  }, [router]);

  const setHeroImage = useCallback(async (url: string) => {
    setHeroImageState(url);
    try {
      const response = await fetch('/api/admin/settings/hero-image', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: url }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Erro ao salvar imagem de fundo.");
        toast({
          variant: "destructive",
          title: "Erro",
          description: result.message || "Erro ao salvar imagem de fundo.",
        });
      }
    } catch (e) {
      console.error("Failed to update hero image", e);
      setError("Erro inesperado ao salvar imagem de fundo.");
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro inesperado ao salvar imagem de fundo.",
      });
    }
  }, [toast]);

  const handlePhotoChange = async (id: string | undefined, field: keyof Photo, value: string | boolean) => {
    const photoToUpdate = photos.find(p => p.id === id);
    if (!photoToUpdate) return;

    const updatedData = { ...photoToUpdate, [field]: value };
    setPhotos(photos.map(p => p.id === id ? updatedData : p));

    try {
      const response = await fetch(`/api/admin/photos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || result.errors?._errors?.join(', ') || "Erro ao atualizar foto.");
        toast({
          variant: "destructive",
          title: "Erro",
          description: result.message || result.errors?._errors?.join(', ') || "Erro ao atualizar foto.",
        });
        // Revert if update fails
        setPhotos(photos);
      }
    } catch (e) {
      console.error("Failed to update photo", e);
      setError("Erro inesperado ao atualizar foto.");
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro inesperado ao atualizar foto.",
      });
      setPhotos(photos);
    }
  };
  
  const handleFileUpload = async (setter: (url: string) => void, file: File) => {
    if (file.size > 5 * 1024 * 1024) { // 5MB Limit
        toast({
            variant: "destructive",
            title: "Arquivo muito grande",
            description: "Por favor, escolha uma imagem com menos de 5MB."
        });
        return;
    }

    setIsSaving(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setter(result.url);
        toast({
          title: "Upload Concluído!",
          description: "Imagem enviada para o Cloudinary e URL salva.",
        });
      } else {
        setError(result.message || "Erro ao fazer upload da imagem.");
        toast({
          variant: "destructive",
          title: "Erro de Upload",
          description: result.message || "Não foi possível fazer upload da imagem.",
        });
      }
    } catch (e) {
      console.error("Failed to upload image:", e);
      setError("Erro inesperado ao fazer upload da imagem.");
      toast({
        variant: "destructive",
        title: "Erro de Upload",
        description: "Erro inesperado ao fazer upload da imagem.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  const addPhoto = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const newPhotoData = { src: 'https://placehold.co/600x400.png', alt: 'Nova Foto', description: 'Nova descrição', hint: 'new photo', isVisible: true };
      const response = await fetch('/api/admin/photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPhotoData),
      });

      const result = await response.json();

      if (response.ok && result) {
        setPhotos(prevPhotos => [...prevPhotos, result as Photo]);
        toast({
          title: "Foto Adicionada!",
          description: "Nova foto adicionada com sucesso.",
        });
      } else {
        setError(result.message || result.errors?._errors?.join(', ') || "Erro ao adicionar foto.");
        toast({
          variant: "destructive",
          title: "Erro",
          description: result.message || result.errors?._errors?.join(', ') || "Erro ao adicionar foto.",
        });
      }
    } catch (e) {
      console.error("Failed to add photo", e);
      setError("Erro inesperado ao adicionar foto.");
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro inesperado ao adicionar foto.",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const removePhoto = async (id: string | undefined) => {
    if (!id) return;
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/photos/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPhotos(prevPhotos => prevPhotos.filter(p => p.id !== id));
        toast({
          title: "Foto Removida!",
          description: "Foto removida com sucesso.",
        });
      } else {
        const result = await response.json();
        setError(result.message || "Erro ao remover foto.");
        toast({
          variant: "destructive",
          title: "Erro",
          description: result.message || "Erro ao remover foto.",
        });
      }
    } catch (e) {
      console.error("Failed to remove photo", e);
      setError("Erro inesperado ao remover foto.");
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro inesperado ao remover foto.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const saveChanges = async () => {
    // Hero image is saved immediately on change via setHeroImage callback
    // Photo changes are saved immediately via handlePhotoChange, addPhoto, removePhoto
    toast({
      title: "Alterações Salvas!",
      description: "Todas as alterações foram salvas no banco de dados.",
    });
  };

  return (
    <div className="min-h-screen bg-muted/40 p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Gerenciar Imagens</h1>
        </div>
        <div className="flex gap-2">
            <Button onClick={saveChanges} disabled={isSaving}>
                {isSaving ? 'Salvando...' : <><Save className="mr-2 h-4 w-4" /> Salvar Alterações</>}
            </Button>
        </div>
      </div>
      
      <Alert className="mb-6 bg-primary/20 border-primary/50">
          <Info className="h-4 w-4 !text-primary-foreground" />
          <AlertTitle className="font-bold">Como as alterações funcionam?</AlertTitle>
          <AlertDescription>
           As imagens e textos são salvos <strong>diretamente no banco de dados</strong>. As alterações serão visíveis imediatamente após o salvamento.
          </AlertDescription>
      </Alert>

      {error && (
        <Alert variant="destructive" className="mb-6">
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* WARNING FOR IMAGE UPLOAD */}
      <Alert variant="success" className="mb-6 bg-green-100 border-green-400 text-green-800">
          <Info className="h-4 w-4" />
          <AlertTitle>Upload de Imagens Configurado!</AlertTitle>
          <AlertDescription>
            Agora você pode fazer upload de imagens diretamente do seu dispositivo. Elas serão enviadas para o Cloudinary e a URL será salva no banco de dados.
            Alternativamente, você ainda pode colar a URL de uma imagem já hospedada.
          </AlertDescription>
      </Alert>

      {/* Hero Background Image Section */}
      <Card className="mb-8">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5" /> Imagem de Fundo da Página</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-full md:w-1/2 lg:w-1/3">
                    <div className="aspect-video relative mb-4 border rounded-md overflow-hidden">
                        <Image
                            src={heroImage}
                            alt="Pré-visualização da imagem de fundo"
                            unoptimized
                            fill
                            className="rounded-md object-cover"
                        />
                    </div>
                </div>
                <div className="w-full md:w-1/2 lg:w-2/3 space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Esta é a imagem principal que aparece no topo do site. Use uma imagem panorâmica (formato 16:9).
                    </p>
                    <div>
                        <Label htmlFor="hero-upload">Substituir Imagem</Label>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => heroFileInputRef.current?.click()}
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                Fazer Upload
                            </Button>
                            <input
                                type="file"
                                id="hero-upload"
                                ref={heroFileInputRef}
                                className="hidden"
                                accept="image/png, image/jpeg, image/gif, image/webp"
                                onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                        handleFileUpload(setHeroImage, e.target.files[0]);
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="hero-url">Ou cole a URL da imagem</Label>
                        <Input
                            id="hero-url"
                            value={heroImage}
                            onChange={(e) => setHeroImage(e.target.value)}
                            placeholder="https://exemplo.com/imagem.png"
                        />
                    </div>
                </div>
            </div>
        </CardContent>
      </Card>

      <Separator className="mb-8" />
      
      {/* Photo Gallery Section */}
      <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Galeria de Memórias</h2>
          <Button onClick={addPhoto}>
              <Plus className="mr-2 h-4 w-4" /> Adicionar Foto à Galeria
          </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {photos.map((photo, index) => (
          <Card key={photo.id || index} className={!photo.isVisible ? 'bg-muted/50 border-dashed' : ''}>
            <CardContent className="p-4">
              <div className="aspect-video relative mb-4">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  unoptimized
                  fill
                  className={`rounded-md object-cover transition-opacity ${!photo.isVisible ? 'opacity-50' : ''}`}
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <Label htmlFor={`visible-${photo.id || index}`} className="flex items-center gap-2">
                       {photo.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                       {photo.isVisible ? 'Visível' : 'Oculto'}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {photo.isVisible ? 'Aparecerá na galeria.' : 'Não aparecerá.'}
                    </p>
                  </div>
                  <Switch
                    id={`visible-${photo.id || index}`}
                    checked={photo.isVisible}
                    onCheckedChange={(checked) => handlePhotoChange(photo.id, 'isVisible', checked)}
                  />
                </div>
                <div>
                  <Label htmlFor={`upload-${photo.id || index}`}>Imagem</Label>
                  <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => fileInputRefs.current[index]?.click()}
                  >
                      <Upload className="mr-2 h-4 w-4" />
                      Fazer Upload
                  </Button>
                   <input
                      type="file"
                      id={`upload-${photo.id || index}`}
                      ref={(el) => { fileInputRefs.current[index] = el; }}
                      className="hidden"
                      accept="image/png, image/jpeg, image/gif, image/webp"
                      onChange={(e) => {
                          if (e.target.files?.[0]) {
                              handleFileUpload((url) => handlePhotoChange(photo.id, 'src', url), e.target.files[0]);
                          }
                      }}
                  />
                </div>
                <div>
                  <Label htmlFor={`description-${photo.id || index}`}>Descrição</Label>
                  <Input
                    id={`description-${photo.id || index}`}
                    value={photo.description || ''}
                    onChange={(e) => handlePhotoChange(photo.id, 'description', e.target.value)}
                    placeholder="Descrição da foto"
                  />
                </div>
                <div>
                  <Label htmlFor={`alt-${photo.id || index}`}>Texto Alternativo (Acessibilidade)</Label>
                  <Input
                    id={`alt-${photo.id || index}`}
                    value={photo.alt}
                    onChange={(e) => handlePhotoChange(photo.id, 'alt', e.target.value)}
                  />
                </div>
                 <div>
                  <Label htmlFor={`hint-${photo.id || index}`}>Dica de IA (máx. 2 palavras)</Label>
                  <Input
                    id={`hint-${photo.id || index}`}
                    value={photo.hint || ''}
                    onChange={(e) => handlePhotoChange(photo.id, 'hint', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => removePhoto(photo.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remover
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
