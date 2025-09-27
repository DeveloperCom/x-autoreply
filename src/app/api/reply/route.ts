// pages/api/reply.js

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { MODEL } from '@/config/model'
import { callLLM } from '@/lib/llm';

const schema = z.object({
    model: z.enum(MODEL , {
        errorMap: () => ({ message: 'Please select a valid model' })
      }),
    
      content: z.string()
        .min(1, { message: 'Content should not be empty' }),

        contextReplyExample: z.array(
            z.string().min(1, { message: 'Context Reply Example indexes should not be empty' })
          )
})

const userPrompt = (content: string, contextReplyExample: string[] | undefined) => {
    let prompt = `You're a helpful human assistant. Reply to this tweet:\n${content}\n`
    if (contextReplyExample && contextReplyExample.length>0) {
        prompt = prompt + `Attaching some reply by other of this tweet, you can see the reply and take inspiration from it:\n`
        contextReplyExample.map((val, idx) => {
            prompt = prompt + `${idx + 1}. ${val}\n`
        })
    }
    return prompt
}


// 3. Next.js API route handler
export async function POST(req: NextRequest) {


    try {
        const body = await req.json();
        const { model, content, contextReplyExample } = schema.parse(body);

        const replys = await callLLM(model, userPrompt(content,contextReplyExample));

        return NextResponse.json({
            replys,
        },
            { status: 200 }
        );
    } catch (err: any) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ error: err.issues[0].message },{status:400})
        }
        else {
            return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });

        }
    }
}
