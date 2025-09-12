import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return Response.json({ 
        error: 'File too large', 
        maxSize: '10MB' 
      }, { status: 400 });
    }

    // Process different file types
    let content = '';
    let analysis = '';

    try {
      if (file.type.startsWith('text/') || file.name.match(/\.(js|ts|py|java|cpp|html|css|md|json)$/i)) {
        // Text-based files
        content = await file.text();
        analysis = analyzeTextFile(content, file.name);
      } else if (file.type.startsWith('image/')) {
        // Image files
        analysis = `Image file: ${file.name}
Size: ${(file.size / 1024).toFixed(2)} KB
Type: ${file.type}
Dimensions: Available after processing

This image is ready for AI analysis. You can ask questions about its content, request descriptions, or perform visual analysis.`;
      } else if (file.type === 'application/pdf') {
        // PDF files
        analysis = `PDF Document: ${file.name}
Size: ${(file.size / 1024).toFixed(2)} KB
Pages: Processing...

This PDF is ready for analysis. You can ask questions about its content, request summaries, or extract specific information.`;
      } else {
        // Other file types
        analysis = `File: ${file.name}
Size: ${(file.size / 1024).toFixed(2)} KB
Type: ${file.type}

File uploaded successfully. The AI assistant can analyze supported file formats and provide insights about the content.`;
      }

      return Response.json({
        success: true,
        file: {
          name: file.name,
          size: file.size,
          type: file.type,
          content: content.substring(0, 10000), // Limit content for response
          analysis,
        }
      });

    } catch (error) {
      console.error('File processing error:', error);
      return Response.json({ 
        error: 'Failed to process file',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Upload API error:', error);
    return Response.json({ 
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function analyzeTextFile(content: string, filename: string): string {
  const lines = content.split('\n').length;
  const words = content.split(/\s+/).length;
  const chars = content.length;

  let fileType = 'Text file';
  let specific = '';

  // Determine file type and provide specific analysis
  if (filename.match(/\.(js|jsx|ts|tsx)$/i)) {
    fileType = 'JavaScript/TypeScript file';
    const functions = (content.match(/function\s+\w+|const\s+\w+\s*=|=>\s*{/g) || []).length;
    const imports = (content.match(/import\s+.*from|require\(/g) || []).length;
    specific = `Functions/Components: ${functions}, Imports: ${imports}`;
  } else if (filename.match(/\.(py)$/i)) {
    fileType = 'Python file';
    const functions = (content.match(/def\s+\w+/g) || []).length;
    const classes = (content.match(/class\s+\w+/g) || []).length;
    const imports = (content.match(/import\s+|from\s+.*import/g) || []).length;
    specific = `Functions: ${functions}, Classes: ${classes}, Imports: ${imports}`;
  } else if (filename.match(/\.(html|htm)$/i)) {
    fileType = 'HTML file';
    const tags = (content.match(/<[^>]+>/g) || []).length;
    const links = (content.match(/<a\s+/g) || []).length;
    specific = `HTML tags: ${tags}, Links: ${links}`;
  } else if (filename.match(/\.(css|scss|sass)$/i)) {
    fileType = 'Stylesheet';
    const rules = (content.match(/[^}]*{[^}]*}/g) || []).length;
    const selectors = (content.match(/[^{]+{/g) || []).length;
    specific = `CSS rules: ${rules}, Selectors: ${selectors}`;
  } else if (filename.match(/\.(json)$/i)) {
    fileType = 'JSON file';
    try {
      const parsed = JSON.parse(content);
      const keys = Object.keys(parsed).length;
      specific = `Top-level keys: ${keys}`;
    } catch {
      specific = 'Invalid JSON format';
    }
  } else if (filename.match(/\.(md|markdown)$/i)) {
    fileType = 'Markdown file';
    const headers = (content.match(/^#+\s+/gm) || []).length;
    const codeBlocks = (content.match(/```/g) || []).length / 2;
    specific = `Headers: ${headers}, Code blocks: ${Math.floor(codeBlocks)}`;
  }

  return `${fileType}: ${filename}
Lines: ${lines.toLocaleString()}
Words: ${words.toLocaleString()}
Characters: ${chars.toLocaleString()}
${specific ? `${specific}\n` : ''}
File analysis completed. You can now ask questions about this file's content, request explanations, or get suggestions for improvements.`;
}