'use client';

import { useRef, useEffect } from 'react';
import { useChatStore } from '@/lib/chat-store';
import { useChat } from '@/hooks/useChat';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';
import { Button } from '@/components/ui/button';
import { RefreshCw, Square } from 'lucide-react';

export default function ChatContainer() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentConversation, isStreaming, isTyping } = useChatStore();
  
  const {
    messages,
    sendMessage,
    stop,
    regenerate,
    error,
  } = useChat({
    onFinish: (message) => {
      console.log('Message completed:', message);
    },
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (content: string, attachments?: File[]) => {
    await sendMessage(content, attachments);
  };

  const handleStopGeneration = () => {
    stop();
  };

  const handleRegenerate = () => {
    regenerate();
  };

  if (!currentConversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">AI</span>
          </div>
          <h2 className="text-2xl font-semibold">Welcome to Advanced AI Assistant</h2>
          <p className="text-muted-foreground max-w-md">
            Your intelligent companion for conversations, code analysis, file processing, and more. 
            Start a conversation to begin exploring advanced AI capabilities.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <MessageList messages={messages} />
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="px-4 py-2">
                <TypingIndicator />
              </div>
            )}
            
            {/* Error Display */}
            {error && (
              <div className="px-4 py-2">
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-sm text-destructive">
                    <strong>Error:</strong> {error.message}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRegenerate}
                    className="mt-2"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Action Bar */}
      {isStreaming && (
        <div className="border-t border-border p-4">
          <div className="max-w-4xl mx-auto flex justify-center">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleStopGeneration}
              className="bg-background"
            >
              <Square className="w-4 h-4 mr-2 fill-current" />
              Stop Generating
            </Button>
          </div>
        </div>
      )}

      {/* Chat Input */}
      <div className="border-t border-border">
        <div className="max-w-4xl mx-auto">
          <ChatInput 
            onSendMessage={handleSendMessage}
            disabled={isStreaming}
            placeholder="Type your message here... (Shift+Enter for new line)"
          />
        </div>
      </div>
    </div>
  );
}