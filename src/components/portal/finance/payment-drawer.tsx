"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { ComprobanteForm } from "./comprobante-form";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PaymentDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDeuda?: {
    id: string;
    concepto: string;
    monto: number;
    estudiante: string;
  } | null;
}

export function PaymentDrawer({
  open,
  onOpenChange,
  selectedDeuda,
}: PaymentDrawerProps) {
  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction="right"
      shouldScaleBackground={false}
    >
      <DrawerContent className="h-full rounded-none">
        <div className="w-full max-w-lg h-full flex flex-col">
          <DrawerHeader className="border-b border-border/40 pb-4">
            <DrawerTitle className="text-2xl font-black">
              Subir Comprobante
            </DrawerTitle>
            <DrawerDescription className="font-medium text-muted-foreground/80">
              Completa los datos de tu transferencia para validar el pago.
            </DrawerDescription>
          </DrawerHeader>
          <ScrollArea className="p-6 h-full max-h-[calc(95vh-50px)] overflow-y-auto">
            <ComprobanteForm
              opcionesDeuda={[]} // No necesario si ya hay deuda precargada
              cronogramaPrecargado={selectedDeuda}
              onSuccess={() => onOpenChange(false)}
            />
          </ScrollArea>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
