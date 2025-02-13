import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

export async function POST(request: Request) {
  try {
    const { event_name, event_link, event_type, event_date, full_content } = await request.json();

    const prompt = `Given the following tech event/article details, generate a concise 3-bullet point recap (50-100 words total):

Event: ${event_name}
Type: ${event_type}
Date: ${event_date}
Link: ${event_link}

Content:
${full_content}

Generate 3 bullet points that capture the most important aspects of this event. Focus on key insights, implications, and notable details. Keep the total length between 50-100 words.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const recap = response.text();

    return NextResponse.json({ recap });
  } catch (error) {
    console.error('Error generating recap:', error);
    return NextResponse.json({ error: 'Failed to generate recap' }, { status: 500 });
  }
}
