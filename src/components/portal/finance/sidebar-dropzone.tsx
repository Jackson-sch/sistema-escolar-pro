"use client";

import { useState } from "react";
import { IconUpload } from "@tabler/icons-react";
import { PaymentDrawer } from "./payment-drawer";

interface SidebarDropZoneProps {
  selectedDeuda?: any;
}

export function SidebarDropZone({ selectedDeuda }: SidebarDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [droppedFile, setDroppedFile] = useState<File | null>(null);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      setDroppedFile(file);
      setDrawerOpen(true);
    }
  };

  const onBrowse = () => {
    setDrawerOpen(true);
  };

  return (
    <>
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={onBrowse}
        className={`rounded-[1.5rem] border-2 border-dashed p-10 flex flex-col items-center justify-center text-center group transition-all cursor-pointer ${
          isDragging
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border/20 bg-card/20 hover:border-primary/40"
        }`}
      >
        <div
          className={`p-4 rounded-full bg-muted/10 text-muted-foreground/40 mb-4 transition-transform ${
            isDragging ? "scale-110 text-primary" : "group-hover:scale-110"
          }`}
        >
          <IconUpload size={32} />
        </div>
        <p className="text-xs font-bold text-muted-foreground">
          {isDragging
            ? "¡Suéltalo aquí!"
            : "Arrastra y suelta el voucher aquí o "}
          <span className="text-primary hover:underline transition-all font-black ml-1">
            Busca en tu equipo
          </span>
        </p>
        <p className="text-[10px] font-bold text-muted-foreground/40 mt-3 uppercase tracking-tighter">
          Formatos permitidos: PDF, JPG, PNG (Max 5MB)
        </p>
      </div>

      <PaymentDrawer
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open);
          if (!open) setDroppedFile(null);
        }}
        selectedDeuda={selectedDeuda}
        // Nota: En un futuro, el ComprobanteForm debería aceptar el 'droppedFile'
        // para pre-cargar la imagen en el Dropzone interno del form.
      />
    </>
  );
}
