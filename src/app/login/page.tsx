import { LoginForm } from "@/components/auth/login-form"
import { IconSchool, IconCheck } from "@tabler/icons-react"
import Image from "next/image"

export default function LoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side: Branding & Info */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-zinc-950 text-white relative overflow-hidden">
        {/* Background mesh/gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -mr-64 -mt-64" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -ml-64 -mb-64" />

        <div className="relative z-10 flex items-center gap-2 font-semibold text-xl">
          <IconSchool className="h-8 w-8 text-primary" />
          <span>EduPeru Pro</span>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <h2 className="text-5xl font-bold tracking-tight leading-[1.1]">
              La plataforma definitiva para la gestión académica
            </h2>
            <p className="text-xl text-zinc-400 max-w-lg leading-relaxed">
              Optimiza procesos, mejora la comunicación y potencia el aprendizaje con nuestra suite integral 100% adaptada al CNEB.
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
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <IconSchool className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold">EduPeru Pro</h1>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight">Iniciar Sesión</h1>
            <p className="text-muted-foreground text-balanced">
              Ingresa tus credenciales para acceder al panel administrativo de la institución.
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
  )
}
