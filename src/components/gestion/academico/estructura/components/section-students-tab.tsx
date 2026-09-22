"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  IconUsers,
  IconSearch,
  IconUserPlus,
  IconExternalLink,
  IconLoader2,
  IconId,
} from "@tabler/icons-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getStudentsInSeccionAction } from "@/actions/academic-structure/secciones-actions";

interface StudentItem {
  id: string;
  name: string | null;
  apellidoPaterno: string | null;
  apellidoMaterno?: string | null;
  dni?: string | null;
}

interface SectionStudentsTabProps {
  seccionId: string;
  capacity: number;
}

export function SectionStudentsTab({
  seccionId,
  capacity,
}: SectionStudentsTabProps) {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getStudentsInSeccionAction(seccionId).then((res) => {
      if (isMounted) {
        if (res.data) setStudents(res.data as any);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [seccionId]);

  const filteredStudents = students.filter((s) => {
    const fullName = `${s.name || ""} ${s.apellidoPaterno || ""} ${s.apellidoMaterno || ""}`.toLowerCase();
    const dni = s.dni || "";
    return fullName.includes(search.toLowerCase()) || dni.includes(search);
  });

  const vacantes = Math.max(0, capacity - students.length);

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/40 bg-muted/20">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <IconUsers className="size-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-foreground">
              Nómina Oficial del Aula
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {students.length} estudiantes matriculados • {vacantes} vacantes libres de {capacity}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            asChild
            className="h-8 px-3 rounded-xl text-xs font-bold gap-1.5 shadow-xs cursor-pointer"
          >
            <Link href="/gestion/matriculas">
              <IconUserPlus className="size-3.5" />
              <span>Matricular Alumno</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <Input
          placeholder="Buscar estudiante por nombre o DNI..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8.5 h-8.5 text-xs rounded-xl bg-card border-border/60"
        />
      </div>

      {/* Student List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
          <IconLoader2 className="size-6 animate-spin text-primary" />
          <span className="text-xs font-semibold">Cargando nómina de estudiantes...</span>
        </div>
      ) : students.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 border border-dashed rounded-2xl p-6 text-center">
          <IconUsers className="size-10 text-muted-foreground/40 mb-2" />
          <p className="text-xs font-bold text-foreground">No hay estudiantes matriculados en esta sección</p>
          <p className="text-[11px] text-muted-foreground mt-1 max-w-sm">
            Las vacantes para este salón se encuentran 100% disponibles.
          </p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
          No se encontraron estudiantes que coincidan con &quot;{search}&quot;.
        </div>
      ) : (
        <div className="rounded-xl border border-border/40 bg-card overflow-hidden divide-y divide-border/30">
          {filteredStudents.map((student, idx) => (
            <div
              key={student.id}
              className="flex items-center justify-between gap-3 p-3 hover:bg-muted/25 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="size-5 rounded-md bg-muted/60 text-muted-foreground text-[10px] font-black flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>

                <Avatar className="size-7 border border-border/40 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                    {(student.apellidoPaterno || student.name || "E").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">
                    {student.apellidoPaterno || ""} {student.apellidoMaterno || ""}, {student.name || ""}
                  </p>
                  {student.dni && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                      <IconId className="size-2.5 opacity-70" />
                      DNI: {student.dni}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Badge
                  variant="outline"
                  className="text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                >
                  Matriculado
                </Badge>

                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="size-7 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Ver perfil del estudiante"
                >
                  <Link href={`/gestion/estudiantes/${student.id}`}>
                    <IconExternalLink className="size-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
