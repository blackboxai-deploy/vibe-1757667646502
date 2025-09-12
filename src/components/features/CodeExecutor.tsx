"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Play, 
  Square, 
  Copy, 
  Download,
  Code,
  Terminal,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Zap,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ExecutionResult {
  output: string;
  error?: string;
  executionTime: number;
  status: "success" | "error" | "timeout";
  language: string;
}

interface CodeExecutorProps {
  defaultLanguage?: string;
  className?: string;
  onExecute?: (code: string, language: string) => void;
}

const supportedLanguages = [
  { id: "javascript", name: "JavaScript", icon: "🟨", extension: "js" },
  { id: "typescript", name: "TypeScript", icon: "🔷", extension: "ts" },
  { id: "python", name: "Python", icon: "🐍", extension: "py" },
  { id: "java", name: "Java", icon: "☕", extension: "java" },
  { id: "cpp", name: "C++", icon: "⚡", extension: "cpp" },
  { id: "rust", name: "Rust", icon: "🦀", extension: "rs" },
  { id: "go", name: "Go", icon: "🐹", extension: "go" },
  { id: "php", name: "PHP", icon: "🐘", extension: "php" },
];

const codeExamples = {
  javascript: `// JavaScript Example
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("Fibonacci sequence:");
for (let i = 0; i < 10; i++) {
  console.log(\`F(\${i}) = \${fibonacci(i)}\`);
}`,

  python: `# Python Example
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print("Fibonacci sequence:")
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")`,

  java: `// Java Example
public class Fibonacci {
    public static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
    
    public static void main(String[] args) {
        System.out.println("Fibonacci sequence:");
        for (int i = 0; i < 10; i++) {
            System.out.println("F(" + i + ") = " + fibonacci(i));
        }
    }
}`,

  cpp: `// C++ Example
#include <iostream>
using namespace std;

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    cout << "Fibonacci sequence:" << endl;
    for (int i = 0; i < 10; i++) {
        cout << "F(" << i << ") = " << fibonacci(i) << endl;
    }
    return 0;
}`,
};

export function CodeExecutor({ defaultLanguage = "javascript", className, onExecute }: CodeExecutorProps) {
  const [language, setLanguage] = useState(defaultLanguage);
  const [code, setCode] = useState(codeExamples[language as keyof typeof codeExamples] || "");
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [executionHistory, setExecutionHistory] = useState<ExecutionResult[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setCode(codeExamples[newLanguage as keyof typeof codeExamples] || "");
    setExecutionResult(null);
  };

  const simulateExecution = async (code: string, language: string): Promise<ExecutionResult> => {
    // Simulate execution time
    const executionTime = Math.random() * 2000 + 500;
    await new Promise(resolve => setTimeout(resolve, executionTime));

    // Simulate different outcomes
    const outcomes = ["success", "success", "success", "error", "timeout"]; // 60% success
    const status = outcomes[Math.floor(Math.random() * outcomes.length)] as ExecutionResult["status"];

    const result: ExecutionResult = {
      output: "",
      executionTime: Math.round(executionTime),
      status,
      language,
    };

    if (status === "success") {
      // Generate realistic output based on language
      if (language === "javascript" || language === "typescript") {
        result.output = `Fibonacci sequence:
F(0) = 0
F(1) = 1
F(2) = 1
F(3) = 2
F(4) = 3
F(5) = 5
F(6) = 8
F(7) = 13
F(8) = 21
F(9) = 34

Process finished with exit code 0`;
      } else if (language === "python") {
        result.output = `Fibonacci sequence:
F(0) = 0
F(1) = 1
F(2) = 1
F(3) = 2
F(4) = 3
F(5) = 5
F(6) = 8
F(7) = 13
F(8) = 21
F(9) = 34

Process finished with exit code 0`;
      } else {
        result.output = `Code executed successfully!
Output generated in ${executionTime}ms
Process finished with exit code 0`;
      }
    } else if (status === "error") {
      result.error = `SyntaxError: Unexpected token at line ${Math.floor(Math.random() * 10 + 1)}
    at executeCode (sandbox.js:${Math.floor(Math.random() * 20 + 1)})
    at process.execution (runner.js:42)`;
    } else {
      result.error = "Execution timed out after 30 seconds";
    }

    return result;
  };

  const executeCode = async () => {
    if (!code.trim()) return;

    setIsExecuting(true);
    onExecute?.(code, language);

    try {
      const result = await simulateExecution(code, language);
      setExecutionResult(result);
      setExecutionHistory(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
    } catch (error) {
      console.error("Execution error:", error);
    } finally {
      setIsExecuting(false);
    }
  };

  const stopExecution = () => {
    setIsExecuting(false);
    setExecutionResult({
      output: "",
      error: "Execution stopped by user",
      executionTime: 0,
      status: "error",
      language,
    });
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const downloadCode = () => {
    const languageInfo = supportedLanguages.find(l => l.id === language);
    const filename = `code.${languageInfo?.extension || "txt"}`;
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: ExecutionResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "timeout":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: ExecutionResult["status"]) => {
    switch (status) {
      case "success":
        return "text-green-600 bg-green-50 border-green-200";
      case "error":
        return "text-red-600 bg-red-50 border-red-200";
      case "timeout":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "";
    }
  };

  const selectedLanguage = supportedLanguages.find(l => l.id === language);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Code className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Code Executor</h2>
            <p className="text-sm text-muted-foreground">Write and run code safely</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <span>{selectedLanguage?.icon}</span>
            <span>{selectedLanguage?.name}</span>
          </Badge>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Code Editor */}
        <div className="lg:col-span-2 space-y-4">
          {/* Language Selector */}
          <div className="flex items-center justify-between">
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {supportedLanguages.map((lang) => (
                  <SelectItem key={lang.id} value={lang.id}>
                    <div className="flex items-center space-x-2">
                      <span>{lang.icon}</span>
                      <span>{lang.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={copyCode}>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={downloadCode}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>

          {/* Code Input */}
          <Card className="p-0">
            <Textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={`Write your ${selectedLanguage?.name} code here...`}
              className="border-0 font-mono text-sm min-h-[400px] resize-none focus-visible:ring-0"
            />
          </Card>

          {/* Control Buttons */}
          <div className="flex items-center space-x-2">
            {isExecuting ? (
              <Button onClick={stopExecution} variant="destructive">
                <Square className="mr-2 h-4 w-4" />
                Stop
              </Button>
            ) : (
              <Button onClick={executeCode} disabled={!code.trim()}>
                <Play className="mr-2 h-4 w-4" />
                Run Code
              </Button>
            )}

            {isExecuting && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span>Executing...</span>
              </div>
            )}
          </div>
        </div>

        {/* Output & History */}
        <div className="space-y-4">
          {/* Current Output */}
          <Card className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Terminal className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Output</span>
              {executionResult && (
                <div className="flex items-center space-x-1 ml-auto">
                  {getStatusIcon(executionResult.status)}
                  <span className="text-xs text-muted-foreground">
                    {executionResult.executionTime}ms
                  </span>
                </div>
              )}
            </div>

            <ScrollArea className="h-[200px]">
              {executionResult ? (
                <div className="space-y-2">
                  {executionResult.output && (
                    <pre className="text-xs bg-muted p-3 rounded whitespace-pre-wrap">
                      {executionResult.output}
                    </pre>
                  )}
                  {executionResult.error && (
                    <pre className="text-xs bg-red-50 text-red-700 p-3 rounded whitespace-pre-wrap border border-red-200">
                      {executionResult.error}
                    </pre>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <Terminal className="mx-auto h-8 w-8 mb-2 opacity-20" />
                    <p className="text-sm">Output will appear here</p>
                  </div>
                </div>
              )}
            </ScrollArea>
          </Card>

          {/* Execution History */}
          {executionHistory.length > 0 && (
            <Card className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Recent Executions</span>
              </div>

              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {executionHistory.map((result, index) => (
                    <div
                      key={index}
                      className={cn(
                        "p-2 rounded border text-xs",
                        getStatusColor(result.status)
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(result.status)}
                          <span className="font-medium capitalize">
                            {result.status}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 text-muted-foreground">
                          <Zap className="h-3 w-3" />
                          <span>{result.executionTime}ms</span>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {result.language} • {new Date().toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}