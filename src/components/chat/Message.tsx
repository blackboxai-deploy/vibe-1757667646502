'use client';

import { useState } from 'react';
import { Message as MessageType } from '@/lib/chat-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, User, Bot, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageProps {
  message: MessageType;
  isFirst?: boolean;
  isLast?: boolean;
}

export default function Message({ message }: MessageProps) {
  const [copied, setCopied] = useState(false);
  const { content, role, timestamp, model, tokens, attachments } = message;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isUser = role === 'user';
  const isAssistant = role === 'assistant';

  return (
    <div className={cn(
      "group relative",
      isUser ? "ml-12" : "mr-12"
    )}>
      {/* Message Container */}
      <div className={cn(
        "flex gap-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}>
        {/* Avatar */}
        <div className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold",
          isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
        )}>
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>

        {/* Message Content */}
        <div className={cn(
          "flex-1 space-y-2",
          isUser ? "text-right" : "text-left"
        )}>
          {/* Message Header */}
          <div className={cn(
            "flex items-center gap-2 text-xs text-muted-foreground",
            isUser ? "justify-end" : "justify-start"
          )}>
            <span className="font-medium">
              {isUser ? "You" : "Assistant"}
            </span>
            {model && isAssistant && (
              <Badge variant="secondary" className="text-xs">
                {model}
              </Badge>
            )}
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatTime(timestamp)}</span>
            </div>
            {tokens && (
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                <span>{tokens} tokens</span>
              </div>
            )}
          </div>

          {/* Attachments */}
          {attachments && attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachments.map((file, index) => (
                <Card key={index} className="p-2 bg-muted">
                  <div className="flex items-center gap-2 text-xs">
                    <span>📎</span>
                    <span className="truncate max-w-32">{file.name}</span>
                    <span className="text-muted-foreground">
                      ({(file.size / 1024).toFixed(1)}KB)
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Message Bubble */}
          <div className={cn(
            "relative p-4 rounded-2xl shadow-sm",
            isUser 
              ? "bg-primary text-primary-foreground ml-4" 
              : "bg-card border border-border mr-4"
          )}>
            {/* Message Text */}
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {content ? (
                <pre className="whitespace-pre-wrap font-sans leading-relaxed">
                  {content}
                </pre>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                  <span>Thinking...</span>
                </div>
              )}
            </div>

            {/* Copy Button */}
            {content && (
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "absolute top-2 opacity-0 group-hover:opacity-100 transition-opacity",
                  isUser ? "left-2" : "right-2"
                )}
                onClick={handleCopy}
              >
                <Copy className="w-4 h-4" />
                {copied && <span className="ml-1 text-xs">Copied!</span>}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}