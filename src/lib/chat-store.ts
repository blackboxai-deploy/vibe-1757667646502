import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: number;
  model?: string;
  tokens?: number;
  attachments?: File[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  model: string;
}

interface ChatState {
  // Current conversation
  currentConversation: Conversation | null;
  conversations: Conversation[];
  
  // UI State
  isStreaming: boolean;
  isTyping: boolean;
  sidebarOpen: boolean;
  selectedModel: string;
  currentModel: string;
  
  // Settings
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  
  // Actions
  createConversation: (title?: string) => void;
  setCurrentConversation: (conversation: Conversation) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  deleteConversation: (conversationId: string) => void;
  renameConversation: (conversationId: string, title: string) => void;
  clearAllConversations: () => void;
  
  // UI Actions
  setIsStreaming: (streaming: boolean) => void;
  setIsTyping: (typing: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSelectedModel: (model: string) => void;
  setCurrentModel: (model: string) => void;
  
  // Settings Actions
  updateSettings: (settings: Partial<Pick<ChatState, 'temperature' | 'maxTokens' | 'systemPrompt'>>) => void;
}

const generateId = () => nanoid();

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentConversation: null,
      conversations: [],
      isStreaming: false,
      isTyping: false,
      sidebarOpen: true,
      selectedModel: 'gpt-4',
      currentModel: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2048,
      systemPrompt: 'You are a helpful AI assistant with advanced capabilities.',
      
      // Actions
      createConversation: (title = 'New Chat') => {
        const newConversation: Conversation = {
          id: generateId(),
          title,
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          model: get().selectedModel,
        };
        
        set((state) => ({
          currentConversation: newConversation,
          conversations: [newConversation, ...state.conversations],
        }));
      },
      
      setCurrentConversation: (conversation) => {
        set({ currentConversation: conversation });
      },
      
      addMessage: (message) => {
        const id = generateId();
        const timestamp = Date.now();
        const newMessage: Message = { ...message, id, timestamp };
        
        set((state) => {
          if (!state.currentConversation) {
            // Create new conversation if none exists
            const newConversation: Conversation = {
              id: generateId(),
              title: message.content.slice(0, 50) + (message.content.length > 50 ? '...' : ''),
              messages: [newMessage],
              createdAt: timestamp,
              updatedAt: timestamp,
              model: state.selectedModel,
            };
            
            return {
              currentConversation: newConversation,
              conversations: [newConversation, ...state.conversations],
            };
          }
          
          // Update existing conversation
          const updatedConversation = {
            ...state.currentConversation,
            messages: [...state.currentConversation.messages, newMessage],
            updatedAt: timestamp,
          };
          
          return {
            currentConversation: updatedConversation,
            conversations: state.conversations.map((conv) =>
              conv.id === updatedConversation.id ? updatedConversation : conv
            ),
          };
        });
      },
      
      updateMessage: (messageId, updates) => {
        set((state) => {
          if (!state.currentConversation) return state;
          
          const updatedConversation = {
            ...state.currentConversation,
            messages: state.currentConversation.messages.map((msg) =>
              msg.id === messageId ? { ...msg, ...updates } : msg
            ),
            updatedAt: Date.now(),
          };
          
          return {
            currentConversation: updatedConversation,
            conversations: state.conversations.map((conv) =>
              conv.id === updatedConversation.id ? updatedConversation : conv
            ),
          };
        });
      },
       deleteConversation: (conversationId) => {
        set((state) => ({
          conversations: state.conversations.filter((conv) => conv.id !== conversationId),
          currentConversation: 
            state.currentConversation?.id === conversationId 
              ? null 
              : state.currentConversation,
        }));
      },
      
      renameConversation: (conversationId, title) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId ? { ...conv, title, updatedAt: Date.now() } : conv
          ),
          currentConversation: 
            state.currentConversation?.id === conversationId 
              ? { ...state.currentConversation, title, updatedAt: Date.now() }
              : state.currentConversation,
        }));
      },
      
      clearAllConversations: () => {
        set({
          conversations: [],
          currentConversation: null,
        });
      },
      
      // UI Actions
      setIsStreaming: (streaming) => set({ isStreaming: streaming }),
      setIsTyping: (typing) => set({ isTyping: typing }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setSelectedModel: (model) => set({ selectedModel: model, currentModel: model }),
      setCurrentModel: (model) => set({ currentModel: model }),
      
      // Settings Actions
      updateSettings: (settings) => set(settings),
    }),
    {
      name: 'ai-chat-storage',
      partialize: (state) => ({
        conversations: state.conversations,
        selectedModel: state.selectedModel,
        temperature: state.temperature,
        maxTokens: state.maxTokens,
        systemPrompt: state.systemPrompt,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);