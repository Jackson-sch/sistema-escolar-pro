"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  IconEdit,
  IconTrash,
  IconArrowRight,
  IconClipboardCheck,
} from "@tabler/icons-react";

import {
  ResponsiveRowActions,
  ActionItem,
} from "@/components/common/responsive-row-actions";
import { FormModal } from "@/components/modals/form-modal";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProspectoForm } from "@/components/gestion/admisiones/management/prospecto-form";
import { AdmisionFlow } from "@/components/gestion/admisiones/management/admision-flow";
import { convertProspectoToAdmisionAction } from "@/actions/admissions";

interface ProspectoRowActionsProps {
  row: any;
  table: any;
}

export function ProspectoRowActions({ row, table }: ProspectoRowActionsProps) {
  const p = row.original;
  const [loading, setLoading] = useState(false);
  const [showFlow, setShowFlow] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  // Extraer metadata del table
  const meta = (table.options.meta as any) || {};
  const { grados = [], instituciones = [] } = meta;

  const onStartAdmision = async () => {
    setLoading(true);
    try {
      const res = await convertProspectoToAdmisionAction(p.id);
      if (res.success) toast.success(res.success);
      else toast.error(res.error);
    } finally {
      setLoading(false);
    }
  };

  const actions: ActionItem[] = [
    {
      icon: IconEdit,
      label: "Editar Datos",
      onClick: () => setShowEdit(true),
      variant: "ghost",
      className: "text-blue-500 rounded-full",
    },
    ...(p.estado === "INTERESADO"
      ? ([
          {
            icon: IconArrowRight,
            label: "Iniciar Evaluación",
            onClick: onStartAdmision,
            disabled: loading,
            variant: "ghost",
            className: "text-green-500 rounded-full",
          },
        ] as ActionItem[])
      : []),
    ...(p.admision
      ? ([
          {
            icon: IconClipboardCheck,
            label: "Ver Evaluación",
            onClick: () => setShowFlow(true),
            variant: "ghost",
            className: "text-emerald-500 rounded-full",
          },
        ] as ActionItem[])
      : []),
    { isSeparator: true },
    {
      icon: IconTrash,
      label: "Eliminar",
      onClick: () => {},
      className: "text-red-500 rounded-full",
    },
  ];

  return (
    <>
      <ResponsiveRowActions actions={actions} label="Acciones" />

      {/* Modal de Edición */}
      <FormModal
        title="Editar Prospecto"
        description="Actualice la información del interesado."
        isOpen={showEdit}
        onOpenChange={setShowEdit}
        className="sm:max-w-lg"
      >
        <ProspectoForm
          id={p.id}
          initialData={p}
          grados={grados}
          instituciones={instituciones}
          onSuccess={() => setShowEdit(false)}
        />
      </FormModal>

      <Sheet open={showFlow} onOpenChange={setShowFlow}>
        <SheetContent className="sm:max-w-lg bg-background border-l border-border/50 px-4">
          <SheetHeader>
            <SheetTitle className="text-xl font-bold uppercase tracking-tight">
              Expediente de Admisión
            </SheetTitle>
            <SheetDescription className="capitalize">
              Seguimiento de evaluación para: {p.nombre} {p.apellidoPaterno}{" "}
              {p.apellidoMaterno}
            </SheetDescription>
          </SheetHeader>
          {p.admision && (
            <ScrollArea className="h-[calc(100vh-150px)] pr-4">
              <AdmisionFlow
                admision={{ ...p.admision, prospecto: p }}
                onSuccess={() => setShowFlow(false)}
              />
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
