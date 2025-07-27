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

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const result = photoSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ errors: result.error.format() }, { status: 400 });
    }

    const updatedPhoto = await prisma.photo.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json(updatedPhoto, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar foto:", error);
    return NextResponse.json({ message: "Erro interno do servidor ao atualizar foto." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    await prisma.photo.delete({
      where: { id },
    });

    revalidatePath('/');
    revalidatePath('/admin/dashboard/gallery');
    return NextResponse.json({ message: "Foto deletada com sucesso." }, { status: 200 });
  } catch (error: any) {
    console.error("Erro ao deletar foto:", error);
    // Check if it's a Prisma error and provide more specific feedback
    if (error.code === 'P2025') {
      return NextResponse.json({ message: "Foto não encontrada." }, { status: 404 });
    }
    return NextResponse.json({ message: "Erro interno do servidor ao deletar foto." }, { status: 500 });
  }
}
