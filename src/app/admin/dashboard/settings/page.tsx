'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Info } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


const defaultContent = {
  heroTitle: "Festa da Família",
  heroSubtitle: "Teixeira, Tavares & Faria",
  heroDescription: "Junte-se a nós para um dia inesquecível de alegria, memórias e muita comida boa!",
  heroButton: "Confirmar Presença",
  // heroBackgroundImage is now managed in the gallery page
  countdownTitle: "Falta Pouco!",
  countdownDescription: "A contagem regressiva para o nosso grande dia já começou. Prepare-se!",
  detailsTitle: "Detalhes do Evento",
  detailsDescription: "Tudo o que você precisa saber para não perder nada.",
  eventDate: "18 de Outubro, 2025",
  eventTime: "A partir das 10:00h",
  eventLocationName: "Sítio Malícia",
  locationTitle: "Como Chegar",
  locationAddress: "Sítio Malícia - Pedra do Indaiá, Minas Gerais, 35565-000",
  galleryTitle: "Mural de Memórias",
  galleryDescription: "Relembre alguns dos nossos momentos mais especiais.",
  rsvpTitle: "Confirme Sua Presença",
  rsvpDescription: "Sua resposta é muito importante para nós. Por favor, confirme até 10 de Dezembro.",
  footerText: "Feito com ❤️ para a grande família Teixeira, Tavares & Faria.",
};

// We remove heroBackgroundImage from this type as it's no longer managed here.
export type SiteContent = Omit<typeof defaultContent, 'heroBackgroundImage'> & { heroBackgroundImage?: string };


export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAdminAuthenticated');
    if (isAuthenticated !== 'true') {
      router.push('/admin/login');
      return;
    }
    const savedContent = localStorage.getItem('siteContent');
    if (savedContent) {
      setContent(prev => ({...prev, ...JSON.parse(savedContent)}));
    }
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setContent(prev => ({ ...prev, [id]: value }));
  };

  const saveChanges = () => {
    setIsSaving(true);
    // When saving, we don't want to overwrite the heroBackgroundImage managed elsewhere
    const { heroBackgroundImage, ...contentToSave } = content;
    const currentFullContentRaw = localStorage.getItem('siteContent');
    const currentFullContent = currentFullContentRaw ? JSON.parse(currentFullContentRaw) : {};
    
    const newContent = { ...currentFullContent, ...contentToSave };

    localStorage.setItem('siteContent', JSON.stringify(newContent));
    
    setTimeout(() => {
      toast({
        title: "Configurações Salvas!",
        description: "Suas alterações foram salvas com sucesso no seu navegador.",
      });
      setIsSaving(false);
    }, 1000);
  };
  
  const createFormField = (id: keyof SiteContent, label: string, type: 'input' | 'textarea' = 'input') => {
    const Component = type === 'input' ? Input : Textarea;
    return (
      <div className="space-y-2">
        <Label htmlFor={id}>{label}</Label>
        <Component id={id} value={content[id as keyof typeof content] || ''} onChange={handleInputChange} />
      </div>
    );
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
          <h1 className="text-2xl font-bold">Configurações Gerais</h1>
        </div>
        <Button onClick={saveChanges} disabled={isSaving}>
          {isSaving ? 'Salvando...' : <><Save className="mr-2 h-4 w-4" /> Salvar Alterações</>}
        </Button>
      </div>

       <Alert className="mb-6 bg-primary/20 border-primary/50">
          <Info className="h-4 w-4 !text-primary-foreground" />
          <AlertTitle className="font-bold">Como as alterações funcionam?</AlertTitle>
          <AlertDescription>
           As imagens e textos são salvos <strong>apenas no seu navegador</strong>. Para que seus convidados vejam as mudanças, você precisa fazer o deploy do site novamente.
          </AlertDescription>
      </Alert>
      
      <Card>
        <CardContent className="p-6 space-y-8">
            {/* Hero Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">Seção Principal (Topo)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {createFormField('heroTitle', 'Título Principal')}
                {createFormField('heroSubtitle', 'Subtítulo')}
                {createFormField('heroDescription', 'Descrição', 'textarea')}
                {createFormField('heroButton', 'Texto do Botão')}
              </div>
            </div>
            <Separator />

            {/* Countdown Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">Contagem Regressiva</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {createFormField('countdownTitle', 'Título')}
                {createFormField('countdownDescription', 'Descrição', 'textarea')}
              </div>
            </div>
            <Separator />
            
            {/* Details Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">Detalhes do Evento</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {createFormField('detailsTitle', 'Título da Seção')}
                  {createFormField('detailsDescription', 'Descrição da Seção')}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  {createFormField('eventDate', 'Data do Evento')}
                  {createFormField('eventTime', 'Horário do Evento')}
                  {createFormField('eventLocationName', 'Nome do Local')}
              </div>
            </div>
            <Separator />

            {/* Location Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">Seção do Local</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {createFormField('locationTitle', 'Título')}
                {createFormField('locationAddress', 'Endereço Completo')}
              </div>
            </div>
            <Separator />
            
            {/* Gallery Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">Galeria</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {createFormField('galleryTitle', 'Título')}
                  {createFormField('galleryDescription', 'Descrição', 'textarea')}
              </div>
            </div>
            <Separator />

            {/* RSVP Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">Confirmação de Presença (RSVP)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {createFormField('rsvpTitle', 'Título')}
                {createFormField('rsvpDescription', 'Descrição', 'textarea')}
              </div>
            </div>
            <Separator />

            {/* Footer Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">Rodapé</h3>
              {createFormField('footerText', 'Texto do Rodapé')}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
