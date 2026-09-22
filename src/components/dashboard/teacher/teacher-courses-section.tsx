"use client";

import { useState, useMemo } from "react";
import {
  IconBook,
  IconSearch,
  IconLayoutGrid,
  IconList,
  IconFilter,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CursoDocente } from "./teacher-types";
import { TeacherCourseCard } from "./teacher-course-card";
import { TeacherCourseRow } from "./teacher-course-row";

interface TeacherCoursesSectionProps {
  cursos: CursoDocente[];
  availableLevels: Array<{ id: string; nombre: string }>;
}

export function TeacherCoursesSection({
  cursos,
  availableLevels,
}: TeacherCoursesSectionProps) {
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [courseSearch, setCourseSearch] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Lista de grados y secciones únicos disponibles
  const availableSections = useMemo(() => {
    const map = new Map<string, { id: string; label: string }>();
    cursos.forEach((c) => {
      const na = c.nivelAcademico;
      if (na?.id && na.grado?.nombre) {
        const label = `${na.grado.nombre} "${na.seccion}" (${na.nivel?.nombre || ""})`;
        if (!map.has(na.id)) {
          map.set(na.id, { id: na.id, label });
        }
      }
    });
    return Array.from(map.values());
  }, [cursos]);

  const filteredCourses = useMemo(() => {
    const q = courseSearch.trim().toLowerCase();
    return cursos.filter((c) => {
      const matchesLevel =
        selectedLevel === "all" || c.nivelAcademico?.nivel?.id === selectedLevel;
      if (!matchesLevel) return false;

      const matchesSection =
        selectedSection === "all" || c.nivelAcademico?.id === selectedSection;
      if (!matchesSection) return false;

      if (!q) return true;
      return (
        (c.nombre && c.nombre.toLowerCase().includes(q)) ||
        c.areaCurricular.nombre.toLowerCase().includes(q) ||
        c.nivelAcademico.grado.nombre.toLowerCase().includes(q) ||
        c.nivelAcademico.seccion.toLowerCase().includes(q)
      );
    });
  }, [cursos, selectedLevel, selectedSection, courseSearch]);

  const resetFilters = () => {
    setSelectedLevel("all");
    setSelectedSection("all");
    setCourseSearch("");
  };

  const hasActiveFilters =
    selectedLevel !== "all" ||
    selectedSection !== "all" ||
    courseSearch.trim() !== "";

  return (
    <section className="space-y-4">
      {/* Encabezado de la Sección */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
            <div className="size-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <IconBook size={14} />
            </div>
            Mis Cursos y Aulas Asignadas
          </h2>
          <p className="text-xs text-muted-foreground">
            Gestiona el registro de notas, temarios y asistencias por aula.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge
            variant="outline"
            className="text-xs font-bold rounded-full px-2.5 py-0.5 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-500/5"
          >
            {filteredCourses.length} de {cursos.length} Asignaturas
          </Badge>

          {/* Toggle de Modo de Vista (Cuadrícula vs Lista Compacta) */}
          <div className="flex items-center p-0.5 rounded-xl bg-muted/60 border border-border/50">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Vista en cuadrícula"
              onClick={() => setViewMode("grid")}
              className={`size-7 rounded-lg transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <IconLayoutGrid size={15} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Vista en lista compacta"
              onClick={() => setViewMode("list")}
              className={`size-7 rounded-lg transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <IconList size={15} />
            </Button>
          </div>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Selector de Nivel */}
          <Tabs
            value={selectedLevel}
            onValueChange={setSelectedLevel}
            className="w-full sm:w-auto"
          >
            <TabsList className="bg-card border border-border/60 p-1 h-9 rounded-xl w-full sm:w-auto">
              <TabsTrigger
                value="all"
                className="text-xs font-semibold rounded-lg px-3 py-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-colors cursor-pointer"
              >
                Todos ({cursos.length})
              </TabsTrigger>
              {availableLevels.map((lvl) => {
                const count = cursos.filter(
                  (c) => c.nivelAcademico.nivel.id === lvl.id
                ).length;
                return (
                  <TabsTrigger
                    key={lvl.id}
                    value={lvl.id}
                    className="text-xs font-semibold rounded-lg px-3 py-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-colors cursor-pointer"
                  >
                    {lvl.nombre} ({count})
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>

          {/* Filtro específico por Grado/Sección si hay varias */}
          {availableSections.length > 1 && (
            <div className="w-full sm:w-48">
              <Select
                value={selectedSection}
                onValueChange={setSelectedSection}
              >
                <SelectTrigger className="h-9 rounded-xl text-xs bg-card/80 border-border/60">
                  <div className="flex items-center gap-1.5 truncate">
                    <IconFilter size={13} className="text-muted-foreground" />
                    <SelectValue placeholder="Todas las aulas" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/60">
                  <SelectItem value="all" className="text-xs">
                    Todas las aulas
                  </SelectItem>
                  {availableSections.map((sec) => (
                    <SelectItem key={sec.id} value={sec.id} className="text-xs">
                      {sec.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Buscador Rápido */}
        <div className="relative w-full md:w-64">
          <IconSearch
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <Input
            type="text"
            placeholder="Buscar materia o grado..."
            value={courseSearch}
            onChange={(e) => setCourseSearch(e.target.value)}
            className="h-9 pl-9 pr-3 rounded-xl text-xs bg-card/80 border-border/60 focus-visible:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Renderizado de Cursos: Grid vs Lista */}
      {filteredCourses.length === 0 ? (
        <div className="rounded-3xl p-8 text-center border border-dashed border-border/60 bg-card/60 backdrop-blur-md space-y-2">
          <IconBook size={28} className="mx-auto text-muted-foreground/40 mb-1" />
          <h4 className="text-sm font-bold text-foreground">
            No se encontraron asignaturas
          </h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            No hay materias asignadas que coincidan con los filtros seleccionados.
          </p>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold cursor-pointer"
            >
              Restablecer filtros
            </Button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredCourses.map((curso) => (
            <TeacherCourseCard key={curso.id} curso={curso} />
          ))}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredCourses.map((curso) => (
            <TeacherCourseRow key={curso.id} curso={curso} />
          ))}
        </div>
      )}
    </section>
  );
}
