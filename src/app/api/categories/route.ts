import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
});

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(categories);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to fetch categories';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = categorySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name } = result.data;

    const category = await prisma.category.create({
      data: { name },
    });

    return NextResponse.json(category);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to add category';
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

    if (!id && !name) {
      return NextResponse.json({ error: 'Category ID or Name is required' }, { status: 400 });
    }

    const targetCategory = id
      ? await prisma.category.findUnique({ where: { id } })
      : await prisma.category.findUnique({ where: { name: name! } });

    if (!targetCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    if (targetCategory.name === 'General') {
      return NextResponse.json({ error: 'Cannot delete the default General category.' }, { status: 400 });
    }

    // Check if the category is referenced by any posts
    const postCount = await prisma.post.count({
      where: { categoryId: targetCategory.id },
    });

    if (postCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category because it is in use by existing posts.' },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id: targetCategory.id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to delete category';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name } = body;

    if (!id || !name) {
      return NextResponse.json({ error: 'Category ID and Name are required' }, { status: 400 });
    }

    if (name.trim().toLowerCase() === 'general') {
      return NextResponse.json({ error: 'Cannot rename a category to "General"' }, { status: 400 });
    }

    // Find the old category to verify existence and get its name
    const oldCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!oldCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    if (oldCategory.name === 'General') {
      return NextResponse.json({ error: 'Cannot rename the default General category' }, { status: 400 });
    }

    // Simply update the category name. Posts automatically reference it via Category relation.
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { name: name.trim() },
    });

    return NextResponse.json(updatedCategory);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to update category';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
