"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  File, 
  Image, 
  FileText, 
  Code, 
  X, 
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: "uploading" | "completed" | "error";
  url?: string;
  analysis?: string;
}

interface FileUploadProps {
  onFilesUploaded?: (files: UploadedFile[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  className?: string;
}

export function FileUpload({ 
  onFilesUploaded, 
  maxFiles = 5, 
  acceptedTypes = ["image/*", ".pdf", ".docx", ".txt", ".md", ".js", ".ts", ".jsx", ".tsx", ".py", ".java", ".cpp"],
  className 
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: "uploading" as const,
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Simulate file upload process
    newFiles.forEach(uploadedFile => {
      simulateUpload(uploadedFile);
    });

    onFilesUploaded?.(newFiles);
  }, [onFilesUploaded]);

  const { getRootProps, getInputProps, isDragActive: dropzoneActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxFiles,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  });

  const simulateUpload = (uploadedFile: UploadedFile) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      
      setUploadedFiles(prev => prev.map(f => 
        f.id === uploadedFile.id 
          ? { ...f, progress: Math.min(progress, 100) }
          : f
      ));

      if (progress >= 100) {
        clearInterval(interval);
        
        // Simulate completion
        setTimeout(() => {
          setUploadedFiles(prev => prev.map(f => 
            f.id === uploadedFile.id 
              ? { 
                  ...f, 
                  status: "completed", 
                  url: URL.createObjectURL(f.file),
                  analysis: generateFileAnalysis(f.file)
                }
              : f
          ));
        }, 500);
      }
    }, 200);
  };

  const generateFileAnalysis = (file: File): string => {
    const type = file.type;
    const size = (file.size / 1024 / 1024).toFixed(2);
    
    if (type.startsWith("image/")) {
      return `Image file (${size}MB) - Ready for visual analysis`;
    } else if (type === "application/pdf") {
      return `PDF document (${size}MB) - Text extraction and analysis available`;
    } else if (type.includes("text") || file.name.endsWith(".md")) {
      return `Text document (${size}MB) - Content analysis and summarization ready`;
    } else if (file.name.match(/\.(js|ts|jsx|tsx|py|java|cpp)$/)) {
      return `Code file (${size}MB) - Code review and optimization suggestions available`;
    } else {
      return `File (${size}MB) - General analysis available`;
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getFileIcon = (file: File) => {
    const type = file.type;
    const name = file.name.toLowerCase();
    
    if (type.startsWith("image/")) return <Image className="h-5 w-5" />;
    if (type === "application/pdf" || name.endsWith(".pdf")) return <FileText className="h-5 w-5" />;
    if (name.match(/\.(js|ts|jsx|tsx|py|java|cpp|html|css)$/)) return <Code className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const getStatusIcon = (status: UploadedFile["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <Card 
        {...getRootProps()} 
        className={cn(
          "border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200",
          isDragActive || dropzoneActive
            ? "border-primary bg-primary/10" 
            : "border-muted-foreground/25 hover:border-primary/50"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-4">
          <div className={cn(
            "rounded-full p-4 transition-colors",
            isDragActive || dropzoneActive
              ? "bg-primary text-primary-foreground" 
              : "bg-muted text-muted-foreground"
          )}>
            <Upload className="h-8 w-8" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">
              {isDragActive || dropzoneActive ? "Drop files here" : "Upload Files"}
            </h3>
            <p className="text-sm text-muted-foreground">
              Drag & drop files here, or click to browse
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {["Images", "PDFs", "Documents", "Code"].map(type => (
                <Badge key={type} variant="secondary" className="text-xs">
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Uploaded Files</h4>
          {uploadedFiles.map((uploadedFile) => (
            <Card key={uploadedFile.id} className="p-4">
              <div className="flex items-start space-x-3">
                <div className="shrink-0 text-muted-foreground">
                  {getFileIcon(uploadedFile.file)}
                </div>
                
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium truncate">
                        {uploadedFile.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(uploadedFile.status)}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(uploadedFile.id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {uploadedFile.status === "uploading" && (
                    <div className="space-y-1">
                      <Progress value={uploadedFile.progress} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        Uploading... {Math.round(uploadedFile.progress)}%
                      </p>
                    </div>
                  )}

                  {/* Analysis */}
                  {uploadedFile.status === "completed" && uploadedFile.analysis && (
                    <div className="p-2 bg-muted rounded-md">
                      <p className="text-xs text-muted-foreground">
                        {uploadedFile.analysis}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}