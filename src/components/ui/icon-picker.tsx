"use client";

import { useState } from "react";
import {
  IconGlobe,
  IconMath,
  IconUsers,
  IconFlask,
  IconTarget,
  IconAbc,
  IconActivity,
  IconArtboard,
  IconAtom,
  IconBallBasketball,
  IconBook,
  IconBriefcase,
  IconBuildingMonument,
  IconCalculator,
  IconCamera,
  IconChartBar,
  IconDeviceLaptop,
  IconGeometry,
  IconLanguage,
  IconMicroscope,
  IconMusic,
  IconPalette,
  IconPlant,
  IconScript,
  IconTools,
  IconVocabulary,
  IconSearch,
  IconCheck
} from "@tabler/icons-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AVAILABLE_ICONS, getIconComponent } from "./icon-utils";

interface IconPickerProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

export function IconPicker({ value, onChange, className }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedIcon = AVAILABLE_ICONS.find(i => i.name === value);
  const SelectedIconComp = selectedIcon?.icon || IconTarget;

  const filteredIcons = AVAILABLE_ICONS.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between rounded-xl px-3 hover:bg-muted/50 transition-colors bg-background",
            className
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <SelectedIconComp className="h-5 w-5 text-muted-foreground" />
            <span className="truncate flex-1 text-left">
              {selectedIcon ? selectedIcon.label : "Selecciona un icono..."}
            </span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 rounded-xl" 
        align="start"
        onWheel={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col">
          <div className="p-2 border-b">
            <div className="relative">
              <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar iconos..."
                className="pl-9 bg-muted/20 border-border/50 focus-visible:ring-1"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <ScrollArea className="h-72 p-2">
            <div className="grid grid-cols-4 gap-2 pr-3 pb-2">
              {filteredIcons.length > 0 ? (
                filteredIcons.map((iconItem) => {
                  const IconComp = iconItem.icon;
                  const isSelected = value === iconItem.name;
                  return (
                    <Button
                      key={iconItem.name}
                      variant={isSelected ? "default" : "ghost"}
                      className={cn(
                        "h-12 w-full p-0 flex items-center justify-center relative rounded-xl",
                        isSelected && "shadow-md"
                      )}
                      title={iconItem.label}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onChange(iconItem.name);
                        setOpen(false);
                        setSearch("");
                      }}
                    >
                      <IconComp className={cn("size-6", isSelected ? "text-primary-foreground" : "text-foreground")} />
                      {isSelected && (
                        <div className="absolute top-0 right-0 p-0.5 bg-background rounded-full translate-x-1/4 -translate-y-1/4 shadow-sm">
                          <IconCheck className="size-3 text-primary" />
                        </div>
                      )}
                    </Button>
                  );
                })
              ) : (
                <div className="col-span-4 py-8 text-center text-sm text-muted-foreground">
                  No se encontraron iconos
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
