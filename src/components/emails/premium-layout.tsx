import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Link,
  Heading,
} from "@react-email/components";
import * as React from "react";

interface PremiumLayoutProps {
  previewText: string;
  children: React.ReactNode;
  institucionNombre?: string;
  institucionLogo?: string;
}

export const PremiumLayout = ({
  previewText,
  children,
  institucionNombre = "Sistema Escolar Pro",
  institucionLogo,
}: PremiumLayoutProps) => (
  <Html>
    <Head />
    <Preview>{previewText}</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header con Logo */}
        <Section style={header}>
          {institucionLogo && (
            <Img
              src={institucionLogo}
              width="40"
              height="40"
              alt={institucionNombre}
              style={logo}
            />
          )}
          <Text style={brandName}>{institucionNombre}</Text>
        </Section>

        {/* Contenido Principal con efecto de tarjeta (Glass-like) */}
        <Section style={contentCard}>
          {children}
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Hr style={hr} />
          <Text style={footerText}>
            Este es un mensaje automático de {institucionNombre}.
            <br />
            © {new Date().getFullYear()} Todos los derechos reservados.
          </Text>
          <Section style={footerLinks}>
            <Link href="#" style={link}>Términos</Link>
            <span style={dot}> • </span>
            <Link href="#" style={link}>Privacidad</Link>
            <span style={dot}> • </span>
            <Link href="#" style={link}>Soporte</Link>
          </Section>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default PremiumLayout;

const main = {
  backgroundColor: "#f8fafc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  width: "580px",
  maxWidth: "100%",
};

const header = {
  padding: "32px 0",
  textAlign: "center" as const,
};

const logo = {
  margin: "0 auto",
  borderRadius: "8px",
};

const brandName = {
  fontSize: "14px",
  fontWeight: "900",
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
  color: "#64748b",
  marginTop: "12px",
};

const contentCard = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  padding: "40px",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
};

const footer = {
  textAlign: "center" as const,
  padding: "32px 0",
};

const hr = {
  borderColor: "#e2e8f0",
  margin: "20px 0",
};

const footerText = {
  color: "#94a3b8",
  fontSize: "12px",
  lineHeight: "18px",
};

const footerLinks = {
  marginTop: "16px",
};

const link = {
  color: "#94a3b8",
  fontSize: "11px",
  textDecoration: "underline",
};

const dot = {
  color: "#cbd5e1",
  padding: "0 4px",
};
