import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { articles, personalArticles, additionalNotes } = await request.json();

    const prompt = `
      Based on the following articles, identify 3-5 key themes that might interest the reader.
      For each theme, provide a brief description and list relevant articles.
      Focus on finding connections between the personal articles and the recent news articles.

      Recent Articles:
      ${articles.map((a: any) => `- ${a.title} (${a.feedSource})`).join('\n')}

      Personal Articles:
      ${personalArticles.map((a: any) => `- ${a.title}`).join('\n')}

      Additional Context:
      ${additionalNotes}

      Please format your response as JSON with the following structure:
      {
        "themes": [
          {
            "name": "Theme Name",
            "description": "Brief description of the theme",
            "articles": [
              {
                "title": "Article Title",
                "link": "Article URL",
                "source": "Source Name"
              }
            ]
          }
        ]
      }
    `;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful AI that analyzes articles and identifies relevant themes. Your responses should be in valid JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "gpt-4-turbo-preview",
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error('No response content from OpenAI');
    }
    
    return NextResponse.json(JSON.parse(response));
  } catch (error) {
    console.error('Error analyzing themes:', error);
    return NextResponse.json(
      { error: 'Failed to analyze themes' },
      { status: 500 }
    );
  }
}
