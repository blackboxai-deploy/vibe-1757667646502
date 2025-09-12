"use client";

import { useChatStore } from "@/lib/chat-store";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import ChatContainer from "@/components/chat/ChatContainer";
import { useEffect } from "react";

export default function HomePage() {
  const { sidebarOpen, currentConversation, createConversation } = useChatStore();

  // Create initial conversation if none exists
  useEffect(() => {
    if (!currentConversation) {
      createConversation("Welcome Chat");
    }
  }, [currentConversation, createConversation]);

  return (
    <>
      {/* Sidebar */}
      <div className={`${
        sidebarOpen ? 'w-80' : 'w-0'
      } transition-all duration-300 ease-in-out overflow-hidden border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60`}>
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen">
        <Header />
        <div className="flex-1 overflow-hidden">
          <ChatContainer />
        </div>
      </div>
    </>
  );
}

