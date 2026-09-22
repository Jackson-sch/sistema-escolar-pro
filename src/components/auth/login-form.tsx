"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import {
  IconMail,
  IconLock,
  IconLoader2,
  IconAlertCircle,
  IconCircleCheck,
} from "@tabler/icons-react";

import { LoginSchema } from "@/lib/schemas/auth";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loginAction } from "@/actions/login";
import Link from "next/link";

export function LoginForm() {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      loginAction(values).then((data) => {
        setError(data?.error);
        setSuccess(data?.success);
      });
    });
  };

  return (
    <div className="w-full space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-foreground/90">Correo Electrónico</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <IconMail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70 pointer-events-none" />
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="admin@colegio.edu.pe"
                        type="email"
                        className="pl-10 h-11 rounded-xl bg-background/70 border-border/80 text-sm focus-visible:ring-primary/20 focus-visible:border-primary shadow-2xs transition-colors"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-xs font-bold text-foreground/90">Contraseña</FormLabel>
                    <Button
                      variant="link"
                      size="sm"
                      className="px-0 font-semibold text-xs text-primary hover:text-primary/80 h-auto py-0 cursor-pointer"
                      asChild
                    >
                      <Link href="/recuperar-password">¿Olvidaste tu contraseña?</Link>
                    </Button>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <IconLock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70 pointer-events-none" />
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="••••••••"
                        type="password"
                        className="pl-10 h-11 rounded-xl bg-background/70 border-border/80 text-sm focus-visible:ring-primary/20 focus-visible:border-primary shadow-2xs transition-colors"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>

          {error && (
            <div className="bg-destructive/15 border border-destructive/25 p-3 rounded-xl flex items-center gap-x-2 text-xs font-medium text-destructive animate-in fade-in zoom-in-95">
              <IconAlertCircle className="h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/15 border border-emerald-500/25 p-3 rounded-xl flex items-center gap-x-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 animate-in fade-in zoom-in-95">
              <IconCircleCheck className="h-4 w-4 shrink-0" />
              <p>{success}</p>
            </div>
          )}

          <Button
            disabled={isPending}
            type="submit"
            className="w-full h-11 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/25 transition-all text-sm cursor-pointer mt-2"
          >
            {isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Iniciando sesión..." : "Ingresar al sistema"}
          </Button>

          {/* Ayuda de acceso para Padres de Familia */}
          <div className="pt-1 text-center">
            <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
              ¿Eres padre o tutor? Ingresa con tu <strong className="font-medium text-foreground/90">correo registrado</strong> y tu <strong className="font-medium text-foreground/90">DNI</strong> como contraseña inicial.
            </p>
          </div>
        </form>
      </Form>
    </div>
  );
}
