import {
  IconLoader2,
  IconMessageChatbot,
  IconSparkles,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface NotaFeedbackPopoverProps {
  comentario?: string;
  isStreaming: boolean;
  onGenerateAI: () => void;
  onCommentChange: (value: string) => void;
  streamingContent: string | null;
}

export function NotaFeedbackPopover({
  comentario,
  isStreaming,
  onGenerateAI,
  onCommentChange,
  streamingContent,
}: NotaFeedbackPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "size-8 rounded-lg transition-all",
            comentario
              ? "text-violet-600 bg-violet-600/10 hover:bg-violet-600/20"
              : "text-muted-foreground hover:bg-muted/50",
          )}
        >
          <IconMessageChatbot className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-4 rounded-2xl border-border/40 bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden"
        align="end"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Feedback Académico
            </h4>
            <Button
              variant="outline"
              size="sm"
              onClick={onGenerateAI}
              disabled={isStreaming}
              className="h-7 px-2.5 text-[10px] font-black uppercase text-violet-600 border-violet-600/20 hover:bg-violet-600/10 hover:border-violet-600/30 transition-all gap-1.5 shadow-sm"
            >
              {isStreaming ? (
                <IconLoader2 className="size-3 animate-spin" />
              ) : (
                <IconSparkles className="size-3" />
              )}
              Asistente IA
            </Button>
          </div>

          <div className="relative">
            <Textarea
              placeholder="Escribe un comentario o usa la IA para generar uno..."
              className="min-h-[120px] text-xs font-medium bg-muted/20 border-border/40 resize-none rounded-xl focus:border-violet-500/50 transition-all"
              value={streamingContent ?? (comentario || "")}
              onChange={(e) => onCommentChange(e.target.value)}
            />
            {isStreaming && (
              <div className="absolute top-2 right-2">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce"></span>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tighter">
            <span>IA Generativa activa</span>
            <span>{comentario?.length || 0} caract.</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
