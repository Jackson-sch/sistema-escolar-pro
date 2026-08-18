import React from 'react'
import {
  Document,
  Page,
  View,
  Text,
  Image,
} from '@react-pdf/renderer'
import { getQRCodeUrl } from '@/lib/pdf-utils'

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
  origin?: string
}

export const DocumentWrapper = ({
  title,
  docTypeLabel,
  docId,
  verificationCode,
  institucion,
  children,
  origin: passedOrigin
}: DocumentWrapperProps) => {
  const origin = passedOrigin || (typeof window !== 'undefined' 
    ? window.location.origin 
    : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'))
  const fechaGeneracion = new Date().toLocaleDateString('es-PE')
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
    : (institucion.direccion || 'S/D')

  let logoUrl: string | null = null
  const rawLogo = institucion.logo || (institucion as any).logoUrl
  
  if (rawLogo && typeof rawLogo === 'string' && rawLogo.trim() !== '') {
    if (rawLogo.startsWith('http') || rawLogo.startsWith('data:')) {
      logoUrl = rawLogo
    } else {
      const cleanPath = rawLogo.startsWith('/') ? rawLogo : `/${rawLogo}`
      logoUrl = `${origin}${cleanPath}`
    }
  }

  return (
    <Document title={title}>
      <Page size="A4" style={{ padding: 28, fontFamily: 'Helvetica', color: '#0f172a', backgroundColor: '#ffffff' }}>
        {/* Cabecera Principal Institucional */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1.5, borderBottomColor: '#0f172a', paddingBottom: 8, marginBottom: 10 }}>
          {/* Izquierda: Logo y Nombre */}
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 10 }}>
            {logoUrl ? (
              <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: '#ffffff', marginRight: 10, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <Image src={logoUrl} style={{ width: 38, height: 38, objectFit: 'contain' }} />
              </View>
            ) : (
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#0f172a', marginRight: 10, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold' }}>
                  {institucion.nombreInstitucion ? institucion.nombreInstitucion.charAt(0).toUpperCase() : 'I'}
                </Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#0f172a', textTransform: 'uppercase', letterSpacing: 0.3 }}>
                {institucion.nombreInstitucion}
              </Text>
              <Text style={{ fontSize: 6.5, color: '#475569', marginTop: 1 }}>
                {subHeader}
              </Text>
              {institucion.direccion ? (
                <Text style={{ fontSize: 6, color: '#64748b', marginTop: 0.5 }}>
                  {institucion.direccion}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Derecha: Badge del Documento */}
          <View style={{ alignItems: 'flex-end', minWidth: 100 }}>
            <View style={{ backgroundColor: '#0f172a', paddingVertical: 3, paddingHorizontal: 8, borderRadius: 3 }}>
              <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#ffffff', textTransform: 'uppercase' }}>
                {docTypeLabel}
              </Text>
            </View>
            {docId ? (
              <Text style={{ fontSize: 6.5, fontWeight: 'bold', color: '#475569', marginTop: 2 }}>
                CÓD: {docId}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Título Principal Sin Cortar Texto */}
        <View style={{ marginVertical: 6, alignItems: 'center' }}>
          <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#0f172a', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' }}>
            {title}
          </Text>
          <View style={{ width: 60, height: 2, backgroundColor: '#0f172a', marginTop: 3, borderRadius: 1 }} />
        </View>

        {/* Contenido Dinámico del Documento */}
        <View style={{ flex: 1 }}>
          {children}
        </View>

        {/* Footer Oficial */}
        <View style={{ borderTopWidth: 0.5, borderTopColor: '#cbd5e1', paddingTop: 6, marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={{ fontSize: 6, color: '#64748b' }}>
              Sistema de Gestión Escolar PRO | Emisión: {fechaGeneracion}
            </Text>
            <Text style={{ fontSize: 5.5, color: '#94a3b8', marginTop: 1 }}>
              Documento digital con validez oficial. Para verificar autenticidad escanee el código QR o ingrese el código de control.
            </Text>
            {verificationCode ? (
              <Text style={{ fontSize: 6.5, fontWeight: 'bold', color: '#0f172a', marginTop: 1.5 }}>
                CÓDIGO DE VERIFICACIÓN: {verificationCode}
              </Text>
            ) : null}
          </View>
          {verificationUrl ? (
            <View style={{ padding: 1, backgroundColor: '#ffffff', borderRadius: 2, borderWidth: 0.5, borderColor: '#cbd5e1' }}>
              <Image src={getQRCodeUrl(verificationUrl)} style={{ width: 32, height: 32 }} />
            </View>
          ) : null}
        </View>
      </Page>
    </Document>
  )
}
