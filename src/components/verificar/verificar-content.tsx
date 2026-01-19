"use client";

import type React from "react";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  IconShieldCheck,
  IconSearch,
  IconLoader2,
  IconX,
  IconFileCertificate,
  IconUser,
  IconCalendar,
  IconFingerprint,
  IconSchool,
} from "@tabler/icons-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export function VerificarContent() {
  const searchParams = useSearchParams();
  const queryCodigo = searchParams.get("codigo");
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [doc, setDoc] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = useCallback(
    async (codeToVerify?: string) => {
      const targetCode = codeToVerify || codigo;

      if (!targetCode) {
        toast.error("Por favor ingrese un código de verificación");
        return;
      }
      setLoading(true);
      setError(null);
      setDoc(null);

      try {
        const response = await fetch(
          `/api/documentos/verificar?codigo=${targetCode}`
        );

        const res = await response.json();

        if (res.data) {
          setDoc(res.data);
          toast.success("Documento verificado correctamente");
        } else {
          setError(res.error || "Código no válido");
          toast.error(res.error || "Documento no encontrado");
        }
      } catch (err) {
        setError("Error al procesar la solicitud");
      } finally {
        setLoading(false);
      }
    },
    [codigo]
  );

  // Efecto para auto-verificar si viene de URL

  useEffect(() => {
    if (queryCodigo && queryCodigo !== codigo) {
      setCodigo(queryCodigo);
      handleVerify(queryCodigo);
    }
  }, [queryCodigo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}

        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-xl shadow-emerald-500/5">
              <IconShieldCheck className="size-12 text-emerald-500" />
            </div>
          </div>

          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            Verificación de <span className="text-emerald-500">Documentos</span>
          </h1>

          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto">
            Valide la autenticidad de libretas, certificados y constancias
            emitidas por nuestra institución.
          </p>
        </div>

        {/* Search Box */}

        <Card className="border-border/40 shadow-2xl shadow-emerald-500/5 bg-emerald-50/10 dark:bg-emerald-500/5 overflow-hidden rounded-3xl p-0">
          <CardHeader className="border-b border-border/40 py-6">
            <CardDescription className="font-bold uppercase tracking-widest text-[10px]">
              Portal de Autenticidad Institucional
            </CardDescription>
          </CardHeader>

          <CardContent className="py-6 pt-0">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <div className="relative flex-1">
                <IconFingerprint className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />

                <Input
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                  placeholder="INGRESE EL CÓDIGO DE VERIFICACIÓN (EJ: ABC123XYZ)"
                  className="h-14 pl-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border-border/40 focus:ring-emerald-500/20 text-lg font-mono tracking-widest uppercase"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="h-14 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-bold active:scale-95 transition-all"
              >
                {loading ? (
                  <IconLoader2 className="animate-spin size-6" />
                ) : (
                  <IconSearch className="size-6 mr-2" />
                )}

                {loading ? "" : "VERIFICAR"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}

        {doc && (
          <Card className="border-emerald-500/30 bg-emerald-50/10 dark:bg-emerald-500/5 overflow-hidden rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-500 p-0">
            <div className="bg-emerald-500/50 px-6 py-4 flex items-center justify-center gap-2">
              <IconShieldCheck className="size-4 text-white" />

              <span className="text-[10px] font-black text-white uppercase tracking-widest">
                Documento Oficial Verificado
              </span>
            </div>

            <CardContent className="p-8 space-y-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase leading-tight">
                    {doc.titulo}
                  </h3>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="text-emerald-600 border-emerald-500/20 bg-emerald-500/5"
                    >
                      {doc.tipoDocumento.nombre}
                    </Badge>

                    <span className="text-xs text-muted-foreground font-mono">
                      {doc.codigoVerificacion}
                    </span>
                  </div>
                </div>

                <IconFileCertificate className="size-16 text-emerald-500/20" />
              </div>

              <Separator className="bg-emerald-500/10" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <div className="flex items-center justify-center p-2 bg-slate-100 dark:bg-slate-900 rounded-full w-12 h-12">
                    <IconUser className="size-6 text-slate-500" />
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                      Estudiante
                    </p>

                    <p className="font-bold text-slate-900 dark:text-white uppercase">
                      {doc.estudiante.apellidoPaterno}{" "}
                      {doc.estudiante.apellidoMaterno}, {doc.estudiante.name}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      DNI: {doc.estudiante.dni}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center justify-center p-2 bg-slate-100 dark:bg-slate-900 rounded-full w-12 h-12">
                    <IconCalendar className="size-6 text-slate-500" />
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                      Emisión
                    </p>

                    <p className="font-bold text-slate-900 dark:text-white uppercase">
                      {new Date(doc.fechaEmision).toLocaleDateString("es-PE", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>

                    <p className="text-xs text-muted-foreground capitalize">
                      Estado: {doc.estado}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center justify-center p-2 bg-slate-100 dark:bg-slate-900 rounded-full w-12 h-12">
                    <IconSchool className="size-6 text-slate-500" />
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                      Institución
                    </p>

                    <p className="font-bold text-slate-900 dark:text-white uppercase">
                      SISTEMA ESCOLAR PRO
                    </p>

                    <p className="text-xs text-muted-foreground font-medium italic capitalize">
                      {doc.emisor.cargo?.nombre || "Emisor"}: {doc.emisor.name}{" "}
                      {doc.emisor.apellidoPaterno} {doc.emisor.apellidoMaterno}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-red-500/30 bg-red-50/10 dark:bg-red-500/5 rounded-3xl animate-in shake duration-500">
            <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="size-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
                <IconX className="size-8 text-red-500" />
              </div>

              <div>
                <CardTitle className="text-xl font-black text-red-600 uppercase">
                  Sin resultados
                </CardTitle>

                <CardDescription className="max-w-xs">{error}</CardDescription>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setError(null)}
                className="rounded-xl border-red-500/20 text-red-600"
              >
                Intentar de nuevo
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Footer info */}

        <p className="text-center text-xs italic text-slate-400">
          "Este sistema utiliza firmas digitales criptográficas para garantizar
          la integridad de los datos."
        </p>
      </div>
    </div>
  );
}
