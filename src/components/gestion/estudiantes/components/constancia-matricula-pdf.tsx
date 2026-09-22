import React from "react";
import { Document, Page, Text, View, Image } from "@/lib/pdf";
import { formatDate } from "@/lib/formats";

export interface ConstanciaMatriculaData {
  estudianteNombre: string;
  dni: string;
  codigoEstudiante: string;
  nivel: string;
  grado: string;
  seccion: string;
  sedeNombre: string;
  fechaMatricula: Date | string;
  anioLectivo: number | string;
  institucion: {
    nombreInstitucion: string;
    codigoModular?: string;
    ugel?: string;
    dre?: string;
    direccion?: string;
    distrito?: string;
    provincia?: string;
    departamento?: string;
    director?: string;
    logo?: string | null;
  };
  qrCode?: string;
}

export const ConstanciaMatriculaPDF = ({
  data,
}: {
  data: ConstanciaMatriculaData;
}) => {
  const inst = data.institucion;
  const hoy = formatDate(new Date());

  return (
    <Document title={`Constancia-Matricula-${data.dni}`}>
      <Page
        size="A4"
        style={{
          padding: 45,
          backgroundColor: "#ffffff",
          fontFamily: "Helvetica",
          color: "#0f172a",
        }}
      >
        {/* ── ENCABEZADO OFICIAL MINEDU / INSTITUCIÓN ── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottomWidth: 1.5,
            borderBottomColor: "#0f172a",
            paddingBottom: 12,
            marginBottom: 24,
          }}
        >
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text
              style={{
                fontSize: 8,
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              REPÚBLICA DEL PERÚ · MINISTERIO DE EDUCACIÓN
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "bold",
                color: "#0f172a",
                textTransform: "uppercase",
                marginTop: 2,
              }}
            >
              {inst.nombreInstitucion}
            </Text>
            <Text style={{ fontSize: 8, color: "#475569", marginTop: 2 }}>
              DRE: {inst.dre || "LIMA METROPOLITANA"} · UGEL: {inst.ugel || "02"} · Cód. Modular: {inst.codigoModular || "---"}
            </Text>
            <Text style={{ fontSize: 7.5, color: "#64748b", marginTop: 1 }}>
              Sede: {data.sedeNombre} · {inst.direccion || "Av. Principal 123"}, {inst.distrito || "Lima"}
            </Text>
          </View>

          {inst.logo ? (
            <Image
              src={inst.logo}
              style={{ width: 48, height: 48, objectFit: "contain" }}
            />
          ) : null}
        </View>

        {/* ── TÍTULO DEL DOCUMENTO ── */}
        <View style={{ alignItems: "center", marginVertical: 18 }}>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: 1,
              color: "#0f172a",
            }}
          >
            CONSTANCIA DE MATRÍCULA
          </Text>
          <Text
            style={{
              fontSize: 9,
              color: "#2563eb",
              fontWeight: "bold",
              marginTop: 3,
            }}
          >
            AÑO LECTIVO {data.anioLectivo}
          </Text>
        </View>

        {/* ── CUERPO DEL TEXTO ── */}
        <View style={{ marginTop: 15, lineHeight: 1.6, fontSize: 10 }}>
          <Text style={{ marginBottom: 12, textAlign: "justify" }}>
            La Dirección de la Institución Educativa Privada{" "}
            <Text style={{ fontWeight: "bold" }}>
              {inst.nombreInstitucion.toUpperCase()}
            </Text>
            , ubicada en {inst.direccion || "la sede principal"}, distrito de{" "}
            {inst.distrito || "Lima"}, perteneciente a la UGEL {inst.ugel || "02"}, que suscribe:
          </Text>

          <Text
            style={{
              fontSize: 12,
              fontWeight: "bold",
              textAlign: "center",
              marginVertical: 10,
              letterSpacing: 1,
            }}
          >
            HACE CONSTAR:
          </Text>

          <Text style={{ marginBottom: 14, textAlign: "justify" }}>
            Que, el/la estudiante{" "}
            <Text style={{ fontWeight: "bold" }}>
              {data.estudianteNombre.toUpperCase()}
            </Text>
            , identificado(a) con DNI N°{" "}
            <Text style={{ fontWeight: "bold" }}>{data.dni}</Text> y Código de
            Estudiante N°{" "}
            <Text style={{ fontWeight: "bold" }}>
              {data.codigoEstudiante || data.dni}
            </Text>
            , se encuentra debidamente{" "}
            <Text style={{ fontWeight: "bold", color: "#166534" }}>
              MATRICULADO(A)
            </Text>{" "}
            en el presente Año Escolar {data.anioLectivo}, con el siguiente detalle académico:
          </Text>

          {/* ── TABLA DE DATOS ACADÉMICOS ── */}
          <View
            style={{
              borderWidth: 1,
              borderColor: "#cbd5e1",
              borderRadius: 4,
              padding: 10,
              backgroundColor: "#f8fafc",
              marginBottom: 16,
            }}
          >
            <View style={{ flexDirection: "row", marginBottom: 4 }}>
              <Text style={{ width: 140, fontWeight: "bold", color: "#475569" }}>
                Nivel Educativo:
              </Text>
              <Text style={{ fontWeight: "bold", color: "#0f172a" }}>
                {data.nivel.toUpperCase()}
              </Text>
            </View>
            <View style={{ flexDirection: "row", marginBottom: 4 }}>
              <Text style={{ width: 140, fontWeight: "bold", color: "#475569" }}>
                Grado y Sección:
              </Text>
              <Text style={{ fontWeight: "bold", color: "#0f172a" }}>
                {data.grado.toUpperCase()} &quot;{data.seccion.toUpperCase()}&quot;
              </Text>
            </View>
            <View style={{ flexDirection: "row", marginBottom: 4 }}>
              <Text style={{ width: 140, fontWeight: "bold", color: "#475569" }}>
                Sede Institucional:
              </Text>
              <Text style={{ color: "#0f172a" }}>{data.sedeNombre}</Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Text style={{ width: 140, fontWeight: "bold", color: "#475569" }}>
                Fecha de Matrícula:
              </Text>
              <Text style={{ color: "#0f172a" }}>
                {formatDate(data.fechaMatricula)}
              </Text>
            </View>
          </View>

          <Text style={{ textAlign: "justify", marginBottom: 25 }}>
            Se expide la presente constancia a solicitud de la parte interesada
            para los fines legales y administrativos que estime conveniente.
          </Text>

          <Text style={{ textAlign: "right", marginTop: 10 }}>
            {inst.distrito || "Lima"}, {hoy}
          </Text>
        </View>

        {/* ── FIRMA Y SELLO + QR DE VALIDACIÓN ── */}
        <View
          style={{
            marginTop: 40,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          {/* QR de Validación Digital */}
          <View style={{ alignItems: "center" }}>
            {data.qrCode ? (
              <Image src={data.qrCode} style={{ width: 60, height: 60 }} />
            ) : null}
            <Text
              style={{
                fontSize: 6,
                color: "#64748b",
                marginTop: 3,
                textAlign: "center",
              }}
            >
              Documento Verificado Digitalmente
            </Text>
            <Text style={{ fontSize: 5.5, color: "#94a3b8" }}>
              ID: {data.dni}-{data.anioLectivo}
            </Text>
          </View>

          {/* Línea de Firma de la Dirección */}
          <View style={{ width: 180, alignItems: "center" }}>
            <View
              style={{
                width: "100%",
                borderBottomWidth: 1,
                borderBottomColor: "#0f172a",
                marginBottom: 4,
              }}
            />
            <Text
              style={{
                fontSize: 8.5,
                fontWeight: "bold",
                textTransform: "uppercase",
              }}
            >
              {inst.director || "DIRECCIÓN GENERAL"}
            </Text>
            <Text style={{ fontSize: 7, color: "#64748b" }}>
              {inst.nombreInstitucion}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
