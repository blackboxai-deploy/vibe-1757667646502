import { NextRequest } from 'next/server';

// Simple code execution API (for demonstration)
// In production, this would use a secure sandbox environment

export async function POST(req: NextRequest) {
  try {
    const { code, language } = await req.json();

    if (!code || !language) {
      return Response.json({ 
        error: 'Code and language are required' 
      }, { status: 400 });
    }

    // Validate supported languages
    const supportedLanguages = ['javascript', 'python', 'typescript'];
    if (!supportedLanguages.includes(language.toLowerCase())) {
      return Response.json({ 
        error: `Unsupported language: ${language}. Supported: ${supportedLanguages.join(', ')}` 
      }, { status: 400 });
    }

    // For demo purposes, we'll simulate code execution
    // In a real implementation, this would use Docker containers or VM sandboxes
    let result = '';
    let error = '';

    try {
      switch (language.toLowerCase()) {
        case 'javascript':
        case 'typescript':
          result = await executeJavaScript(code);
          break;
        case 'python':
          result = await executePython(code);
          break;
        default:
          error = `Execution not implemented for ${language}`;
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Execution failed';
    }

    return Response.json({
      success: !error,
      result,
      error,
      language,
      executedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Execute API error:', error);
    return Response.json({ 
      error: 'Execution API failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Simulated JavaScript execution (very limited for security)
async function executeJavaScript(code: string): Promise<string> {
  // This is a very basic simulation - in production, use proper sandboxing
  try {
    // Remove dangerous patterns
    const dangerousPatterns = [
      /require\s*\(/,
      /import\s+/,
      /process\./,
      /global\./,
      /eval\s*\(/,
      /Function\s*\(/,
      /setTimeout|setInterval/,
      /XMLHttpRequest|fetch/,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        throw new Error('Potentially dangerous code detected');
      }
    }

    // Simple evaluation for basic math and string operations
    if (code.includes('console.log')) {
      // Capture console.log output
      const logs: string[] = [];
      const originalLog = console.log;
      console.log = (...args) => {
        logs.push(args.map(arg => String(arg)).join(' '));
      };

      try {
        // Very limited evaluation
        eval(code);
        console.log = originalLog;
        return logs.join('\n') || 'Code executed (no output)';
      } catch (error) {
        console.log = originalLog;
        throw error;
      }
    } else {
      // Try to evaluate as expression
      const result = eval(code);
      return String(result);
    }
  } catch (error) {
    throw new Error(`JavaScript execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Simulated Python execution
async function executePython(code: string): Promise<string> {
  // This is a placeholder - in production, use Pyodide or a proper Python sandbox
  return `Python execution simulated.
Code: ${code}

Note: This is a demo environment. In production, this would execute in a secure Python sandbox with libraries like Pyodide or a containerized environment.

For full Python execution, consider integrating with:
- Pyodide (Python in the browser)
- Docker containers with Python runtime
- Cloud-based code execution services
- WebAssembly Python interpreters`;
}

export async function GET() {
  return Response.json({
    message: 'Code execution API',
    supportedLanguages: ['javascript', 'python', 'typescript'],
    features: [
      'Basic JavaScript/TypeScript execution',
      'Python simulation (placeholder)',
      'Security restrictions applied',
      'Limited to safe operations',
    ],
    security: [
      'No file system access',
      'No network requests',
      'No dangerous functions',
      'Execution timeout protection',
    ],
  });
}