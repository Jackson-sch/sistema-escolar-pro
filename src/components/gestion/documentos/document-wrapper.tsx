import React from 'react'
import {
  Document,
  Page,
  View,
  Text,
  Image,
} from '@react-pdf/renderer'
import { getQRCodeUrl } from '@/lib/pdf-utils'
import { Heading } from '@/components/pdfx/heading/pdfx-heading'
import { PageHeader } from '@/components/pdfx/page-header/pdfx-page-header'
import { PageFooter } from '@/components/pdfx/page-footer/pdfx-page-footer'
import { Stack } from '@/components/pdfx/stack/pdfx-stack'

interface InstitucionProps {
  nombreInstitucion: string
  lema?: string
  dre?: string
  ugel?: string
  codigoModular?: string
  direccion: string
  telefono?: string
  email?: string
  logo?: string
}

interface DocumentWrapperProps {
  title: string
  docTypeLabel: string
  docId?: string
  verificationCode?: string
  institucion: InstitucionProps
  children: React.ReactNode
}

export const DocumentWrapper = ({
  title,
  docTypeLabel,
  docId,
  verificationCode,
  institucion,
  children
}: DocumentWrapperProps) => {
  // En SSR window no está disponible
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://sistema-escolar.pro'
  const verificationUrl = verificationCode
    ? `${origin}/verificar?codigo=${verificationCode}`
    : null

  const subHeaderParts = [
    institucion.lema ? `"${institucion.lema}"` : null,
    institucion.dre ? `DRE: ${institucion.dre}` : null,
    institucion.ugel ? `UGEL: ${institucion.ugel}` : null,
    institucion.codigoModular ? `CÓD. MODULAR: ${institucion.codigoModular}` : null,
  ].filter(Boolean)

  const subHeader = subHeaderParts.length > 0 
    ? subHeaderParts.join(' | ') 
    : institucion.direccion

  return (
    <Document title={title}>
      <Page size="A4" style={{ padding: 35, fontFamily: 'Helvetica', color: '#1e293b' }}>
        {/* Header Institucional */}
        <PageHeader
          title={institucion.nombreInstitucion}
          subtitle={subHeader}
          rightText={docTypeLabel}
          rightSubText={docId}
          variant={institucion.logo ? "logo-left" : "simple"}
          logo={institucion.logo ? (
            <Image 
              src={institucion.logo} 
              style={{ width: 48, height: 48, objectFit: 'contain' }} 
            />
          ) : undefined}
          marginBottom={12}
        />
        
        {/* Dirección si hay subheader (para no saturar la primera línea) */}
        {subHeaderParts.length > 0 && (
          <Text style={{ fontSize: 7, color: '#64748b', marginTop: -8, marginBottom: 12, textAlign: 'left' }}>
            {institucion.direccion}
          </Text>
        )}

        {/* Título del Documento */}
        <Stack direction="vertical" gap="none" style={{ marginVertical: 12 }}>
          <Heading 
            level={2} 
            weight="bold" 
            transform="uppercase" 
            align="center" 
            keepWithNext={false}
            noMargin
            style={{ borderBottomWidth: 1.5, borderBottomColor: '#0f172a', paddingBottom: 4 }}
          >
            {title}
          </Heading>
        </Stack>

        {/* Contenido Dinámico */}
        <View wrap={true}>
          {children}
        </View>

        {/* Footer con Verificación */}
        <PageFooter
          variant="simple"
          fixed
          pagePadding={30}
          renderCustomContent={() => (
            <Stack direction="horizontal" justify="between" align="center" style={{ width: '100%', borderTopWidth: 0.5, borderTopColor: '#e2e8f0', paddingTop: 10 }}>
              <View style={{ flex: 1, marginRight: 20 }}>
                <Text style={{ fontSize: 7, color: '#94a3b8' }}>
                  Documento generado por Sistema de Gestión Escolar PRO | Fecha: {new Date().toLocaleString('es-PE')}
                </Text>
                <Text style={{ fontSize: 7, color: '#94a3b8', marginTop: 2 }}>
                  La autenticidad de este documento puede ser verificada mediante el código de control.
                </Text>
                {verificationCode && (
                  <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#64748b', marginTop: 2 }}>
                    CÓDIGO DE VERIFICACIÓN: {verificationCode}
                  </Text>
                )}
              </View>
              {verificationUrl && (
                <Image
                  src={getQRCodeUrl(verificationUrl)}
                  style={{ width: 40, height: 40 }}
                />
              )}
            </Stack>
          )}
        />
      </Page>
    </Document>
  )
}
