import Image from "next/image";
import { Card } from "@/components/ui/card";
import { getPhotos } from "@/app/actions";

export async function PhotoGallery() {
  const photosResult = await getPhotos();
  const photos = photosResult.success ? photosResult.data : [];

  

  return (
    <div className="columns-2 md:columns-3 gap-4 space-y-4">
      {photos.filter(p => p.isVisible).map((photo) => (
        <div key={photo.id} className="break-inside-avoid">
          <Card className="overflow-hidden group border-2 border-primary/50 shadow-lg relative">
            <Image
              src={photo.src}
              alt={photo.alt}
              unoptimized // Always unoptimized for external images
              width={600}
              
              height={400} // Default height for unoptimized images
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