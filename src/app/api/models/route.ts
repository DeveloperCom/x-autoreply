import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const modelSchema = z.object({
  name: z.string().min(1, 'Display name is required'),
  value: z.string().min(1, 'Model identifier value is required'),
});

export async function GET() {
  try {
    const models = await prisma.targetModel.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(models);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to fetch models';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// Helper endpoint returning raw models (including IDs) for management
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = modelSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, value } = result.data;

    const model = await prisma.targetModel.create({
      data: { name, value },
    });

    return NextResponse.json(model);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to add model';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const name = searchParams.get('name');
    const value = searchParams.get('value');

    if (!id && !name && !value) {
      return NextResponse.json({ error: 'Model ID, Name or Value is required' }, { status: 400 });
    }

    const targetModel = id
      ? await prisma.targetModel.findUnique({ where: { id } })
      : name
        ? await prisma.targetModel.findUnique({ where: { name } })
        : await prisma.targetModel.findUnique({ where: { value: value! } });

    if (!targetModel) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    await prisma.targetModel.delete({
      where: { id: targetModel.id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to delete model';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
