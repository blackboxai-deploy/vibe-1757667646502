'use client';

import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TypingIndicator() {
  return (
    <div className="flex gap-3 mr-12">
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center">
        <Bot className="w-4 h-4" />
      </div>

      {/* Typing Animation */}
      <div className="bg-card border border-border rounded-2xl p-4 mr-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Assistant is typing</span>
          <div className="flex gap-1">
            <div className={cn(
              "w-2 h-2 bg-current rounded-full animate-bounce",
              "[animation-delay:-0.3s]"
            )} />
            <div className={cn(
              "w-2 h-2 bg-current rounded-full animate-bounce",
              "[animation-delay:-0.15s]"
            )} />
            <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  );
}