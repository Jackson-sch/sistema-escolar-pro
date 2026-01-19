"use client";

import { useState } from "react";
import { IconCopy, IconCheck } from "@tabler/icons-react";
import { toast } from "sonner";

interface CopyTextProps {
  text: string;
}

export function CopyText({ text }: CopyTextProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copiado al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Error al copiar");
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all duration-200 focus:ring-2 ring-primary/20 outline-none active:scale-90"
      title="Copiar texto"
    >
      {copied ? (
        <IconCheck className="size-4 text-green-500" />
      ) : (
        <IconCopy className="size-4" />
      )}
    </button>
  );
}
