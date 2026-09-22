"use client";

import {
  IconPhone,
  IconMail,
  IconMapPin,
  IconHeartbeat,
  IconLock,
  IconPhoneCall,
} from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InlineEditableField } from "@/components/gestion/personal/management/inline-editable-field";

interface TeacherTabContactoProps {
  profile: any;
  saveField: (field: string, value: any) => Promise<void>;
}

export function TeacherTabContacto({
  profile,
  saveField,
}: TeacherTabContactoProps) {
  return (
    <div className="space-y-6">
      {/* ── CARD 1: CANALES DE CONTACTO & DOMICILIO ── */}
      <Card className="rounded-3xl border border-border/50 bg-card/80 shadow-xs">
        <CardContent className="p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border/30 pb-3.5">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
                <IconPhone size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight text-foreground">
                  Canales de Contacto & Domicilio
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Medios de comunicación directa con el docente y ubicación física.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div className="space-y-1">
              <InlineEditableField
                label="Correo Electrónico Institucional"
                value={profile.email}
                icon={<IconMail className="size-4" />}
                readOnly
                onSave={() => Promise.resolve()}
              />
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground pl-1">
                <IconLock size={11} className="text-amber-500 shrink-0" />
                <span>Correo corporativo gestionado por TI</span>
              </div>
            </div>

            <InlineEditableField
              label="Teléfono Móvil"
              value={profile.telefono}
              icon={<IconPhone className="size-4" />}
              onSave={(v) => saveField("telefono", v)}
            />

            <InlineEditableField
              label="Dirección de Residencia"
              value={profile.direccion}
              icon={<IconMapPin className="size-4" />}
              onSave={(v) => saveField("direccion", v)}
            />

            <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/40 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Ubigeo Referencial
              </span>
              <p className="font-semibold text-xs text-foreground mt-0.5">
                {`${profile.distrito || ""} - ${profile.provincia || ""}`.trim() ||
                  "No especificado en el padrón"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── CARD 2: CONTACTO DE EMERGENCIA ── */}
      <Card className="rounded-3xl border border-border/50 bg-card/80 shadow-xs">
        <CardContent className="p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border/30 pb-3.5">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20 shrink-0">
                <IconHeartbeat size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight text-foreground">
                  Contacto de Emergencia
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Familiar o persona de confianza para situaciones de urgencia médica.
                </p>
              </div>
            </div>
            {profile.telefonoEmergencia && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-xl text-xs font-bold border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 gap-1.5 cursor-pointer"
                asChild
              >
                <a href={`tel:${profile.telefonoEmergencia}`}>
                  <IconPhoneCall size={13} />
                  <span>Llamar</span>
                </a>
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <InlineEditableField
              label="Nombre del Contacto de Emergencia"
              value={profile.contactoEmergencia}
              onSave={(v) => saveField("contactoEmergencia", v)}
            />

            <InlineEditableField
              label="Teléfono de Contacto"
              value={profile.telefonoEmergencia}
              icon={<IconPhone className="size-4" />}
              onSave={(v) => saveField("telefonoEmergencia", v)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
