"use client";

import * as React from "react";
import { IconCheck, IconChevronDown } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface ComboboxItem {
  id: string;
  label: string;
  subLabel?: string;
  image?: string | null;
}

interface ComboboxReusableProps {
  items: ComboboxItem[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  isLoading?: boolean;
}

export function ComboboxReusable({
  items,
  value,
  onValueChange,
  placeholder = "Seleccionar...",
  searchPlaceholder = "Buscar...",
  emptyMessage = "No se encontraron resultados.",
  disabled = false,
  className,
  isLoading = false,
}: ComboboxReusableProps) {
  const [open, setOpen] = React.useState(false);

  const selectedItem = React.useMemo(
    () => items.find((item) => item.id === value),
    [items, value]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || isLoading}
          className={cn(
            "w-full justify-between h-9 px-3 rounded-xl border-border/40 bg-background/40 hover:bg-background/60 transition-all font-bold text-xs",
            selectedItem ? "text-foreground" : "text-muted-foreground",
            className
          )}
        >
          <div className="flex items-center gap-2 truncate">
            {selectedItem?.image !== undefined && (
              <Avatar className="size-5 border border-primary/20 shrink-0">
                <AvatarImage src={selectedItem.image || ""} />
                <AvatarFallback className="bg-primary/10 text-primary text-[8px] font-bold uppercase">
                  {selectedItem.label[0]}
                </AvatarFallback>
              </Avatar>
            )}
            <span className="truncate">
              {selectedItem ? selectedItem.label : placeholder}
            </span>
          </div>
          <IconChevronDown className={cn(
            "ml-2 size-3.5 shrink-0 opacity-50 transition-transform duration-200",
            open && "rotate-180"
          )} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-2xl border-border/40 shadow-2xl bg-card/95 backdrop-blur-xl">
        <Command className="bg-transparent">
          <div className="flex items-center border-b border-border/40 px-3 py-2">
            <CommandInput 
              placeholder={searchPlaceholder} 
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-none focus-visible:ring-0"
            />
          </div>
          <CommandList>
            <ScrollArea className="h-auto max-h-[300px]">
              <CommandEmpty className="py-6 text-center text-xs text-muted-foreground font-medium">
                {isLoading ? "Cargando..." : emptyMessage}
              </CommandEmpty>
              <CommandGroup className="p-1 px-2">
                {items.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.label}
                    onSelect={() => {
                      onValueChange(item.id === value ? "" : item.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all duration-200 cursor-pointer mb-0.5",
                      value === item.id 
                        ? "bg-primary/10 text-primary font-bold" 
                        : "hover:bg-muted/50"
                    )}
                  >
                    {item.image !== undefined && (
                      <Avatar className="size-7 border border-primary/20 shrink-0">
                        <AvatarImage src={item.image || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-black uppercase">
                          {item.label[0]}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="truncate capitalize">{item.label}</span>
                      {item.subLabel && (
                        <span className="text-[10px] text-muted-foreground truncate font-medium">
                          {item.subLabel}
                        </span>
                      )}
                    </div>
                    <IconCheck
                      className={cn(
                        "ml-auto size-4 transition-all",
                        value === item.id ? "opacity-100 scale-100" : "opacity-0 scale-50"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
