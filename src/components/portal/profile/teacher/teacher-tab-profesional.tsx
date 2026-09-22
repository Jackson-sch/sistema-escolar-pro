"use client";

import {
  IconUser,
  IconBriefcase,
  IconCertificate,
  IconCalendar,
  IconWorld,
  IconId,
  IconLock,
} from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InlineEditableField } from "@/components/gestion/personal/management/inline-editable-field";
import {
  SEXO_OPTIONS,
  ESTADO_CIVIL_OPTIONS,
  TIPO_CONTRATO_OPTIONS,
  TURNO_OPTIONS,
  ESCALA_MAGISTERIAL_OPTIONS,
} from "@/lib/constants";

interface TeacherTabProfesionalProps {
  profile: any;
  saveField: (field: string, value: any) => Promise<void>;
}

export function TeacherTabProfesional({
  profile,
  saveField,
}: TeacherTabProfesionalProps) {
  return (
    <div className="space-y-6">
      {/* ── CARD 1: IDENTIDAD & FILIACIÓN ── */}
      <Card className="rounded-3xl border border-border/50 bg-card/80 shadow-xs">
        <CardContent className="p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border/30 pb-3.5">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20 shrink-0">
                <IconUser size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight text-foreground">
                  Identidad & Filiación
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Datos personales de registro civil del docente.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div className="space-y-1">
              <InlineEditableField
                label="DNI / Documento"
                value={profile.dni}
                icon={<IconId className="size-4" />}
                readOnly
                onSave={() => Promise.resolve()}
              />
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground pl-1">
                <IconLock size={11} className="text-amber-500 shrink-0" />
                <span>Bloqueado por secretaría académica</span>
              </div>
            </div>

            <InlineEditableField
              label="Fecha de Nacimiento"
              value={profile.fechaNacimiento ? new Date(profile.fechaNacimiento) : null}
              type="date"
              icon={<IconCalendar className="size-4" />}
              onSave={(v) => saveField("fechaNacimiento", v)}
            />

            <InlineEditableField
              label="Sexo"
              value={profile.sexo}
              type="select"
              options={SEXO_OPTIONS}
              onSave={(v) => saveField("sexo", v)}
            />

            <InlineEditableField
              label="Estado Civil"
              value={profile.estadoCivil}
              type="select"
              options={ESTADO_CIVIL_OPTIONS}
              onSave={(v) => saveField("estadoCivil", v)}
            />

            <InlineEditableField
              label="Nacionalidad"
              value={profile.nacionalidad}
              icon={<IconWorld className="size-4" />}
              onSave={(v) => saveField("nacionalidad", v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── CARD 2: DATOS LABORALES & CONTRATACIÓN ── */}
      <Card className="rounded-3xl border border-border/50 bg-card/80 shadow-xs">
        <CardContent className="p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border/30 pb-3.5">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0">
                <IconBriefcase size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight text-foreground">
                  Condición Laboral & Contratación
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Vínculo contractual y turno asignado en la institución.
                </p>
              </div>
            </div>
            {profile.tipoContrato && (
              <Badge variant="outline" className="rounded-full text-[10px] font-bold uppercase border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10">
                {profile.tipoContrato}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <InlineEditableField
              label="Tipo de Contrato"
              value={profile.tipoContrato}
              type="select"
              options={TIPO_CONTRATO_OPTIONS}
              onSave={(v) => saveField("tipoContrato", v)}
            />

            <InlineEditableField
              label="Turno Asignado"
              value={profile.turno}
              type="select"
              options={TURNO_OPTIONS}
              onSave={(v) => saveField("turno", v)}
            />

            <InlineEditableField
              label="Fecha de Contratación"
              value={profile.fechaContratacion ? new Date(profile.fechaContratacion) : null}
              type="date"
              onSave={(v) => saveField("fechaContratacion", v)}
            />

            <InlineEditableField
              label="Fecha de Ingreso a la Institución"
              value={profile.fechaIngreso ? new Date(profile.fechaIngreso) : null}
              type="date"
              onSave={(v) => saveField("fechaIngreso", v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── CARD 3: PERFIL ACADÉMICO & ESCALAFÓN ── */}
      <Card className="rounded-3xl border border-border/50 bg-card/80 shadow-xs">
        <CardContent className="p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border/30 pb-3.5">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20 shrink-0">
                <IconCertificate size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight text-foreground">
                  Formación Profesional & Escalafón
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Grados académicos, colegiatura y escala magisterial.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <InlineEditableField
              label="Especialidad Principal"
              value={profile.especialidad}
              onSave={(v) => saveField("especialidad", v)}
            />

            <InlineEditableField
              label="Título Profesional Obtenido"
              value={profile.titulo}
              onSave={(v) => saveField("titulo", v)}
            />

            <InlineEditableField
              label="N° Colegiatura de Profesores"
              value={profile.colegioProfesor}
              onSave={(v) => saveField("colegioProfesor", v)}
            />

            <InlineEditableField
              label="Escala Magisterial"
              value={profile.escalaMagisterial}
              type="select"
              options={ESCALA_MAGISTERIAL_OPTIONS}
              onSave={(v) => saveField("escalaMagisterial", v)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
