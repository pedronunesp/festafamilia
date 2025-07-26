import { z } from "zod"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

const rsvpSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  attending: z.enum(["yes", "no"]),
})

const photoSchema = z.object({
  id: z.string().optional(),
  src: z.string().url({ message: "URL da imagem inválida." }),
  alt: z.string().min(1, { message: "Texto alternativo é obrigatório." }),
  description: z.string().optional(),
  hint: z.string().optional(),
  isVisible: z.boolean().default(true),
})

export async function handleRsvp(data: unknown) {
  const result = rsvpSchema.safeParse(data)

  if (!result.success) {
    return { success: false, errors: result.error.format() }
  }

  try {
    const { name, attending } = result.data;
    const createdRsvp = await prisma.rsvp.create({
      data: {
        name,
        attending: attending === "yes",
      },
    });
    console.log("RSVP confirmado e salvo no DB:", createdRsvp);
    revalidatePath("/");
    return { success: true, data: result.data };
  } catch (error) {
    console.error("Erro ao salvar RSVP no banco de dados:", error);
    return { success: false, errors: { _errors: ["Erro ao salvar RSVP no banco de dados."] } };
  }
}

export async function getPhotos() {
  try {
    const photos = await prisma.photo.findMany({
      orderBy: { createdAt: "asc" },
    });
    return { success: true, data: photos };
  } catch (error) {
    console.error("Erro ao buscar fotos:", error);
    return { success: false, errors: { _errors: ["Erro ao buscar fotos."] } };
  }
}

export async function createPhoto(data: unknown) {
  const result = photoSchema.safeParse(data);

  if (!result.success) {
    return { success: false, errors: result.error.format() };
  }

  try {
    const newPhoto = await prisma.photo.create({
      data: result.data,
    });
    revalidatePath("/admin/dashboard/gallery");
    revalidatePath("/");
    return { success: true, data: newPhoto };
  } catch (error) {
    console.error("Erro ao criar foto:", error);
    return { success: false, errors: { _errors: ["Erro ao criar foto."] } };
  }
}

export async function updatePhoto(id: string, data: unknown) {
  const result = photoSchema.safeParse(data);

  if (!result.success) {
    return { success: false, errors: result.error.format() };
  }

  try {
    const updatedPhoto = await prisma.photo.update({
      where: { id },
      data: result.data,
    });
    revalidatePath("/admin/dashboard/gallery");
    revalidatePath("/");
    return { success: true, data: updatedPhoto };
  } catch (error) {
    console.error("Erro ao atualizar foto:", error);
    return { success: false, errors: { _errors: ["Erro ao atualizar foto."] } };
  }
}

export async function deletePhoto(id: string) {
  try {
    await prisma.photo.delete({
      where: { id },
    });
    revalidatePath("/admin/dashboard/gallery");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar foto:", error);
    return { success: false, errors: { _errors: ["Erro ao deletar foto."] } };
  }
}

export async function updateHeroImage(imageUrl: string) {
  try {
    const setting = await prisma.setting.upsert({
      where: { key: "heroBackgroundImage" },
      update: { value: imageUrl },
      create: { key: "heroBackgroundImage", value: imageUrl },
    });
    revalidatePath("/admin/dashboard/gallery");
    revalidatePath("/");
    return { success: true, data: setting };
  } catch (error) {
    console.error("Erro ao atualizar imagem de fundo do herói:", error);
    return { success: false, errors: { _errors: ["Erro ao atualizar imagem de fundo do herói."] } };
  }
}

export async function getHeroImage() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "heroBackgroundImage" },
    });
    return { success: true, data: setting?.value || null };
  } catch (error) {
    console.error("Erro ao buscar imagem de fundo do herói:", error);
    return { success: false, errors: { _errors: ["Erro ao buscar imagem de fundo do herói."] } };
  }
}