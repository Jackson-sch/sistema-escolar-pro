import React from "react";
import {
  Document,
  Page,
  View,
  Text as PdfText,
  Image,
} from "@/lib/pdf";
import { getQRCodeUrl } from "@/lib/pdf-utils";
import { Badge } from "@/components/pdfx/badge/pdfx-badge";
import { Heading } from "@/components/pdfx/heading/pdfx-heading";
import { Divider } from "@/components/pdfx/divider/pdfx-divider";

interface InstitucionProps {
  nombreInstitucion: string;
  lema?: string;
  dre?: string;
  ugel?: string;
  codigoModular?: string;
  direccion: string;
  telefono?: string;
  email?: string;
  logo?: string;
}

interface DocumentWrapperProps {
  title: string;
  docTypeLabel: string;
  docId?: string;
  verificationCode?: string;
  institucion: InstitucionProps;
  children: React.ReactNode;
  origin?: string;
  qrCode?: string;
  size?: "A4" | "LETTER";
  orientation?: "portrait" | "landscape";
}

function resolveLogoUrl(rawLogo: unknown, origin: string): string | null {
  if (rawLogo && typeof rawLogo === "string" && rawLogo.trim() !== "") {
    if (rawLogo.startsWith("http") || rawLogo.startsWith("data:")) {
      return rawLogo;
    }
    const cleanPath = rawLogo.startsWith("/") ? rawLogo : `/${rawLogo}`;
    return `${origin}${cleanPath}`;
  }
  return null;
}

function resolveSubHeader(institucion: InstitucionProps): string {
  const parts = [
    institucion.dre ? `DRE: ${institucion.dre}` : null,
    institucion.ugel ? `UGEL: ${institucion.ugel}` : null,
    institucion.codigoModular ? `CÓD. MODULAR: ${institucion.codigoModular}` : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join("  •  ") : institucion.direccion || "MINISTERIO DE EDUCACIÓN";
}

function DocumentHeader({
  institucion,
  docTypeLabel,
  docId,
  origin,
}: {
  institucion: InstitucionProps;
  docTypeLabel: string;
  docId?: string;
  origin: string;
}) {
  const logoUrl = resolveLogoUrl(institucion.logo || (institucion as any).logoUrl, origin);
  const subHeader = resolveSubHeader(institucion);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomWidth: 1.5,
        borderBottomColor: "#0f172a",
        paddingBottom: 10,
        marginBottom: 8,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1, paddingRight: 12 }}>
        {logoUrl ? (
          <View
            style={{
              width: 46,
              height: 46,
              borderRadius: 8,
              backgroundColor: "#ffffff",
              marginRight: 10,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 0.5,
              borderColor: "#e2e8f0",
              overflow: "hidden",
            }}
          >
            <Image src={logoUrl} style={{ width: 40, height: 40, objectFit: "contain" }} />
          </View>
        ) : (
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 8,
              backgroundColor: "#0f172a",
              marginRight: 10,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PdfText style={{ color: "#ffffff", fontSize: 18, fontWeight: "bold" }}>
              {institucion.nombreInstitucion
                ? institucion.nombreInstitucion.charAt(0).toUpperCase()
                : "I"}
            </PdfText>
          </View>
        )}

        <View style={{ flex: 1 }}>
          <PdfText
            style={{
              fontSize: 11.5,
              fontWeight: "bold",
              color: "#0f172a",
              textTransform: "uppercase",
              letterSpacing: 0.4,
            }}
          >
            {institucion.nombreInstitucion || "INSTITUCIÓN EDUCATIVA"}
          </PdfText>
          {institucion.lema && (
            <PdfText style={{ fontSize: 6.5, fontStyle: "italic", color: "#64748b", marginTop: 1 }}>
              &quot;{institucion.lema}&quot;
            </PdfText>
          )}
          <PdfText style={{ fontSize: 6.5, color: "#475569", fontWeight: "medium", marginTop: 1.5 }}>
            {subHeader}
          </PdfText>
          {institucion.direccion && (
            <PdfText style={{ fontSize: 6, color: "#64748b", marginTop: 0.5 }}>
              {institucion.direccion} {institucion.telefono ? `| Tel: ${institucion.telefono}` : ""}
            </PdfText>
          )}
        </View>
      </View>

      <View style={{ alignItems: "flex-end", minWidth: 110 }}>
        <Badge
          variant="default"
          size="md"
          color="#ffffff"
          background="#0f172a"
          label={docTypeLabel}
          style={{
            fontWeight: "bold",
            fontSize: 7.5,
            letterSpacing: 0.5,
            paddingHorizontal: 8,
            paddingVertical: 3,
          }}
        />
        {docId && (
          <PdfText
            style={{
              fontSize: 6.5,
              fontWeight: "bold",
              color: "#64748b",
              marginTop: 3,
              letterSpacing: 0.3,
            }}
          >
            REGISTRO: {docId}
          </PdfText>
        )}
      </View>
    </View>
  );
}

function DocumentFooter({
  fechaGeneracion,
  verificationCode,
  verificationUrl,
  qrCode,
}: {
  fechaGeneracion: string;
  verificationCode?: string;
  verificationUrl: string | null;
  qrCode?: string;
}) {
  return (
    <View
      style={{
        borderTopWidth: 0.75,
        borderTopColor: "#e2e8f0",
        paddingTop: 8,
        marginTop: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <View style={{ flex: 1, paddingRight: 12 }}>
        <PdfText style={{ fontSize: 6.5, fontWeight: "bold", color: "#334155" }}>
          Sistema de Gestión Escolar PRO • Emisión Oficial: {fechaGeneracion}
        </PdfText>
        <PdfText style={{ fontSize: 5.5, color: "#64748b", marginTop: 1.5, lineHeight: 1.2 }}>
          Este documento cuenta con validez oficial conforme a las normas de simplificación administrativa.
          Para verificar su autenticidad e integridad, escanee el código QR o consulte el portal institucional.
        </PdfText>
        {verificationCode && (
          <PdfText
            style={{
              fontSize: 6.5,
              fontWeight: "bold",
              color: "#0f172a",
              marginTop: 2,
              fontFamily: "Courier",
            }}
          >
            HASH DE CONTROL: {verificationCode}
          </PdfText>
        )}
      </View>

      {verificationUrl && (
        <View
          style={{
            padding: 2,
            backgroundColor: "#ffffff",
            borderRadius: 4,
            borderWidth: 0.75,
            borderColor: "#cbd5e1",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            src={qrCode || getQRCodeUrl(verificationUrl)}
            style={{ width: 34, height: 34 }}
          />
        </View>
      )}
    </View>
  );
}

export const DocumentWrapper = ({
  title,
  docTypeLabel,
  docId,
  verificationCode,
  institucion,
  children,
  origin: passedOrigin,
  qrCode,
  size = "A4",
  orientation = "portrait",
}: DocumentWrapperProps) => {
  const origin =
    passedOrigin ||
    (typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");

  const fechaGeneracion = new Date().toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const verificationUrl = verificationCode
    ? `${origin}/verificar?codigo=${verificationCode}`
    : null;

  return (
    <Document title={`${title} - ${institucion.nombreInstitucion || "Sistema Escolar"}`}>
      <Page
        size={size}
        orientation={orientation}
        style={{
          paddingTop: 28,
          paddingBottom: 28,
          paddingLeft: 32,
          paddingRight: 32,
          fontFamily: "Helvetica",
          color: "#0f172a",
          backgroundColor: "#ffffff",
          position: "relative",
        }}
      >
        <View
          style={{
            position: "absolute",
            top: 14,
            left: 14,
            right: 14,
            bottom: 14,
            borderWidth: 0.75,
            borderColor: "#cbd5e1",
            borderRadius: 6,
          }}
        />

        <DocumentHeader
          institucion={institucion}
          docTypeLabel={docTypeLabel}
          docId={docId}
          origin={origin}
        />

        <View style={{ marginVertical: 8, alignItems: "center" }}>
          <Heading
            level={2}
            align="center"
            weight="bold"
            transform="uppercase"
            tracking="wide"
            noMargin
            style={{ fontSize: 13, color: "#0f172a" }}
          >
            {title}
          </Heading>
          <View
            style={{
              width: 50,
              height: 2,
              backgroundColor: "#2563eb",
              marginTop: 3,
              borderRadius: 1,
            }}
          />
        </View>

        <View style={{ flex: 1 }}>{children}</View>

        <DocumentFooter
          fechaGeneracion={fechaGeneracion}
          verificationCode={verificationCode}
          verificationUrl={verificationUrl}
          qrCode={qrCode}
        />
      </Page>
    </Document>
  );
};
