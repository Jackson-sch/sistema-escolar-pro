"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import {
  IconMessageChatbot,
  IconX,
  IconSend,
  IconLoader2,
  IconRobot,
  IconUser,
  IconSparkles,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface DirectivoChatProps {
  context?: any;
}

function getMessageContent(m: any) {
  return (
    m.content ||
    m.parts
      ?.flatMap((p: any) => (p.type === "text" ? [p.text] : []))
      .join("") ||
    ""
  );
}

export function DirectivoChat({ context }: DirectivoChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, setMessages } = useChat({
    id: "director-gpt",
    body: {
      context,
    },
  } as any);

  // Auto-scroll al fondo
  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollIntoView({ behavior: "auto", block: "end" });
    }
  }, [messages, status, isOpen]);

  // Inicializar mensaje de bienvenida
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "start",
          role: "assistant",
          content:
            "Hola Director, ¿en qué puedo ayudarte hoy? Puedo darte resúmenes académicos, financieros o asistenciales.",
        } as any,
      ]);
    }
  }, [setMessages, messages.length]);

  const isLoading = status === "submitted" || status === "streaming";

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isLoading) return;

    sendMessage({ text: chatInput });
    setChatInput("");
  };

  return (
    <div className="fixed bottom-20 right-6 z-50 flex flex-col items-end gap-4">
      {isOpen && (
        <div className="w-[380px] h-[600px] bg-white/95 dark:bg-zinc-950/95 border border-slate-200/80 dark:border-zinc-800 rounded-2xl shadow-lg overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 animation-duration-">
          {/* Header - Fixed height */}
          <div className="h-20 p-6 bg-indigo-50/50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-600/10">
                <IconSparkles className="size-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight text-foreground">
                  Director GPT
                </h3>
                <div className="flex items-center gap-1.5">
                  <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    IA Conectada
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="size-8 rounded-full hover:bg-slate-200/50 dark:hover:bg-white/10 text-foreground"
            >
              <IconX className="size-4" />
            </Button>
          </div>

          {/* Messages - Native scroll with flex-1 */}
          <div className="flex-1 overflow-y-auto p-6 overscroll-y-contain scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10 scrollbar-track-transparent">
            <div className="space-y-6">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "flex flex-col gap-2",
                    m.role === "user" ? "items-end" : "items-start",
                  )}
                >
                  <div className="flex items-center gap-2">
                    {m.role === "assistant" && (
                      <IconRobot className="size-3 text-indigo-600 dark:text-indigo-400" />
                    )}
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {m.role === "user" ? "Director" : "Asistente Pro"}
                    </span>
                    {m.role === "user" && (
                      <IconUser className="size-3 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "max-w-[85%] px-4 py-3 rounded-2xl text-xs leading-relaxed shadow-sm",
                      m.role === "user"
                        ? "bg-indigo-600 shadow-lg shadow-indigo-600/10 text-white rounded-tr-none dark:bg-indigo-500"
                        : "bg-slate-100/80 border border-slate-200/50 text-foreground rounded-tl-none dark:bg-white/5 dark:border-white/5 dark:border-white/10",
                    )}
                  >
                    <div
                      className={cn(
                        "prose prose-xs max-w-none wrap-break-word [&_p]:leading-relaxed [&_p]:m-0 [&_ul]:my-1 [&_ol]:my-1 [&_li]:m-0 text-foreground text-sm dark:prose-invert",
                        m.role === "user" ? "prose-invert text-white" : "",
                      )}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {getMessageContent(m)}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex flex-col items-start gap-2">
                  <div className="flex items-center gap-2 text-muted-foreground/60">
                    <IconRobot className="size-3" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Escribiendo...
                    </span>
                  </div>
                  <div className="bg-slate-100/80 border border-slate-200/50 dark:bg-white/5 dark:border-white/5 px-4 py-3 rounded-2xl rounded-tl-none">
                    <IconLoader2 className="size-4 animate-spin text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>
              )}
              <div ref={scrollRef} className="h-px" />
            </div>
          </div>

          {/* Input - Fixed height */}
          <form
            onSubmit={handleSend}
            className="h-24 p-6 bg-slate-50/50 dark:bg-zinc-900/30 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-3 shrink-0"
          >
            <Input
              placeholder="Haz una consulta ejecutiva..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="h-12 border border-slate-200 dark:border-zinc-800 rounded-full focus-visible:ring-indigo-500/20 text-sm font-medium"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !chatInput.trim()}
              className="size-12 rounded-2xl bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/10 transition-[background-color,transform] active:scale-95 shrink-0 hover:scale-105 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white"
            >
              <IconSend className="size-5" />
            </Button>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "size-12 rounded-full shadow-lg transition-[color,background-color,border-color] duration-300 group overflow-hidden border cursor-pointer",
          isOpen
            ? "bg-slate-100 border-slate-200 text-indigo-600 hover:bg-slate-200 dark:bg-zinc-900 dark:border-zinc-800 dark:text-indigo-400 dark:hover:bg-zinc-800"
            : "bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 active:scale-95 dark:bg-indigo-500 dark:border-indigo-500 dark:hover:bg-indigo-600",
        )}
      >
        <div className="relative size-full flex items-center justify-center">
          <IconMessageChatbot
            className={cn(
              "size-5 transition-[opacity,transform] duration-300",
              isOpen ? "opacity-0 scale-50 rotate-90" : "opacity-100 scale-100",
            )}
          />
          <IconX
            className={cn(
              "absolute size-5 transition-[opacity,transform] duration-300",
              isOpen
                ? "opacity-100 scale-100"
                : "opacity-0 scale-50 -rotate-90",
            )}
          />
        </div>
      </Button>
    </div>
  );
}
