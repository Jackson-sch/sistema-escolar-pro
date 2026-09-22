import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return <AuthCard title="Recupera tu contraseña" description="Ingresa tu correo y te enviaremos un enlace seguro para crear una nueva contraseña."><ForgotPasswordForm /></AuthCard>;
}

export function AuthCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4"><section className="w-full max-w-md rounded-3xl border bg-card p-8 shadow-lg"><div className="mb-6 space-y-2 text-center"><h1 className="text-2xl font-bold tracking-tight">{title}</h1><p className="text-sm leading-relaxed text-muted-foreground">{description}</p></div>{children}</section></main>;
}
