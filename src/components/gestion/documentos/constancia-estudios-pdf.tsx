"use client"

import React from 'react'
import { Text, View, StyleSheet } from '@react-pdf/renderer'
import { DocumentWrapper, pdfStyles } from './document-wrapper'

const certStyles = StyleSheet.create({
  content: {
    marginTop: 40,
    fontSize: 12,
    textAlign: 'justify',
  },
  signatureSection: {
    marginTop: 80,
    alignItems: 'center',
  },
  signatureLine: {
    width: 200,
    borderTopWidth: 1,
    borderTopColor: '#0f172a',
    marginTop: 10,
  },
  datePlace: {
    marginTop: 40,
    textAlign: 'right',
    fontSize: 11,
  }
})

interface ConstanciaEstudiosPDFProps {
  student: {
    name: string
    apellidoPaterno: string
    apellidoMaterno: string
    dni: string
    nivelAcademico: {
      grado: { nombre: string }
      seccion: string
      nivel: { nombre: string }
    }
  }
  anioAcademico: number
  institucion: any
  verificationCode?: string
}

export const ConstanciaEstudiosPDF = ({
  student,
  anioAcademico,
  institucion,
  verificationCode
}: ConstanciaEstudiosPDFProps) => {
  const studentFull = `${student.apellidoPaterno} ${student.apellidoMaterno}, ${student.name}`
  const date = new Date()
  const dateStr = `${date.getDate()} de ${date.toLocaleString('es-PE', { month: 'long' })} de ${date.getFullYear()}`

  return (
    <DocumentWrapper
      title="Constancia de Estudios"
      docTypeLabel={`EXP: ${date.getFullYear()}-${student.dni.substring(0, 4)}`}
      docId={student.dni}
      institucion={institucion}
      verificationCode={verificationCode}
    >
      <View style={certStyles.content}>
        <Text>
          EL QUE SUSCRIBE, DIRECTOR DE LA INSTITUCIÓN EDUCATIVA "{institucion.nombreInstitucion.toUpperCase()}", HACE CONSTAR QUE:
        </Text>

        <Text style={{ marginTop: 25 }}>
          El(la) estudiante <Text style={{ fontWeight: 'bold' }}>{studentFull.toUpperCase()}</Text>, identificado(a) con DNI N° {student.dni}, se encuentra matriculado(a) en nuestra institución educativa en el:
        </Text>

        <Text style={{ marginTop: 20, textAlign: 'center', fontWeight: 'bold', fontSize: 13 }}>
          {(student.nivelAcademico?.grado?.nombre || '-').toUpperCase()} DE {(student.nivelAcademico?.nivel?.nombre || '-').toUpperCase()} - SECCIÓN "{(student.nivelAcademico?.seccion || '-').toUpperCase()}"
        </Text>

        <Text style={{ marginTop: 20 }}>
          Correspondiente al Año Académico {anioAcademico}, habiendo cumplido con los requisitos exigidos por las normas legales vigentes.
        </Text>

        <Text style={{ marginTop: 20 }}>
          Se expide la presente constancia a solicitud de la parte interesada para los fines que estime conveniente.
        </Text>
      </View>

      <View style={certStyles.datePlace}>
        <Text>Ciudad, {dateStr}</Text>
      </View>

      <View style={certStyles.signatureSection}>
        <View style={certStyles.signatureLine} />
        <Text style={{ fontSize: 10, fontWeight: 'bold' }}>EL DIRECTOR</Text>
        <Text style={{ fontSize: 8, color: '#64748b' }}>{institucion.nombreInstitucion}</Text>
      </View>

    </DocumentWrapper>
  )
}
