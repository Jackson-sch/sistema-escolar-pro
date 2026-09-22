"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/use-confirm";
import {
  deleteNivelAction,
  deleteGradoAction,
  deleteSeccionAction,
  cloneAcademicStructureAction,
} from "@/actions/academic-structure";

export function useEstructuraModals(selectedYear: number, institucionId: string) {
  const router = useRouter();

  const [nivelModal, setNivelModal] = useState<{ open: boolean; data?: any }>({
    open: false,
  });
  const [gradoModal, setGradoModal] = useState<{ open: boolean; data?: any }>({
    open: false,
  });
  const [seccionModal, setSeccionModal] = useState<{
    open: boolean;
    data?: any;
    gradeId?: string;
  }>({ open: false });
  const [tutorModal, setTutorModal] = useState<{
    open: boolean;
    seccion?: any;
  }>({ open: false });
  const [courseModal, setCourseModal] = useState<{
    open: boolean;
    seccion?: any;
  }>({ open: false });
  const [wizardModal, setWizardModal] = useState<{
    open: boolean;
    gradeId?: string;
  }>({ open: false });
  const [clonando, setClonando] = useState(false);

  const [ConfirmDialog, confirm] = useConfirm(
    "¿Estás seguro?",
    "Esta acción no se puede deshacer y eliminará todos los datos relacionados.",
  );
  const [CloneConfirmDialog, confirmClone] = useConfirm(
    "Clonar Estructura Académica",
    `¿Deseas copiar la estructura de ${selectedYear} al año ${selectedYear + 1}? Se copiarán niveles, grados y secciones (sin tutores).`,
  );

  const handleEditNivel = (e: React.MouseEvent, nivel: any) => {
    e.stopPropagation();
    setNivelModal({ open: true, data: nivel });
  };

  const handleDeleteNivel = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const ok = await confirm();
    if (!ok) return;
    const res = await deleteNivelAction(id);
    if (res.success) {
      toast.success(res.success);
      router.refresh();
    } else toast.error(res.error);
  };

  const handleDeleteGrade = async (id: string) => {
    const ok = await confirm();
    if (!ok) return;
    const res = await deleteGradoAction(id);
    if (res.success) {
      toast.success(res.success);
      router.refresh();
    } else toast.error(res.error);
  };

  const handleDeleteSection = async (id: string) => {
    const ok = await confirm();
    if (!ok) return;
    const res = await deleteSeccionAction(id);
    if (res.success) {
      toast.success(res.success);
      router.refresh();
    } else toast.error(res.error);
  };

  const handleClone = async () => {
    const ok = await confirmClone();
    if (!ok) return;
    setClonando(true);
    try {
      const res = await cloneAcademicStructureAction(
        selectedYear,
        selectedYear + 1,
        institucionId,
      );
      if (res.success) {
        toast.success(res.success);
        router.push(`/gestion/academico/estructura?anio=${selectedYear + 1}`);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Error al clonar la estructura");
    } finally {
      setClonando(false);
    }
  };

  return {
    nivelModal,
    setNivelModal,
    gradoModal,
    setGradoModal,
    seccionModal,
    setSeccionModal,
    tutorModal,
    setTutorModal,
    courseModal,
    setCourseModal,
    wizardModal,
    setWizardModal,
    clonando,
    ConfirmDialog,
    CloneConfirmDialog,
    handleEditNivel,
    handleDeleteNivel,
    handleDeleteGrade,
    handleDeleteSection,
    handleClone,
  };
}
