import { NextRequest } from 'next/server';

export async function GET() {
  const models = [
    {
      id: 'gpt-4',
      name: 'GPT-4',
      provider: 'OpenAI',
      badge: 'SMART',
      description: 'Most capable model for complex reasoning and analysis',
      features: ['Advanced reasoning', 'Code generation', 'Creative writing', 'Complex analysis'],
      maxTokens: 8192,
      pricing: { input: 0.03, output: 0.06 },
      capabilities: {
        textGeneration: true,
        codeGeneration: true,
        reasoning: true,
        analysis: true,
        creative: true,
        multiModal: false,
      }
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: 'OpenAI',
      badge: 'FAST',
      description: 'Fast and efficient for most conversational tasks',
      features: ['Fast responses', 'Good reasoning', 'Conversational', 'Cost effective'],
      maxTokens: 4096,
      pricing: { input: 0.001, output: 0.002 },
      capabilities: {
        textGeneration: true,
        codeGeneration: true,
        reasoning: true,
        analysis: true,
        creative: true,
        multiModal: false,
      }
    },
    {
      id: 'claude-3',
      name: 'Claude 3',
      provider: 'Anthropic',
      badge: 'CREATIVE',
      description: 'Excellent for creative writing and ethical reasoning',
      features: ['Creative writing', 'Ethical reasoning', 'Long context', 'Thoughtful responses'],
      maxTokens: 100000,
      pricing: { input: 0.015, output: 0.075 },
      capabilities: {
        textGeneration: true,
        codeGeneration: true,
        reasoning: true,
        analysis: true,
        creative: true,
        multiModal: true,
      }
    },
    {
      id: 'gemini-pro',
      name: 'Gemini Pro',
      provider: 'Google',
      badge: 'MULTI-MODAL',
      description: 'Advanced multi-modal capabilities with vision and reasoning',
      features: ['Multi-modal', 'Vision capabilities', 'Fast inference', 'Large context'],
      maxTokens: 32768,
      pricing: { input: 0.00125, output: 0.00375 },
      capabilities: {
        textGeneration: true,
        codeGeneration: true,
        reasoning: true,
        analysis: true,
        creative: true,
        multiModal: true,
      }
    }
  ];

  return Response.json({
    models,
    total: models.length,
    categories: {
      reasoning: models.filter(m => m.capabilities.reasoning),
      creative: models.filter(m => m.capabilities.creative),
      multiModal: models.filter(m => m.capabilities.multiModal),
      fast: models.filter(m => m.badge === 'FAST'),
    },
    recommendations: {
      generalUse: 'gpt-4',
      fastResponses: 'gpt-3.5-turbo',
      creativeWriting: 'claude-3',
      imageAnalysis: 'gemini-pro',
      codeGeneration: 'gpt-4',
      costEffective: 'gpt-3.5-turbo',
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const { modelId, task } = await req.json();

    if (!modelId) {
      return Response.json({ error: 'Model ID is required' }, { status: 400 });
    }

    // Get model info
    const response = await GET();
    const data = await response.json();
    const model = data.models.find((m: any) => m.id === modelId);

    if (!model) {
      return Response.json({ error: 'Model not found' }, { status: 404 });
    }

    // Provide model-specific recommendations based on task
    let recommendation = 'This model is suitable for your request.';
    
    if (task) {
      const taskLower = task.toLowerCase();
      if (taskLower.includes('creative') || taskLower.includes('writing')) {
        if (model.id !== 'claude-3') {
          recommendation = 'Consider using Claude 3 for enhanced creative writing capabilities.';
        }
      } else if (taskLower.includes('code') || taskLower.includes('programming')) {
        if (model.id !== 'gpt-4') {
          recommendation = 'Consider using GPT-4 for superior code generation and analysis.';
        }
      } else if (taskLower.includes('fast') || taskLower.includes('quick')) {
        if (model.id !== 'gpt-3.5-turbo') {
          recommendation = 'Consider using GPT-3.5 Turbo for faster responses.';
        }
      } else if (taskLower.includes('image') || taskLower.includes('visual')) {
        if (!model.capabilities.multiModal) {
          recommendation = 'Consider using Gemini Pro or Claude 3 for image analysis capabilities.';
        }
      }
    }

    return Response.json({
      model,
      recommendation,
      estimatedCost: calculateEstimatedCost(model, task),
      suitabilityScore: calculateSuitabilityScore(model, task),
    });

  } catch (error) {
    console.error('Models API error:', error);
    return Response.json({ 
      error: 'Models API failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function calculateEstimatedCost(model: any, task?: string): { input: number; output: number; total: number } {
  // Estimate token usage based on task complexity
  let estimatedInputTokens = 100; // Base conversation
  let estimatedOutputTokens = 200; // Typical response

  if (task) {
    const taskLower = task.toLowerCase();
    if (taskLower.includes('long') || taskLower.includes('detailed')) {
      estimatedInputTokens *= 2;
      estimatedOutputTokens *= 3;
    } else if (taskLower.includes('code') || taskLower.includes('analysis')) {
      estimatedInputTokens *= 1.5;
      estimatedOutputTokens *= 2;
    }
  }

  const inputCost = (estimatedInputTokens / 1000) * model.pricing.input;
  const outputCost = (estimatedOutputTokens / 1000) * model.pricing.output;

  return {
    input: parseFloat(inputCost.toFixed(6)),
    output: parseFloat(outputCost.toFixed(6)),
    total: parseFloat((inputCost + outputCost).toFixed(6)),
  };
}

function calculateSuitabilityScore(model: any, task?: string): number {
  let score = 70; // Base score

  if (!task) return score;

  const taskLower = task.toLowerCase();
  
  // Adjust score based on model capabilities and task requirements
  if (taskLower.includes('creative') || taskLower.includes('writing')) {
    if (model.id === 'claude-3') score += 20;
    else if (model.id === 'gpt-4') score += 15;
    else score += 5;
  }
  
  if (taskLower.includes('code') || taskLower.includes('programming')) {
    if (model.id === 'gpt-4') score += 20;
    else if (model.id === 'gpt-3.5-turbo') score += 15;
    else score += 10;
  }
  
  if (taskLower.includes('fast') || taskLower.includes('quick')) {
    if (model.id === 'gpt-3.5-turbo') score += 20;
    else score -= 5;
  }
  
  if (taskLower.includes('image') || taskLower.includes('visual')) {
    if (model.capabilities.multiModal) score += 20;
    else score -= 15;
  }

  return Math.min(100, Math.max(0, score));
}