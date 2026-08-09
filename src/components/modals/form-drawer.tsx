"use client";

import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { FormModalProvider, useFormModal } from "@/components/modals/form-modal-context";
import { SafeCloseDialog } from "@/components/modals/safe-close-dialog";
import { useFormShortcuts } from "@/hooks/use-form-shortcuts";
import { LucideIcon } from "lucide-react";

interface FormDrawerProps {
  title: string;
  titleSpan?: string;
  description?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  Icon?: LucideIcon;
}

export function FormDrawer(props: FormDrawerProps) {
  return (
    <FormModalProvider>
      <FormDrawerInner {...props} />
    </FormModalProvider>
  );
}

function FormDrawerInner({
  title,
  titleSpan,
  description,
  isOpen,
  onOpenChange,
  children,
  className,
  headerClassName,
  Icon
}: FormDrawerProps) {
  const { isDirty, setIsDirty, triggerSubmit } = useFormModal();
  const [showConfirm, setShowConfirm] = useState(false);

  useFormShortcuts({
    onSubmit: triggerSubmit,
    isLoading: false,
  });

  const handleOpenChange = (open: boolean) => {
    if (!open && isDirty) {
      setShowConfirm(true);
      return;
    }
    onOpenChange(open);
  };

  const onConfirmClose = () => {
    setShowConfirm(false);
    setIsDirty(false);
    onOpenChange(false);
  };

  return (
    <Drawer open={isOpen} onOpenChange={handleOpenChange} direction="right">
      <DrawerContent
        className={cn(
          "h-full max-h-full border-l border-border/50",
          "data-[vaul-drawer-direction=right]:w-full! data-[vaul-drawer-direction=right]:sm:max-w-2xl!",
          className,
        )}
      >
        <DrawerHeader className={cn("p-6 pb-4 border-b shrink-0", headerClassName)}>
          <div className="flex items-center gap-3">
            <DrawerTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
              {Icon && <Icon className="size-5" />}
              {title}
            </DrawerTitle>
            {titleSpan && (
              <span className="hidden sm:inline-flex items-center text-xxs font-mono bg-white/5 text-zinc-500 border border-white/[0.07] px-2 py-1 rounded-md shrink-0">
                {titleSpan}
              </span>
            )}
          </div>
          {description && (
            <DrawerDescription className="text-xs mt-1">
              {description}
            </DrawerDescription>
          )}
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
          <div className="p-6 pt-4 text-pretty">{children}</div>
        </div>
      </DrawerContent>

      <SafeCloseDialog
        isOpen={showConfirm}
        onConfirm={onConfirmClose}
        onCancel={() => setShowConfirm(false)}
      />
    </Drawer>
  );
}
