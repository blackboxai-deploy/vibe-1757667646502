"use client";

import { useState } from "react";
import { useChatStore } from "@/lib/chat-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Download, 
  FileText, 
  File, 
  Code, 
  Share2,
  CheckCircle,
  Copy,
  Mail,
  Link,

} from "lucide-react";
import { cn } from "@/lib/utils";

interface ExportDialogProps {
  children?: React.ReactNode;
  conversationId?: string;
  className?: string;
}

type ExportFormat = "json" | "markdown" | "pdf" | "html" | "csv";
type ExportContent = "messages" | "summary" | "analysis" | "code";

const exportFormats = [
  {
    id: "markdown" as ExportFormat,
    name: "Markdown",
    description: "Human-readable format with formatting",
    icon: <FileText className="h-4 w-4" />,
    extension: "md",
    popular: true,
  },
  {
    id: "json" as ExportFormat,
    name: "JSON",
    description: "Structured data for programmatic use",
    icon: <Code className="h-4 w-4" />,
    extension: "json",
    popular: true,
  },
  {
    id: "pdf" as ExportFormat,
    name: "PDF",
    description: "Professional document format",
    icon: <File className="h-4 w-4" />,
    extension: "pdf",
    popular: false,
  },
  {
    id: "html" as ExportFormat,
    name: "HTML",
    description: "Web-viewable format with styling",
    icon: <FileText className="h-4 w-4" />,
    extension: "html",
    popular: false,
  },
  {
    id: "csv" as ExportFormat,
    name: "CSV",
    description: "Spreadsheet-compatible format",
    icon: <File className="h-4 w-4" />,
    extension: "csv",
    popular: false,
  },
];

const contentTypes = [
  {
    id: "messages" as ExportContent,
    name: "All Messages",
    description: "Complete conversation history",
    default: true,
  },
  {
    id: "summary" as ExportContent,
    name: "Conversation Summary",
    description: "Key points and conclusions",
    default: false,
  },
  {
    id: "analysis" as ExportContent,
    name: "Analysis & Insights",
    description: "Extracted insights and patterns",
    default: false,
  },
  {
    id: "code" as ExportContent,
    name: "Code Snippets Only",
    description: "Just the code blocks and technical content",
    default: false,
  },
];

export function ExportDialog({ children, conversationId, className }: ExportDialogProps) {
  const { currentConversation, conversations } = useChatStore();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("markdown");
  const [selectedContent, setSelectedContent] = useState<ExportContent[]>(["messages"]);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includeTimestamps, setIncludeTimestamps] = useState(true);
  const [shareMethod, setShareMethod] = useState<"download" | "copy" | "email" | "link">("download");
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  // Get the conversation to export
  const conversationToExport = conversationId 
    ? conversations.find(c => c.id === conversationId)
    : currentConversation;

  if (!conversationToExport) {
    return null;
  }

  const generateExportData = () => {
    const conversation = conversationToExport;
    const metadata = {
      title: conversation.title,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      model: conversation.model,
      messageCount: conversation.messages.length,
      exportedAt: new Date(),
    };

    let content = "";
    const format = exportFormats.find(f => f.id === selectedFormat)!;

    switch (selectedFormat) {
      case "markdown":
        content = generateMarkdown(conversation, metadata);
        break;
      case "json":
        content = JSON.stringify({
          metadata: includeMetadata ? metadata : undefined,
          messages: conversation.messages.map(msg => ({
            ...msg,
            timestamp: includeTimestamps ? msg.timestamp : undefined,
          })),
        }, null, 2);
        break;
      case "html":
        content = generateHTML(conversation, metadata);
        break;
      case "csv":
        content = generateCSV(conversation, metadata);
        break;
      case "pdf":
        // For PDF, we'd typically use a library like jsPDF
        content = generateMarkdown(conversation, metadata);
        break;
    }

    return {
      content,
      filename: `${conversation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${format.extension}`,
      mimeType: getMimeType(selectedFormat),
    };
  };

  const generateMarkdown = (conversation: any, metadata: any) => {
    let content = `# ${conversation.title}\n\n`;
    
    if (includeMetadata) {
      content += `**Created:** ${new Date(metadata.createdAt).toLocaleString()}\n`;
      content += `**Model:** ${metadata.model}\n`;
      content += `**Messages:** ${metadata.messageCount}\n\n`;
      content += "---\n\n";
    }

    conversation.messages.forEach((message: any, index: number) => {
      const role = message.role === "user" ? "👤 User" : "🤖 Assistant";
      content += `## ${role}`;
      
      if (includeTimestamps) {
        content += ` (${new Date(message.timestamp).toLocaleString()})`;
      }
      
      content += `\n\n${message.content}\n\n`;
      
      if (index < conversation.messages.length - 1) {
        content += "---\n\n";
      }
    });

    return content;
  };

  const generateHTML = (conversation: any, metadata: any) => {
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${conversation.title}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; }
        .header { border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
        .message { margin-bottom: 30px; }
        .user { background: #f0f9ff; padding: 20px; border-radius: 8px; }
        .assistant { background: #f8fafc; padding: 20px; border-radius: 8px; }
        .role { font-weight: 600; margin-bottom: 10px; color: #374151; }
        .timestamp { color: #6b7280; font-size: 0.875rem; }
        pre { background: #f3f4f6; padding: 15px; border-radius: 6px; overflow-x: auto; }
    </style>
</head>
<body>`;

    html += `<div class="header"><h1>${conversation.title}</h1>`;
    
    if (includeMetadata) {
      html += `<p><strong>Created:</strong> ${new Date(metadata.createdAt).toLocaleString()}</p>`;
      html += `<p><strong>Model:</strong> ${metadata.model}</p>`;
      html += `<p><strong>Messages:</strong> ${metadata.messageCount}</p>`;
    }
    
    html += `</div>`;

    conversation.messages.forEach((message: any) => {
      const roleClass = message.role === "user" ? "user" : "assistant";
      const roleDisplay = message.role === "user" ? "👤 User" : "🤖 Assistant";
      
      html += `<div class="message ${roleClass}">`;
      html += `<div class="role">${roleDisplay}`;
      
      if (includeTimestamps) {
        html += ` <span class="timestamp">(${new Date(message.timestamp).toLocaleString()})</span>`;
      }
      
      html += `</div>`;
      html += `<div>${message.content.replace(/\n/g, '<br>')}</div>`;
      html += `</div>`;
    });

    html += `</body></html>`;
    return html;
  };

  const generateCSV = (conversation: any, metadata: any) => {
    let csv = "Role,Content,Timestamp,Model\n";
    
    conversation.messages.forEach((message: any) => {
      const content = message.content.replace(/"/g, '""'); // Escape quotes
      const timestamp = includeTimestamps ? new Date(message.timestamp).toISOString() : "";
      csv += `"${message.role}","${content}","${timestamp}","${conversation.model}"\n`;
    });

    return csv;
  };

  const getMimeType = (format: ExportFormat) => {
    switch (format) {
      case "json": return "application/json";
      case "html": return "text/html";
      case "csv": return "text/csv";
      case "pdf": return "application/pdf";
      default: return "text/plain";
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const { content, filename, mimeType } = generateExportData();
      
      // Simulate export processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (shareMethod === "download") {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (shareMethod === "copy") {
        await navigator.clipboard.writeText(content);
      }
      
      setExportComplete(true);
      setTimeout(() => {
        setExportComplete(false);
        setIsOpen(false);
      }, 2000);
      
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const toggleContentType = (contentType: ExportContent, checked: boolean) => {
    setSelectedContent(prev => 
      checked 
        ? [...prev, contentType]
        : prev.filter(c => c !== contentType)
    );
  };

  const selectedFormatInfo = exportFormats.find(f => f.id === selectedFormat)!;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className={className}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Export Conversation</span>
          </DialogTitle>
          <DialogDescription>
            Export "{conversationToExport.title}" with {conversationToExport.messages.length} messages
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Format</Label>
            <RadioGroup value={selectedFormat} onValueChange={(value) => setSelectedFormat(value as ExportFormat)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {exportFormats.map((format) => (
                  <div key={format.id} className="relative">
                    <RadioGroupItem
                      value={format.id}
                      id={format.id}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={format.id}
                      className={cn(
                        "flex items-start space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-accent",
                        "peer-checked:border-primary peer-checked:bg-primary/5"
                      )}
                    >
                      <div className="text-primary mt-0.5">{format.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{format.name}</span>
                          {format.popular && (
                            <Badge variant="secondary" className="text-xs">Popular</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {format.description}
                        </p>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Content Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Content to Include</Label>
            <div className="space-y-3">
              {contentTypes.map((contentType) => (
                <div key={contentType.id} className="flex items-start space-x-3">
                  <Checkbox
                    id={contentType.id}
                    checked={selectedContent.includes(contentType.id)}
                    onCheckedChange={(checked) => 
                      toggleContentType(contentType.id, checked as boolean)
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor={contentType.id} className="text-sm font-medium cursor-pointer">
                      {contentType.name}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {contentType.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Export Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Options</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="metadata"
                  checked={includeMetadata}
                  onCheckedChange={(checked) => setIncludeMetadata(checked as boolean)}
                />
                <Label htmlFor="metadata" className="text-sm cursor-pointer">
                  Include conversation metadata
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="timestamps"
                  checked={includeTimestamps}
                  onCheckedChange={(checked) => setIncludeTimestamps(checked as boolean)}
                />
                <Label htmlFor="timestamps" className="text-sm cursor-pointer">
                  Include message timestamps
                </Label>
              </div>
            </div>
          </div>

          {/* Share Method */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Method</Label>
            <Select value={shareMethod} onValueChange={(value) => setShareMethod(value as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="download">
                  <div className="flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Download File</span>
                  </div>
                </SelectItem>
                <SelectItem value="copy">
                  <div className="flex items-center space-x-2">
                    <Copy className="h-4 w-4" />
                    <span>Copy to Clipboard</span>
                  </div>
                </SelectItem>
                <SelectItem value="email">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Send via Email</span>
                  </div>
                </SelectItem>
                <SelectItem value="link">
                  <div className="flex items-center space-x-2">
                    <Link className="h-4 w-4" />
                    <span>Generate Share Link</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          <Card className="p-4 bg-muted/50">
            <div className="flex items-center space-x-2 mb-2">
              {selectedFormatInfo.icon}
              <span className="text-sm font-medium">Export Preview</span>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Format: {selectedFormatInfo.name} (.{selectedFormatInfo.extension})</p>
              <p>Content: {selectedContent.length} section(s)</p>
              <p>Messages: {conversationToExport.messages.length}</p>
              {includeMetadata && <p>✓ Includes metadata</p>}
              {includeTimestamps && <p>✓ Includes timestamps</p>}
            </div>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting || selectedContent.length === 0}>
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Exporting...
              </>
            ) : exportComplete ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Exported!
              </>
            ) : (
              <>
                {shareMethod === "download" && <Download className="mr-2 h-4 w-4" />}
                {shareMethod === "copy" && <Copy className="mr-2 h-4 w-4" />}
                {shareMethod === "email" && <Mail className="mr-2 h-4 w-4" />}
                {shareMethod === "link" && <Share2 className="mr-2 h-4 w-4" />}
                Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}