"use client";

import { useAssistant } from "@/hooks/useAssistant";
import { AssistantMessages } from "./AssistantMessages";
import { SparklesIcon, XIcon, RotateCcwIcon, SendIcon } from "lucide-react";

type Props = { onClose: () => void; isModal?: boolean };

export function AssistantChat({ onClose, isModal = false }: Props) {
  const { messages, input, setInput, isStreaming, sendMessage, clearMessages } =
    useAssistant();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const SUGGESTED = [
    "Rekomendasikan jaket pria",
    "Produk diskon terbesar",
    "Sepatu wanita murah",
  ];

  const containerClassName = isModal
    ? "flex h-full w-full max-h-[80vh] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white"
    : "flex h-120 w-80 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl";

  return (
    <div className={containerClassName}>
      {/* Header */}
      <div className="flex items-center justify-between bg-green-600 px-4 py-3">
        <div className="flex items-center gap-2">
          <SparklesIcon size={16} className="text-white" />
          <span className="text-sm font-semibold text-white">
            Asisten Belanja
          </span>
          <span className="h-2 w-2 rounded-full bg-green-300 animate-pulse" />
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={clearMessages}
            className="rounded-full p-1.5 text-green-200 hover:bg-green-700 transition-colors"
            title="Reset percakapan"
          >
            <RotateCcwIcon size={14} />
          </button>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-green-200 hover:bg-green-700 transition-colors"
          >
            <XIcon size={14} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <AssistantMessages messages={messages} isStreaming={isStreaming} />

      {/* Suggested questions — hanya tampil saat baru mulai */}
      {messages.length === 1 && (
        <div className="flex flex-wrap gap-1.5 px-4 pb-2">
          {SUGGESTED.map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs text-green-700 hover:bg-green-100 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-100 px-3 py-3">
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 focus-within:border-green-400 focus-within:bg-white transition-colors">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
            placeholder="Ketik pesanmu..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isStreaming}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-600 text-white transition-colors hover:bg-green-700 disabled:opacity-40"
          >
            <SendIcon size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
