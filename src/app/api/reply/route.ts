import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { callLLMForReplies } from '@/lib/llm';

const schema = z.object({
  model: z.string().min(1, 'Model is required'),
  content: z.string().min(1, { message: 'Content should not be empty' }),
  replyStyle: z.string().default('Supportive'),
  contextReplyExample: z.array(z.string()).optional(),
});

const getReplyPrompt = (content: string, style: string, goal: string, contextReplyExample: string[] | undefined) => {
  let prompt = `Write a reply to this tweet:\n"${content}"\n\n`;

  prompt += `The style of the reply should be: ${style}.\n`;
  prompt += `Goal: ${goal}\n`;

  if (contextReplyExample && contextReplyExample.length > 0) {
    prompt += `\nHere are some example replies to draw inspiration from:\n`;
    contextReplyExample.forEach((val, idx) => {
      prompt += `${idx + 1}. ${val}\n`;
    });
  }

  prompt += `\nOutput format: Generate 3 to 5 options in JSON format. Make sure the output is ONLY a valid JSON object matching this schema:
{
  "replys": [
    { "type": "very-short", "text": "..." },
    { "type": "short", "text": "..." },
    { "type": "medium", "text": "..." }
  ]
}
Do not include markdown tags like \`\`\`json, just return raw JSON content.`;
  return prompt;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'OpenRouter API key missing' },
        { status: 400 }
      );
    }

    const { model, content, replyStyle, contextReplyExample } = result.data;

    // Fetch the goal dynamically from the database
    const dbTone = await prisma.tone.findFirst({
      where: {
        OR: [
          { name: replyStyle },
          { description: replyStyle },
        ],
      },
    });
    if (!dbTone) {
      return NextResponse.json(
        { error: 'Reply tone not found' },
        { status: 400 })
    }

    const toneGoal = dbTone.goal;

    const userPrompt = getReplyPrompt(content, replyStyle, toneGoal, contextReplyExample);
    const replys = await callLLMForReplies(model, userPrompt);
    return NextResponse.json({
      replys,
      prompt: userPrompt,
      directGen: true,
    });

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Internal Server Error';
    console.log(err, errorMessage)
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
