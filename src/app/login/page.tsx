import { LoginForm } from "@/components/auth/login-form";
import { IconCheck } from "@tabler/icons-react";
import SVGAnimado from "@/components/common/svg-animado";
import { getInstitucionAction } from "@/actions/institucion";
import { BrandLogo, BrandIcon } from "@/components/common/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";

export default async function LoginPage() {
  const { data } = await getInstitucionAction();
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background text-foreground relative selection:bg-primary/20 selection:text-primary">
      {/* Botón flotante para alternar tema */}
      <div className="absolute top-6 right-6 z-30">
        <div className="rounded-xl bg-card/80 backdrop-blur-md border border-border/70 p-1 shadow-md hover:border-border transition-colors">
          <ThemeToggle />
        </div>
      </div>

      {/* Left Side: Branding, Valor & Ilustración */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden border-r border-border/40">
        {/* Luces de ambiente sutiles */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[140px] -mr-48 -mt-48 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px] -ml-32 -mb-32 pointer-events-none" />

        {/* SVG Animado en el fondo */}
        <div className="absolute top-10 right-0 lg:right-10 w-64 h-64 lg:w-96 lg:h-96 opacity-40 pointer-events-none animate-float">
          <SVGAnimado />
        </div>

        {/* Identidad Institucional */}
        <div className="relative z-10 flex items-center gap-3 font-semibold text-xl">
          {data?.logo ? (
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 p-1.5 border border-white/20 overflow-hidden shadow-md backdrop-blur-md">
              <Image
                src={data.logo}
                alt={data.nombreInstitucion || "Logo"}
                width={44}
                height={44}
                className="h-full w-full object-contain rounded-sm"
              />
            </div>
          ) : (
            <BrandLogo iconSize={36} />
          )}
          {data?.nombreInstitucion && (
            <span className="tracking-tight font-extrabold text-white text-lg drop-shadow-xs">
              {data.nombreInstitucion}
            </span>
          )}
        </div>

        {/* Titular y Características Clave */}
        <div className="relative z-10 space-y-8 my-auto py-12">
          <div className="space-y-4 max-w-lg">
            <h2 className="text-4xl xl:text-5xl font-extrabold leading-tight tracking-tight text-white">
              La plataforma definitiva para la gestión académica
            </h2>
            <p className="text-base xl:text-lg text-slate-300 leading-relaxed">
              Optimiza procesos, mejora la comunicación y potencia el
              aprendizaje con nuestra suite integral 100% adaptada al CNEB.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 max-w-md">
            {[
              "Adaptado al SIAGIE",
              "Gestión de Competencias",
              "Cronogramas de Pago",
              "Fichas Psicopedagógicas",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2.5 text-slate-200">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/25 border border-primary/40 text-primary-foreground shadow-xs shrink-0">
                  <IconCheck className="h-3.5 w-3.5 text-indigo-300" strokeWidth={3} />
                </div>
                <span className="text-xs font-semibold">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Institucional con Año Dinámico */}
        <div className="relative z-10 pt-8 text-xs text-slate-400 border-t border-white/10 flex items-center justify-between">
          <span>© {currentYear} {data?.nombreInstitucion || "EduNova Pro"}.</span>
          <span className="text-slate-400 font-mono">Periodo {currentYear}</span>
        </div>
      </div>

      {/* Right Side: Formulario de Autenticación */}
      <div className="flex items-center justify-center p-6 sm:p-12 relative bg-background">
        {/* Glow sutil en el fondo derecho */}
        <div className="absolute top-1/4 right-1/3 w-80 h-80 bg-primary/10 rounded-full blur-[130px] pointer-events-none" />

        <div className="w-full max-w-[420px] space-y-7 relative z-10">
          {/* Logo visible en pantallas móviles */}
          <div className="lg:hidden flex flex-col items-center gap-3 mb-6">
            <div className="rounded-2xl bg-card flex items-center justify-center shadow-lg border border-border/80 p-3">
              {data?.logo ? (
                <Image
                  src={data.logo}
                  alt={data.nombreInstitucion || "Logo"}
                  width={44}
                  height={44}
                  className="h-11 w-11 object-contain"
                />
              ) : (
                <BrandIcon size={44} />
              )}
            </div>
            <h1 className="text-xl font-bold tracking-tight text-center text-foreground">
              {data?.nombreInstitucion || "EduNova Pro"}
            </h1>
          </div>

          {/* Textos de Bienvenida */}
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Iniciar Sesión
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Ingresa tus credenciales para acceder al panel institucional.
            </p>
          </div>

          {/* Tarjeta del Formulario con Estilo Armónico */}
          <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/70 shadow-xl shadow-black/5 dark:shadow-black/40">
            <LoginForm />
          </div>

          {/* Soporte */}
          <p className="text-center text-xs text-muted-foreground leading-relaxed">
            ¿Necesitas ayuda con tu cuenta? <br />
            <span className="text-foreground/80 font-medium">Contacta al departamento de soporte o secretaría del colegio.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
