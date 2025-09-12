'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export function AnimatedCounter({ 
  value, 
  duration = 1000, 
  className,
  prefix = '',
  suffix = '',
  decimals = 0
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (value === displayValue) return;

    setIsAnimating(true);
    const startValue = displayValue;
    const endValue = value;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const currentValue = startValue + (endValue - startValue) * easeOut;
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  }, [value, displayValue, duration]);

  const formatValue = (val: number): string => {
    const rounded = decimals > 0 ? val.toFixed(decimals) : Math.round(val).toString();
    
    // Add thousands separators for large numbers
    if (Math.abs(val) >= 1000) {
      return parseFloat(rounded).toLocaleString();
    }
    
    return rounded;
  };

  return (
    <span 
      className={cn(
        "tabular-nums transition-all duration-200",
        isAnimating && "animate-pulse",
        className
      )}
    >
      {prefix}{formatValue(displayValue)}{suffix}
    </span>
  );
}

// Specialized counter for tokens
export function TokenCounter({ value, className }: { value: number; className?: string }) {
  const formatTokens = (tokens: number): { value: number; suffix: string } => {
    if (tokens >= 1000000) {
      return { value: tokens / 1000000, suffix: 'M' };
    } else if (tokens >= 1000) {
      return { value: tokens / 1000, suffix: 'K' };
    }
    return { value: tokens, suffix: '' };
  };

  const { value: displayValue, suffix } = formatTokens(value);

  return (
    <AnimatedCounter
      value={displayValue}
      decimals={suffix ? 1 : 0}
      suffix={suffix}
      className={cn("text-xs font-mono", className)}
    />
  );
}

// Specialized counter for costs
export function CostCounter({ value, className }: { value: number; className?: string }) {
  const formatCost = (cost: number): string => {
    if (cost < 0.01) return `${(cost * 100).toFixed(2)}¢`;
    return `$${cost.toFixed(4)}`;
  };

  return (
    <span className={cn("text-xs font-mono", className)}>
      {formatCost(value)}
    </span>
  );
}