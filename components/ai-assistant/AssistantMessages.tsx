"use client";

import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";

type Message = {
  role: "user" | "model";
  parts: { text: string }[];
};

type Props = {
  messages: Message[];
  isStreaming: boolean;
};

const linkifyBareUrls = (text: string) => {
  const markdownLinkPattern = /\[[^\]]+\]\([^)]+\)/g;
  const placeholders: string[] = [];
  const protectedText = text.replace(markdownLinkPattern, (match) => {
    const token = `__MARKDOWN_LINK_${placeholders.length}__`;
    placeholders.push(match);
    return token;
  });

  const linkedText = protectedText.replace(
    /(^|[\s(])((?:https?:\/\/[^\s)]+)|(?:\/(?:product|category|collections|related|search|checkout|cart|order|shipping)\/[^\s)]*))/g,
    (_match, prefix: string, url: string) => {
      const cleanUrl = url.replace(/[.,!?;:]+$/, "");
      const trailing = url.slice(cleanUrl.length);
      return `${prefix}[${cleanUrl}](${cleanUrl})${trailing}`;
    },
  );

  return placeholders.reduce(
    (result, link, index) => result.replace(`__MARKDOWN_LINK_${index}__`, link),
    linkedText,
  );
};

export function AssistantMessages({ messages, isStreaming }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
      {messages.map((msg, i) => {
        const isUser = msg.role === "user";
        const text = msg.parts[0]?.text ?? "";
        const isLastModel = !isUser && i === messages.length - 1;

        return (
          <div
            key={i}
            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
          >
            {!isUser && (
              <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm">
                ✨
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed
              ${
                isUser
                  ? "bg-green-600 text-white rounded-tr-sm"
                  : "bg-gray-100 text-gray-800 rounded-tl-sm"
              }`}
            >
              {isUser ? (
                text
              ) : text === "" && isStreaming && isLastModel ? (
                <span className="flex gap-1 py-1">
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: `${d * 0.15}s` }}
                    />
                  ))}
                </span>
              ) : (
                <ReactMarkdown
                  components={{
                    // ✅ Link internal pakai Next.js Link, eksternal buka tab baru
                    a: ({ href, children }) => {
                      const isInternal = href?.startsWith("/");
                      if (isInternal) {
                        return (
                          <Link
                            href={href ?? "#"}
                            className="font-medium text-green-700 underline underline-offset-2 hover:text-green-800"
                          >
                            {children}
                          </Link>
                        );
                      }
                      return (
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-green-700 underline underline-offset-2 hover:text-green-800"
                        >
                          {children}
                        </a>
                      );
                    },
                    p: ({ children }) => (
                      <p className="mb-1 last:mb-0">{children}</p>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold">{children}</strong>
                    ),
                  }}
                >
                  {linkifyBareUrls(text)}
                </ReactMarkdown>
              )}
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
