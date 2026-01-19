"use client"

import React from 'react'
import { Text, View, StyleSheet } from '@react-pdf/renderer'
import { DocumentWrapper, pdfStyles } from '../documentos/document-wrapper'

interface ConstanciaMatriculaPDFProps {
  enrollment: {
    id: string
    anioAcademico: number
    estudiante: {
      name: string
      apellidoPaterno: string
      apellidoMaterno: string
      dni: string
    }
    nivelAcademico: {
      seccion: string
      grado: { nombre: string }
      nivel: { nombre: string }
    }
  }
  institucion: any
  verificationCode?: string
}

export const ConstanciaMatriculaPDF = ({ enrollment, institucion, verificationCode }: ConstanciaMatriculaPDFProps) => {
  const studentFullName = `${enrollment.estudiante.apellidoPaterno} ${enrollment.estudiante.apellidoMaterno}, ${enrollment.estudiante.name}`
  const today = new Date().toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  return (
    <DocumentWrapper
      title="Constancia de Matrícula"
      docTypeLabel={`AÑO ACADÉMICO ${enrollment.anioAcademico}`}
      docId={enrollment.estudiante.dni}
      institucion={institucion}
      verificationCode={verificationCode}
    >
      <View style={{ marginTop: 20 }}>
        <Text style={{ textAlign: 'justify' }}>
          La Dirección de la Institución Educativa <Text style={pdfStyles.bold}>{institucion.nombreInstitucion || institucion.nombre}</Text>, perteneciente a la {institucion.ugel || 'UGEL correspondiente'}, hace constar por medio de la presente que el estudiante:
        </Text>

        <View style={{ marginVertical: 20, padding: 10, borderLeftWidth: 3, borderLeftColor: '#0f172a', backgroundColor: '#f8fafc' }}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#0f172a' }}>{studentFullName.toUpperCase()}</Text>
          <Text style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>DOCUMENTO DE IDENTIDAD (DNI): {enrollment.estudiante.dni}</Text>
        </View>

        <Text style={{ textAlign: 'justify' }}>
          Se encuentra debidamente <Text style={pdfStyles.bold}>MATRICULADO</Text> para cursar estudios correspondientes al <Text style={pdfStyles.bold}>Año Académico {enrollment.anioAcademico}</Text>, conforme a los registros oficiales de esta casa de estudios. El estudiante ha quedado expedito en la siguiente ubicación académica:
        </Text>
      </View>

      <View style={{ marginTop: 20, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
        <View style={{ backgroundColor: '#f8fafc', padding: 10, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' }}>
          <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#475569' }}>DETALLES DE UBICACIÓN ACADÉMICA</Text>
        </View>
        <View style={{ padding: 10, flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
          <Text style={{ width: '30%', color: '#64748b', fontWeight: 'bold' }}>NIVEL EDUCATIVO:</Text>
          <Text style={{ width: '70%', fontWeight: 'bold' }}>{enrollment.nivelAcademico.nivel.nombre}</Text>
        </View>
        <View style={{ padding: 10, flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
          <Text style={{ width: '30%', color: '#64748b', fontWeight: 'bold' }}>GRADO / AÑO:</Text>
          <Text style={{ width: '70%', fontWeight: 'bold' }}>{enrollment.nivelAcademico.grado.nombre}</Text>
        </View>
        <View style={{ padding: 10, flexDirection: 'row' }}>
          <Text style={{ width: '30%', color: '#64748b', fontWeight: 'bold' }}>SECCIÓN ASIGNADA:</Text>
          <Text style={{ width: '70%', fontWeight: 'bold' }}>"{enrollment.nivelAcademico.seccion}"</Text>
        </View>
      </View>

      <Text style={{ fontSize: 10, marginTop: 15, textAlign: 'justify' }}>
        En fe de lo cual y a solicitud verbal de la parte interesada, se firma y sella la presente para los fines que el interesado estime conveniente.
      </Text>

      <View style={{ marginTop: 20, textAlign: 'right' }}>
        <Text>{institucion.provincia || 'Ciudad'}, {today}</Text>
      </View>

      <View style={{ marginTop: 40, alignItems: 'center' }}>
        <View style={{ width: 220, borderTopWidth: 1, borderTopColor: '#0f172a', paddingTop: 10, alignItems: 'center' }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold' }}>LA DIRECCIÓN</Text>
          <Text style={{ fontSize: 8, color: '#64748b' }}>{institucion.nombreInstitucion || institucion.nombre}</Text>
        </View>
      </View>
    </DocumentWrapper>
  )
}
