"use client"

import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useTransition } from "react"
import { IconMail, IconLock, IconLoader2, IconAlertCircle, IconCircleCheck } from "@tabler/icons-react"

import { LoginSchema } from "@/lib/schemas/auth"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { loginAction } from "@/actions/login"

export function LoginForm() {
  const [error, setError] = useState<string | undefined>("")
  const [success, setSuccess] = useState<string | undefined>("")
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError("")
    setSuccess("")

    startTransition(() => {
      loginAction(values).then((data) => {
        setError(data?.error)
        setSuccess(data?.success)
      })
    })
  }

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
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <IconMail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="admin@colegio.edu.pe"
                        type="email"
                        className="pl-10 h-10"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Contraseña</FormLabel>
                    <Button variant="link" size="sm" className="px-0 font-normal h-auto py-0">
                      ¿Olvidaste tu contraseña?
                    </Button>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <IconLock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="••••••••"
                        type="password"
                        className="pl-10 h-10"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {error && (
            <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive animate-in fade-in zoom-in duration-300">
              <IconAlertCircle className="h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-emerald-500 animate-in fade-in zoom-in duration-300">
              <IconCircleCheck className="h-4 w-4 shrink-0" />
              <p>{success}</p>
            </div>
          )}

          <Button
            disabled={isPending}
            type="submit"
            className="w-full h-11 transition-all active:scale-[0.98]"
          >
            {isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Iniciando sesión..." : "Ingresar al sistema"}
          </Button>
        </form>
      </Form>
    </div>
  )
}
