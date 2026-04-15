"use client";

import { useState, useMemo } from "react";
import {
  IconSearch,
  IconUserCircle,
  IconX,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TeacherSelectorProps {
  teachers: any[];
  onSelect: (id: string | null) => void;
  selectedTeacherId?: string | null;
  currentTeacher?: any;
  isLoading?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  showCurrentTeacherBox?: boolean;
}

export function TeacherSelector({
  teachers,
  onSelect,
  selectedTeacherId,
  currentTeacher,
  isLoading = false,
  searchPlaceholder = "Escribe para buscar docente...",
  emptyMessage = "No se encontraron docentes",
  showCurrentTeacherBox = true,
}: TeacherSelectorProps) {
  console.log("🚀 ~ TeacherSelector ~ currentTeacher:", currentTeacher)
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search || search.length < 2) return [];
    const q = search.toLowerCase();
    return teachers.filter((t: any) =>
      t.name?.toLowerCase().includes(q) ||
      t.apellidoPaterno?.toLowerCase().includes(q) ||
      t.apellidoMaterno?.toLowerCase().includes(q)
    );
  }, [teachers, search]);

  return (
    <div className="space-y-3">
      {/* Current teacher info */}
      {showCurrentTeacherBox && currentTeacher && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-primary/5 border border-primary/15">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar className="size-8 border border-primary/20 shrink-0">
              <AvatarImage src={currentTeacher.image || ""} />
              <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold uppercase">
                {currentTeacher.name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-[10px] text-primary/60 font-medium tracking-widest">Asignación actual</p>
              <p className="text-xs font-bold text-primary truncate capitalize">
                {currentTeacher.apellidoPaterno} {currentTeacher.apellidoMaterno || ""}, {currentTeacher.name}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onSelect(null)}
            disabled={isLoading}
            className="size-8 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground shrink-0"
            title="Remover asignación"
          >
            <IconX size={14} />
          </Button>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-10 text-sm bg-muted/30 border-border/60 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/40"
          autoFocus
        />
      </div>

      {/* Results */}
      <ScrollArea className="max-h-[280px]">
        <div className="space-y-1 pr-2">
          {search.length < 2 ? (
            <div className="py-8 text-center bg-muted/5 rounded-xl border border-dashed border-border/40">
              <IconSearch className="size-8 mx-auto text-muted-foreground/20 mb-2" />
              <p className="text-xs text-muted-foreground/60 font-medium">
                Escribe al menos 2 letras para buscar
              </p>
              <p className="text-[10px] text-muted-foreground/40 mt-1">
                {teachers.length} docentes disponibles
              </p>
            </div>
          ) : filtered.length > 0 ? (
            <>
              {filtered.slice(0, 8).map((teacher: any) => {
                const isSelected = selectedTeacherId === teacher.id;
                return (
                  <button
                    key={teacher.id}
                    onClick={() => onSelect(teacher.id)}
                    disabled={isLoading || isSelected}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all duration-200 disabled:opacity-50 group",
                      isSelected
                        ? "bg-primary/10 border-primary/25 text-primary shadow-sm"
                        : "bg-card border-border/40 hover:border-primary/25 hover:bg-primary/5 hover:translate-x-0.5"
                    )}
                  >
                    <Avatar className="size-8 border border-primary/20 shrink-0 group-hover:scale-105 transition-transform">
                      <AvatarImage src={teacher.image || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold uppercase">
                        {teacher.name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate capitalize">
                        {teacher.apellidoPaterno} {teacher.apellidoMaterno || ""}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate capitalize">
                        {teacher.name}
                      </p>
                    </div>
                    {isSelected && (
                      <Badge variant="outline" className="text-[9px] font-bold px-2 py-0 h-5 rounded-md border-primary/25 text-primary bg-primary/5 shrink-0">
                        Actual
                      </Badge>
                    )}
                  </button>
                );
              })}
              {filtered.length > 8 && (
                <p className="text-[10px] text-center text-muted-foreground/50 py-2 bg-muted/5 rounded-lg border border-border/20 mt-2">
                  Hay {filtered.length - 8} resultados más · Refina tu búsqueda
                </p>
              )}
            </>
          ) : (
            <div className="py-8 text-center bg-muted/5 rounded-xl border border-dashed border-border/40">
              <IconUserCircle className="size-8 mx-auto text-muted-foreground/20 mb-2" />
              <p className="text-xs text-muted-foreground font-medium">{emptyMessage}</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
