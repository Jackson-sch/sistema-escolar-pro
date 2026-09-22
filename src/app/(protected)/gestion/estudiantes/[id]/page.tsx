import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getStudentFullProfileDetailAction } from "@/actions/students";
import { StudentExpedienteView } from "@/components/gestion/estudiantes/expediente/student-expediente-view";

interface StudentDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: StudentDetailPageProps) {
  const { id } = await params;
  const res = await getStudentFullProfileDetailAction(id);
  const student = res.data;

  if (!student) {
    return {
      title: "Expediente del Estudiante | Sistema Escolar Pro",
    };
  }

  const fullName = `${student.name} ${student.apellidoPaterno || ""}`.trim();
  return {
    title: `${fullName} - Expediente del Alumno | Sistema Escolar Pro`,
    description: `Expediente 360°, ficha médica, matrícula, pensiones y récord académico de ${fullName}.`,
  };
}

export default async function StudentDetailPage({
  params,
}: StudentDetailPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;
  const res = await getStudentFullProfileDetailAction(id);

  if (!res.data || res.error) {
    notFound();
  }

  return <StudentExpedienteView student={res.data} />;
}
