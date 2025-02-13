import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

export async function POST(request: Request) {
  try {
    const { question, event_name, event_type, full_content } = await request.json();

    const prompt = `Given this tech event/article:

Event: ${event_name}
Type: ${event_type}

Content:
${full_content}

Please answer this question in 50-100 words:
${question}

Focus on providing a clear, insightful answer based on the content provided. The answer should be specific and directly address the question.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const answer = response.text();

    return NextResponse.json({ answer });
  } catch (error) {
    console.error('Error generating answer:', error);
    return NextResponse.json({ error: 'Failed to generate answer' }, { status: 500 });
  }
}
