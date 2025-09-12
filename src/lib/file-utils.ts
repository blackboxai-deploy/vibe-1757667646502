// File processing utilities

export interface FileAnalysis {
  name: string;
  size: number;
  type: string;
  content?: string;
  analysis: string;
  metadata: {
    lines?: number;
    words?: number;
    characters?: number;
    encoding?: string;
    language?: string;
  };
}

// File type detection
export function detectFileType(file: File): {
  category: 'text' | 'image' | 'document' | 'code' | 'other';
  language?: string;
  icon: string;
} {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const mimeType = file.type.toLowerCase();

  // Code files
  const codeExtensions: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'cs': 'csharp',
    'php': 'php',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'swift': 'swift',
    'kt': 'kotlin',
    'dart': 'dart',
    'vue': 'vue',
    'svelte': 'svelte',
  };

  if (codeExtensions[extension]) {
    return {
      category: 'code',
      language: codeExtensions[extension],
      icon: '💻'
    };
  }

  // Web files
  const webExtensions = ['html', 'htm', 'css', 'scss', 'sass', 'less'];
  if (webExtensions.includes(extension)) {
    return {
      category: 'code',
      language: extension,
      icon: '🌐'
    };
  }

  // Text files
  if (mimeType.startsWith('text/') || ['txt', 'md', 'markdown', 'rtf'].includes(extension)) {
    return {
      category: 'text',
      language: extension === 'md' || extension === 'markdown' ? 'markdown' : 'text',
      icon: '📄'
    };
  }

  // Images
  if (mimeType.startsWith('image/')) {
    return {
      category: 'image',
      icon: '🖼️'
    };
  }

  // Documents
  const documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
  if (documentExtensions.includes(extension) || mimeType.includes('pdf')) {
    return {
      category: 'document',
      icon: '📋'
    };
  }

  // JSON and config files
  if (['json', 'yaml', 'yml', 'toml', 'xml', 'ini', 'cfg'].includes(extension)) {
    return {
      category: 'code',
      language: extension,
      icon: '⚙️'
    };
  }

  return {
    category: 'other',
    icon: '📎'
  };
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Extract metadata from text content
export function analyzeTextContent(content: string, filename: string): FileAnalysis['metadata'] {
  const lines = content.split('\n').length;
  const words = content.trim() ? content.split(/\s+/).length : 0;
  const characters = content.length;
  
  // Detect probable encoding
  let encoding = 'UTF-8';
  try {
    // Simple heuristic: if content has unusual characters, might be different encoding
    if (/[\u0080-\u00FF]/.test(content)) {
      encoding = 'UTF-8 (with extended characters)';
    }
  } catch (error) {
    encoding = 'Unknown';
  }

  // Detect language/format
  const extension = filename.split('.').pop()?.toLowerCase();
  const { language } = detectFileType({ name: filename, type: '', size: 0 } as File);

  return {
    lines,
    words,
    characters,
    encoding,
    language: language || extension,
  };
}

// Generate file analysis
export function generateFileAnalysis(file: File, content?: string): string {
  const { category, language, icon } = detectFileType(file);
  const size = formatFileSize(file.size);
  
  let analysis = `${icon} **${file.name}**\n`;
  analysis += `📏 Size: ${size}\n`;
  analysis += `🏷️ Type: ${file.type || 'Unknown'}\n`;
  
  if (category === 'code' && language) {
    analysis += `💻 Language: ${language.charAt(0).toUpperCase() + language.slice(1)}\n`;
  }
  
  if (content) {
    const metadata = analyzeTextContent(content, file.name);
    
    if (metadata.lines) {
      analysis += `📋 Lines: ${metadata.lines.toLocaleString()}\n`;
    }
    
    if (metadata.words) {
      analysis += `📝 Words: ${metadata.words.toLocaleString()}\n`;
    }
    
    if (metadata.characters) {
      analysis += `🔤 Characters: ${metadata.characters.toLocaleString()}\n`;
    }
    
    // Add specific insights based on file type
    if (category === 'code') {
      analysis += generateCodeInsights(content, language || '');
    } else if (category === 'text') {
      analysis += generateTextInsights(content);
    }
  }
  
  analysis += '\n✨ **Ready for AI Analysis**\n';
  analysis += 'You can now ask questions about this file, request explanations, summaries, or specific analysis!';
  
  return analysis;
}

// Generate code-specific insights
function generateCodeInsights(content: string, language: string): string {
  let insights = '\n📊 **Code Analysis:**\n';
  
  // Function/method detection
  const functionPatterns: Record<string, RegExp> = {
    javascript: /function\s+\w+|const\s+\w+\s*=|=>\s*{|class\s+\w+/g,
    typescript: /function\s+\w+|const\s+\w+\s*=|=>\s*{|class\s+\w+|interface\s+\w+|type\s+\w+/g,
    python: /def\s+\w+|class\s+\w+/g,
    java: /public\s+\w+\s+\w+\(|private\s+\w+\s+\w+\(|class\s+\w+/g,
    cpp: /\w+\s+\w+\s*\(.*\)\s*{|class\s+\w+/g,
  };
  
  const pattern = functionPatterns[language];
  if (pattern) {
    const functions = content.match(pattern) || [];
    insights += `⚡ Functions/Classes: ${functions.length}\n`;
  }
  
  // Import/include detection
  const importPatterns: Record<string, RegExp> = {
    javascript: /import\s+.*from|require\(/g,
    typescript: /import\s+.*from|require\(/g,
    python: /import\s+|from\s+.*import/g,
    java: /import\s+/g,
    cpp: /#include\s+/g,
  };
  
  const importPattern = importPatterns[language];
  if (importPattern) {
    const imports = content.match(importPattern) || [];
    insights += `📦 Imports/Dependencies: ${imports.length}\n`;
  }
  
  // Comments detection
  const comments = content.match(/\/\/.*|\/\*[\s\S]*?\*\/|#.*|<!--[\s\S]*?-->/g) || [];
  const commentRatio = ((comments.join('').length / content.length) * 100).toFixed(1);
  insights += `💬 Comments: ${comments.length} (${commentRatio}% of code)\n`;
  
  return insights;
}

// Generate text-specific insights
function generateTextInsights(content: string): string {
  let insights = '\n📊 **Text Analysis:**\n';
  
  // Readability metrics
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const avgWordsPerSentence = sentences > 0 ? (content.split(/\s+/).length / sentences).toFixed(1) : '0';
  
  insights += `📝 Sentences: ${sentences}\n`;
  insights += `📏 Avg words per sentence: ${avgWordsPerSentence}\n`;
  
  // Paragraph detection
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
  insights += `📄 Paragraphs: ${paragraphs}\n`;
  
  // Basic complexity indicators
  const complexWords = content.match(/\b\w{8,}\b/g) || [];
  insights += `🔬 Complex words (8+ chars): ${complexWords.length}\n`;
  
  return insights;
}

// Validate file for upload
export function validateFileForUpload(file: File): { valid: boolean; error?: string; warnings?: string[] } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const warnings: string[] = [];
  
  // Size check
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: `File size (${formatFileSize(file.size)}) exceeds 10MB limit` 
    };
  }
  
  if (file.size > 5 * 1024 * 1024) { // 5MB
    warnings.push('Large file may take longer to process');
  }
  
  // Type check
  const { category } = detectFileType(file);
  if (category === 'other') {
    warnings.push('File type may not be fully supported');
  }
  
  // Name check
  if (file.name.length > 100) {
    warnings.push('Very long filename may be truncated');
  }
  
  if (!/^[\w\-. ]+$/.test(file.name)) {
    warnings.push('Special characters in filename may cause issues');
  }
  
  return { valid: true, warnings: warnings.length > 0 ? warnings : undefined };
}

// Convert file to base64 for embedding
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // Remove data URL prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Extract text from different file types
export async function extractTextFromFile(file: File): Promise<string> {
  if (file.type.startsWith('text/') || 
      file.name.match(/\.(js|ts|tsx|jsx|py|java|cpp|html|css|md|json|csv|txt)$/i)) {
    return await file.text();
  }
  
  // For other file types, we'd need specific libraries
  // This is a placeholder for future implementation
  throw new Error(`Text extraction not yet implemented for ${file.type}`);
}