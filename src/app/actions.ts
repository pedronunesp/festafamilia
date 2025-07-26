import { z } from "zod"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

const rsvpSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  attending: z.enum(["yes", "no"]),
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