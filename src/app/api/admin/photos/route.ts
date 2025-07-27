import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const photoSchema = z.object({
  src: z.string().url({ message: "URL da imagem inválida." }),
  alt: z.string().min(1, { message: "Texto alternativo é obrigatório." }),
  description: z.string().optional(),
  hint: z.string().optional(),
  isVisible: z.boolean().default(true),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = photoSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ errors: result.error.format() }, { status: 400 });
    }

    const newPhoto = await prisma.photo.create({
      data: result.data,
    });

    revalidatePath('/');
    revalidatePath('/admin/dashboard/gallery');
    return NextResponse.json(newPhoto, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar foto:", error);
    return NextResponse.json({ message: "Erro interno do servidor ao criar foto." }, { status: 500 });
  }
}
