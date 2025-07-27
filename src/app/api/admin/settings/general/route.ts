import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

// Define a schema for the general settings, allowing any string key-value pair
const generalSettingsSchema = z.record(z.string(), z.string());

export async function GET() {
  try {
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          not: "heroBackgroundImage" // Exclude heroBackgroundImage as it's managed separately
        }
      }
    });

    const settingsMap: { [key: string]: string } = {};
    settings.forEach(setting => {
      settingsMap[setting.key] = setting.value;
    });

    return NextResponse.json(settingsMap, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar configurações gerais:", error);
    return NextResponse.json({ message: "Erro interno do servidor ao buscar configurações gerais." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const result = generalSettingsSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ errors: result.error.format() }, { status: 400 });
    }

    const updates = Object.entries(result.data).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    );

    await prisma.$transaction(updates);

    revalidatePath('/');
    // No need to revalidate /admin/dashboard/settings as it's a client component that will refetch
    return NextResponse.json({ message: "Configurações gerais salvas com sucesso." }, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar configurações gerais:", error);
    return NextResponse.json({ message: "Erro interno do servidor ao atualizar configurações gerais." }, { status: 500 });
  }
}
