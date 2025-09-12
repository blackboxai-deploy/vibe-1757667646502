// AI Service - Client-side utilities for AI interactions

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  badge: string;
  description: string;
  features: string[];
  maxTokens: number;
  pricing: { input: number; output: number };
  capabilities: {
    textGeneration: boolean;
    codeGeneration: boolean;
    reasoning: boolean;
    analysis: boolean;
    creative: boolean;
    multiModal: boolean;
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
  tokens?: number;
  attachments?: File[];
}

export interface StreamingResponse {
  content: string;
  tokens: number;
  finished: boolean;
}

export class AIService {
  private baseUrl: string;

  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
  }

  // Get available models
  async getModels(): Promise<AIModel[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/models`);
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`);
      }
      const data = await response.json();
      return data.models;
    } catch (error) {
      console.error('Error fetching models:', error);
      throw error;
    }
  }

  // Get model recommendations for a specific task
  async getModelRecommendation(modelId: string, task?: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/models`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ modelId, task }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get recommendation: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting model recommendation:', error);
      throw error;
    }
  }

  // Send chat message with streaming
  async sendMessage({
    message,
    model = 'gpt-4',
    history = [],
    attachments = [],
    temperature = 0.7,
    maxTokens = 2048,
    systemPrompt = 'You are a helpful AI assistant.',
  }: {
    message: string;
    model?: string;
    history?: ChatMessage[];
    attachments?: File[];
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  }): Promise<Response> {
    const formData = new FormData();
    formData.append('message', message);
    formData.append('model', model);
    formData.append('temperature', temperature.toString());
    formData.append('maxTokens', maxTokens.toString());
    formData.append('systemPrompt', systemPrompt);

    if (history.length > 0) {
      formData.append('history', JSON.stringify(history));
    }

    // Add attachments
    attachments.forEach((file, index) => {
      formData.append(`attachment_${index}`, file);
    });

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Chat request failed: ${response.status}`);
      }

      return response;
    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    }
  }

  // Upload and analyze file
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${this.baseUrl}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Upload failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }

  // Execute code
  async executeCode(code: string, language: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, language }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Execution failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Code execution error:', error);
      throw error;
    }
  }

  // Estimate tokens for text (approximation)
  estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token for English text
    return Math.ceil(text.length / 4);
  }

  // Calculate cost estimate
  calculateCostEstimate(inputTokens: number, outputTokens: number, model: AIModel) {
    const inputCost = (inputTokens / 1000) * model.pricing.input;
    const outputCost = (outputTokens / 1000) * model.pricing.output;
    
    return {
      input: parseFloat(inputCost.toFixed(6)),
      output: parseFloat(outputCost.toFixed(6)),
      total: parseFloat((inputCost + outputCost).toFixed(6)),
    };
  }

  // Validate file for upload
  validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'text/plain',
      'text/javascript',
      'text/typescript',
      'text/html',
      'text/css',
      'text/markdown',
      'application/json',
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 10MB limit' };
    }

    const isTypeAllowed = allowedTypes.some(type => 
      file.type.startsWith(type) || 
      file.name.match(/\.(js|ts|tsx|jsx|py|java|cpp|c|cs|html|css|scss|md|txt|json|csv)$/i)
    );

    if (!isTypeAllowed) {
      return { valid: false, error: 'File type not supported' };
    }

    return { valid: true };
  }
}

// Export singleton instance
export const aiService = new AIService();

// Utility functions
export function formatTokenCount(tokens: number): string {
  if (tokens < 1000) return tokens.toString();
  if (tokens < 1000000) return `${(tokens / 1000).toFixed(1)}K`;
  return `${(tokens / 1000000).toFixed(1)}M`;
}

export function formatCost(cost: number): string {
  if (cost < 0.01) return `$${(cost * 100).toFixed(2)}¢`;
  return `$${cost.toFixed(4)}`;
}

export function getModelByBadge(badge: string): string {
  const modelMap: Record<string, string> = {
    'SMART': 'gpt-4',
    'FAST': 'gpt-3.5-turbo',
    'CREATIVE': 'claude-3',
    'MULTI-MODAL': 'gemini-pro',
  };
  return modelMap[badge] || 'gpt-4';
}