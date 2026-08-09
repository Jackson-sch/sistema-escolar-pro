import { LoginForm } from "@/components/auth/login-form";
import { IconCheck } from "@tabler/icons-react";
import SVGAnimado from "@/components/common/svg-animado";
import { getInstitucionAction } from "@/actions/institucion";
import { BrandLogo, BrandIcon } from "@/components/common/brand-logo";
import Image from "next/image";

export default async function LoginPage() {
  const { data } = await getInstitucionAction();

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side: Branding & Info */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-zinc-950 text-white relative overflow-hidden">
        {/* Background mesh/gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -mr-64 -mt-64" />
        {/* Brillo de fondo sutil */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"></div>

        {/* PROPUESTA DE SVG ANIMADO */}
        <div className="absolute top-10 right-0 lg:right-10 w-64 h-64 lg:w-96 lg:h-96 opacity-60 pointer-events-none animate-float">
          <SVGAnimado />
        </div>

        <div className="relative z-10 flex items-center gap-3 font-semibold text-xl">
          {data?.logo ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 p-1 border border-primary/20 overflow-hidden">
              <Image
                src={data.logo}
                alt={data.nombreInstitucion || "Logo"}
                width={40}
                height={40}
                className="h-full w-full object-contain rounded-sm"
              />
            </div>
          ) : (
            <BrandLogo iconSize={36} />
          )}
          {data?.nombreInstitucion && (
            <span className="tracking-tight font-bold text-white">
              {data.nombreInstitucion}
            </span>
          )}
        </div>

        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <h2 className="text-5xl font-extrabold leading-tight">
              La plataforma definitiva para la gestión académica
            </h2>
            <p className="text-xl text-zinc-400 max-w-lg leading-relaxed">
              Optimiza procesos, mejora la comunicación y potencia el
              aprendizaje con nuestra suite integral 100% adaptada al CNEB.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-4">
            {[
              "Adaptado al SIAGIE",
              "Gestión de Competencias",
              "Cronogramas de Pago",
              "Fichas Psicopedagógicas",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-zinc-300">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <IconCheck className="h-3 w-3" />
                </div>
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 pt-12 text-sm text-zinc-500 border-t border-zinc-800">
          © 2025 EduPeru Pro. Todos los derechos reservados.
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex items-center justify-center p-8 bg-zinc-50/50 dark:bg-zinc-950/50">
        <div className="w-full max-w-[420px] space-y-8">
          <div className="lg:hidden flex flex-col items-center gap-4 mb-8">
            <div className="rounded-2xl bg-white dark:bg-zinc-900 flex items-center justify-center shadow-xl shadow-indigo-500/10 border border-zinc-200 dark:border-zinc-800 p-3">
              {data?.logo ? (
                <Image
                  src={data.logo}
                  alt={data.nombreInstitucion || "Logo"}
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain"
                />
              ) : (
                <BrandIcon size={40} />
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-center">
              {data?.nombreInstitucion || "EduNova Pro"}
            </h1>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight">
              Iniciar Sesión
            </h1>
            <p className="text-muted-foreground text-balanced">
              Ingresa tus credenciales para acceder al panel administrativo de
              la institución.
            </p>
          </div>

          <LoginForm />

          <p className="px-8 text-center text-sm text-zinc-500">
            ¿Necesitas ayuda con tu cuenta? <br />
            Contacta al departamento de soporte del colegio.
          </p>
        </div>
      </div>
    </div>
  );
}
