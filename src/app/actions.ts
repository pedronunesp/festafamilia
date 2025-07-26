import { z } from "zod"
import prisma from "@/lib/prisma"

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
    return { success: true, data: result.data };
  } catch (error) {
    console.error("Erro ao salvar RSVP no banco de dados:", error);
    return { success: false, errors: { _errors: ["Erro ao salvar RSVP no banco de dados."] } };
  }
}
