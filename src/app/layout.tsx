import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import { Providers } from "@/components/providers";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "EduNova Pro | Sistema de Gestión Educativa",
  description:
    "Plataforma avanzada de gestión escolar adaptada a normativas MINEDU / CNEB y SIAGIE",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EduNova Pro",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className={`${plusJakartaSans.variable} ${jetbrainsMono.variable}`}>
      <head>
        <meta name="theme-color" content="#4f46e5" />
      </head>
      <body
        className="font-sans antialiased bg-background text-foreground tracking-tight selection:bg-indigo-500/20 selection:text-indigo-500"
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
