"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { IconLoader2, IconLock } from "@tabler/icons-react";

import { resetPasswordAction } from "@/actions/password-reset";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ResetPasswordForm({ token }: { token: string }) {
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  function submit(formData: FormData) {
    const password = String(formData.get("password") || "");
    const confirmation = String(formData.get("confirmation") || "");
    setMessage(undefined);
    setError(undefined);
    if (password !== confirmation) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    startTransition(async () => {
      const result = await resetPasswordAction(token, password);
      if ("success" in result) setMessage(result.success);
      else setError(result.error);
    });
  }

  return (
    <form action={submit} className="space-y-5">
      <PasswordInput id="password" label="Nueva contraseña" autoComplete="new-password" disabled={isPending} />
      <PasswordInput id="confirmation" label="Confirmar contraseña" autoComplete="new-password" disabled={isPending} />
      {message && <Alert><AlertDescription>{message}</AlertDescription></Alert>}
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      {message ? (
        <Button className="w-full" asChild><Link href="/login">Ir a iniciar sesión</Link></Button>
      ) : (
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <IconLoader2 className="mr-2 size-4 animate-spin" />}
          Actualizar contraseña
        </Button>
      )}
    </form>
  );
}

function PasswordInput({ id, label, autoComplete, disabled }: { id: string; label: string; autoComplete: string; disabled: boolean }) {
  return <div className="space-y-2"><label htmlFor={id} className="text-sm font-medium">{label}</label><div className="relative"><IconLock className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" /><Input id={id} name={id} type="password" minLength={6} required autoComplete={autoComplete} placeholder="Mínimo 6 caracteres" className="h-10 pl-10" disabled={disabled} /></div></div>;
}
