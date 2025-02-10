import { NextResponse } from 'next/server';
import { generateSoWhat } from '@/services/openaiService';

export async function POST(request: Request) {
  try {
    const { eventName, description, questions, answers } = await request.json();

    const soWhat = await generateSoWhat(
      eventName,
      description,
      questions,
      answers
    );

    return NextResponse.json({ soWhat });
  } catch (error) {
    console.error('Error in generate-so-what API:', error);
    return NextResponse.json(
      { error: 'Failed to generate analysis' },
      { status: 500 }
    );
  }
}
