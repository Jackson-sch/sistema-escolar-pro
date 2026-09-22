"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { IconArrowLeft, IconMail, IconLoader2 } from "@tabler/icons-react";

import { forgotPasswordAction } from "@/actions/password-reset";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ForgotPasswordForm() {
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  function submit(formData: FormData) {
    const email = String(formData.get("email") || "");
    setMessage(undefined);
    setError(undefined);
    startTransition(async () => {
      const result = await forgotPasswordAction(email);
      if ("success" in result) setMessage(result.success);
      else setError(result.error);
    });
  }

  return (
    <form action={submit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">Correo electrónico</label>
        <div className="relative">
          <IconMail className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input id="email" name="email" type="email" required autoComplete="email" placeholder="nombre@colegio.edu.pe" className="h-10 pl-10" disabled={isPending} />
        </div>
      </div>
      {message && <Alert><AlertDescription>{message}</AlertDescription></Alert>}
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <IconLoader2 className="mr-2 size-4 animate-spin" />}
        Enviar enlace de recuperación
      </Button>
      <Button variant="ghost" className="w-full" asChild>
        <Link href="/login"><IconArrowLeft className="mr-2 size-4" />Volver al inicio de sesión</Link>
      </Button>
    </form>
  );
}
