"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Search, 
  Plus, 
  Code, 
  FileText, 
  Lightbulb, 
  MessageSquare, 
  Briefcase,
  GraduationCap,
  Palette,
  Brain,
  Star,
  Copy,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: string;
  tags: string[];
  icon: React.ReactNode;
  isFavorite?: boolean;
}

const defaultTemplates: PromptTemplate[] = [
  {
    id: "1",
    title: "Code Review",
    description: "Get comprehensive code review and suggestions",
    prompt: "Please review the following code and provide:\n1. Code quality assessment\n2. Performance improvements\n3. Best practices recommendations\n4. Security considerations\n\n```\n[Paste your code here]\n```",
    category: "coding",
    tags: ["review", "optimization", "best-practices"],
    icon: <Code className="h-4 w-4" />,
  },
  {
    id: "2", 
    title: "Document Summarizer",
    description: "Summarize long documents with key points",
    prompt: "Please analyze the following document and provide:\n1. Executive summary (2-3 sentences)\n2. Key points (bullet format)\n3. Important details\n4. Action items (if any)\n\nDocument:\n[Paste your document here]",
    category: "analysis",
    tags: ["summary", "analysis", "documents"],
    icon: <FileText className="h-4 w-4" />,
  },
  {
    id: "3",
    title: "Creative Brainstorming",
    description: "Generate creative ideas and solutions",
    prompt: "I need creative ideas for: [Describe your challenge]\n\nPlease provide:\n1. 5-10 innovative approaches\n2. Pros and cons for top 3 ideas\n3. Implementation suggestions\n4. Potential obstacles and solutions\n\nContext: [Add any relevant background information]",
    category: "creative",
    tags: ["brainstorming", "innovation", "ideas"],
    icon: <Lightbulb className="h-4 w-4" />,
  },
  {
    id: "4",
    title: "Technical Explanation",
    description: "Explain complex technical concepts simply",
    prompt: "Please explain [technical concept] in a way that:\n1. A beginner can understand\n2. Includes real-world analogies\n3. Covers practical applications\n4. Mentions common misconceptions\n\nTarget audience: [Specify audience level]\nSpecific focus: [What aspect to emphasize]",
    category: "education",
    tags: ["explanation", "technical", "education"],
    icon: <GraduationCap className="h-4 w-4" />,
  },
  {
    id: "5",
    title: "Business Strategy",
    description: "Analyze business scenarios and strategies",
    prompt: "Business Challenge: [Describe the situation]\n\nPlease provide:\n1. Situation analysis (SWOT if relevant)\n2. Strategic options (3-5 alternatives)\n3. Risk assessment for each option\n4. Recommended approach with reasoning\n5. Implementation timeline\n\nCompany context: [Industry, size, resources]",
    category: "business",
    tags: ["strategy", "analysis", "planning"],
    icon: <Briefcase className="h-4 w-4" />,
  },
  {
    id: "6",
    title: "Creative Writing",
    description: "Generate creative content and stories",
    prompt: "Creative Writing Request:\nGenre: [Specify genre]\nTone: [Describe desired tone]\nLength: [Approximate word count]\nKey elements: [Characters, setting, themes]\n\nPlease create:\n1. Compelling opening\n2. Well-developed characters\n3. Engaging plot progression\n4. Satisfying conclusion\n\nSpecial requirements: [Any specific needs]",
    category: "creative",
    tags: ["writing", "storytelling", "content"],
    icon: <Palette className="h-4 w-4" />,
  },
  {
    id: "7",
    title: "Problem Solving",
    description: "Systematic approach to complex problems",
    prompt: "Problem: [Clearly define the problem]\n\nPlease help me:\n1. Break down the problem into components\n2. Identify root causes\n3. Generate multiple solution approaches\n4. Evaluate solutions (feasibility, impact, resources)\n5. Recommend the best approach\n\nConstraints: [Time, budget, resources, etc.]\nSuccess criteria: [How will we measure success?]",
    category: "analysis",
    tags: ["problem-solving", "analysis", "strategy"],
    icon: <Brain className="h-4 w-4" />,
  },
  {
    id: "8",
    title: "Meeting Assistant",
    description: "Prepare for or follow up on meetings",
    prompt: "Meeting: [Meeting topic/purpose]\nParticipants: [Who will attend]\nDate: [When]\n\nPlease help me:\n1. Create a detailed agenda\n2. Prepare key talking points\n3. Anticipate questions/concerns\n4. Suggest follow-up actions\n\nContext: [Background information]\nGoals: [What we want to achieve]",
    category: "business",
    tags: ["meetings", "preparation", "communication"],
    icon: <MessageSquare className="h-4 w-4" />,
  },
];

interface PromptTemplatesProps {
  onSelectTemplate?: (template: PromptTemplate) => void;
  className?: string;
}

export function PromptTemplates({ onSelectTemplate, className }: PromptTemplatesProps) {
  const [templates, setTemplates] = useState<PromptTemplate[]>(defaultTemplates);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAddingTemplate, setIsAddingTemplate] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    title: "",
    description: "",
    prompt: "",
    category: "custom",
    tags: "",
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    { id: "all", label: "All Templates", count: templates.length },
    { id: "coding", label: "Coding", count: templates.filter(t => t.category === "coding").length },
    { id: "analysis", label: "Analysis", count: templates.filter(t => t.category === "analysis").length },
    { id: "creative", label: "Creative", count: templates.filter(t => t.category === "creative").length },
    { id: "business", label: "Business", count: templates.filter(t => t.category === "business").length },
    { id: "education", label: "Education", count: templates.filter(t => t.category === "education").length },
    { id: "custom", label: "Custom", count: templates.filter(t => t.category === "custom").length },
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCopyPrompt = async (template: PromptTemplate) => {
    try {
      await navigator.clipboard.writeText(template.prompt);
      setCopiedId(template.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy prompt:", err);
    }
  };

  const handleAddTemplate = () => {
    if (!newTemplate.title || !newTemplate.prompt) return;

    const template: PromptTemplate = {
      id: Date.now().toString(),
      title: newTemplate.title,
      description: newTemplate.description,
      prompt: newTemplate.prompt,
      category: newTemplate.category,
      tags: newTemplate.tags.split(",").map(tag => tag.trim()).filter(Boolean),
      icon: <Star className="h-4 w-4" />,
    };

    setTemplates(prev => [template, ...prev]);
    setNewTemplate({ title: "", description: "", prompt: "", category: "custom", tags: "" });
    setIsAddingTemplate(false);
  };

  const toggleFavorite = (templateId: string) => {
    setTemplates(prev => prev.map(template => 
      template.id === templateId 
        ? { ...template, isFavorite: !template.isFavorite }
        : template
    ));
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Prompt Templates</h2>
          <p className="text-muted-foreground">Pre-built prompts for common tasks</p>
        </div>
        
        <Dialog open={isAddingTemplate} onOpenChange={setIsAddingTemplate}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
              <DialogDescription>
                Create a custom prompt template for reuse
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={newTemplate.title}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Template title"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={newTemplate.category}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="custom">Custom</option>
                    <option value="coding">Coding</option>
                    <option value="analysis">Analysis</option>
                    <option value="creative">Creative</option>
                    <option value="business">Business</option>
                    <option value="education">Education</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of what this template does"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Tags (comma-separated)</label>
                <Input
                  value={newTemplate.tags}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="analysis, report, summary"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Prompt Template</label>
                <Textarea
                  value={newTemplate.prompt}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, prompt: e.target.value }))}
                  placeholder="Write your prompt template here..."
                  rows={6}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingTemplate(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTemplate}>
                Create Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
            {categories.map(category => (
              <TabsTrigger key={category.id} value={category.id} className="text-xs">
                {category.label} ({category.count})
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Templates Grid */}
      <ScrollArea className="h-[600px]">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="text-primary">{template.icon}</div>
                    <h3 className="font-semibold text-sm">{template.title}</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(template.id)}
                    className="h-6 w-6 p-0"
                  >
                    <Star className={cn(
                      "h-3 w-3",
                      template.isFavorite ? "fill-current text-yellow-500" : "text-muted-foreground"
                    )} />
                  </Button>
                </div>

                {/* Description */}
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {template.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {template.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs py-0">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => onSelectTemplate?.(template)}
                    className="flex-1 text-xs"
                  >
                    Use Template
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyPrompt(template)}
                    className="px-2"
                  >
                    {copiedId === template.id ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              <MessageSquare className="mx-auto h-12 w-12 mb-4 opacity-20" />
              <p>No templates found</p>
              <p className="text-sm mt-1">
                {searchTerm ? "Try a different search term" : "Create your first custom template"}
              </p>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}