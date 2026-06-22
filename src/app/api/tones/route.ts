import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const toneSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().default(''),
  goal: z.string().min(1, 'Goal instructions are required'),
});

const updateToneSchema = z.object({
  id: z.string().uuid('Invalid tone ID'),
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  goal: z.string().min(1, 'Goal instructions are required').optional(),
});

export async function GET() {
  try {
    const tones = await prisma.tone.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(tones);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tones';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = toneSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, description, goal } = result.data;

    const tone = await prisma.tone.create({
      data: { name, description, goal },
    });

    return NextResponse.json(tone);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to create tone';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const result = updateToneSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { id, ...data } = result.data;

    const updateData: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        updateData[key] = value;
      }
    }

    const updatedTone = await prisma.tone.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedTone);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to update tone';
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

    if (!id) {
      return NextResponse.json({ error: 'Tone ID is required' }, { status: 400 });
    }

    const targetTone = await prisma.tone.findUnique({
      where: { id },
    });

    if (!targetTone) {
      return NextResponse.json({ error: 'Tone not found' }, { status: 404 });
    }

    await prisma.tone.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to delete tone';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
