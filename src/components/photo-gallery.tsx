"use client";

import { useState, useEffect } from 'react';
import Image from "next/image";
import { Card } from "@/components/ui/card";

const defaultPhotos = [
  { src: "https://placehold.co/600x400.png", alt: "Foto de família 1", description: "O início de tudo", hint: "family gathering", isVisible: true },
  { src: "https://placehold.co/400x600.png", alt: "Foto de família 2", description: "Celebração especial", hint: "family party", isVisible: true },
  { src: "https://placehold.co/600x400.png", alt: "Foto de família 3", description: "Risadas e alegria", hint: "celebration dinner", isVisible: true },
  { src: "https://placehold.co/600x400.png", alt: "Foto de família 4", description: "Dia de sol", hint: "outdoor barbecue", isVisible: true },
  { src: "https://placehold.co/400x600.png", alt: "Foto de família 5", description: "Momento doce", hint: "birthday cake", isVisible: true },
  { src: "https://placehold.co/600x400.png", alt: "Foto de família 6", description: "Todos reunidos", hint: "group photo", isVisible: true },
];

export function PhotoGallery() {
  const [photos, setPhotos] = useState(defaultPhotos);

  useEffect(() => {
    // This component will now reflect changes made in the admin panel
    // by reading from localStorage. This is a temporary solution for the prototype.
    // A real application would fetch this data from a server.
    const savedPhotos = localStorage.getItem('galleryPhotos');
    if (savedPhotos) {
      try {
        const parsedPhotos = JSON.parse(savedPhotos).map((p: any) => ({...p, isVisible: p.isVisible !== false, description: p.description || ''}));
        if (Array.isArray(parsedPhotos)) {
          setPhotos(parsedPhotos);
        }
      } catch (e) {
        console.error("Failed to parse gallery photos from localStorage", e);
        // If parsing fails, fall back to default photos
        setPhotos(defaultPhotos);
      }
    }
  }, []);

  // Determine if aspect ratio is portrait or landscape
  const getAspectRatio = (src: string) => {
    if (src.startsWith('data:image')) return 400; // Default for base64
    const match = src.match(/placehold\.co\/(\d+)x(\d+)/);
    if(match) {
        const width = parseInt(match[1], 10);
        const height = parseInt(match[2], 10);
        return height > width ? 600 : 400;
    }
    return 400;
  }

  return (
    <div className="columns-2 md:columns-3 gap-4 space-y-4">
      {photos.filter(p => p.isVisible).map((photo, index) => (
        <div key={index} className="break-inside-avoid">
          <Card className="overflow-hidden group border-2 border-primary/50 shadow-lg relative">
            <Image
              src={photo.src}
              alt={photo.alt}
              unoptimized={photo.src.startsWith('data:image')} // Required for base64 Data URLs
              width={600}
              height={getAspectRatio(photo.src)}
              data-ai-hint={photo.hint}
              className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {photo.description && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 text-white text-xs text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p>{photo.description}</p>
                </div>
            )}
          </Card>
        </div>
      ))}
    </div>
  );
}
