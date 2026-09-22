import {
  IconLoader2,
  IconMessageChatbot,
  IconSparkles,
  IconTrash,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  const hasComment = Boolean(comentario && comentario.trim().length > 0);

  return (
    <TooltipProvider delayDuration={350}>
      <Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Conclusión descriptiva o retroalimentación"
                className={cn(
                  "relative size-8 rounded-xl transition-all cursor-pointer",
                  hasComment
                    ? "text-violet-600 dark:text-violet-400 bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/30 shadow-2xs"
                    : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/60",
                )}
              >
                <IconMessageChatbot className="size-4" />
                {hasComment && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-600 ring-2 ring-background" />
                  </span>
                )}
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="max-w-xs text-xs p-2.5 bg-popover text-popover-foreground border border-border/80 shadow-md rounded-xl"
          >
            {hasComment ? (
              <div className="space-y-1 text-left">
                <span className="font-bold text-[10px] uppercase text-violet-600 tracking-wider flex items-center gap-1">
                  ✓ Conclusión Registrada
                </span>
                <p className="text-[11px] line-clamp-3 text-foreground/80 font-normal leading-relaxed">
                  {comentario}
                </p>
              </div>
            ) : (
              <span className="text-[11px]">
                Agregar conclusión descriptiva (CNEB) o retroalimentación
              </span>
            )}
          </TooltipContent>
        </Tooltip>

        <PopoverContent
          className="w-88 p-4 rounded-2xl border-border/60 bg-background/95 backdrop-blur-md shadow-xl overflow-hidden"
          align="end"
          sideOffset={8}
        >
          <div className="space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-wider text-foreground">
                  Conclusión Descriptiva
                </h4>
                <p className="text-[10px] text-muted-foreground">
                  Estándar CNEB / SIAGIE
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onGenerateAI}
                disabled={isStreaming}
                className="h-7 px-2.5 text-[10px] font-black uppercase text-violet-600 dark:text-violet-400 border-violet-500/25 hover:bg-violet-500/10 hover:border-violet-500/40 transition-all gap-1.5 shadow-2xs rounded-full cursor-pointer"
              >
                {isStreaming ? (
                  <IconLoader2 className="size-3 animate-spin" />
                ) : (
                  <IconSparkles className="size-3 text-violet-500" />
                )}
                Redactar con IA
              </Button>
            </div>

            <div className="relative">
              <Textarea
                placeholder="Describe el avance, dificultad o recomendación pedagógica del estudiante..."
                className="min-h-[110px] text-xs font-normal leading-relaxed bg-muted/20 border-border/60 resize-none rounded-xl focus:border-violet-500/50 transition-colors p-3"
                value={streamingContent ?? (comentario || "")}
                onChange={(e) => onCommentChange(e.target.value)}
              />
              {isStreaming && (
                <div className="absolute top-2.5 right-2.5 bg-background/80 px-2 py-1 rounded-md border border-violet-500/30 backdrop-blur-xs flex items-center gap-1.5 shadow-2xs">
                  <span className="text-[9px] font-bold text-violet-600">Generando</span>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce"></span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center text-[10px] font-medium text-muted-foreground pt-1 border-t border-border/30">
              <div className="flex items-center gap-2">
                {hasComment && (
                  <button
                    type="button"
                    onClick={() => onCommentChange("")}
                    className="text-muted-foreground hover:text-destructive flex items-center gap-1 text-[10px] transition-colors cursor-pointer"
                  >
                    <IconTrash className="size-3" /> Borrar
                  </button>
                )}
              </div>
              <span className="font-mono text-[10px]">
                {comentario?.length || 0} caract.
              </span>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
}
