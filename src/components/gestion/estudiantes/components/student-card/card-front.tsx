import React from "react";
import { Text, View, Image } from "@/lib/pdf";
import { CARD_WIDTH, CARD_HEIGHT, StudentCardPDFProps } from "./card-types";

export const CardFront = ({
  student,
  institucion,
  qrCode,
}: StudentCardPDFProps) => {
  const currentYear = new Date().getFullYear();
  const fullName = `${student.name} ${student.apellidoPaterno} ${student.apellidoMaterno}`.trim();
  const gradoNivel = student.nivelAcademico
    ? `${student.nivelAcademico.grado.nombre} "${student.nivelAcademico.seccion}" - ${student.nivelAcademico.nivel.nombre}`
    : "ESTUDIANTE REGULAR";

  return (
    <View
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 8,
        backgroundColor: "#ffffff",
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#cbd5e1",
        position: "relative",
      }}
    >
      {/* Header Superior */}
      <View
        style={{
          backgroundColor: "#0f172a",
          height: 34,
          paddingHorizontal: 10,
          paddingVertical: 4,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flex: 1, paddingRight: 6 }}>
          <Text
            style={{
              fontSize: 7.5,
              fontWeight: "bold",
              color: "#ffffff",
              textTransform: "uppercase",
              letterSpacing: 0.3,
            }}
          >
            {institucion.nombreInstitucion}
          </Text>
          <Text style={{ fontSize: 4.5, color: "#93c5fd", marginTop: 1 }}>
            {student.nivelAcademico?.sede?.nombre || institucion.lema || "Excelencia Educativa"}
          </Text>
        </View>
        {institucion.logo ? (
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: "#ffffff",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <Image
              src={institucion.logo}
              style={{ width: 20, height: 20, objectFit: "contain" }}
            />
          </View>
        ) : null}
      </View>

      {/* Banda de Acento */}
      <View style={{ height: 2, backgroundColor: "#3b82f6" }} />

      {/* Cuerpo Principal */}
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          paddingHorizontal: 10,
          paddingTop: 8,
          paddingBottom: 4,
        }}
      >
        {/* Foto */}
        <View
          style={{
            width: 52,
            height: 64,
            borderRadius: 5,
            borderWidth: 1,
            borderColor: "#cbd5e1",
            backgroundColor: "#f1f5f9",
            overflow: "hidden",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {student.image ? (
            <Image
              src={student.image}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "#64748b" }}>
              {student.name ? student.name.charAt(0).toUpperCase() : "E"}
            </Text>
          )}
        </View>

        {/* Datos Alumno */}
        <View style={{ flex: 1, marginLeft: 10, justifyContent: "space-between" }}>
          <View>
            <Text style={{ fontSize: 4.5, fontWeight: "bold", color: "#64748b" }}>
              ESTUDIANTE
            </Text>
            <Text
              style={{
                fontSize: fullName.length > 22 ? 6.5 : 7.5,
                fontWeight: "bold",
                color: "#0f172a",
                marginTop: 1,
                textTransform: "uppercase",
              }}
            >
              {fullName}
            </Text>
          </View>

          <View style={{ marginTop: 2 }}>
            <Text style={{ fontSize: 4.5, fontWeight: "bold", color: "#64748b" }}>
              GRADO / NIVEL
            </Text>
            <View
              style={{
                backgroundColor: "#1e293b",
                paddingVertical: 1.5,
                paddingHorizontal: 5,
                borderRadius: 3,
                alignSelf: "flex-start",
              }}
            >
              <Text
                style={{
                  fontSize: 5.5,
                  fontWeight: "bold",
                  color: "#ffffff",
                  textTransform: "uppercase",
                }}
              >
                {gradoNivel}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", marginTop: 2 }}>
            <View style={{ marginRight: 14 }}>
              <Text style={{ fontSize: 4.5, fontWeight: "bold", color: "#64748b" }}>
                DNI
              </Text>
              <Text style={{ fontSize: 6.5, fontWeight: "bold", color: "#0f172a" }}>
                {student.dni}
              </Text>
            </View>
            <View>
              <Text style={{ fontSize: 4.5, fontWeight: "bold", color: "#64748b" }}>
                VIGENCIA
              </Text>
              <Text style={{ fontSize: 6.5, fontWeight: "bold", color: "#2563eb" }}>
                DIC {currentYear}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View
        style={{
          height: 20,
          borderTopWidth: 0.5,
          borderTopColor: "#e2e8f0",
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 10,
          backgroundColor: "#f8fafc",
        }}
      >
        {qrCode ? (
          <Image src={qrCode} style={{ width: 14, height: 14, marginRight: 6 }} />
        ) : null}
        <View>
          <Text style={{ fontSize: 4.5, fontWeight: "bold", color: "#0f172a" }}>
            CARNET ESCOLAR OFICIAL
          </Text>
          <Text style={{ fontSize: 4, color: "#64748b" }}>
            CÓD. MODULAR: {institucion.codigoModular || "---"}
          </Text>
        </View>
      </View>
    </View>
  );
};
