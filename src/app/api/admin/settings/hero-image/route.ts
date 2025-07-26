import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const heroImageSchema = z.object({
  imageUrl: z.string().url({ message: "URL da imagem inválida." }),
});

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const result = heroImageSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ errors: result.error.format() }, { status: 400 });
    }

    const { imageUrl } = result.data;

    const setting = await prisma.setting.upsert({
      where: { key: "heroBackgroundImage" },
      update: { value: imageUrl },
      create: { key: "heroBackgroundImage", value: imageUrl },
    });

    revalidatePath('/');
    return NextResponse.json(setting, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar imagem de fundo do herói:", error);
    return NextResponse.json({ message: "Erro interno do servidor ao atualizar imagem de fundo do herói." }, { status: 500 });
  }
}
