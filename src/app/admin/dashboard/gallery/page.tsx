import { getPhotos, getHeroImage } from '@/app/actions';
import { GalleryAdminClient } from '@/components/gallery-admin-client';

const defaultHeroImage = "https://placehold.co/1920x1080.png";

export default async function GalleryAdminPage() {
  const photosResult = await getPhotos();
  const initialPhotos = photosResult.success ? photosResult.data : [];

  const heroImageResult = await getHeroImage();
  const initialHeroImage = heroImageResult.success && heroImageResult.data ? heroImageResult.data : defaultHeroImage;

  return (
    <GalleryAdminClient initialPhotos={initialPhotos} initialHeroImage={initialHeroImage} />
  );
}
