import React from "react";
import { Text, View } from "@/lib/pdf";

const CARD_W = 260;
const CARD_H = 172;

interface BackCardProps {
  institucion: {
    nombreInstitucion: string;
    telefono?: string;
    direccion?: string;
  };
  year: number;
}

export const BatchBackCard = ({ institucion, year }: BackCardProps) => (
  <View
    style={{
      width: CARD_W,
      height: CARD_H,
      borderRadius: 6,
      backgroundColor: "#ffffff",
      overflow: "hidden",
      borderWidth: 0.8,
      borderColor: "#cbd5e1",
      borderStyle: "dashed",
      justifyContent: "space-between",
    }}
  >
    {/* Header Reverso */}
    <View
      style={{
        backgroundColor: "#090d16",
        height: 22,
        paddingHorizontal: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Text style={{ fontSize: 5.5, fontWeight: "bold", color: "#ffffff" }}>
        REVERSO OFICIAL · CONDICIONES DE USO
      </Text>
      <Text style={{ fontSize: 4.5, color: "#a5b4fc" }}>
        {institucion.nombreInstitucion.length > 22
          ? `${institucion.nombreInstitucion.slice(0, 20)}...`
          : institucion.nombreInstitucion}
      </Text>
    </View>
    <View style={{ height: 1.5, backgroundColor: "#4f46e5" }} />

    {/* Contenido Normativo y Datos */}
    <View style={{ padding: 6, flex: 1, justifyContent: "space-between" }}>
      <View
        style={{
          backgroundColor: "#f8fafc",
          borderWidth: 0.6,
          borderColor: "#e2e8f0",
          borderRadius: 3,
          padding: 4,
        }}
      >
        <Text style={{ fontSize: 4.2, color: "#334155", lineHeight: 1.25 }}>
          • Este carnet es personal e intransferible. Identifica al estudiante como alumno regular.
        </Text>
        <Text style={{ fontSize: 4.2, color: "#334155", lineHeight: 1.25, marginTop: 2 }}>
          • Portación obligatoria para el registro de asistencia en quioscos/lectores QR de la I.E.
        </Text>
        <Text style={{ fontSize: 4.2, color: "#334155", lineHeight: 1.25, marginTop: 2 }}>
          • En caso de extravío o deterioro, solicitar el duplicado en la Dirección del Plantel.
        </Text>
      </View>

      {/* Datos de Contacto y Firma */}
      <View style={{ flexDirection: "row", gap: 5, marginTop: 4 }}>
        <View
          style={{
            flex: 1,
            backgroundColor: "#ffffff",
            borderWidth: 0.6,
            borderColor: "#e2e8f0",
            borderRadius: 3,
            padding: 4,
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 3.8, fontWeight: "bold", color: "#64748b" }}>
            CONTACTO DE EMERGENCIA / SEDE
          </Text>
          <Text style={{ fontSize: 5, fontWeight: "bold", color: "#0f172a", marginTop: 1 }}>
            Tel: {institucion.telefono || "Central de la I.E."}
          </Text>
          <Text style={{ fontSize: 3.8, color: "#475569", marginTop: 1 }}>
            Dir: {institucion.direccion || "Local Escolar"}
          </Text>
        </View>

        <View
          style={{
            width: 76,
            backgroundColor: "#ffffff",
            borderWidth: 0.6,
            borderColor: "#e2e8f0",
            borderRadius: 3,
            padding: 4,
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              borderBottomWidth: 0.8,
              borderColor: "#94a3b8",
              borderStyle: "dotted",
              width: 62,
              marginBottom: 2,
            }}
          />
          <Text style={{ fontSize: 4, fontWeight: "bold", color: "#1e293b" }}>
            DIRECCIÓN GENERAL
          </Text>
          <Text style={{ fontSize: 3.2, color: "#94a3b8" }}>
            Firma y Sello Autorizado
          </Text>
        </View>
      </View>
    </View>

    {/* Footer Reverso */}
    <View
      style={{
        height: 14,
        backgroundColor: "#f1f5f9",
        borderTopWidth: 0.5,
        borderTopColor: "#cbd5e1",
        paddingHorizontal: 6,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 3.8, color: "#64748b" }}>
        © {year} {institucion.nombreInstitucion}
      </Text>
      <Text style={{ fontSize: 3.5, color: "#94a3b8" }}>
        MINEDU · LEY GENERAL DE EDUCACIÓN
      </Text>
    </View>
  </View>
);
