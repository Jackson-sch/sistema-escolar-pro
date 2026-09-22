"use client";

import { IconSearch, IconX, IconLoader2 } from "@tabler/icons-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState } from "react";
import { Input } from "@/components/ui/input";

export function InstitucionSearch() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(() => searchParams.get("query") || "");

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }

    startTransition(() => {
      replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="relative w-full sm:w-72">
      {isPending ? (
        <IconLoader2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-primary animate-spin" />
      ) : (
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      )}
      <Input
        type="text"
        placeholder="Buscar por nombre o modular..."
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          handleSearch(e.target.value);
        }}
        className="pl-9 pr-8 h-9 rounded-xl border-border/60 bg-background text-xs"
        aria-label="Buscar institución"
      />
      {value && (
        <button
          aria-label="Limpiar búsqueda"
          onClick={() => {
            setValue("");
            handleSearch("");
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <IconX className="size-3.5" />
        </button>
      )}
    </div>
  );
}
