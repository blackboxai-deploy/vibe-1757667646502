'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showValue?: boolean;
  label?: string;
  color?: 'default' | 'success' | 'warning' | 'error';
  animated?: boolean;
  striped?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  className,
  showValue = true,
  label,
  color = 'default',
  animated = false,
  striped = false
}: ProgressBarProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const percentage = Math.min((value / max) * 100, 100);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayValue(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  const colorClasses = {
    default: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">{label}</span>
          {showValue && (
            <span className="font-mono text-xs">
              {value.toLocaleString()}/{max.toLocaleString()}
            </span>
          )}
        </div>
      )}
      
      <div className="relative">
        <Progress 
          value={displayValue} 
          className={cn(
            "h-2 transition-all duration-500 ease-out",
            striped && "bg-stripe-animation"
          )}
        />
        
        {animated && (
          <div 
            className={cn(
              "absolute inset-0 rounded-full opacity-30",
              "animate-pulse",
              colorClasses[color]
            )}
            style={{ width: `${displayValue}%` }}
          />
        )}
      </div>
      
      {showValue && !label && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0</span>
          <span className="font-mono">{Math.round(percentage)}%</span>
          <span>{max.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}

// Specialized progress bar for streaming responses
export function StreamingProgress({ 
  isStreaming, 
  className,
  label = "Generating response..."
}: { 
  isStreaming: boolean; 
  className?: string;
  label?: string;
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isStreaming) {
      setProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return 90; // Don't reach 100% until actually complete
        return prev + Math.random() * 10;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isStreaming]);

  useEffect(() => {
    if (!isStreaming && progress > 0) {
      // Complete the progress bar when streaming stops
      setProgress(100);
      setTimeout(() => setProgress(0), 1000);
    }
  }, [isStreaming, progress]);

  if (!isStreaming && progress === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="animate-spin rounded-full h-3 w-3 border-2 border-current border-t-transparent" />
        <span>{label}</span>
      </div>
      <Progress 
        value={progress} 
        className="h-1 transition-all duration-300"
      />
    </div>
  );
}

// Token usage progress bar
export function TokenUsageBar({ 
  used, 
  limit, 
  className 
}: { 
  used: number; 
  limit: number; 
  className?: string;
}) {
  const percentage = (used / limit) * 100;
  
  const getColor = (): 'default' | 'warning' | 'error' => {
    if (percentage >= 90) return 'error';
    if (percentage >= 75) return 'warning';
    return 'default';
  };

  const formatTokens = (tokens: number): string => {
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`;
    return tokens.toString();
  };

  return (
    <ProgressBar
      value={used}
      max={limit}
      color={getColor()}
      label={`Token Usage: ${formatTokens(used)} / ${formatTokens(limit)}`}
      className={className}
      showValue={false}
    />
  );
}

// File upload progress
export function FileUploadProgress({ 
  progress, 
  fileName, 
  className 
}: { 
  progress: number; 
  fileName: string; 
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="truncate flex-1 text-muted-foreground">
          Uploading {fileName}
        </span>
        <span className="font-mono text-xs ml-2">
          {Math.round(progress)}%
        </span>
      </div>
      <ProgressBar
        value={progress}
        max={100}
        color={progress === 100 ? 'success' : 'default'}
        animated={progress < 100}
        showValue={false}
      />
    </div>
  );
}