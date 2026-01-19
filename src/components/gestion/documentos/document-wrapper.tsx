"use client"

import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer'
import { getQRCodeUrl } from '@/lib/pdf-utils'

// Estilos globales premium para documentos oficiales
export const pdfStyles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1e293b',
    lineHeight: 1.6,
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 1.5,
    borderBottomColor: '#0f172a',
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  schoolInfo: {
    flex: 1,
  },
  schoolName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  schoolSub: {
    fontSize: 8,
    color: '#64748b',
    marginTop: 2,
  },
  docTypeContainer: {
    textAlign: 'right',
  },
  docId: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    borderTopWidth: 0.5,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 7,
    color: '#94a3b8',
    flex: 1,
  },
  qrCode: {
    width: 45,
    height: 45,
  },
  bold: {
    fontWeight: 'bold',
    color: '#020617',
  },
  titleContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    textDecoration: 'underline',
    textTransform: 'uppercase',
    letterSpacing: 2,
  }
})

interface InstitucionProps {
  nombreInstitucion: string
  lema?: string
  dre?: string
  ugel?: string
  codigoModular?: string
  direccion: string
  telefono?: string
  email?: string
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
  const verificationUrl = verificationCode
    ? `${window.location.origin}/verificar?codigo=${verificationCode}`
    : null
  return (
    <Document title={title}>
      <Page size="A4" style={pdfStyles.page}>
        {/* Header Institucional */}
        <View style={pdfStyles.header}>
          <View style={pdfStyles.schoolInfo}>
            <Text style={pdfStyles.schoolName}>{institucion.nombreInstitucion}</Text>
            {institucion.lema && <Text style={[pdfStyles.schoolSub, { fontStyle: 'italic', color: '#475569' }]}>"{institucion.lema}"</Text>}
            <Text style={pdfStyles.schoolSub}>
              {institucion.dre && `DRE: ${institucion.dre} | `}
              {institucion.ugel && `UGEL: ${institucion.ugel}`}
            </Text>
            <Text style={pdfStyles.schoolSub}>
              {institucion.codigoModular && `CÓD. MODULAR: ${institucion.codigoModular} | `}
              {institucion.direccion}
            </Text>
          </View>
          <View style={pdfStyles.docTypeContainer}>
            <Text style={pdfStyles.docId}>{docTypeLabel}</Text>
            {docId && <Text style={[pdfStyles.docId, { color: '#0f172a', marginTop: 2 }]}>{docId}</Text>}
          </View>
        </View>

        {/* Título del Documento */}
        <View style={pdfStyles.titleContainer}>
          <Text style={pdfStyles.mainTitle}>{title}</Text>
        </View>

        {/* Contenido Dinámico */}
        {children}

        {/* Footer con Verificación */}
        <View style={pdfStyles.footer}>
          <View style={pdfStyles.footerText}>
            <Text>
              Documento generado por Sistema de Gestión Escolar PRO | Fecha: {new Date().toLocaleString('es-PE')}
            </Text>
            <Text style={{ marginTop: 2 }}>
              La autenticidad de este documento puede ser verificada mediante el código de control institucional.
            </Text>
            {verificationCode && (
              <Text style={{ marginTop: 2, fontWeight: 'bold', color: '#64748b' }}>
                CÓDIGO DE VERIFICACIÓN: {verificationCode}
              </Text>
            )}
          </View>
          {verificationUrl && (
            <Image
              src={getQRCodeUrl(verificationUrl)}
              style={pdfStyles.qrCode}
            />
          )}
        </View>
      </Page>
    </Document>
  )
}
