"use client";

import { useEffect, Dispatch, SetStateAction } from "react";
import { StudentTableType } from "@/components/gestion/estudiantes/components/columns";

interface UseStudentTableKeyboardProps {
  isDrawerOpen: boolean;
  isEditOpen: boolean;
  isEnrollmentOpen: boolean;
  currentPageStudents: StudentTableType[];
  selectedIndex: number;
  setSelectedIndex: Dispatch<SetStateAction<number>>;
  canManage: boolean;
  handleOpenDrawer: (student: StudentTableType) => void;
  handleOpenEdit: (student: StudentTableType) => void;
  handleOpenEnrollment: (student: StudentTableType) => void;
  setViewMode: (value: string | ((prev: string) => string)) => void;
}

export function useStudentTableKeyboard({
  isDrawerOpen,
  isEditOpen,
  isEnrollmentOpen,
  currentPageStudents,
  selectedIndex,
  setSelectedIndex,
  canManage,
  handleOpenDrawer,
  handleOpenEdit,
  handleOpenEnrollment,
  setViewMode,
}: UseStudentTableKeyboardProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputFocused =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        target.closest("[role='combobox']");

      // Si está en un input y presiona Escape, salir del input
      if (isInputFocused && e.key === "Escape") {
        (target as HTMLElement).blur();
        return;
      }

      // Si cualquier modal/drawer está abierto, no disparar atajos de lista
      if (isDrawerOpen || isEditOpen || isEnrollmentOpen) {
        return;
      }

      // Atajos que funcionan con combinaciones de teclas (Ctrl/Cmd)
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        if (key === "m") {
          e.preventDefault();
          const currentStudent = currentPageStudents[selectedIndex];
          if (currentStudent && canManage) {
            handleOpenEnrollment(currentStudent);
          }
          return;
        }
        if (key === "e") {
          e.preventDefault();
          const currentStudent = currentPageStudents[selectedIndex];
          if (currentStudent && canManage) {
            handleOpenEdit(currentStudent);
          }
          return;
        }
      }

      // Atajos de una sola tecla (solo cuando NO se está escribiendo)
      if (!isInputFocused) {
        // Navegación arriba / abajo
        if (e.key === "ArrowDown" || e.key === "j" || e.key === "J") {
          e.preventDefault();
          setSelectedIndex((prev) =>
            Math.min(prev + 1, Math.max(0, currentPageStudents.length - 1)),
          );
          return;
        }
        if (e.key === "ArrowUp" || e.key === "k" || e.key === "K") {
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          return;
        }

        // Abrir expediente 360° (Enter o Espacio)
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          const currentStudent = currentPageStudents[selectedIndex];
          if (currentStudent) {
            handleOpenDrawer(currentStudent);
          }
          return;
        }

        // Acciones por tecla directa
        if (e.key.toLowerCase() === "m" && canManage) {
          e.preventDefault();
          const currentStudent = currentPageStudents[selectedIndex];
          if (currentStudent) {
            handleOpenEnrollment(currentStudent);
          }
          return;
        }

        if (e.key.toLowerCase() === "e" && canManage) {
          e.preventDefault();
          const currentStudent = currentPageStudents[selectedIndex];
          if (currentStudent) {
            handleOpenEdit(currentStudent);
          }
          return;
        }

        if (e.key.toLowerCase() === "w") {
          const currentStudent = currentPageStudents[selectedIndex];
          const mainGuardian =
            currentStudent?.padresTutores?.find((p) => p.contactoPrimario) ||
            currentStudent?.padresTutores?.[0];
          const phone = mainGuardian?.padreTutor?.telefono?.replace(/\D/g, "");
          if (phone && currentStudent) {
            e.preventDefault();
            const fullName =
              `${currentStudent.name} ${currentStudent.apellidoPaterno}`.trim();
            const url = `https://wa.me/51${phone.length === 9 ? phone : phone.slice(-9)}?text=${encodeURIComponent(
              `Estimado(a) ${mainGuardian?.padreTutor?.name}, nos comunicamos de la Dirección Escolar respecto al estudiante ${fullName}.`,
            )}`;
            window.open(url, "_blank");
          }
          return;
        }

        // Cambiar modo de vista (V)
        if (e.key.toLowerCase() === "v") {
          e.preventDefault();
          setViewMode((prev) => (prev === "table" ? "grid" : "table"));
          return;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isDrawerOpen,
    isEditOpen,
    isEnrollmentOpen,
    currentPageStudents,
    selectedIndex,
    setSelectedIndex,
    canManage,
    handleOpenDrawer,
    handleOpenEdit,
    handleOpenEnrollment,
    setViewMode,
  ]);
}
