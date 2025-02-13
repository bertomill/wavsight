import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '@/utils/supabase';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured.' },
        { status: 500 }
      );
    }

    const { messages, selectedEventIds } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

    // Get the last user message
    const lastUserMessage = messages[messages.length - 1];
    
    // Initialize response variables
    let aiResponse = '';
    let generatedContent = '';

    // If user has selected events, fetch their details
    let selectedEvents = [];
    if (selectedEventIds && selectedEventIds.length > 0) {
      const { data: events, error } = await supabase
        .from('tech_events')
        .select('*')
        .in('id', selectedEventIds);

      if (error) {
        console.error('Error fetching events:', error);
        return NextResponse.json(
          { error: 'Failed to fetch event details' },
          { status: 500 }
        );
      }

      selectedEvents = events;
    }

    // Handle different user intents
    const userMessage = lastUserMessage.content.toLowerCase();
    
    if (userMessage.includes('1') || userMessage.includes('blog article')) {
      if (selectedEvents.length > 0) {
        // Generate blog article for selected events
        const event = selectedEvents[0]; // For now, use the first selected event
        const isUpcoming = event.description?.includes('(Upcoming Event)');
        
        const prompt = `Write an informative article about this tech event:
          Event: ${event.event_name}
          Status: ${isUpcoming ? '🔜 Upcoming Event' : '✅ Past Event'}
          Description: ${event.description || ''}
          Full Content: ${event.full_content || ''}
          So What (Key Takeaway): ${event.so_what || ''}
          Event Link: ${event.event_link || ''}
          
          Write a well-structured article that:
          1. Has an engaging headline
          2. Includes an introduction that hooks the reader
          3. Covers the main points
          4. Provides analysis and insights
          5. References the event link if available
          6. Ends with a strong conclusion
          7. Uses a professional tone
          Format the article in markdown.`;

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        generatedContent = response.text();
        aiResponse = "I've generated a blog article based on the selected event. You can see it in the preview panel.";
      } else {
        aiResponse = "Please select one or more tech events to write about. Would you like to see the available events?";
      }
    } else if (userMessage.includes('2') || userMessage.includes('linkedin post')) {
      if (selectedEvents.length > 0) {
        // Generate LinkedIn post for selected events
        const event = selectedEvents[0]; // For now, use the first selected event
        const isUpcoming = event.description?.includes('(Upcoming Event)');
        
        const prompt = `Write a LinkedIn post about this tech event:
          Event: ${event.event_name}
          Status: ${isUpcoming ? '🔜 Upcoming Event' : '✅ Past Event'}
          Description: ${event.description || ''}
          Full Content: ${event.full_content || ''}
          So What (Key Takeaway): ${event.so_what || ''}
          Event Link: ${event.event_link || ''}

          Create an engaging LinkedIn post that:
          1. Starts with a compelling hook
          2. Presents the key information professionally
          3. Emphasizes the key takeaway
          4. Includes the event link if available
          5. Uses appropriate spacing and formatting
          6. Ends with a conversation starter
          Format the post in a LinkedIn-appropriate style with emojis and bullet points where relevant.`;

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        generatedContent = response.text();
        aiResponse = "I've generated a LinkedIn post based on the selected event. You can see it in the preview panel.";
      } else {
        aiResponse = "Please select one or more tech events to write about. Would you like to see the available events?";
      }
    } else {
      // Handle general conversation
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(lastUserMessage.content);
      const response = await result.response;
      aiResponse = response.text();
    }

    return NextResponse.json({
      message: aiResponse,
      generatedContent: generatedContent,
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}
