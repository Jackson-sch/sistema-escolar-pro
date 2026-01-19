"use client";

import { Badge } from "@/components/ui/badge";
import { IconMessage2, IconNotification } from "@tabler/icons-react";

export function CommunicationsBanner() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-sky-500/20 bg-card/50 p-8 @container/banner">
      <div className="relative z-10 flex flex-col gap-3 md:max-w-[70%]">
        <Badge className="w-fit border-none bg-sky-500/10 text-sky-500 hover:bg-sky-500/20 transition-colors">
          Comunicaciones
        </Badge>
        <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight sm:text-4xl">
          Avisos y{" "}
          <span className="bg-linear-to-r from-sky-500 to-blue-500 bg-clip-text text-transparent">
            Noticias
          </span>
        </h1>
        <p className="max-w-xl text-balance text-lg text-muted-foreground font-medium">
          Mantente al día con los comunicados oficiales, eventos y noticias más
          importantes de la institución educativa.
        </p>
      </div>

      {/* Abstract background elements */}
      <div className="absolute -right-24 -top-24 size-80 rounded-full bg-sky-600/10 blur-[120px]" />
      <div className="absolute -bottom-24 -left-24 size-64 rounded-full bg-blue-500/10 blur-[100px]" />
      <IconMessage2 className="absolute -bottom-10 -right-10 size-64 -rotate-12 text-sky-500/5 select-none" />
      <IconNotification className="absolute top-1/2 right-1/4 size-32 opacity-[0.03] -translate-y-1/2 select-none" />
    </div>
  );
}
