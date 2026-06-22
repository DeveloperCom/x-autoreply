import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { callLLMForText } from '@/lib/llm';
import { POST_SYSTEM_PROMPT } from '@/config/prompt';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic, category, useHistory, model } = body;

    if (!topic || topic.trim() === '') {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    // 1. Fetch history from DB if requested
    let historyPosts: any[] = [];
    if (useHistory) {
      historyPosts = await prisma.post.findMany({
        orderBy: [
          { likes: 'desc' },
          { postedAt: 'desc' }
        ],
        take: 5,
      });
    }

    // 2. Load system instructions
    const systemPrompt = POST_SYSTEM_PROMPT;

    // 3. Construct user prompt containing few-shot examples from history
    let prompt = '';
    if (historyPosts.length > 0) {
      prompt += `Analyze and replicate the writing style, structure, and formatting of my best-performing past tweets listed below:\n\n`;
      historyPosts.forEach((post, index) => {
        prompt += `--- Example ${index + 1} (Likes: ${post.likes}) ---\n${post.content}\n\n`;
      });
      prompt += `Now, write a new tweet in the exact same style and voice about this topic: "${topic}"\n`;
      if (category && category !== 'General') {
        prompt += `The tweet category/theme is: ${category}. Ensure it fits this context.\n`;
      }
      prompt += `Output ONLY the text of the generated tweet. Do not include quotes, intros, or explanations.`;
    } else {
      prompt += `Write an engaging tweet about this topic: "${topic}"\n`;
      if (category && category !== 'General') {
        prompt += `The tweet category/theme is: ${category}.\n`;
      }
      prompt += `Output ONLY the text of the generated tweet. Do not include quotes, intros, or explanations.`;
    }

    // 4. Try generating via LLM if API keys exist
    const openrouterKey = process.env.OPENROUTER_API_KEY;

    if (openrouterKey) {
      try {
        const text = await callLLMForText(
          model || 'nvidia/nemotron-3-ultra-550b-a55b:free',
          prompt,
          systemPrompt,
          openrouterKey
        );
        return NextResponse.json({
          text,
          prompt: `${systemPrompt}\n\n[USER PROMPT]\n${prompt}`,
          directGen: true,
        });
      } catch (err) {
        if (err instanceof Error && err.message === 'NO_API_KEY') {
          // Fall through to returning the prompt
        } else {
          throw err;
        }
      }
    }

    // If no keys, return the compiled prompt for manual copy-pasting
    return NextResponse.json({
      text: '',
      prompt: `${systemPrompt}\n\n[USER PROMPT]\n${prompt}`,
      directGen: false,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to generate post';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
