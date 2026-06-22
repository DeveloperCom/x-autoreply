import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const postSchema = z.object({
  content: z.string().min(1, 'Post content cannot be empty'),
  likes: z.number().int().nonnegative().default(0),
  retweets: z.number().int().nonnegative().default(0),
  categoryId: z.string().min(1, 'Category ID is required'),
  postedAt: z.string().optional().transform((val) => val ? new Date(val) : new Date()),
});

const updatePostSchema = z.object({
  id: z.string().uuid('Invalid post ID'),
  content: z.string().min(1, 'Post content cannot be empty').optional(),
  likes: z.number().int().nonnegative().optional(),
  retweets: z.number().int().nonnegative().optional(),
  categoryId: z.string().optional(),
  postedAt: z.string().optional().transform((val) => val ? new Date(val) : undefined),
});

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      include: { category: true },
      orderBy: { postedAt: 'desc' },
    });
    return NextResponse.json(posts);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to fetch posts';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = postSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { content, likes, retweets, categoryId, postedAt } = result.data;

    const post = await prisma.post.create({
      data: {
        content,
        likes,
        retweets,
        categoryId,
        postedAt,
      },
      include: { category: true },
    });

    return NextResponse.json(post);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to create post';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const result = updatePostSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { id, ...data } = result.data;

    // Filter out undefined fields to only update what was provided
    const updateData: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        updateData[key] = value;
      }
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });

    return NextResponse.json(updatedPost);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to update post';
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
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const targetPost = await prisma.post.findUnique({
      where: { id },
    });

    if (!targetPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    await prisma.post.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to delete post';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

