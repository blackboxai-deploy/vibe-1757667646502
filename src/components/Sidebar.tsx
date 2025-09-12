'use client';

import { useState } from 'react';
import { useChatStore } from '@/lib/chat-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  MessageSquare, 
  MoreHorizontal, 
  Trash2, 
  Edit3,
  Clock,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

import type { Conversation } from '@/lib/chat-store';

interface SidebarProps {
  conversations?: Conversation[];
  currentConversation?: Conversation | null;
  onSelectConversation?: (conversation: Conversation) => void;
  onNewChat?: () => void;
  isOpen?: boolean;
}

export default function Sidebar({ 
  conversations: propConversations,
  currentConversation: propCurrentConversation,
  onSelectConversation,
  onNewChat,
  isOpen = true
}: SidebarProps = {}) {
  const {
    conversations: storeConversations,
    currentConversation: storeCurrentConversation,
    createConversation,
    setCurrentConversation,
    deleteConversation,
  } = useChatStore();
  
  // Use props if provided, otherwise use store values
  const conversations = propConversations || storeConversations;
  const currentConversation = propCurrentConversation || storeCurrentConversation;
  
  const [editingId, setEditingId] = useState<string | null>(null);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short' 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getMessageCount = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    return conversation?.messages.length || 0;
  };

  const getTotalTokens = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    return conversation?.messages.reduce((total, msg) => total + (msg.tokens || 0), 0) || 0;
  };

  const handleDeleteConversation = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this conversation?')) {
      deleteConversation(conversationId);
    }
  };

  const handleEditTitle = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conversationId);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm">Conversations</h2>
          <Badge variant="secondary" className="text-xs">
            {conversations.length}
          </Badge>
        </div>
        
        <Button
          onClick={() => onNewChat ? onNewChat() : createConversation()}
          className="w-full justify-start gap-2"
          variant="outline"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No conversations yet</p>
              <p className="text-xs">Start a new chat to begin</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <Card
                key={conversation.id}
                className={cn(
                  "p-3 cursor-pointer transition-all hover:bg-accent group",
                  currentConversation?.id === conversation.id && "bg-accent border-primary/50"
                )}
                onClick={() => onSelectConversation ? onSelectConversation(conversation) : setCurrentConversation(conversation)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {editingId === conversation.id ? (
                      <input
                        autoFocus
                        className="w-full bg-transparent border-none outline-none text-sm font-medium"
                        defaultValue={conversation.title}
                        onBlur={() => {
                          // TODO: Implement title update
                          setEditingId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.currentTarget.blur();
                          }
                          if (e.key === 'Escape') {
                            setEditingId(null);
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <h3 className="text-sm font-medium line-clamp-1 mb-1">
                        {conversation.title}
                      </h3>
                    )}
                    
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(conversation.updatedAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>{getMessageCount(conversation.id)}</span>
                      </div>
                      {getTotalTokens(conversation.id) > 0 && (
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          <span>{getTotalTokens(conversation.id)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-1">
                      <Badge variant="outline" className="text-xs">
                        {conversation.model}
                      </Badge>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        onClick={(e) => handleEditTitle(conversation.id, e)}
                        className="text-xs"
                      >
                        <Edit3 className="w-3 h-3 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => handleDeleteConversation(conversation.id, e)}
                        className="text-xs text-destructive"
                      >
                        <Trash2 className="w-3 h-3 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}