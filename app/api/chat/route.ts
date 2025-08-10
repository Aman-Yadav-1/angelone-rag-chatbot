import { NextResponse } from 'next/server';
import { queryDocuments, getDocumentCount } from '@/lib/vector-store';

interface ChatRequest {
  message: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export async function POST(req: Request) {
  console.log('Chat API endpoint called');
  
  try {
    const { message, history = [] } = await req.json() as ChatRequest;
    console.log('Received message:', message);

    if (!message) {
      console.error('No message provided');
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      console.error('OpenRouter API key not found');
      return NextResponse.json(
        { 
          error: 'Server configuration error',
          details: process.env.NODE_ENV === 'development' 
            ? 'Make sure OPENROUTER_API_KEY is set in .env.local' 
            : undefined
        },
        { status: 500 }
      );
    }

    // Check if we have documents in the vector store
    const documentCount = await getDocumentCount();
    let context = '';
    
    if (documentCount > 0) {
      // Try to find relevant documents
      const relevantDocs = await queryDocuments(message, 3);
      
      if (relevantDocs.length > 0) {
        // Format the context from relevant documents
        context = relevantDocs
          .map((doc, i) => `Document ${i + 1}:\n${doc.pageContent}`)
          .join('\n\n');
      }
    }

    // Prepare the conversation history
    const conversation = [
      {
        role: 'system' as const,
        content: `You are a helpful insurance assistant. ${context ? 'Use the following context to answer the question. If you don\'t know the answer, say so.\n\nContext:\n' + context : 'You have no documents loaded yet, so base your response on general knowledge.'}`
      },
      ...history.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      { role: 'user' as const, content: message }
    ];

    try {
      console.log('Calling OpenRouter API...');
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Insurance Chatbot'
        },
        body: JSON.stringify({
          model: 'openai/gpt-3.5-turbo',
          messages: conversation,
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('OpenRouter API error:', error);
        throw new Error(`OpenRouter API error: ${error}`);
      }

      const data = await response.json();
      const responseText = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
      
      console.log('Generated response:', responseText);
      return NextResponse.json({ text: responseText });
      
    } catch (error) {
      console.error('Error calling OpenRouter API:', error);
      return NextResponse.json(
        { 
          text: 'I encountered an error while processing your request. Please try again later.',
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    return NextResponse.json(
      { 
        text: 'An error occurred while processing your request. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}