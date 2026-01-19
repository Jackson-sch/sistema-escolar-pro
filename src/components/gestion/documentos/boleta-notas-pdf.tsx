"use client"

import React from 'react'
import { Text, View, StyleSheet } from '@react-pdf/renderer'
import { DocumentWrapper, pdfStyles } from './document-wrapper'

const boletaStyles = StyleSheet.create({
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    backgroundColor: '#f8fafc',
    padding: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    color: '#0f172a',
    textTransform: 'uppercase',
    marginTop: 10,
  },
  studentInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderRadius: 8,
  },
  infoItem: {
    width: '50%',
    marginBottom: 6,
  },
  label: {
    fontSize: 7,
    color: '#64748b',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  table: {
    marginTop: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    color: 'white',
    padding: 8,
    fontSize: 8,
    fontWeight: 'bold',
    borderRadius: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#f1f5f9',
    paddingVertical: 8,
    paddingHorizontal: 4,
    minHeight: 30,
    alignItems: 'center',
  },
  areaCell: { width: '35%' },
  competencyCell: { width: '45%' },
  gradeCell: { width: '20%', textAlign: 'center' },
  areaText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  compText: {
    fontSize: 7,
    color: '#475569',
  },
  gradeText: {
    fontSize: 10,
    fontWeight: 'black',
  },
  gradeAD: { color: '#059669' },
  gradeA: { color: '#2563eb' },
  gradeB: { color: '#d97706' },
  gradeC: { color: '#dc2626' },
  summarySection: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  }
})

interface BoletaNotasPDFProps {
  student: {
    name: string
    apellidoPaterno: string
    apellidoMaterno: string
    dni: string
    codigoEstudiante?: string
    nivelAcademico: {
      grado: {
        nombre: string
        nivel: { nombre: string }
      }
      seccion: string
    }
  }
  notas: any[] // Array de notas agrupadas por área/competencia
  periodoNombre: string
  anioAcademico: number
  institucion: any
  verificationCode?: string
}

export const BoletaNotasPDF = ({
  student,
  notas,
  periodoNombre,
  anioAcademico,
  institucion,
  verificationCode
}: BoletaNotasPDFProps) => {
  const studentFull = `${student.apellidoPaterno} ${student.apellidoMaterno}, ${student.name}`

  // Lógica de colores para notas literales
  const getGradeStyle = (grade?: string) => {
    switch (grade) {
      case 'AD': return [boletaStyles.gradeText, boletaStyles.gradeAD]
      case 'A': return [boletaStyles.gradeText, boletaStyles.gradeA]
      case 'B': return [boletaStyles.gradeText, boletaStyles.gradeB]
      case 'C': return [boletaStyles.gradeText, boletaStyles.gradeC]
      default: return boletaStyles.gradeText
    }
  }

  return (
    <DocumentWrapper
      title="Boleta de Información del Estudiante"
      docTypeLabel={`Año Escolar ${anioAcademico}`}
      docId={student.codigoEstudiante || student.dni}
      institucion={institucion}
      verificationCode={verificationCode}
    >
      {/* Datos del Estudiante */}
      <View style={boletaStyles.studentInfo}>
        <View style={boletaStyles.infoItem}>
          <Text style={boletaStyles.label}>Estudiante</Text>
          <Text style={boletaStyles.value}>{studentFull}</Text>
        </View>
        <View style={boletaStyles.infoItem}>
          <Text style={boletaStyles.label}>DNI / Código</Text>
          <Text style={boletaStyles.value}>{student.dni} {student.codigoEstudiante && `/ ${student.codigoEstudiante}`}</Text>
        </View>
        <View style={boletaStyles.infoItem}>
          <Text style={boletaStyles.label}>Nivel / Grado</Text>
          <Text style={boletaStyles.value}>
            {student.nivelAcademico?.grado?.nivel?.nombre || '-'} - {student.nivelAcademico?.grado?.nombre || '-'}
          </Text>
        </View>
        <View style={boletaStyles.infoItem}>
          <Text style={boletaStyles.label}>Sección / Periodo</Text>
          <Text style={boletaStyles.value}>"{student.nivelAcademico.seccion}" / {periodoNombre}</Text>
        </View>
      </View>

      <Text style={boletaStyles.sectionTitle}>Resultados Académicos por Competencia</Text>

      {/* Tabla de Calificaciones */}
      <View style={boletaStyles.table}>
        <View style={boletaStyles.tableHeader}>
          <Text style={boletaStyles.areaCell}>Área Curricular</Text>
          <Text style={boletaStyles.competencyCell}>Competencia Evaluada</Text>
          <Text style={boletaStyles.gradeCell}>Calificación</Text>
        </View>

        {notas.map((n, i) => (
          <View key={i} style={boletaStyles.tableRow}>
            <View style={boletaStyles.areaCell}>
              <Text style={boletaStyles.areaText}>{n.area}</Text>
            </View>
            <View style={boletaStyles.competencyCell}>
              <Text style={boletaStyles.compText}>{n.competencia}</Text>
            </View>
            <View style={boletaStyles.gradeCell}>
              <Text style={getGradeStyle(n.notaLiteral)}>
                {n.valor !== undefined ? `${Math.round(n.valor)} - ` : ''}{n.notaLiteral || '-'}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Resumen Final */}
      <View style={boletaStyles.summarySection}>
        <Text style={[boletaStyles.label, { marginBottom: 4 }]}>Apreciación del Tutor / Observaciones</Text>
        <Text style={{ fontSize: 8, color: '#475569', minHeight: 40 }}>
          ________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________
        </Text>
      </View>

      <View style={{ marginTop: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ width: '40%', borderTopWidth: 1, borderTopColor: '#0f172a', paddingTop: 6, alignItems: 'center' }}>
          <Text style={{ fontSize: 8, fontWeight: 'bold' }}>FIRMA DEL TUTOR</Text>
        </View>
        <View style={{ width: '40%', borderTopWidth: 1, borderTopColor: '#0f172a', paddingTop: 6, alignItems: 'center' }}>
          <Text style={{ fontSize: 8, fontWeight: 'bold' }}>FIRMA DEL DIRECTOR</Text>
        </View>
      </View>

    </DocumentWrapper>
  )
}
