"use client";

import { Suspense } from "react";

import { IconLoader2 } from "@tabler/icons-react";
import { VerificarContent } from "@/components/verificar/verificar-content";

export default function VerificarPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
          <IconLoader2 className="animate-spin size-12 text-emerald-500" />
        </div>
      }
    >
      <VerificarContent />
    </Suspense>
  );
}


