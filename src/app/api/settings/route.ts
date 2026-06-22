import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    let settings = await prisma.settings.findUnique({
      where: { id: 'global' },
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: { id: 'global', xUsername: '' },
      });
    }

    return NextResponse.json(settings);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to fetch settings';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { xUsername } = body;

    const settings = await prisma.settings.upsert({
      where: { id: 'global' },
      update: { xUsername: xUsername || '' },
      create: { id: 'global', xUsername: xUsername || '' },
    });

    return NextResponse.json(settings);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to save settings';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
