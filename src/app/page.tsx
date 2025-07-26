'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin, Settings, MessageSquarePlus } from 'lucide-react';
import { Countdown } from '@/components/countdown';
import { MapView } from '@/components/map-view';
import { PhotoGallery } from '@/components/photo-gallery';
import { RsvpForm } from '@/components/rsvp-form';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import type { SiteContent } from './admin/dashboard/settings/page';

const defaultContent: SiteContent = {
  heroTitle: "Festa da Família",
  heroSubtitle: "Teixeira, Tavares & Faria",
  heroDescription: "Junte-se a nós para um dia inesquecível de alegria, memórias e muita comida boa!",
  heroButton: "Confirmar Presença",
  heroBackgroundImage: "https://placehold.co/1920x1080.png",
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

export default function Home() {
    const [content, setContent] = useState<SiteContent>(defaultContent);

    useEffect(() => {
        const savedContent = localStorage.getItem('siteContent');
        if (savedContent) {
            try {
                const parsedContent = JSON.parse(savedContent);
                // Merge with defaults to ensure all fields are present
                setContent({...defaultContent, ...parsedContent});
            } catch (e) {
                console.error("Failed to parse site content from localStorage", e);
                setContent(defaultContent);
            }
        }
    }, []);

  const whatsappNumber = "5537998617771";
  const whatsappMessage = encodeURIComponent("Olá! Gostaria de enviar uma foto para o mural de memórias.");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
      <main className="flex-grow">
        {/* Hero Section */}
        <section
          id="home"
          className="relative text-center py-20 md:py-32 lg:py-40 bg-primary/30 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent z-10"></div>
          {content.heroBackgroundImage && <Image
            src={content.heroBackgroundImage}
            alt="Família reunida à mesa de jantar"
            data-ai-hint="family dinner"
            fill
            objectFit="cover"
            className="opacity-20"
            key={content.heroBackgroundImage} // Add key to force re-render on change
          />}
          <div className="container mx-auto px-4 relative z-20">
            <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              {content.heroTitle}
            </h1>
            <p className="mt-4 text-2xl md:text-4xl font-headline text-accent-foreground">
              {content.heroSubtitle}
            </p>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
              {content.heroDescription}
            </p>
            <Button asChild size="lg" className="mt-8 text-base py-6 px-8">
              <a href="#rsvp">{content.heroButton}</a>
            </Button>
          </div>
        </section>

        {/* Countdown Section */}
        <section id="countdown" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-2">{content.countdownTitle}</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">{content.countdownDescription}</p>
            <Countdown />
          </div>
        </section>

        <Separator className="my-0 max-w-4xl mx-auto" />
        
        {/* Event Details Section */}
        <section id="details" className="py-16 md:py-24 bg-primary/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-headline font-bold">{content.detailsTitle}</h2>
              <p className="text-muted-foreground mt-2">{content.detailsDescription}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="text-center shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
                <CardHeader>
                  <Calendar className="mx-auto h-12 w-12 text-accent" />
                </CardHeader>
                <CardContent>
                  <CardTitle className="font-headline text-xl mb-2">Data</CardTitle>
                  <p className="text-lg">{content.eventDate}</p>
                </CardContent>
              </Card>
              <Card className="text-center shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
                <CardHeader>
                  <Clock className="mx-auto h-12 w-12 text-accent" />
                </CardHeader>
                <CardContent>
                  <CardTitle className="font-headline text-xl mb-2">Horário</CardTitle>
                  <p className="text-lg">{content.eventTime}</p>
                </CardContent>
              </Card>
              <Card className="text-center shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
                <CardHeader>
                  <MapPin className="mx-auto h-12 w-12 text-accent" />
                </CardHeader>
                <CardContent>
                  <CardTitle className="font-headline text-xl mb-2">Local</CardTitle>
                  <p className="text-lg">{content.eventLocationName}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Location Section */}
        <section id="location" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-headline font-bold">{content.locationTitle}</h2>
              <p className="text-muted-foreground mt-2">{content.locationAddress}</p>
            </div>
            <div className="max-w-4xl mx-auto">
              <MapView />
            </div>
          </div>
        </section>

        <Separator className="my-0 max-w-4xl mx-auto" />

        {/* Gallery Section */}
        <section id="gallery" className="py-16 md:py-24 bg-primary/20">
           <div className="container mx-auto px-4">
             <div className="text-center mb-12">
               <h2 className="text-3xl md:text-4xl font-headline font-bold">{content.galleryTitle}</h2>
               <p className="text-muted-foreground mt-2">{content.galleryDescription}</p>
             </div>
             <div className="max-w-6xl mx-auto">
              <PhotoGallery />
             </div>
             <div className="text-center mt-12">
                <p className="text-muted-foreground mb-4">Quer ver a sua foto aqui? Envie para nós!</p>
                <Button asChild>
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                        <MessageSquarePlus className="mr-2 h-5 w-5" />
                        Enviar foto por WhatsApp
                    </a>
                </Button>
             </div>
           </div>
        </section>

        {/* RSVP Section */}
        <section id="rsvp" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-headline font-bold">{content.rsvpTitle}</h2>
              <p className="text-muted-foreground mt-2">{content.rsvpDescription}</p>
            </div>
            <div className="flex justify-center">
              <RsvpForm />
            </div>
          </div>
        </section>

      </main>
      <footer className="bg-foreground text-background text-center p-6 relative">
        <p>{content.footerText}</p>
        <p className="text-sm opacity-70 mt-1">&copy; {new Date().getFullYear()} Todos os direitos reservados.</p>
        <div className="absolute bottom-2 right-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin/login" title="Acesso Administrativo">
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
        </div>
      </footer>
    </div>
  );
}
