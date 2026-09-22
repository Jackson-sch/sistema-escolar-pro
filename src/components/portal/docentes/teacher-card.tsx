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

function TeacherContactInfo({
  email,
  telefono,
}: {
  email: string | null;
  telefono: string | null;
}) {
  if (!email && !telefono) {
    return (
      <p className="text-[11px] italic text-muted-foreground/70">
        Información de contacto no disponible.
      </p>
    );
  }

  return (
    <div className="space-y-3 mb-4">
      {email && (
        <a href={`mailto:${email}`} className="flex items-center gap-3 group/link">
          <span className="size-8 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200 bg-primary/10 text-primary group-hover/link:bg-primary group-hover/link:text-primary-foreground">
            <Mail className="size-3.5" />
          </span>
          <span className="text-xs font-medium truncate transition-colors text-muted-foreground group-hover/link:text-foreground">
            {email}
          </span>
        </a>
      )}

      {telefono && (
        <div className="flex items-center gap-3">
          <span className="size-8 rounded-xl flex items-center justify-center shrink-0 bg-primary/10 text-primary">
            <Phone className="size-3.5" />
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            {telefono}
          </span>
        </div>
      )}
    </div>
  );
}

function TeacherCoursesList({
  cursos,
}: {
  cursos?: Array<{
    nombre: string;
    nivelAcademico: { grado: { nombre: string }; seccion: string };
  }>;
}) {
  if (!cursos || cursos.length === 0) {
    return null;
  }

  const visibleCourses = cursos.slice(0, 3);
  const extraCourses = cursos.length - 3;

  return (
    <div className="mt-auto pt-2">
      <div className="w-full h-px mb-4 bg-border/50" />

      <div className="flex items-center gap-1.5 mb-3">
        <IconBook2 className="size-3.5 text-muted-foreground" />
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Cursos asignados
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {visibleCourses.map((curso) => (
          <Badge
            key={`${curso.nombre}-${curso.nivelAcademico.grado.nombre}-${curso.nivelAcademico.seccion}`}
            variant="outline"
            className="bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 text-[10px] py-0.5"
          >
            {curso.nombre}
            <span className="ml-1 opacity-60 font-normal">
              {curso.nivelAcademico.grado.nombre}{" "}
              {curso.nivelAcademico.seccion}
            </span>
          </Badge>
        ))}
        {extraCourses > 0 && (
          <Badge
            variant="secondary"
            className="text-[10px] py-0.5 text-muted-foreground"
          >
            +{extraCourses} más
          </Badge>
        )}
      </div>
    </div>
  );
}

export function TeacherCard({ teacher }: TeacherCardProps) {
  const fullName =
    `${teacher.name || ""} ${teacher.apellidoPaterno || ""} ${teacher.apellidoMaterno || ""}`.trim();
  const initials =
    `${teacher.name?.charAt(0) || ""}${teacher.apellidoPaterno?.charAt(0) || ""}`.toUpperCase();

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/80 text-card-foreground shadow-sm transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-md">
      {/* Banner */}
      <div className="relative h-28 overflow-hidden shrink-0 bg-primary/90">
        <div
          className="absolute inset-0 opacity-20 mix-blend-overlay"
          style={{
            backgroundImage:
              "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        {teacher.cargo && (
          <div className="absolute top-3 right-3">
            <Badge
              variant="secondary"
              className="bg-background/20 hover:bg-background/30 text-primary-foreground border-transparent text-[10px] uppercase tracking-widest font-bold"
            >
              {teacher.cargo.nombre}
            </Badge>
          </div>
        )}
      </div>

      {/* Cuerpo */}
      <div className="flex-1 flex flex-col px-5 pb-5 -mt-12 relative">
        <Avatar className="size-[72px] border-4 border-card shadow-sm mb-3 ring-2 ring-transparent transition-shadow duration-300 group-hover:ring-primary/20">
          <AvatarImage src={teacher.image || ""} alt={fullName} />
          <AvatarFallback className="text-xl font-black bg-muted text-muted-foreground">
            {initials || "??"}
          </AvatarFallback>
        </Avatar>

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

        <div className="w-full h-px mb-4 bg-border/50" />

        <TeacherContactInfo email={teacher.email} telefono={teacher.telefono} />
        <TeacherCoursesList cursos={teacher.cursosImpartidos} />
      </div>
    </div>
  );
}
