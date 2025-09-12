'use client';

import { useChatStore } from '@/lib/chat-store';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Menu,
  Sun,
  Moon,
  Settings,
  Download,
  Trash2,
  Bot,
  Zap,
  MessageSquare,
  Palette
} from 'lucide-react';

export default function Header() {
  const {
    currentConversation,
    toggleSidebar,
    selectedModel,
    setSelectedModel,
    clearAllConversations,
  } = useChatStore();

  const { theme, setTheme } = useTheme();

  const availableModels = [
    { id: 'gpt-4', name: 'GPT-4', badge: 'SMART' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', badge: 'FAST' },
    { id: 'claude-3', name: 'Claude 3', badge: 'CREATIVE' },
    { id: 'gemini-pro', name: 'Gemini Pro', badge: 'MULTI-MODAL' },
  ];

  const getCurrentModel = () => {
    return availableModels.find(model => model.id === selectedModel) || availableModels[0];
  };

  const getConversationStats = () => {
    if (!currentConversation) return { messages: 0, tokens: 0 };
    
    const messages = currentConversation.messages.length;
    const tokens = currentConversation.messages.reduce((total, msg) => total + (msg.tokens || 0), 0);
    
    return { messages, tokens };
  };

  const handleExportConversation = () => {
    if (!currentConversation) return;
    
    const exportData = {
      title: currentConversation.title,
      messages: currentConversation.messages,
      model: currentConversation.model,
      createdAt: new Date(currentConversation.createdAt).toISOString(),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentConversation.title.slice(0, 50)}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  };

  const handleClearAllConversations = () => {
    if (confirm('Are you sure you want to delete all conversations? This action cannot be undone.')) {
      clearAllConversations();
    }
  };

  const stats = getConversationStats();
  const currentModel = getCurrentModel();

  return (
    <div className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          {/* Sidebar Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="md:hidden"
          >
            <Menu className="w-4 h-4" />
          </Button>

          {/* App Title */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-sm">Advanced AI Assistant</h1>
              {currentConversation && (
                <p className="text-xs text-muted-foreground truncate max-w-48">
                  {currentConversation.title}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Center Stats */}
        {currentConversation && (
          <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              <span>{stats.messages} messages</span>
            </div>
            {stats.tokens > 0 && (
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                <span>{stats.tokens.toLocaleString()} tokens</span>
              </div>
            )}
          </div>
        )}

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* Model Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Bot className="w-3 h-3" />
                <span className="hidden sm:inline">{currentModel.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {currentModel.badge}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Select AI Model</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableModels.map((model) => (
                <DropdownMenuItem
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Bot className="w-3 h-3" />
                    <span>{model.name}</span>
                  </div>
                  <Badge variant={selectedModel === model.id ? "default" : "secondary"} className="text-xs">
                    {model.badge}
                  </Badge>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>

          {/* Settings Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {currentConversation && (
                <>
                  <DropdownMenuItem onClick={handleExportConversation}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Chat
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}

              <Dialog>
                <DialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Palette className="w-4 h-4 mr-2" />
                    Preferences
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Preferences</DialogTitle>
                    <DialogDescription>
                      Customize your AI assistant experience.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Theme</h4>
                      <div className="flex gap-2">
                        <Button
                          variant={theme === 'light' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setTheme('light')}
                        >
                          Light
                        </Button>
                        <Button
                          variant={theme === 'dark' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setTheme('dark')}
                        >
                          Dark
                        </Button>
                        <Button
                          variant={theme === 'system' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setTheme('system')}
                        >
                          System
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleClearAllConversations}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Chats
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}