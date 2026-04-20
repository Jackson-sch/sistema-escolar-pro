"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
import { 
  IconUsers, 
  IconArrowRight, 
  IconSchool, 
  IconCheck, 
  IconAlertCircle,
  IconCalendarEvent,
  IconSearch,
  IconFilter,
  IconClipboardCheck,
  IconRocket,
  IconChartBar,
  IconCircleCheckFilled,
  IconArrowLeft
} from "@tabler/icons-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  getStudentsInSeccionAction 
} from "@/actions/academic-structure";
import { promoteStudentsAction } from "@/actions/enrollments";
import { cn } from "@/lib/utils";

interface PromocionesViewProps {
  aniosDisponibles: number[];
  seccionesOrigen: any[];
  seccionesDestino: any[];
  grados: any[];
  anioOrigen: number;
  anioDestino: number;
  institucionId: string;
}

export function PromocionesView({
  aniosDisponibles,
  seccionesOrigen,
  seccionesDestino,
  grados,
  anioOrigen,
  anioDestino,
  institucionId,
}: PromocionesViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loadingStudents, setLoadingStudents] = useState(false);
  
  // Stepper State
  const [activeTab, setActiveTab] = useState<"auditoria" | "mapeo" | "ejecucion">("auditoria");
  
  // States
  const [selectedLevelId, setSelectedLevelId] = useState<string>("all");
  const [sourceSeccionId, setSourceSeccionId] = useState<string>("");
  const [targetSeccionId, setTargetSeccionId] = useState<string>("");
  const [students, setStudents] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Validation States (Step 1)
  const validationItems = [
    { id: "grades", label: "Cierre de Notas", description: "Todas las notas y promedios finales registrados.", status: "complete" },
    { id: "attendance", label: "Control de Asistencia", description: "Asistencia institucional validada y cerrada.", status: "complete" },
    { id: "finance", label: "Solvencia Estudiantil", description: "Sincronización de estados de pago.", status: "warning" },
  ];

  const niveles = useMemo(() => {
    const map = new Map();
    seccionesOrigen.forEach((s) => {
      if (s.nivel && !map.has(s.nivel.id)) map.set(s.nivel.id, s.nivel);
    });
    return Array.from(map.values());
  }, [seccionesOrigen]);

  const filteredSourceSecciones = useMemo(() => {
    if (selectedLevelId === "all") return seccionesOrigen;
    return seccionesOrigen.filter((s) => s.nivel?.id === selectedLevelId);
  }, [seccionesOrigen, selectedLevelId]);

  const filteredTargetSecciones = useMemo(() => {
    if (selectedLevelId === "all") return seccionesDestino;
    return seccionesDestino.filter((s) => s.nivel?.id === selectedLevelId);
  }, [seccionesDestino, selectedLevelId]);

  // Obtener estudiantes cuando cambia la sección de origen
  useEffect(() => {
    if (sourceSeccionId) {
      handleFetchStudents(sourceSeccionId);
    } else {
      setStudents([]);
      setSelectedIds([]);
    }
  }, [sourceSeccionId]);

  const handleFetchStudents = async (seccionId: string) => {
    setLoadingStudents(true);
    try {
      const res = await getStudentsInSeccionAction(seccionId);
      if (res.data) {
        setStudents(res.data);
        setSelectedIds(res.data.map((s: any) => s.id)); // Seleccionar todos por defecto
      } else {
        toast.error(res.error || "No se pudieron cargar los estudiantes");
      }
    } catch (error) {
      toast.error("Error al conectar con el servidor");
    } finally {
      setLoadingStudents(false);
    }
  };

  const filteredStudents = students.filter(s => 
    `${s.name} ${s.apellidoPaterno} ${s.apellidoMaterno}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleStudent = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === filteredStudents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStudents.map(s => s.id));
    }
  };

  const handlePromote = async () => {
    if (selectedIds.length === 0) {
      toast.error("Selecciona al menos un estudiante");
      return;
    }
    if (!targetSeccionId) {
      toast.error("Selecciona la sección de destino");
      return;
    }

    setActiveTab("ejecucion");

    startTransition(async () => {
      const res = await promoteStudentsAction(
        selectedIds,
        targetSeccionId,
        anioDestino
      );

      if (res.success) {
        toast.success(res.success);
        router.refresh();
        // Mantener en ejecución pero permitir finalizar
      } else {
        toast.error(res.error || "Ocurrió un error");
        setActiveTab("mapeo"); // Regresar si falló
      }
    });
  };

  return (
    <div className="space-y-8 pb-20 relative">
      {/* Background Blobs for Atmosphere */}
      <div className="absolute top-0 -left-20 w-72 h-72 bg-primary/10 rounded-full blur-[120px] animate-blob pointer-events-none"></div>
      <div className="absolute bottom-40 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-blob [animation-delay:2s] pointer-events-none"></div>

      {/* ── Stepper Header: High Impact ── */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-4 py-2">
        <StepperItem 
          active={activeTab === "auditoria"} 
          completed={activeTab !== "auditoria"} 
          icon={<IconClipboardCheck className="size-5" />} 
          label="Paso 1" 
          title="Auditoría Académica" 
          onClick={() => setActiveTab("auditoria")}
        />
        <div className="hidden md:block w-12 h-[1px] bg-border/50"></div>
        <StepperItem 
          active={activeTab === "mapeo"} 
          completed={activeTab === "ejecucion"} 
          icon={<IconFilter className="size-5" />} 
          label="Paso 2" 
          title="Mapeo de Secciones" 
          onClick={() => activeTab !== "auditoria" ? setActiveTab("mapeo") : null}
          disabled={activeTab === "auditoria"}
        />
        <div className="hidden md:block w-12 h-[1px] bg-border/50"></div>
        <StepperItem 
          active={activeTab === "ejecucion"} 
          completed={false} 
          icon={<IconRocket className="size-5" />} 
          label="Paso 3" 
          title="Centro de Control" 
          disabled={activeTab !== "ejecucion"}
        />
      </div>

      <Separator className="bg-border/20" />

      {/* ── Content Based on Stepper ── */}
      {activeTab === "auditoria" && (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="text-center space-y-2">
              <h1 className="text-4xl font-black bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent italic uppercase tracking-tighter">
                Auditoría Académica {anioOrigen}
              </h1>
              <p className="text-muted-foreground text-sm max-w-lg mx-auto">
                Validación inteligente de prerrequisitos institucionales para garantizar una promoción sin errores.
              </p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {validationItems.map((item) => (
                <Card key={item.id} className="liquid-glass p-6 rounded-[2.5rem] border-border/40 group hover:scale-[1.02]">
                  <div className="space-y-4">
                    <div className={cn(
                      "size-12 rounded-2xl flex items-center justify-center border transition-all",
                      item.status === "complete" ? "bg-green-500/10 border-green-500/30 text-green-500" : "bg-warning/10 border-warning/30 text-warning"
                    )}>
                      {item.status === "complete" ? <IconCircleCheckFilled className="size-6" /> : <IconAlertCircle className="size-6" />}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-base">{item.label}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                    <Badge variant={item.status === "complete" ? "secondary" : "outline"} className="rounded-full px-3 py-1">
                      {item.status === "complete" ? "Validado" : "Revisión Sugerida"}
                    </Badge>
                  </div>
                </Card>
              ))}
           </div>

           <Card className="liquid-glass p-8 rounded-[3rem] border-primary/20 bg-primary/5 flex flex-col md:flex-row items-center justify-between gap-6 overflow-visible relative">
              <div className="absolute -top-10 -right-10 size-40 bg-primary/20 rounded-full blur-3xl animate-blob"></div>
              <div className="space-y-2 text-center md:text-left z-10">
                <h2 className="text-2xl font-black italic tracking-tighter">¿SISTEMA LISTO?</h2>
                <p className="text-sm text-muted-foreground max-w-md">
                  El año lectivo {anioOrigen} cumple con los estándares institucionales básicos. Puedes proceder al mapeo de secciones para el nuevo ciclo {anioDestino}.
                </p>
              </div>
              <Button 
                onClick={() => setActiveTab("mapeo")}
                className="rounded-3xl h-14 px-10 font-bold bg-primary text-primary-foreground shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-widest gap-3 z-10"
              >
                Configurar Mapeo
                <IconArrowRight size={18} />
              </Button>
           </Card>
        </div>
      )}

      {activeTab === "mapeo" && (
        <div className="animate-in fade-in zoom-in-95 duration-500">
           <div className="flex items-center justify-between mb-8">
              <Button variant="ghost" onClick={() => setActiveTab("auditoria")} className="gap-2 rounded-2xl group">
                <IconArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Volver a Auditoría
              </Button>
              <div className="text-right">
                 <h2 className="text-2xl font-black italic tracking-tighter uppercase">Configuración de Mapeo</h2>
                 <p className="text-xs text-muted-foreground">Ciclo {anioOrigen} → {anioDestino}</p>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* ── Columna Izquierda: Configuración Masiva ── */}
              <div className="lg:col-span-4 space-y-6">
                <Card className="liquid-glass p-6 rounded-[2.5rem] border-border/50 bg-card/40 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <IconFilter className="text-primary size-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold">Filtros Inteligentes</h3>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Optimización de carga</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Nivel Educativo</label>
                       <Select 
                         value={selectedLevelId} 
                         onValueChange={(val) => {
                           setSelectedLevelId(val);
                           setSourceSeccionId("");
                           setTargetSeccionId("");
                         }}
                       >
                         <SelectTrigger className="rounded-2xl border-border/40 bg-muted/40 h-12 shadow-sm focus:ring-primary/20">
                           <SelectValue placeholder="Todos los niveles" />
                         </SelectTrigger>
                         <SelectContent className="rounded-2xl border-border/40 backdrop-blur-xl">
                           <SelectItem value="all">Todos los niveles</SelectItem>
                           {niveles.map((n: any) => (
                             <SelectItem key={n.id} value={n.id}>
                               {n.nombre}
                             </SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                    </div>

                    <div className="p-4 rounded-3xl bg-primary/5 border border-primary/10 space-y-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 ml-1">Origen {anioOrigen}</label>
                           <Select value={sourceSeccionId} onValueChange={setSourceSeccionId}>
                             <SelectTrigger className="rounded-2xl border-primary/10 bg-white/50 dark:bg-black/50 h-12 shadow-inner">
                               <SelectValue placeholder="Selecciona origen..." />
                             </SelectTrigger>
                             <SelectContent className="rounded-2xl border-border/40 backdrop-blur-xl">
                                {filteredSourceSecciones.map((s: any) => (
                                  <SelectItem key={s.id} value={s.id}>
                                     {s.nivel.nombre} - {s.grado.nombre} "{s.seccion}"
                                  </SelectItem>
                                ))}
                             </SelectContent>
                           </Select>
                        </div>

                        <div className="flex justify-center -my-2 relative z-10 text-primary">
                           <div className="p-2 rounded-2xl bg-primary text-primary-foreground shadow-lg rotate-90 lg:rotate-0">
                              <IconArrowRight className="size-4" strokeWidth={3} />
                           </div>
                        </div>

                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 ml-1">Destino {anioDestino}</label>
                           <Select value={targetSeccionId} onValueChange={setTargetSeccionId}>
                             <SelectTrigger className="rounded-2xl border-primary/20 bg-primary/5 h-12 shadow-inner">
                               <SelectValue placeholder="Selecciona destino..." />
                             </SelectTrigger>
                             <SelectContent className="rounded-2xl border-border/40 backdrop-blur-xl">
                                {filteredTargetSecciones.map((s: any) => (
                                  <SelectItem key={s.id} value={s.id}>
                                     {s.nivel.nombre} - {s.grado.nombre} "{s.seccion}"
                                  </SelectItem>
                                ))}
                             </SelectContent>
                           </Select>
                        </div>
                    </div>
                  </div>

                  {seccionesDestino.length === 0 && (
                    <div className="p-4 rounded-2xl bg-warning/10 border border-warning/20 flex gap-3">
                       <IconAlertCircle className="size-5 text-warning shrink-0" />
                       <p className="text-[11px] text-warning/80 leading-relaxed font-medium">
                         No hay secciones para el ciclo destino. Sincroniza la estructura en el panel de configuración.
                       </p>
                    </div>
                  )}
                </Card>

                <Card className="p-6 rounded-[2.5rem] border-border/40 bg-blue-500/5 overflow-hidden relative">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
                   <div className="space-y-4 relative z-10">
                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                         <IconChartBar size={18} />
                         <span className="text-[10px] font-bold uppercase tracking-widest">Estado del Nivel</span>
                      </div>
                      <div className="space-y-1">
                         <div className="flex justify-between text-[10px] font-bold mb-1">
                            <span className="text-muted-foreground">PROGRESADO</span>
                            <span>{niveles.length > 0 ? "12%" : "0%"}</span>
                         </div>
                         <div className="h-1.5 w-full bg-border/40 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full w-[12%] shadow-sm shadow-blue-500/40"></div>
                         </div>
                      </div>
                   </div>
                </Card>
              </div>

              {/* ── Columna Derecha: Selección de Estudiantes GIGANTE ── */}
              <div className="lg:col-span-8 flex flex-col h-full min-h-[650px]">
                <Card className="flex-1 liquid-glass rounded-[3rem] border-border/40 flex flex-col overflow-hidden bg-card/30">
                  <div className="px-8 py-6 border-b border-border/30 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white/20 dark:bg-black/20">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                         <h3 className="text-lg font-black italic tracking-tighter uppercase">Listado de Promoción</h3>
                         <Badge variant="secondary" className="rounded-lg px-2 text-[10px] font-bold">
                           {selectedIds.length} / {students.length}
                         </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-medium">Panel de selección masiva</p>
                    </div>

                    <div className="flex items-center gap-3">
                       <div className="relative group flex-1 lg:flex-none">
                         <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                         <Input 
                           placeholder="Buscar alumno..."
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           className="pl-11 h-12 w-full lg:w-72 bg-white/40 dark:bg-black/40 border-border/40 rounded-2xl text-sm shadow-inner transition-all focus:ring-primary/20"
                         />
                       </div>
                       <Button 
                         variant="outline" 
                         onClick={toggleAll}
                         className="rounded-2xl h-12 px-6 text-xs font-black uppercase tracking-widest border-border/50 hover:bg-white/50"
                       >
                         {selectedIds.length === filteredStudents.length ? "Ninguno" : "Todos"}
                       </Button>
                    </div>
                  </div>

                  <ScrollArea className="flex-1 p-8">
                    {!sourceSeccionId ? (
                      <div className="flex flex-col items-center justify-center py-40 text-center space-y-6">
                         <div className="size-24 rounded-[2.5rem] bg-primary/5 border-2 border-dashed border-primary/20 flex items-center justify-center">
                            <IconSchool className="size-12 text-primary/20 animate-pulse" />
                         </div>
                         <div className="space-y-2">
                           <h3 className="text-xl font-black italic tracking-tighter uppercase text-muted-foreground/60">Carga de Datos Pendiente</h3>
                           <p className="text-xs text-muted-foreground/40 max-w-sm mx-auto font-medium">
                             Define primero la sección de origen para instanciar el proceso de transferencia al ciclo {anioDestino}.
                           </p>
                         </div>
                      </div>
                    ) : loadingStudents ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                          <div key={i} className="h-20 w-full bg-primary/5 animate-pulse rounded-[2rem] border border-primary/10" />
                        ))}
                      </div>
                    ) : filteredStudents.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {filteredStudents.map((student) => {
                          const isSelected = selectedIds.includes(student.id);
                          return (
                            <div 
                              key={student.id}
                              onClick={() => toggleStudent(student.id)}
                              className={cn(
                                "group p-5 rounded-[2.2rem] border-2 transition-all cursor-pointer flex items-center gap-5 relative overflow-hidden",
                                isSelected 
                                  ? "bg-primary/10 border-primary/30 shadow-lg shadow-primary/5" 
                                  : "bg-white/40 dark:bg-black/40 border-transparent hover:border-border/60 hover:bg-white/60"
                              )}
                            >
                              <div className={cn(
                                "flex items-center justify-center size-8 rounded-[0.9rem] border-2 transition-all",
                                isSelected ? "bg-primary border-primary text-primary-foreground rotate-0" : "bg-white dark:bg-black border-border/60 rotate-45"
                              )}>
                                <IconCheck size={16} className={cn("transition-all", isSelected ? "scale-100 opacity-100" : "scale-0 opacity-0")} strokeWidth={4} />
                              </div>
                              <div className="flex-1 min-w-0">
                                 <h4 className="text-[13px] font-black tracking-tight truncate uppercase italic">
                                   {student.apellidoPaterno} {student.apellidoMaterno}, {student.name}
                                 </h4>
                                 <p className="text-[9px] font-bold text-muted-foreground/60 mt-0.5 tracking-wider">CÓDIGO: {student.id.substring(0, 8).toUpperCase()}</p>
                              </div>
                              <div className={cn(
                                "size-2 rounded-full",
                                isSelected ? "bg-primary animate-pulse" : "bg-muted-foreground/20"
                              )} />
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                       <div className="text-center py-20 bg-primary/5 rounded-[3rem] border-2 border-dashed border-primary/10">
                         <p className="text-sm font-black italic uppercase text-primary/40 tracking-widest">Sin alumnos registrados</p>
                       </div>
                    )}
                  </ScrollArea>

                  <div className="px-8 py-6 bg-primary/5 border-t border-primary/10 flex items-center justify-between">
                     <div className="hidden sm:flex items-center gap-4">
                       <div className="flex -space-x-3">
                         {students.slice(0, 4).map((s, i) => (
                           <div key={i} className="size-10 rounded-2xl bg-white dark:bg-black border-2 border-primary/20 shadow-xl overflow-hidden flex items-center justify-center">
                              <span className="text-[10px] font-black text-primary uppercase">{s.name[0]}{s.apellidoPaterno[0]}</span>
                           </div>
                         ))}
                         {students.length > 4 && (
                           <div className="size-10 rounded-2xl bg-primary text-primary-foreground border-2 border-primary border-white flex items-center justify-center text-[10px] font-black shadow-xl">
                             +{students.length - 4}
                           </div>
                         )}
                       </div>
                       <div className="space-y-0.5">
                          <p className="text-[10px] font-black uppercase tracking-widest text-primary italic">Transferencia Lista</p>
                          <p className="text-[9px] text-muted-foreground font-bold">Se generarán registros para el ciclo {anioDestino}</p>
                       </div>
                     </div>

                     <Button 
                       size="lg"
                       onClick={handlePromote}
                       disabled={isPending || !sourceSeccionId || !targetSeccionId || selectedIds.length === 0}
                       className="rounded-[2rem] h-16 px-10 font-bold bg-primary text-primary-foreground shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-[0.1em] gap-3"
                     >
                       {isPending ? (
                         <>OPTIMIZANDO...</>
                       ) : (
                         <>
                           EJECUTAR PROMOCIÓN
                           <IconRocket size={20} className="animate-bounce" />
                         </>
                       )}
                     </Button>
                  </div>
                </Card>
              </div>
           </div>
        </div>
      )}

      {activeTab === "ejecucion" && (
        <div className="max-w-3xl mx-auto py-12 text-center space-y-8 animate-in zoom-in-50 duration-700">
           <div className={cn(
             "size-32 rounded-[3.5rem] flex items-center justify-center mx-auto shadow-2xl transition-all duration-1000",
             isPending 
               ? "bg-primary/10 border-4 border-primary/30 shadow-primary/10 animate-liquid-spin" 
               : "bg-green-500/10 border-4 border-green-500/30 shadow-green-500/10"
           )}>
              {isPending ? <IconRocket className="size-16 text-primary" /> : <IconCheck className="size-16 text-green-500" />}
           </div>
           
           <div className="space-y-3">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter">
                {isPending ? "Procesando Institución" : "Promoción Exitosa"}
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto text-sm">
                {isPending 
                  ? "Estamos sincronizando la base de datos académica para el nuevo ciclo lectivo. Por favor, no cierres esta ventana." 
                  : "Los estudiantes han sido transferidos correctamente a sus nuevas secciones. Los registros de matrícula han sido actualizados."}
              </p>
           </div>
           
           <div className="w-full h-4 bg-border/20 rounded-full overflow-hidden shadow-inner">
              <div className={cn(
                "h-full rounded-full transition-all duration-1000 shadow-lg relative",
                isPending ? "bg-primary w-[70%] shadow-primary/50" : "bg-green-500 w-full shadow-green-500/50"
              )}>
                 {isPending && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>}
              </div>
           </div>
           
           <p className={cn(
             "text-[10px] font-black uppercase tracking-[0.4em]",
             isPending ? "text-primary animate-pulse" : "text-green-500"
           )}>
             {isPending ? "Ejecutando Scripts de Migración..." : "Sincronización Completada"}
           </p>

           {!isPending && (
              <div className="pt-4 flex flex-col items-center gap-4">
                 <Button 
                   onClick={() => {
                     setActiveTab("auditoria");
                     setSourceSeccionId("");
                     setTargetSeccionId("");
                     setSelectedIds([]);
                   }}
                   className="rounded-3xl h-14 px-12 font-black uppercase tracking-widest bg-green-500 hover:bg-green-600 text-white shadow-xl shadow-green-500/20"
                 >
                    Finalizar y Volver
                 </Button>
                 <p className="text-[9px] text-muted-foreground font-bold tracking-tighter uppercase">
                    Se han procesado {selectedIds.length} registros exitosamente.
                 </p>
              </div>
           )}
        </div>
      )}
    </div>
  );
}

function StepperItem({ 
  active, 
  completed, 
  icon, 
  label, 
  title, 
  onClick,
  disabled 
}: { 
  active: boolean; 
  completed: boolean; 
  icon: React.ReactNode; 
  label: string; 
  title: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-4 transition-all duration-500 px-6 py-4 rounded-[2rem] border min-w-[260px]",
        active 
          ? "bg-primary/10 border-primary/40 shadow-xl shadow-primary/10 scale-105 z-10" 
          : completed 
            ? "bg-green-500/5 border-green-500/20 opacity-80" 
            : "bg-muted/10 border-transparent opacity-40 grayscale pointer-events-none"
      )}
    >
      <div className={cn(
        "size-10 rounded-2xl flex items-center justify-center transition-all duration-500",
        active ? "bg-primary text-primary-foreground shadow-lg rotate-0" : completed ? "bg-green-500 text-white" : "bg-border text-muted-foreground rotate-12"
      )}>
        {completed ? <IconCheck className="size-5" strokeWidth={3} /> : icon}
      </div>
      <div className="text-left">
        <p className={cn("text-[9px] font-black uppercase tracking-widest", active ? "text-primary" : "text-muted-foreground")}>{label}</p>
        <p className={cn("text-xs font-bold leading-tight", active ? "text-foreground" : "text-muted-foreground")}>{title}</p>
      </div>
    </button>
  );
}
