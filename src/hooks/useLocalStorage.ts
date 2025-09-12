'use client';

import { useState } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

// Custom hook for preferences
export function usePreferences() {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark' | 'system'>('theme', 'system');
  const [fontSize, setFontSize] = useLocalStorage<'small' | 'medium' | 'large'>('fontSize', 'medium');
  const [codeTheme, setCodeTheme] = useLocalStorage<'light' | 'dark'>('codeTheme', 'dark');
  const [sendOnEnter, setSendOnEnter] = useLocalStorage<boolean>('sendOnEnter', true);
  const [showTimestamps, setShowTimestamps] = useLocalStorage<boolean>('showTimestamps', false);
  const [autoScroll, setAutoScroll] = useLocalStorage<boolean>('autoScroll', true);

  return {
    theme,
    setTheme,
    fontSize,
    setFontSize,
    codeTheme,
    setCodeTheme,
    sendOnEnter,
    setSendOnEnter,
    showTimestamps,
    setShowTimestamps,
    autoScroll,
    setAutoScroll,
  };
}

// Hook for managing conversation drafts
export function useConversationDrafts() {
  const [drafts, setDrafts] = useLocalStorage<Record<string, string>>('conversationDrafts', {});

  const saveDraft = (conversationId: string, content: string) => {
    setDrafts(prev => ({
      ...prev,
      [conversationId]: content,
    }));
  };

  const getDraft = (conversationId: string): string => {
    return drafts[conversationId] || '';
  };

  const clearDraft = (conversationId: string) => {
    setDrafts(prev => {
      const newDrafts = { ...prev };
      delete newDrafts[conversationId];
      return newDrafts;
    });
  };

  const clearAllDrafts = () => {
    setDrafts({});
  };

  return {
    saveDraft,
    getDraft,
    clearDraft,
    clearAllDrafts,
  };
}