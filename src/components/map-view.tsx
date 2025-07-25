'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Map } from 'lucide-react';

const defaultAddress = "Sítio Malícia - Pedra do Indaiá, Minas Gerais, 35565-000";

export function MapView() {
  const [address, setAddress] = useState(defaultAddress);

  useEffect(() => {
    const savedContent = localStorage.getItem('siteContent');
    if (savedContent) {
        try {
            const parsedContent = JSON.parse(savedContent);
            if(parsedContent.locationAddress) {
                setAddress(parsedContent.locationAddress);
            }
        } catch (e) {
            console.error("Failed to parse site content for map address", e);
        }
    }
  }, []);

  // O parâmetro 't=k' define a visualização do mapa para satélite.
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=k&z=17&ie=UTF8&iwloc=&output=embed`;
  const navigationUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="aspect-video h-auto w-full max-w-4xl rounded-lg overflow-hidden shadow-lg border border-border">
        <iframe
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={mapEmbedUrl}
          title={`Mapa mostrando a localização de ${address}`}
        >
        </iframe>
      </div>
      <Button asChild size="lg">
        <a href={navigationUrl} target="_blank" rel="noopener noreferrer">
          <Map className="mr-2 h-5 w-5" />
          Ver no Google Maps e traçar rota
        </a>
      </Button>
    </div>
  );
}
