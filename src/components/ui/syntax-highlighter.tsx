'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Play, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SyntaxHighlighterProps {
  code: string;
  language?: string;
  className?: string;
  showLineNumbers?: boolean;
  copyable?: boolean;
  executable?: boolean;
  downloadable?: boolean;
  onExecute?: (code: string, language: string) => void;
  onDownload?: (code: string, language: string) => void;
}

export function SyntaxHighlighter({
  code,
  language = 'text',
  className,
  showLineNumbers = false,
  copyable = true,
  executable = false,
  downloadable = false,
  onExecute,
  onDownload,
}: SyntaxHighlighterProps) {
  const [copied, setCopied] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState(code);

  // Simple syntax highlighting (basic implementation)
  useEffect(() => {
    const highlight = () => {
      let highlighted = code;

      // Basic patterns for common languages
      if (language === 'javascript' || language === 'typescript') {
        // Keywords
        highlighted = highlighted.replace(
          /\b(const|let|var|function|return|if|else|for|while|class|extends|import|export|from|async|await)\b/g,
          '<span class="text-purple-400 font-semibold">$1</span>'
        );
        // Strings
        highlighted = highlighted.replace(
          /(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g,
          '<span class="text-green-400">$1$2$1</span>'
        );
        // Comments
        highlighted = highlighted.replace(
          /\/\/.*$/gm,
          '<span class="text-gray-500 italic">$&</span>'
        );
        highlighted = highlighted.replace(
          /\/\*[\s\S]*?\*\//g,
          '<span class="text-gray-500 italic">$&</span>'
        );
        // Numbers
        highlighted = highlighted.replace(
          /\b\d+\.?\d*\b/g,
          '<span class="text-blue-400">$&</span>'
        );
      } else if (language === 'python') {
        // Keywords
        highlighted = highlighted.replace(
          /\b(def|class|if|elif|else|for|while|try|except|finally|import|from|as|return|yield|break|continue|pass|with|global|nonlocal|lambda|and|or|not|in|is)\b/g,
          '<span class="text-purple-400 font-semibold">$1</span>'
        );
        // Strings
        highlighted = highlighted.replace(
          /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g,
          '<span class="text-green-400">$1$2$1</span>'
        );
        // Comments
        highlighted = highlighted.replace(
          /#.*$/gm,
          '<span class="text-gray-500 italic">$&</span>'
        );
        // Numbers
        highlighted = highlighted.replace(
          /\b\d+\.?\d*\b/g,
          '<span class="text-blue-400">$&</span>'
        );
      } else if (language === 'html') {
        // Tags
        highlighted = highlighted.replace(
          /<\/?[\w\s="/.':;#-\/\?]+>/gi,
          '<span class="text-blue-400">$&</span>'
        );
        // Attributes
        highlighted = highlighted.replace(
          /(\w+)=/g,
          '<span class="text-yellow-400">$1</span>='
        );
        // Attribute values
        highlighted = highlighted.replace(
          /=["']([^"']*)["']/g,
          '=<span class="text-green-400">"$1"</span>'
        );
      } else if (language === 'css') {
        // Selectors
        highlighted = highlighted.replace(
          /^[\w\s\[\].:#+>~-]+(?=\s*{)/gm,
          '<span class="text-yellow-400">$&</span>'
        );
        // Properties
        highlighted = highlighted.replace(
          /([\w-]+)(\s*:)/g,
          '<span class="text-blue-400">$1</span>$2'
        );
        // Values
        highlighted = highlighted.replace(
          /:\s*([^;{}\n]+)/g,
          ': <span class="text-green-400">$1</span>'
        );
        // Comments
        highlighted = highlighted.replace(
          /\/\*[\s\S]*?\*\//g,
          '<span class="text-gray-500 italic">$&</span>'
        );
      }

      setHighlightedCode(highlighted);
    };

    highlight();
  }, [code, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const handleExecute = () => {
    if (onExecute) {
      onExecute(code, language);
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload(code, language);
    } else {
      // Default download implementation
      const extension = getFileExtension(language);
      const blob = new Blob([code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `code.${extension}`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const getFileExtension = (lang: string): string => {
    const extensions: Record<string, string> = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      html: 'html',
      css: 'css',
      json: 'json',
      markdown: 'md',
      jsx: 'jsx',
      tsx: 'tsx',
    };
    return extensions[lang] || 'txt';
  };

  const lines = code.split('\n');

  return (
    <div className={cn("relative group rounded-lg overflow-hidden border border-border bg-muted/50", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/80 text-xs">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {language.toUpperCase()}
          </Badge>
          <span className="text-muted-foreground">
            {lines.length} line{lines.length !== 1 ? 's' : ''} • {code.length} chars
          </span>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {executable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExecute}
              className="h-6 px-2"
              title="Execute code"
            >
              <Play className="w-3 h-3" />
            </Button>
          )}
          
          {downloadable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="h-6 px-2"
              title="Download code"
            >
              <Download className="w-3 h-3" />
            </Button>
          )}
          
          {copyable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-6 px-2"
              title="Copy code"
            >
              {copied ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Code Content */}
      <div className="overflow-x-auto">
        <pre className="p-4 text-sm leading-relaxed">
          <code className="block">
            {showLineNumbers ? (
              <div className="flex">
                {/* Line Numbers */}
                <div className="select-none text-muted-foreground/60 text-right pr-4 border-r border-border/50 mr-4 font-mono text-xs leading-relaxed">
                  {lines.map((_, index) => (
                    <div key={index} className="h-5">
                      {index + 1}
                    </div>
                  ))}
                </div>
                
                {/* Code */}
                <div 
                  className="flex-1 font-mono leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: highlightedCode }}
                />
              </div>
            ) : (
              <div 
                className="font-mono leading-relaxed"
                dangerouslySetInnerHTML={{ __html: highlightedCode }}
              />
            )}
          </code>
        </pre>
      </div>
    </div>
  );
}

// Inline code component
export function InlineCode({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <code className={cn(
      "relative rounded bg-muted px-1.5 py-0.5 font-mono text-sm font-semibold",
      className
    )}>
      {children}
    </code>
  );
}

// Code block with minimal styling (for markdown rendering)
export function CodeBlock({ 
  children, 
  language,
  className 
}: { 
  children: string; 
  language?: string;
  className?: string;
}) {
  return (
    <SyntaxHighlighter
      code={children}
      language={language}
      className={cn("my-4", className)}
      copyable
      downloadable
    />
  );
}