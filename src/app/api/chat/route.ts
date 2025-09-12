import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Mock response for development when no API key is available
const createMockResponse = async (message: string): Promise<string> => {
  // Simulate AI response with delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const responses = [
    `I understand you said: "${message}". This is a demonstration of the Advanced AI Assistant interface. In a production environment, this would connect to actual AI models like GPT-4, Claude, or Gemini.`,
    `Thank you for testing the chat functionality. Your message was: "${message}". The interface supports file uploads, code execution, and streaming responses.`,
    `I received your message: "${message}". This advanced AI assistant includes features like conversation memory, model switching, file analysis, and export capabilities.`,
    `Hello! You wrote: "${message}". This is a fully-featured AI interface with dark/light themes, responsive design, and multi-modal capabilities.`,
    `You asked: "${message}". This demo shows real-time streaming, conversation persistence, file upload support, and advanced UI components built with Next.js and shadcn/ui.`
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const message = formData.get('message') as string;
    const model = (formData.get('model') as string) || 'gpt-4';
    const historyString = formData.get('history') as string;

    if (!message) {
      return new Response('Message is required', { status: 400 });
    }

    // Process file attachments
    const attachments: string[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('attachment_') && value instanceof File) {
        try {
          const text = await value.text();
          attachments.push(`File: ${value.name}\nContent: ${text.slice(0, 1000)}...`);
        } catch (error) {
          attachments.push(`File: ${value.name} (could not read content)`);
        }
      }
    }

    // Create final message with attachments
    const finalMessage = attachments.length > 0 
      ? `${message}\n\nAttached files:\n${attachments.join('\n\n')}`
      : message;

    // Use mock response for demo
    const mockResponse = await createMockResponse(finalMessage);
    
    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const words = mockResponse.split(' ');
        
        // Simulate streaming by sending words with delay
        for (let i = 0; i < words.length; i++) {
          const word = i === 0 ? words[i] : ` ${words[i]}`;
          const data = JSON.stringify({
            content: word,
            tokens: Math.floor(mockResponse.length / 4),
          });
          
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          
          // Add slight delay for realistic streaming effect
          if (i < words.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
          }
        }
        
        // Send completion signal
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}