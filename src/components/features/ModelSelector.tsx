'use client';

import { useState, useEffect } from 'react';
import { useChatStore } from '@/lib/chat-store';
import { aiService, AIModel } from '@/lib/ai-service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, Zap, Clock, Brain, Palette, Eye, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ModelSelector() {
  const { selectedModel, setSelectedModel } = useChatStore();
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const fetchedModels = await aiService.getModels();
        setModels(fetchedModels);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load models');
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  const currentModel = models.find(model => model.id === selectedModel);

  const getModelIcon = (badge: string) => {
    switch (badge) {
      case 'SMART': return <Brain className="w-4 h-4" />;
      case 'FAST': return <Zap className="w-4 h-4" />;
      case 'CREATIVE': return <Palette className="w-4 h-4" />;
      case 'MULTI-MODAL': return <Eye className="w-4 h-4" />;
      default: return <Bot className="w-4 h-4" />;
    }
  };

  const getBadgeColor = (badge: string): string => {
    switch (badge) {
      case 'SMART': return 'bg-blue-500 text-white';
      case 'FAST': return 'bg-green-500 text-white';
      case 'CREATIVE': return 'bg-purple-500 text-white';
      case 'MULTI-MODAL': return 'bg-orange-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const formatCost = (cost: number): string => {
    if (cost < 0.01) return `${(cost * 1000).toFixed(2)}¢/1K`;
    return `$${cost.toFixed(3)}/1K`;
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
        <span>Loading models...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-destructive">
        Error loading models: {error}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Quick Selector */}
      <Select value={selectedModel} onValueChange={setSelectedModel}>
        <SelectTrigger className="w-auto min-w-32 h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {models.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              <div className="flex items-center gap-2">
                {getModelIcon(model.badge)}
                <span>{model.name}</span>
                <Badge className={cn("text-xs", getBadgeColor(model.badge))}>
                  {model.badge}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Detailed Selector Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 px-2">
            <Bot className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>AI Model Selection</DialogTitle>
            <DialogDescription>
              Choose the best AI model for your needs. Each model has different strengths and pricing.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="grid" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="grid">Model Grid</TabsTrigger>
              <TabsTrigger value="comparison">Compare</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>

            {/* Grid View */}
            <TabsContent value="grid" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {models.map((model) => (
                  <Card 
                    key={model.id} 
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      selectedModel === model.id && "ring-2 ring-primary"
                    )}
                    onClick={() => setSelectedModel(model.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          {getModelIcon(model.badge)}
                          {model.name}
                        </CardTitle>
                        <Badge className={cn("text-xs", getBadgeColor(model.badge))}>
                          {model.badge}
                        </Badge>
                      </div>
                      <CardDescription>{model.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Features */}
                      <div>
                        <h5 className="text-sm font-medium mb-2">Key Features</h5>
                        <div className="flex flex-wrap gap-1">
                          {model.features.slice(0, 3).map((feature, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {model.features.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{model.features.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Capabilities */}
                      <div>
                        <h5 className="text-sm font-medium mb-2">Capabilities</h5>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              model.capabilities.textGeneration ? "bg-green-500" : "bg-gray-300"
                            )} />
                            <span>Text Generation</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              model.capabilities.codeGeneration ? "bg-green-500" : "bg-gray-300"
                            )} />
                            <span>Code Generation</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              model.capabilities.reasoning ? "bg-green-500" : "bg-gray-300"
                            )} />
                            <span>Reasoning</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              model.capabilities.multiModal ? "bg-green-500" : "bg-gray-300"
                            )} />
                            <span>Multi-Modal</span>
                          </div>
                        </div>
                      </div>

                      {/* Pricing & Specs */}
                      <div className="flex justify-between items-center pt-2 border-t text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {formatCost(model.pricing.input)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {model.maxTokens.toLocaleString()}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">
                          {model.provider}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Comparison View */}
            <TabsContent value="comparison" className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="border border-border p-3 text-left">Model</th>
                      <th className="border border-border p-3 text-center">Provider</th>
                      <th className="border border-border p-3 text-center">Max Tokens</th>
                      <th className="border border-border p-3 text-center">Input Cost</th>
                      <th className="border border-border p-3 text-center">Output Cost</th>
                      <th className="border border-border p-3 text-center">Multi-Modal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {models.map((model) => (
                      <tr 
                        key={model.id}
                        className={cn(
                          "hover:bg-muted/30 cursor-pointer",
                          selectedModel === model.id && "bg-primary/10"
                        )}
                        onClick={() => setSelectedModel(model.id)}
                      >
                        <td className="border border-border p-3">
                          <div className="flex items-center gap-2">
                            {getModelIcon(model.badge)}
                            <span className="font-medium">{model.name}</span>
                            <Badge className={cn("text-xs", getBadgeColor(model.badge))}>
                              {model.badge}
                            </Badge>
                          </div>
                        </td>
                        <td className="border border-border p-3 text-center text-sm">
                          {model.provider}
                        </td>
                        <td className="border border-border p-3 text-center text-sm">
                          {model.maxTokens.toLocaleString()}
                        </td>
                        <td className="border border-border p-3 text-center text-sm">
                          {formatCost(model.pricing.input)}
                        </td>
                        <td className="border border-border p-3 text-center text-sm">
                          {formatCost(model.pricing.output)}
                        </td>
                        <td className="border border-border p-3 text-center">
                          <div className={cn(
                            "w-3 h-3 rounded-full mx-auto",
                            model.capabilities.multiModal ? "bg-green-500" : "bg-gray-300"
                          )} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {/* Recommendations */}
            <TabsContent value="recommendations" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      Best for Complex Reasoning
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      For advanced analysis, complex problem-solving, and detailed reasoning tasks.
                    </p>
                    <Button 
                      variant={selectedModel === 'gpt-4' ? 'default' : 'outline'}
                      onClick={() => setSelectedModel('gpt-4')}
                      className="w-full"
                    >
                      Select GPT-4
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Best for Speed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      For quick responses, casual conversations, and cost-effective usage.
                    </p>
                    <Button 
                      variant={selectedModel === 'gpt-3.5-turbo' ? 'default' : 'outline'}
                      onClick={() => setSelectedModel('gpt-3.5-turbo')}
                      className="w-full"
                    >
                      Select GPT-3.5 Turbo
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      Best for Creative Writing
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      For creative content, storytelling, and thoughtful compositions.
                    </p>
                    <Button 
                      variant={selectedModel === 'claude-3' ? 'default' : 'outline'}
                      onClick={() => setSelectedModel('claude-3')}
                      className="w-full"
                    >
                      Select Claude 3
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Best for Multi-Modal Tasks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      For image analysis, vision tasks, and multi-modal interactions.
                    </p>
                    <Button 
                      variant={selectedModel === 'gemini-pro' ? 'default' : 'outline'}
                      onClick={() => setSelectedModel('gemini-pro')}
                      className="w-full"
                    >
                      Select Gemini Pro
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Current Selection */}
          {currentModel && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Currently Selected: {currentModel.name}</h4>
                  <p className="text-sm text-muted-foreground">{currentModel.description}</p>
                </div>
                <Badge className={cn("text-xs", getBadgeColor(currentModel.badge))}>
                  {currentModel.badge}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}