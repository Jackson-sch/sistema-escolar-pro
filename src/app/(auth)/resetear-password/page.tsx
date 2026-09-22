import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { AuthCard } from "@/app/(auth)/recuperar-password/page";

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return <AuthCard title="Crea una nueva contraseña" description="Elige una contraseña segura de al menos 6 caracteres."><ResetPasswordForm token={token || ""} /></AuthCard>;
}
