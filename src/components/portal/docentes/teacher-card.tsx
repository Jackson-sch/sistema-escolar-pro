import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone } from "lucide-react";
import { IconBriefcase, IconBook2 } from "@tabler/icons-react";

interface TeacherCardProps {
  teacher: {
    id: string;
    name: string | null;
    apellidoPaterno: string | null;
    apellidoMaterno: string | null;
    image: string | null;
    email: string | null;
    especialidad: string | null;
    telefono: string | null;
    cargo: { nombre: string } | null;
    cursosImpartidos?: Array<{
      nombre: string;
      nivelAcademico: { grado: { nombre: string }; seccion: string };
    }>;
  };
}

export function TeacherCard({ teacher }: TeacherCardProps) {
  const fullName =
    `${teacher.name || ""} ${teacher.apellidoPaterno || ""} ${teacher.apellidoMaterno || ""}`.trim();
  const initials =
    `${teacher.name?.charAt(0) || ""}${teacher.apellidoPaterno?.charAt(0) || ""}`.toUpperCase();

  const hasCourses =
    teacher.cursosImpartidos && teacher.cursosImpartidos.length > 0;
  const visibleCourses = teacher.cursosImpartidos?.slice(0, 3) ?? [];
  const extraCourses = (teacher.cursosImpartidos?.length ?? 0) - 3;

  return (
    <div
      className="group relative flex flex-col rounded-3xl overflow-hidden border border-border/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-card text-card-foreground shadow-sm"
    >
      {/* ── Banner ── */}
      {/* Usamos bg-primary para que respete el color principal de tu tema shadcn */}
      <div className="relative h-28 overflow-hidden shrink-0 bg-primary/90">
        {/* Patrón de puntos sutil */}
        <div
          className="absolute inset-0 opacity-20 mix-blend-overlay"
          style={{
            backgroundImage:
              "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        {/* Formas decorativas */}
        <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-background/10 blur-2xl" />
        <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full bg-background/10 blur-xl" />

        {/* Badge de Cargo */}
        {teacher.cargo && (
          <div className="absolute top-3 right-3">
            <Badge 
              variant="secondary" 
              className="bg-background/20 hover:bg-background/30 text-primary-foreground border-transparent backdrop-blur-md text-[10px] uppercase tracking-widest font-bold"
            >
              {teacher.cargo.nombre}
            </Badge>
          </div>
        )}
      </div>

      {/* ── Cuerpo de la Tarjeta ── */}
      <div className="flex-1 flex flex-col px-5 pb-5 -mt-12 relative">
        {/* Avatar superpuesto */}
        <Avatar className="size-[72px] border-4 border-card shadow-sm mb-3 ring-2 ring-transparent transition-all duration-300 group-hover:ring-primary/20">
          <AvatarImage src={teacher.image || ""} alt={fullName} />
          <AvatarFallback className="text-xl font-black bg-muted text-muted-foreground">
            {initials || "??"}
          </AvatarFallback>
        </Avatar>

        {/* Nombre y Especialidad */}
        <div className="mb-4">
          <h3 className="text-[17px] font-bold tracking-tight leading-snug line-clamp-2 capitalize">
            {fullName}
          </h3>
          {teacher.especialidad && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-primary/80">
              <IconBriefcase className="size-3.5 shrink-0" />
              {teacher.especialidad}
            </p>
          )}
        </div>

        {/* Separador */}
        <div className="w-full h-px mb-4 bg-border/50" />

        {/* Información de Contacto */}
        <div className="space-y-3 mb-4">
          {teacher.email && (
            <a
              href={`mailto:${teacher.email}`}
              className="flex items-center gap-3 group/link"
            >
              <span className="size-8 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200 bg-primary/10 text-primary group-hover/link:bg-primary group-hover/link:text-primary-foreground">
                <Mail className="size-3.5" />
              </span>
              <span className="text-xs font-medium truncate transition-colors text-muted-foreground group-hover/link:text-foreground">
                {teacher.email}
              </span>
            </a>
          )}

          {teacher.telefono && (
            <div className="flex items-center gap-3">
              <span className="size-8 rounded-xl flex items-center justify-center shrink-0 bg-primary/10 text-primary">
                <Phone className="size-3.5" />
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {teacher.telefono}
              </span>
            </div>
          )}

          {!teacher.email && !teacher.telefono && (
            <p className="text-[11px] italic text-muted-foreground/70">
              Información de contacto no disponible.
            </p>
          )}
        </div>

        {/* Cursos Asignados */}
        {hasCourses && (
          <div className="mt-auto pt-2">
            <div className="w-full h-px mb-4 bg-border/50" />
            
            <div className="flex items-center gap-1.5 mb-3">
              <IconBook2 className="size-3.5 text-muted-foreground" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Cursos asignados
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {visibleCourses.map((curso, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 text-[10px] py-0.5"
                >
                  {curso.nombre}
                  <span className="ml-1 opacity-60 font-normal">
                    {curso.nivelAcademico.grado.nombre} {curso.nivelAcademico.seccion}
                  </span>
                </Badge>
              ))}
              {extraCourses > 0 && (
                <Badge variant="secondary" className="text-[10px] py-0.5 text-muted-foreground">
                  +{extraCourses} más
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}