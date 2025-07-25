'use client';

import { useState, useEffect, useRef } from 'react';
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

const initialPhotos = [
  { src: "https://placehold.co/600x400.png", alt: "Foto de família 1", description: "O início de tudo", hint: "family gathering", isVisible: true },
  { src: "https://placehold.co/400x600.png", alt: "Foto de família 2", description: "Celebração especial", hint: "family party", isVisible: true },
  { src: "https://placehold.co/600x400.png", alt: "Foto de família 3", description: "Risadas e alegria", hint: "celebration dinner", isVisible: true },
  { src: "https://placehold.co/600x400.png", alt: "Foto de família 4", description: "Dia de sol", hint: "outdoor barbecue", isVisible: true },
  { src: "https://placehold.co/400x600.png", alt: "Foto de família 5", description: "Momento doce", hint: "birthday cake", isVisible: true },
  { src: "https://placehold.co/600x400.png", alt: "Foto de família 6", description: "Todos reunidos", hint: "group photo", isVisible: true },
];

const defaultHeroImage = "https://placehold.co/1920x1080.png";

type Photo = {
    src: string;
    alt: string;
    description: string;
    hint: string;
    isVisible: boolean;
};

export default function GalleryAdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [heroImage, setHeroImage] = useState(defaultHeroImage);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const heroFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAdminAuthenticated');
    if (isAuthenticated !== 'true') {
      router.push('/admin/login');
    }
    // Load photos from localStorage if available
    try {
      const savedPhotos = localStorage.getItem('galleryPhotos');
      if (savedPhotos) {
        const parsedPhotos = JSON.parse(savedPhotos).map((p: any) => ({...p, isVisible: p.isVisible !== false, description: p.description || ''}));
        setPhotos(parsedPhotos);
      }
      const siteContent = localStorage.getItem('siteContent');
      if (siteContent) {
        setHeroImage(JSON.parse(siteContent).heroBackgroundImage || defaultHeroImage);
      }
    } catch(e) {
      setError("Falha ao carregar os dados salvos. O armazenamento local pode estar corrompido.");
      console.error(e);
    }
  }, [router]);

  const handlePhotoChange = (index: number, field: keyof Photo, value: string | boolean) => {
    const newPhotos = [...photos];
    newPhotos[index] = { ...newPhotos[index], [field]: value };
    setPhotos(newPhotos);
  };
  
  const handleFileUpload = (setter: (url: string) => void, file: File) => {
    if (file.size > 5 * 1024 * 1024) { // 5MB Limit
        toast({
            variant: "destructive",
            title: "Arquivo muito grande",
            description: "Por favor, escolha uma imagem com menos de 5MB."
        });
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        if(event.target?.result) {
            setter(event.target.result as string);
        }
    };
    reader.onerror = () => {
         toast({
            variant: "destructive",
            title: "Erro de Leitura",
            description: "Não foi possível ler o arquivo da imagem."
        });
    }
    reader.readAsDataURL(file);
  }

  const addPhoto = () => {
    setPhotos([...photos, { src: 'https://placehold.co/600x400.png', alt: 'Nova Foto', description: 'Nova descrição', hint: 'new photo', isVisible: true }]);
  };
  
  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
  };

  const saveChanges = () => {
    setIsSaving(true);
    setError(null);
    try {
      localStorage.setItem('galleryPhotos', JSON.stringify(photos));

      const siteContentRaw = localStorage.getItem('siteContent');
      const siteContent = siteContentRaw ? JSON.parse(siteContentRaw) : {};
      siteContent.heroBackgroundImage = heroImage;
      localStorage.setItem('siteContent', JSON.stringify(siteContent));

      toast({
        title: "Galeria Salva!",
        description: "Suas alterações foram salvas com sucesso no seu navegador.",
      });
    } catch (e: any) {
        console.error("Failed to save to localStorage", e);
        if (e.name === 'QuotaExceededError') {
             setError("Erro: O armazenamento do navegador está cheio. Tente remover algumas imagens ou use arquivos menores e otimizados.");
        } else {
             setError("Erro ao salvar. Verifique o console para mais detalhes.");
        }
    } finally {
        setIsSaving(false);
    }
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
           As imagens e textos são salvos <strong>apenas no seu navegador</strong>. Para que seus convidados vejam as mudanças, você precisa <strong>reimplantar o site</strong> usando o comando `firebase deploy --only hosting` no terminal.
          </AlertDescription>
      </Alert>

      {error && (
        <Alert variant="destructive" className="mb-6">
            <AlertTitle>Erro de Armazenamento</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
          <Card key={index} className={!photo.isVisible ? 'bg-muted/50 border-dashed' : ''}>
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
                    <Label htmlFor={`visible-${index}`} className="flex items-center gap-2">
                       {photo.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                       {photo.isVisible ? 'Visível' : 'Oculto'}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {photo.isVisible ? 'Aparecerá na galeria.' : 'Não aparecerá.'}
                    </p>
                  </div>
                  <Switch
                    id={`visible-${index}`}
                    checked={photo.isVisible}
                    onCheckedChange={(checked) => handlePhotoChange(index, 'isVisible', checked)}
                  />
                </div>
                <div>
                  <Label htmlFor={`upload-${index}`}>Imagem</Label>
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
                      id={`upload-${index}`}
                      ref={(el) => (fileInputRefs.current[index] = el)}
                      className="hidden"
                      accept="image/png, image/jpeg, image/gif, image/webp"
                      onChange={(e) => {
                          if (e.target.files?.[0]) {
                              handleFileUpload((url) => handlePhotoChange(index, 'src', url), e.target.files[0]);
                          }
                      }}
                  />
                </div>
                <div>
                  <Label htmlFor={`description-${index}`}>Descrição</Label>
                  <Input
                    id={`description-${index}`}
                    value={photo.description}
                    onChange={(e) => handlePhotoChange(index, 'description', e.target.value)}
                    placeholder="Descrição da foto"
                  />
                </div>
                <div>
                  <Label htmlFor={`alt-${index}`}>Texto Alternativo (Acessibilidade)</Label>
                  <Input
                    id={`alt-${index}`}
                    value={photo.alt}
                    onChange={(e) => handlePhotoChange(index, 'alt', e.target.value)}
                  />
                </div>
                 <div>
                  <Label htmlFor={`hint-${index}`}>Dica de IA (máx. 2 palavras)</Label>
                  <Input
                    id={`hint-${index}`}
                    value={photo.hint}
                    onChange={(e) => handlePhotoChange(index, 'hint', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => removePhoto(index)}
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
