"use client";

import { IconSearch, IconX } from "@tabler/icons-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState } from "react";

export function InstitucionSearch() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(searchParams.get("query") || "");

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
    <div className="relative group">
      <IconSearch className={`absolute left-3 top-1/2 -translate-y-1/2 size-4 transition-colors ${isPending ? 'text-indigo-500 animate-pulse' : 'text-zinc-500 group-focus-within:text-indigo-500'}`} />
      <input 
        type="text" 
        placeholder="Buscar colegio..." 
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          handleSearch(e.target.value);
        }}
        className="pl-10 pr-10 py-2 bg-zinc-900 border border-white/5 rounded-xl text-sm focus:outline-none focus:border-indigo-500/50 transition-all w-64"
      />
      {value && (
        <button 
          onClick={() => {
            setValue("");
            handleSearch("");
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-white/5 rounded-md transition-all"
        >
          <IconX className="size-3 text-zinc-500" />
        </button>
      )}
    </div>
  );
}
