'use client';

import { Message as MessageType } from '@/lib/chat-store';
import Message from './Message';

interface MessageListProps {
  messages: MessageType[];
}

export default function MessageList({ messages }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 p-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center">
          <span className="text-2xl">💬</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Ask me anything! I can help with coding, analysis, creative writing, 
            problem-solving, and much more. Upload files for analysis or start with a simple question.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
          <div className="p-3 border border-border rounded-lg bg-card hover:bg-accent transition-colors cursor-pointer">
            <p className="text-sm font-medium">💡 Explain a concept</p>
            <p className="text-xs text-muted-foreground">Get clear explanations</p>
          </div>
          <div className="p-3 border border-border rounded-lg bg-card hover:bg-accent transition-colors cursor-pointer">
            <p className="text-sm font-medium">🔍 Analyze code</p>
            <p className="text-xs text-muted-foreground">Review and optimize</p>
          </div>
          <div className="p-3 border border-border rounded-lg bg-card hover:bg-accent transition-colors cursor-pointer">
            <p className="text-sm font-medium">📄 Process files</p>
            <p className="text-xs text-muted-foreground">Upload and analyze</p>
          </div>
          <div className="p-3 border border-border rounded-lg bg-card hover:bg-accent transition-colors cursor-pointer">
            <p className="text-sm font-medium">✨ Create content</p>
            <p className="text-xs text-muted-foreground">Writing and ideation</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {messages.map((message, index) => (
        <Message 
          key={message.id} 
          message={message} 
          isFirst={index === 0}
          isLast={index === messages.length - 1}
        />
      ))}
    </div>
  );
}