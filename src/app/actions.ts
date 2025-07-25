import { z } from "zod"

const rsvpSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  attending: z.enum(["yes", "no"]),
})

export async function handleRsvp(data: unknown) {
  const result = rsvpSchema.safeParse(data)

  if (!result.success) {
    return { success: false, errors: result.error.format() }
  }

  // Em uma aplicação real, você salvaria isso em um banco de dados.
  // ex., await saveRsvpToDatabase(result.data)
  console.log("RSVP confirmado:", result.data)

  return { success: true, data: result.data }
}
