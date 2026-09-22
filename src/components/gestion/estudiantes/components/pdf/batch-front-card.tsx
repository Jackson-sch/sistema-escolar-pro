import React from "react";
import { Text, View, Image } from "@/lib/pdf";
import { StudentCardItem } from "../batch-student-cards-pdf";

const CARD_W = 260;
const CARD_H = 172;

interface FrontCardProps {
  student: StudentCardItem;
  institucion: {
    nombreInstitucion: string;
    lema?: string;
    codigoModular?: string;
    logo?: string | null;
  };
  year: number;
}

export const BatchFrontCard = ({
  student,
  institucion,
  year,
}: FrontCardProps) => {
  const fullName = `${student.name} ${student.apellidoPaterno} ${student.apellidoMaterno}`.trim();
  const subTitle =
    student.sedeNombre &&
    student.sedeNombre.toUpperCase() !== institucion.nombreInstitucion.toUpperCase()
      ? `SEDE: ${student.sedeNombre.toUpperCase()}`
      : institucion.lema || "FORMACIÓN INTEGRAL Y VALORES";

  return (
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
        position: "relative",
      }}
    >
      {/* Header Ejecutivo Nordic Slate */}
      <View
        style={{
          backgroundColor: "#090d16",
          height: 30,
          paddingHorizontal: 7,
          paddingVertical: 2,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1, paddingRight: 4 }}>
          {institucion.logo ? (
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 4,
                backgroundColor: "#ffffff",
                padding: 1.5,
                marginRight: 5,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                src={institucion.logo}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </View>
          ) : (
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 4,
                backgroundColor: "#1e1b4b",
                borderWidth: 1,
                borderColor: "#4f46e5",
                marginRight: 5,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 9, fontWeight: "bold", color: "#ffffff" }}>
                {institucion.nombreInstitucion.charAt(0)}
              </Text>
            </View>
          )}

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 7.8,
                fontWeight: "bold",
                color: "#ffffff",
                textTransform: "uppercase",
              }}
            >
              {institucion.nombreInstitucion}
            </Text>
            <Text style={{ fontSize: 4.5, color: "#a5b4fc", marginTop: 0.5 }}>
              {subTitle}
            </Text>
          </View>
        </View>

        <View
          style={{
            backgroundColor: "#1e1b4b",
            borderWidth: 0.5,
            borderColor: "#4338ca",
            paddingHorizontal: 4,
            paddingVertical: 1.5,
            borderRadius: 3,
          }}
        >
          <Text style={{ fontSize: 4.8, fontWeight: "bold", color: "#e0e7ff" }}>
            DIC {year}
          </Text>
        </View>
      </View>

      {/* Franja de Acento Electric Indigo */}
      <View style={{ height: 2, backgroundColor: "#4f46e5" }} />

      {/* Cuerpo del Carnet */}
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          paddingHorizontal: 6,
          paddingTop: 5,
          paddingBottom: 3,
          alignItems: "center",
        }}
      >
        {/* Columna 1: Foto + DNI */}
        <View style={{ width: 56, alignItems: "center" }}>
          <View
            style={{
              width: 54,
              height: 66,
              borderRadius: 4,
              borderWidth: 1,
              borderColor: "#cbd5e1",
              backgroundColor: "#f8fafc",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {student.image ? (
              <Image
                src={student.image}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: "#e0e7ff",
                    borderWidth: 1,
                    borderColor: "#a5b4fc",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: "bold", color: "#3730a3" }}>
                    {student.name ? student.name.charAt(0).toUpperCase() : "E"}
                  </Text>
                </View>
                <Text style={{ fontSize: 3.8, color: "#94a3b8", fontWeight: "bold", marginTop: 2 }}>
                  ESTUDIANTE
                </Text>
              </View>
            )}
          </View>

          <View
            style={{
              marginTop: 2.5,
              backgroundColor: "#0f172a",
              borderRadius: 2.5,
              paddingVertical: 1.5,
              paddingHorizontal: 3,
              width: 54,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 5.5, fontWeight: "bold", color: "#ffffff", letterSpacing: 0.3 }}>
              DNI {student.dni}
            </Text>
          </View>
        </View>

        {/* Columna 2: Datos Académicos */}
        <View
          style={{
            flex: 1,
            paddingHorizontal: 6,
            height: 84,
            justifyContent: "space-between",
          }}
        >
          <View>
            <Text style={{ fontSize: 3.8, fontWeight: "bold", color: "#64748b", letterSpacing: 0.4 }}>
              APELLIDOS Y NOMBRES
            </Text>
            <Text
              style={{
                fontSize: fullName.length > 25 ? 6.8 : fullName.length > 18 ? 7.8 : 8.8,
                fontWeight: "bold",
                color: "#0f172a",
                textTransform: "uppercase",
                marginTop: 0.5,
                lineHeight: 1.15,
              }}
            >
              {fullName}
            </Text>
          </View>

          {/* Tarjeta de Información Académica */}
          <View
            style={{
              backgroundColor: "#f8fafc",
              borderRadius: 3.5,
              borderWidth: 0.8,
              borderColor: "#e2e8f0",
              padding: 3.5,
              marginTop: 2,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View>
                <Text style={{ fontSize: 3.8, fontWeight: "bold", color: "#64748b" }}>
                  AULA / SECCIÓN
                </Text>
                <View
                  style={{
                    backgroundColor: "#1e293b",
                    paddingVertical: 1.5,
                    paddingHorizontal: 4,
                    borderRadius: 2,
                    marginTop: 1,
                    alignSelf: "flex-start",
                  }}
                >
                  <Text style={{ fontSize: 5.8, fontWeight: "bold", color: "#ffffff" }}>
                    {student.aula}
                  </Text>
                </View>
              </View>

              <View style={{ alignItems: "flex-end" }}>
                <Text style={{ fontSize: 3.8, fontWeight: "bold", color: "#64748b" }}>
                  NIVEL
                </Text>
                <View
                  style={{
                    backgroundColor: "#eef2ff",
                    borderWidth: 0.5,
                    borderColor: "#c7d2fe",
                    paddingVertical: 1,
                    paddingHorizontal: 3.5,
                    borderRadius: 2,
                    marginTop: 1,
                  }}
                >
                  <Text style={{ fontSize: 4.8, fontWeight: "bold", color: "#3730a3" }}>
                    {student.nivelNombre || "REGULAR"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontSize: 4.8, fontWeight: "bold", color: "#4f46e5" }}>
              AÑO LECTIVO {year}
            </Text>
            <Text style={{ fontSize: 4.2, fontWeight: "bold", color: "#64748b" }}>
              VIGENCIA DIC {year}
            </Text>
          </View>
        </View>

        {/* Columna 3: Escáner QR de Asistencia */}
        <View style={{ width: 58, alignItems: "center", justifyContent: "center" }}>
          <View
            style={{
              padding: 2.5,
              backgroundColor: "#ffffff",
              borderRadius: 4,
              borderWidth: 1,
              borderColor: "#cbd5e1",
              alignItems: "center",
            }}
          >
            {student.qrCode ? (
              <Image src={student.qrCode} style={{ width: 48, height: 48 }} />
            ) : null}
          </View>
          <View
            style={{
              backgroundColor: "#4f46e5",
              borderRadius: 2,
              paddingVertical: 1.5,
              paddingHorizontal: 3,
              marginTop: 2,
              width: 58,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 3.8, fontWeight: "bold", color: "#ffffff", letterSpacing: 0.3 }}>
              CONTROL ASISTENCIA
            </Text>
          </View>
          <Text style={{ fontSize: 3.2, color: "#64748b", marginTop: 1 }}>
            ESCANEAR AL INGRESO
          </Text>
        </View>
      </View>

      {/* Footer Bar */}
      <View
        style={{
          height: 15,
          backgroundColor: "#090d16",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 7,
        }}
      >
        <Text style={{ fontSize: 4, fontWeight: "bold", color: "#e2e8f0" }}>
          DOCUMENTO DE IDENTIFICACIÓN ESCOLAR
        </Text>
        <Text style={{ fontSize: 4, color: "#93c5fd" }}>
          CÓD. MODULAR: {institucion.codigoModular || "---"}
        </Text>
      </View>
    </View>
  );
};
