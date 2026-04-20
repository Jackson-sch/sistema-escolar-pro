import {
  Button,
  Heading,
  Text,
  Section,
} from "@react-email/components";
import * as React from "react";
import { PremiumLayout } from "./premium-layout";

interface NotificationEmailProps {
  nombre: string;
  mensaje: string;
  accionLabel?: string;
  accionUrl?: string;
  institucionNombre?: string;
}

export const NotificationEmail = ({
  nombre,
  mensaje,
  accionLabel,
  accionUrl,
  institucionNombre,
}: NotificationEmailProps) => (
  <PremiumLayout 
    previewText={`Notificación de ${institucionNombre || "Sistema Escolar"}`}
    institucionNombre={institucionNombre}
  >
    <Heading style={h1}>Hola, {nombre}</Heading>
    <Text style={text}>
      Tienes una nueva notificación importante de la institución:
    </Text>
    
    <Section style={messageBox}>
      <Text style={messageText}>{mensaje}</Text>
    </Section>

    {accionLabel && accionUrl && (
      <Section style={btnContainer}>
        <Button style={button} href={accionUrl}>
          {accionLabel}
        </Button>
      </Section>
    )}

    <Text style={text}>
      Si tienes alguna duda, puedes contactarnos respondiendo a este correo o a través de nuestra plataforma.
    </Text>
  </PremiumLayout>
);

export default NotificationEmail;

const h1 = {
  color: "#0f172a",
  fontSize: "24px",
  fontWeight: "900",
  lineHeight: "1.2",
  margin: "0 0 20px",
  textAlign: "left" as const,
};

const text = {
  color: "#475569",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 20px",
};

const messageBox = {
  backgroundColor: "#f1f5f9",
  borderRadius: "12px",
  padding: "24px",
  margin: "24px 0",
  borderLeft: "4px solid #7c3aed",
};

const messageText = {
  color: "#1e293b",
  fontSize: "15px",
  lineHeight: "22px",
  margin: "0",
  fontStyle: "italic",
};

const btnContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#7c3aed",
  borderRadius: "12px",
  color: "#fff",
  fontSize: "14px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "16px 32px",
  boxShadow: "0 4px 6px -1px rgba(124, 58, 237, 0.3)",
};
