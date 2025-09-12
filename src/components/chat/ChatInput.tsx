'use client';

import { useState, useRef, useCallback, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Paperclip, 
  X, 
  Image as ImageIcon, 
  FileText, 
  Code,
  Mic,
  MicOff
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (content: string, attachments?: File[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "Type your message..."
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 200);
      textarea.style.height = `${newHeight}px`;
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    adjustTextareaHeight();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Shift+Enter for new line
        return;
      } else {
        // Enter to send
        e.preventDefault();
        handleSend();
      }
    }
  };

  const handleSend = () => {
    if (!message.trim() && attachments.length === 0) return;
    if (disabled) return;

    onSendMessage(message.trim(), attachments);
    setMessage('');
    setAttachments([]);
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      // Allow common file types (images, documents, code files)
      const allowedTypes = [
        'image/',
        'text/',
        'application/pdf',
        'application/json',
        'application/javascript',
        '.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.cpp', '.c', '.cs',
        '.html', '.css', '.scss', '.md', '.txt', '.csv'
      ];
      
      return allowedTypes.some(type => 
        (file as File).type.startsWith(type) || (file as File).name.includes(type)
      );
    });

    setAttachments(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="w-4 h-4" />;
    if (file.type.includes('text') || file.name.match(/\.(js|ts|py|java|cpp|html|css|md)$/)) {
      return <Code className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  const getFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleVoiceRecording = () => {
    // Placeholder for voice recording functionality
    setIsRecording(!isRecording);
    // TODO: Implement speech-to-text
  };

  return (
    <div className="p-4 space-y-3">
      {/* Attachments Display */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <Card key={index} className="flex items-center gap-2 p-2 bg-muted">
              {getFileIcon(file)}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{getFileSize(file.size)}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeAttachment(index)}
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end gap-3">
        {/* File Upload Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || attachments.length >= 5}
          className="flex-shrink-0"
        >
          <Paperclip className="w-4 h-4" />
        </Button>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,.pdf,.txt,.md,.js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.cs,.html,.css,.scss,.json,.csv"
        />

        {/* Text Input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="min-h-[44px] max-h-[200px] pr-12 resize-none"
            rows={1}
          />
          
          {/* Character Count */}
          {message.length > 0 && (
            <Badge 
              variant="secondary" 
              className="absolute bottom-2 right-12 text-xs"
            >
              {message.length}
            </Badge>
          )}
        </div>

        {/* Voice Recording Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleVoiceRecording}
          disabled={disabled}
          className={cn(
            "flex-shrink-0",
            isRecording && "bg-red-500 text-white hover:bg-red-600"
          )}
        >
          {isRecording ? (
            <MicOff className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </Button>

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={disabled || (!message.trim() && attachments.length === 0)}
          size="sm"
          className="flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>

      {/* Input Hints */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Press Shift+Enter for new line</span>
        <span>Max 5 files, 10MB each</span>
      </div>
    </div>
  );
}