import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconArrowRight, IconSchool } from "@tabler/icons-react";

interface WelcomeBannerProps {
  userName: string;
}

export function WelcomeBanner({ userName }: WelcomeBannerProps) {
  const firstName = userName?.split(" ")[0] || "";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card/50 p-8 @container/banner">
      <div className="relative z-10 flex flex-col gap-3 md:max-w-[70%]">
        <Badge className="w-fit border-none bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
          Portal Familiar
        </Badge>
        <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight sm:text-4xl">
          ¡Hola,{" "}
          <span className="bg-linear-to-r from-primary to-primary/50 bg-clip-text text-transparent capitalize">
            {firstName}
          </span>
          !
        </h1>
        <p className="max-w-xl text-balance text-lg text-muted-foreground">
          Gestiona los pagos y el progreso académico de tus hijos de forma ágil
          y segura desde tu panel personal.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            asChild
            size="lg"
            className="rounded-2xl font-bold shadow-xl shadow-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Link href="/portal/comprobantes/nuevo">
              Subir Pago
              <IconArrowRight className="ml-2 size-5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Abstract background elements */}
      <div className="absolute -right-24 -top-24 size-80 rounded-full bg-primary/20 blur-[120px]" />
      <div className="absolute -bottom-24 -left-24 size-64 rounded-full bg-institutional/10 blur-[100px]" />
      <IconSchool className="absolute -bottom-8 -right-8 size-56 -rotate-12 text-primary/5 select-none" />
    </div>
  );
}
