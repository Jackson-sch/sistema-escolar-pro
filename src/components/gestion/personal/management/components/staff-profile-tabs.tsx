"use client";

import {
  IconUser,
  IconBriefcase,
  IconCertificate,
  IconPhone,
  IconHeartbeat,
  IconBulb,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { InlineEditableField } from "../inline-editable-field";
import {
  SEXO_OPTIONS,
  ESTADO_CIVIL_OPTIONS,
  TIPO_CONTRATO_OPTIONS,
  TURNO_OPTIONS,
  ESCALA_MAGISTERIAL_OPTIONS,
} from "@/lib/constants";

import {
  STAFF_TABS,
  type StaffTabId,
} from "./staff-profile-tabs.constants";

interface StaffProfileTabsProps {
  staff: any;
  activeTab: StaffTabId;
  onTabChange: (tab: StaffTabId) => void;
  visibleTabs: typeof STAFF_TABS;
  isAdminGlobal: boolean;
  onSaveField: (field: string, value: any) => Promise<void>;
}

export function StaffProfileTabs({
  staff,
  activeTab,
  onTabChange,
  visibleTabs,
  isAdminGlobal,
  onSaveField,
}: StaffProfileTabsProps) {
  return (
    <div className="flex-1 flex flex-col sm:flex-row min-h-0 border-t border-border/30">
      {/* Navegación de Pestañas */}
      <nav className="sm:w-44 shrink-0 border-b sm:border-b-0 sm:border-r border-border/30 px-3 py-2 sm:py-4 bg-muted/10">
        <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground px-2 mb-2 hidden sm:block">
          Secciones del Expediente
        </p>
        <div className="flex sm:flex-col overflow-x-auto sm:overflow-x-visible gap-1">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id as StaffTabId)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-[color,background-color,box-shadow] whitespace-nowrap w-full text-left cursor-pointer",
                  isActive
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                )}
              >
                <Icon className="size-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Panel de Campos Editables Inline */}
      <div className="flex-1 px-4 py-4 overflow-y-auto space-y-1">
        <div className="p-2 rounded-xl bg-indigo-500/5 border border-indigo-500/10 mb-3 flex items-center justify-between">
          <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
            <IconBulb className="size-3.5 shrink-0" />
            Haz clic en cualquier campo para editarlo en tiempo real.
          </span>
        </div>

        {activeTab === "personal" && (
          <>
            <InlineEditableField
              label="Fecha de Nacimiento"
              value={
                staff.fechaNacimiento
                  ? new Date(staff.fechaNacimiento)
                  : null
              }
              type="date"
              placeholder="Agregar fecha de nacimiento"
              readOnly={isAdminGlobal}
              onSave={(v) => onSaveField("fechaNacimiento", v)}
            />
            <InlineEditableField
              label="Sexo / Género"
              value={staff.sexo}
              type="select"
              options={SEXO_OPTIONS}
              placeholder="Seleccionar sexo"
              readOnly={isAdminGlobal}
              onSave={(v) => onSaveField("sexo", v)}
            />
            <InlineEditableField
              label="Estado Civil"
              value={staff.estadoCivil}
              type="select"
              options={ESTADO_CIVIL_OPTIONS}
              placeholder="Agregar estado civil"
              readOnly={isAdminGlobal}
              onSave={(v) => onSaveField("estadoCivil", v)}
            />
            <InlineEditableField
              label="Nacionalidad"
              value={staff.nacionalidad}
              type="text"
              placeholder="Agregar nacionalidad"
              readOnly={isAdminGlobal}
              onSave={(v) => onSaveField("nacionalidad", v)}
            />
            <InlineEditableField
              label="Documento de Identidad (DNI)"
              value={staff.dni}
              type="text"
              placeholder="DNI"
              readOnly={isAdminGlobal}
              onSave={(v) => onSaveField("dni", v)}
            />
          </>
        )}

        {activeTab === "laboral" && (
          <>
            <InlineEditableField
              label="Tipo de Contrato"
              value={staff.tipoContrato}
              type="select"
              options={TIPO_CONTRATO_OPTIONS}
              placeholder="Seleccionar tipo de contrato"
              readOnly={isAdminGlobal}
              onSave={(v) => onSaveField("tipoContrato", v)}
            />
            <InlineEditableField
              label="Número de Contrato"
              value={staff.numeroContrato}
              type="text"
              placeholder="Agregar número de contrato"
              readOnly={isAdminGlobal}
              onSave={(v) => onSaveField("numeroContrato", v)}
            />
            <InlineEditableField
              label="Fecha de Contratación"
              value={
                staff.fechaContratacion
                  ? new Date(staff.fechaContratacion)
                  : null
              }
              type="date"
              placeholder="Seleccionar fecha"
              readOnly={isAdminGlobal}
              onSave={(v) => onSaveField("fechaContratacion", v)}
            />
            <InlineEditableField
              label="Fecha de Ingreso Institucional"
              value={
                staff.fechaIngreso ? new Date(staff.fechaIngreso) : null
              }
              type="date"
              placeholder="Seleccionar fecha"
              readOnly={isAdminGlobal}
              onSave={(v) => onSaveField("fechaIngreso", v)}
            />
            <InlineEditableField
              label="Turno Laboral"
              value={staff.turno}
              type="select"
              options={TURNO_OPTIONS}
              placeholder="Seleccionar turno"
              readOnly={isAdminGlobal}
              onSave={(v) => onSaveField("turno", v)}
            />
          </>
        )}

        {activeTab === "academico" && staff.role === "profesor" && (
          <>
            <InlineEditableField
              label="Especialidad Pedagógica"
              value={staff.especialidad}
              type="text"
              placeholder="Agregar especialidad"
              readOnly={isAdminGlobal}
              onSave={(v) => onSaveField("especialidad", v)}
            />
            <InlineEditableField
              label="Título / Grado Académico"
              value={staff.titulo}
              type="text"
              placeholder="Agregar título académico"
              readOnly={isAdminGlobal}
              onSave={(v) => onSaveField("titulo", v)}
            />
            <InlineEditableField
              label="N° Colegiatura (CPP)"
              value={staff.colegioProfesor}
              type="text"
              placeholder="Agregar número de colegiatura"
              readOnly={isAdminGlobal}
              onSave={(v) => onSaveField("colegioProfesor", v)}
            />
            <InlineEditableField
              label="Escala Magisterial"
              value={staff.escalaMagisterial}
              type="select"
              options={ESCALA_MAGISTERIAL_OPTIONS}
              placeholder="Seleccionar escala"
              readOnly={isAdminGlobal}
              onSave={(v) => onSaveField("escalaMagisterial", v)}
            />
          </>
        )}

        {activeTab === "contacto" && (
          <>
            <InlineEditableField
              label="Correo Electrónico"
              value={staff.email}
              type="text"
              placeholder="Agregar correo electrónico"
              readOnly={isAdminGlobal}
              onSave={(v) => onSaveField("email", v)}
            />
            <InlineEditableField
              label="Teléfono de Contacto"
              value={staff.telefono}
              type="text"
              placeholder="Agregar teléfono"
              readOnly={isAdminGlobal}
              onSave={(v) => onSaveField("telefono", v)}
            />
            <InlineEditableField
              label="Dirección Domiciliaria"
              value={staff.direccion}
              type="text"
              placeholder="Agregar dirección"
              readOnly={isAdminGlobal}
              onSave={(v) => onSaveField("direccion", v)}
            />
          </>
        )}

        {activeTab === "emergencia" && (
          <>
            <InlineEditableField
              label="Nombre de Contacto de Emergencia"
              value={staff.contactoEmergencia}
              type="text"
              placeholder="Agregar nombre del contacto"
              readOnly={isAdminGlobal}
              onSave={(v) => onSaveField("contactoEmergencia", v)}
            />
            <InlineEditableField
              label="Teléfono de Emergencia"
              value={staff.telefonoEmergencia}
              type="text"
              placeholder="Agregar teléfono de emergencia"
              readOnly={isAdminGlobal}
              onSave={(v) => onSaveField("telefonoEmergencia", v)}
            />
          </>
        )}
      </div>
    </div>
  );
}
