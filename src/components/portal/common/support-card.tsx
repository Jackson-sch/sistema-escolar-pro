import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconHeadset, IconArrowRight } from "@tabler/icons-react";

export function SupportCard() {
  return (
    <Card className="relative overflow-hidden border-none bg-linear-to-br from-indigo-600 via-blue-600 to-blue-500 text-white shadow-xl shadow-blue-500/20">
      {/* Decorative blobs */}
      <div className="absolute top-0 -right-10 size-40 bg-white/10 rounded-full blur-3xl animate-blob" />
      <div className="absolute -bottom-10 -left-10 size-40 bg-indigo-400/20 rounded-full blur-3xl animate-blob delay-700" />

      <CardContent className="relative z-10 p-6 space-y-6">
        <div className="space-y-2">
          <div className="size-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
            <IconHeadset className="size-6 text-white" />
          </div>
          <h3 className="text-xl font-black tracking-tight pt-2">
            Canal de Soporte
          </h3>
          <p className="text-sm font-medium text-blue-50/80 leading-relaxed">
            ¿Tienes dudas sobre los avisos o problemas técnicos en el portal
            escolar?
          </p>
        </div>

        <Button
          variant="secondary"
          className="w-full h-12 rounded-xl bg-white text-blue-600 hover:bg-white/95 font-black uppercase tracking-wider text-[11px] border-none shadow-lg group"
        >
          Contactar Ayuda
          <IconArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
