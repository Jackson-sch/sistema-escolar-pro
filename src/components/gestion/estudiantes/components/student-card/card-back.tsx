import React from "react";
import { Text, View, Image } from "@/lib/pdf";
import { CARD_WIDTH, CARD_HEIGHT, StudentCardPDFProps } from "./card-types";

export const CardBack = ({
  institucion,
  qrCode,
}: StudentCardPDFProps) => {
  const currentYear = new Date().getFullYear();

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
      <View style={{ height: 4, backgroundColor: "#0f172a" }} />

      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 14,
          paddingTop: 10,
          paddingBottom: 8,
        }}
      >
        <Text
          style={{
            fontSize: 7.5,
            fontWeight: "bold",
            color: "#0f172a",
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}
        >
          CONDICIONES DE USO
        </Text>

        <Text
          style={{
            fontSize: 5,
            color: "#475569",
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          Este carnet es personal e intransferible. Identifica al portador como
          estudiante regular de nuestra institución educativa. En caso de
          pérdida o hallazgo, favor de reportarlo a la dirección general.
        </Text>

        {/* QR de Validación Digital */}
        <View style={{ alignItems: "center" }}>
          <View
            style={{
              padding: 2,
              backgroundColor: "#ffffff",
              borderRadius: 4,
              borderWidth: 1,
              borderColor: "#cbd5e1",
            }}
          >
            {qrCode ? (
              <Image src={qrCode} style={{ width: 38, height: 38 }} />
            ) : (
              <View
                style={{ width: 38, height: 38, backgroundColor: "#f1f5f9" }}
              />
            )}
          </View>
          <Text
            style={{
              fontSize: 4.5,
              fontWeight: "bold",
              color: "#0f172a",
              letterSpacing: 0.5,
              marginTop: 2,
            }}
          >
            VALIDACIÓN DIGITAL
          </Text>
        </View>

        <Text style={{ fontSize: 4, color: "#94a3b8" }}>
          © {currentYear} {institucion.nombreInstitucion}
        </Text>
      </View>
    </View>
  );
};
