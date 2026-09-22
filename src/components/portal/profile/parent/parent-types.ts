export interface ChildRelation {
  parentesco: string;
  hijo: {
    id: string;
    name: string | null;
    apellidoPaterno: string | null;
    apellidoMaterno: string | null;
    image: string | null;
    codigoEstudiante: string | null;
    fechaNacimiento: string | Date | null;
    nivelAcademico: {
      nivel: { nombre: string } | null;
      grado: { nombre: string } | null;
      seccion: string;
    } | null;
  };
}

export interface ParentProfile {
  id: string;
  name: string | null;
  apellidoPaterno: string | null;
  apellidoMaterno: string | null;
  email: string | null;
  dni: string | null;
  telefono: string | null;
  telefonoEmergencia: string | null;
  direccion: string | null;
  distrito: string | null;
  provincia: string | null;
  departamento: string | null;
  fechaNacimiento: string | Date | null;
  sexo: string | null;
  estadoCivil: string | null;
  nacionalidad: string | null;
  ocupacion: string | null;
  lugarTrabajo: string | null;
  gradoInstruccion: string | null;
  image: string | null;
  createdAt: string | Date;
  hijosDeTutor: ChildRelation[];
}

export function getFullName(profile: ParentProfile) {
  return [profile.name, profile.apellidoPaterno, profile.apellidoMaterno]
    .filter(Boolean)
    .join(" ");
}

export function getFullAddress(profile: ParentProfile) {
  return [
    profile.direccion,
    profile.distrito,
    profile.provincia,
    profile.departamento,
  ]
    .filter(Boolean)
    .join(", ");
}

export function formatDate(dateStr: string | Date | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "America/Lima",
  });
}
