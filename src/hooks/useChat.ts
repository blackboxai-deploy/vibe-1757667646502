'use client';

import { useState, useCallback, useRef } from 'react';
import { useChatStore } from '@/lib/chat-store';

export interface UseChatOptions {
  api?: string;
  onResponse?: (response: string) => void;
  onError?: (error: Error) => void;
  onFinish?: (message: string) => void;
}

export function useChat(options: UseChatOptions = {}) {
  const {
    api = '/api/chat',
    onResponse,
    onError,
    onFinish,
  } = options;

  const {
    currentConversation,
    addMessage,
    updateMessage,
    setIsStreaming,
    setIsTyping,
    selectedModel,
    temperature,
    maxTokens,
    systemPrompt,
  } = useChatStore();

  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (
    content: string,
    attachments?: File[]
  ) => {
    if (!content.trim()) return;

    try {
      setError(null);
      setIsStreaming(true);

      // Add user message
      addMessage({
        content,
        role: 'user',
        attachments,
      });

      // Prepare request
      const formData = new FormData();
      formData.append('message', content);
      formData.append('model', selectedModel);
      formData.append('temperature', temperature.toString());
      formData.append('maxTokens', maxTokens.toString());
      formData.append('systemPrompt', systemPrompt);

      // Add conversation history
      if (currentConversation?.messages) {
        formData.append('history', JSON.stringify(currentConversation.messages));
      }

      // Add attachments
      if (attachments?.length) {
        attachments.forEach((file, index) => {
          formData.append(`attachment_${index}`, file);
        });
      }

      // Create abort controller
      abortControllerRef.current = new AbortController();

      // Send request
      const response = await fetch(api, {
        method: 'POST',
        body: formData,
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      let assistantMessageId: string | null = null;
      let fullResponse = '';

      // Add initial assistant message
      addMessage({
        content: '',
        role: 'assistant',
        model: selectedModel,
      });

      // Get the message ID from the store
      const messages = useChatStore.getState().currentConversation?.messages;
      assistantMessageId = messages?.[messages.length - 1]?.id || null;

      setIsTyping(true);

      // Read stream
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              break;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullResponse += parsed.content;
                
                if (assistantMessageId) {
                  updateMessage(assistantMessageId, {
                    content: fullResponse,
                    tokens: parsed.tokens,
                  });
                }

                onResponse?.(parsed.content);
              }
            } catch (e) {
              console.warn('Failed to parse SSE data:', data);
            }
          }
        }
      }

      setIsTyping(false);
      onFinish?.(fullResponse);

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
      setIsTyping(false);
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [
    api,
    currentConversation,
    addMessage,
    updateMessage,
    setIsStreaming,
    setIsTyping,
    selectedModel,
    temperature,
    maxTokens,
    systemPrompt,
    onResponse,
    onError,
    onFinish,
  ]);

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      setIsTyping(false);
    }
  }, [setIsStreaming, setIsTyping]);

  const regenerate = useCallback(() => {
    if (!currentConversation?.messages.length) return;

    const lastUserMessage = [...currentConversation.messages]
      .reverse()
      .find(msg => msg.role === 'user');

    if (lastUserMessage) {
      sendMessage(lastUserMessage.content, lastUserMessage.attachments);
    }
  }, [currentConversation, sendMessage]);

  return {
    messages: currentConversation?.messages || [],
    sendMessage,
    stop,
    regenerate,
    error,
    isStreaming: useChatStore(state => state.isStreaming),
    isTyping: useChatStore(state => state.isTyping),
  };
}