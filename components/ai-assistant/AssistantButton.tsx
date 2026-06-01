"use client";

import { SparklesIcon, XIcon } from "lucide-react";
import { useAssistantStore } from "@/lib/zustand/assistantStore";
import { AssistantChat } from "./AssistantChat";

export function AssistantButton() {
  const isOpen = useAssistantStore((state) => state.isOpen);
  const setIsOpen = useAssistantStore((state) => state.setIsOpen);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && <AssistantChat onClose={() => setIsOpen(false)} />}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-lg shadow-green-200 transition-all hover:bg-green-700 hover:scale-105 active:scale-95"
        aria-label="Buka asisten belanja"
      >
        {isOpen ? <XIcon size={22} /> : <SparklesIcon size={22} />}
      </button>
    </div>
  );
}
