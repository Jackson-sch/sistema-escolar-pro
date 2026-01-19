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
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface DirectivoChatProps {
  context?: any;
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

  const getMessageContent = (m: any) => {
    return (
      m.content ||
      m.parts
        ?.filter((p: any) => p.type === "text")
        .map((p: any) => p.text)
        .join("") ||
      ""
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {isOpen && (
        <div className="w-[380px] h-[600px] bg-background/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-300">
          {/* Header - Fixed height */}
          <div className="h-20 p-6 bg-linear-to-r from-violet-600/20 to-indigo-600/20 border-b border-white/5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <IconSparkles className="size-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight">
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
              className="size-8 rounded-full hover:bg-white/10"
            >
              <IconX className="size-4" />
            </Button>
          </div>

          {/* Messages - Native scroll with flex-1 */}
          <div className="flex-1 overflow-y-auto p-6 overscroll-y-contain scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <div className="space-y-6">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "flex flex-col gap-2",
                    m.role === "user" ? "items-end" : "items-start"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {m.role === "assistant" && (
                      <IconRobot className="size-3 text-violet-500" />
                    )}
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                      {m.role === "user" ? "Director" : "Asistente Pro"}
                    </span>
                    {m.role === "user" && (
                      <IconUser className="size-3 text-indigo-500" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "max-w-[85%] px-4 py-3 rounded-2xl text-xs leading-relaxed shadow-sm",
                      m.role === "user"
                        ? "bg-violet-600 text-white rounded-tr-none"
                        : "bg-white/5 border border-white/5 text-foreground rounded-tl-none"
                    )}
                  >
                    <div className="prose prose-invert prose-xs max-w-none wrap-break-word [&_p]:leading-relaxed [&_p]:m-0 [&_ul]:my-1 [&_ol]:my-1 [&_li]:m-0">
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
                  <div className="bg-white/5 border border-white/5 px-4 py-3 rounded-2xl rounded-tl-none">
                    <IconLoader2 className="size-4 animate-spin text-violet-500" />
                  </div>
                </div>
              )}
              <div ref={scrollRef} className="h-px" />
            </div>
          </div>

          {/* Input - Fixed height */}
          <form
            onSubmit={handleSend}
            className="h-24 p-6 bg-white/5 border-t border-white/5 flex items-center gap-3 shrink-0"
          >
            <Input
              placeholder="Haz una consulta ejecutiva..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="h-12 border-white/5 bg-white/5 rounded-2xl focus-visible:ring-violet-500/20 text-sm font-medium"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !chatInput.trim()}
              className="size-12 rounded-2xl bg-violet-600 hover:bg-violet-700 shadow-xl shadow-violet-500/20 transition-all active:scale-95 shrink-0"
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
          "size-16 rounded-[2rem] shadow-2xl transition-all duration-500 group overflow-hidden",
          isOpen
            ? "bg-background border border-white/10 text-violet-600 hover:bg-muted"
            : "bg-violet-600 text-white hover:bg-violet-700 hover:scale-105"
        )}
      >
        <div className="relative size-full flex items-center justify-center">
          <IconMessageChatbot
            className={cn(
              "size-7 transition-all duration-500",
              isOpen ? "opacity-0 scale-50 rotate-90" : "opacity-100 scale-100"
            )}
          />
          <IconX
            className={cn(
              "absolute size-7 transition-all duration-500",
              isOpen ? "opacity-100 scale-100" : "opacity-0 scale-50 -rotate-90"
            )}
          />
        </div>
      </Button>
    </div>
  );
}
