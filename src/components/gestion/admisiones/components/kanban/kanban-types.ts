export interface KanbanColumnDef {
  id: string;
  title: string;
  color: string;
  dotColor: string;
}

export const COLUMNS: KanbanColumnDef[] = [
  {
    id: "INTERESADO",
    title: "Interesados",
    color:
      "border-blue-500/20 bg-blue-500/5 text-blue-600 dark:text-blue-400",
    dotColor: "bg-blue-500",
  },
  {
    id: "EVALUANDO",
    title: "En Evaluación",
    color:
      "border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400",
    dotColor: "bg-amber-500",
  },
  {
    id: "ADMITIDO",
    title: "Admitidos",
    color:
      "border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400",
    dotColor: "bg-emerald-500",
  },
  {
    id: "RECHAZADO",
    title: "Rechazados",
    color:
      "border-rose-500/20 bg-rose-500/5 text-rose-600 dark:text-rose-400",
    dotColor: "bg-rose-500",
  },
  {
    id: "MATRICULADO",
    title: "Matriculados",
    color:
      "border-violet-500/20 bg-violet-500/5 text-violet-600 dark:text-violet-400",
    dotColor: "bg-violet-500",
  },
];

export function getWhatsAppUrl(p: any, gradeName: string) {
  if (!p.telefono) return "";
  const cleanPhone = p.telefono.replace(/\D/g, "");
  const fullPhone = cleanPhone.length === 9 ? `51${cleanPhone}` : cleanPhone;
  const studentName = `${p.nombre} ${p.apellidoPaterno || ""}`.trim();

  let msg = "";
  if (p.estado === "INTERESADO") {
    msg =
      `*PROCESO DE ADMISIÓN ESCOLAR*\n\n` +
      `Estimada familia de *${studentName}*, le saludamos de la institución educativa.\n\n` +
      `Nos comunicamos para brindarle la información detallada sobre la vacante para *${gradeName}* y coordinar su entrevista de admisión.\n\n` +
      `¿En qué horario le gustaría recibir nuestra llamada?`;
  } else if (p.estado === "EVALUANDO") {
    msg =
      `*EVALUACIÓN PSICOPEDAGÓGICA*\n\n` +
      `Estimada familia de *${studentName}*, nos comunicamos para confirmar la fecha de su entrevista psicopedagógica y recepción de documentos para *${gradeName}*.\n\n` +
      `Quedamos a su disposición ante cualquier consulta.`;
  } else if (p.estado === "ADMITIDO") {
    msg =
      `*¡VACANTE APROBADA! 🎉*\n\n` +
      `Estimada familia de *${studentName}*, nos complace informarle que su postulación para *${gradeName}* ha sido *Aprobada*.\n\n` +
      `Ya puede proceder con el pago de matrícula y reserva oficial de su vacante.\n\n` +
      `¡Bienvenidos a nuestra comunidad educativa!`;
  } else {
    msg = `Estimada familia de *${studentName}*, le saludamos de la institución educativa respecto a su proceso de admisión para *${gradeName}*.`;
  }

  return `https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`;
}
