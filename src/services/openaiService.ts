import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface CompanyContext {
  strategy: string;
  interests: string[];
  industry: string;
}

const DEFAULT_COMPANY_CONTEXT: CompanyContext = {
  strategy: "Building innovative AI-powered solutions that enhance productivity and decision-making",
  interests: [
    "Artificial Intelligence",
    "Machine Learning",
    "Developer Tools",
    "Enterprise Software",
    "Productivity Solutions"
  ],
  industry: "Technology/Software"
};

export async function generateSoWhat(
  eventName: string,
  description: string,
  questions: { question: string }[],
  answers: { answer: string }[],
  companyContext: CompanyContext = DEFAULT_COMPANY_CONTEXT
): Promise<string> {
  const prompt = `
As a strategic advisor, analyze this tech event's relevance to our company:

EVENT DETAILS:
- Name: ${eventName}
- Description: ${description}
- Key Questions: ${questions.map(q => q.question).join(', ')}
- Answers: ${answers.map(a => a.answer).join(', ')}

COMPANY CONTEXT:
- Strategy: ${companyContext.strategy}
- Key Interests: ${companyContext.interests.join(', ')}
- Industry: ${companyContext.industry}

Provide a concise 20-40 word "So What?" analysis explaining why this event might be important for our company. 
Focus on strategic implications, potential opportunities, or risks.
Be specific and actionable.
`;

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a strategic technology advisor who provides concise, insightful analysis of tech events and their business implications."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "gpt-4-turbo-preview",
      max_tokens: 100,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content?.trim() || 'Unable to generate analysis';
  } catch (error) {
    console.error('Error generating So What analysis:', error);
    return 'Error generating analysis';
  }
}
