"use client"

import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'

// Estilos para la libreta de notas - Rediseño Peruano
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 8,
    fontFamily: 'Helvetica',
    color: '#1e293b',
  },
  mainBorder: {
    borderWidth: 1.5,
    borderColor: '#334155',
    padding: 15,
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#334155',
    paddingBottom: 5,
  },
  schoolInfo: {
    flex: 1,
  },
  schoolName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    textTransform: 'uppercase',
  },
  reportTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#f1f5f9',
    paddingVertical: 4,
    marginVertical: 10,
    textTransform: 'uppercase',
    color: '#334155',
  },
  studentInfo: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    padding: 8,
    marginBottom: 15,
  },
  infoCol: {
    flex: 1,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  label: {
    width: 80,
    fontWeight: 'bold',
    color: '#64748b',
    textTransform: 'uppercase',
    fontSize: 7,
  },
  value: {
    flex: 1,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#334155',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    minHeight: 18,
    alignItems: 'center',
  },
  rowHeader: {
    backgroundColor: '#0f172a',
  },
  colCourse: { width: '35%', paddingLeft: 5, borderRightWidth: 1, borderRightColor: '#cbd5e1' },
  colBim: { width: '10%', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#cbd5e1' },
  colAvg: { width: '12%', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#cbd5e1', fontWeight: 'bold' },
  colRec: { width: '13%', textAlign: 'center', fontWeight: 'bold' },
  headerText: { color: 'white', fontWeight: 'bold', fontSize: 7, textAlign: 'center' },
  cellText: { fontSize: 8 },
  gradeText: { fontSize: 8, textAlign: 'center' },
  specialRow: {
    backgroundColor: '#f8fafc',
  },
  bottomGrid: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  obsSection: {
    flex: 2,
    borderWidth: 1,
    borderColor: '#334155',
  },
  obsHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    backgroundColor: '#f1f5f9',
  },
  obsTitle: { flex: 1, textAlign: 'center', fontWeight: 'bold', padding: 2 },
  obsRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#cbd5e1', height: 25 },
  obsLabel: { width: 80, padding: 4, borderRightWidth: 1, borderRightColor: '#cbd5e1', fontSize: 7, fontWeight: 'bold' },
  obsValue: { flex: 1, padding: 4 },
  statusTable: {
    flex: 3,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statusHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  statusCell: { flex: 1, textAlign: 'center', padding: 2, borderRightWidth: 1, borderRightColor: '#334155', fontWeight: 'bold' },
  signatureArea: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#334155',
    width: 140,
    textAlign: 'center',
    paddingTop: 4,
    fontSize: 7,
  }
})

interface GradeReportPDFProps {
  data: {
    estudiante: {
      nombreCompleto: string
      dni: string
      codigo: string
      grado: string
      seccion: string
      nivel: string
      institucion: string
    }
    periodos: any[]
    cursos: any[]
    anioAcademico: number
    resumen: {
      puntajes: number[]
      promedios: number[]
    }
  }
}

export const GradeReportPDF = ({ data }: GradeReportPDFProps) => {
  const { estudiante, periodos, cursos, resumen } = data

  const bimestres = [0, 1, 2, 3].map(i => periodos[i] || { id: `empty-${i}`, nombre: `${i + 1}° Bimestre` })

  return (
    <Document title={`Libreta-${estudiante.dni}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.mainBorder}>
          <View style={styles.header}>
            <View style={styles.schoolInfo}>
              <Text style={styles.schoolName}>{estudiante.institucion}</Text>
              <Text style={{ fontSize: 7, color: '#64748b' }}>SISTEMA DE GESTIÓN ACADÉMICA</Text>
            </View>
            <View style={{ textAlign: 'right' }}>
              <Text style={{ fontSize: 10, fontWeight: 'bold' }}>AÑO ACADÉMICO {data.anioAcademico}</Text>
            </View>
          </View>

          <Text style={styles.reportTitle}>Libreta de Notas Informativa</Text>

          <View style={styles.studentInfo}>
            <View style={styles.infoCol}>
              <View style={styles.infoItem}>
                <Text style={styles.label}>Estudiante:</Text>
                <Text style={styles.value}>{estudiante.nombreCompleto}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.label}>Nivel / Grado:</Text>
                <Text style={styles.value}>{estudiante.nivel} - {estudiante.grado}</Text>
              </View>
            </View>
            <View style={styles.infoCol}>
              <View style={styles.infoItem}>
                <Text style={styles.label}>DNI / Código:</Text>
                <Text style={styles.value}>{estudiante.dni} / {estudiante.codigo || 'S/C'}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.label}>Sección:</Text>
                <Text style={styles.value}>"{estudiante.seccion}"</Text>
              </View>
            </View>
          </View>

          <View style={styles.table}>
            <View style={[styles.tableRow, styles.rowHeader]}>
              <View style={styles.colCourse}><Text style={styles.headerText}>ASIGNATURAS</Text></View>
              {bimestres.map((b, i) => (
                <View key={b.id} style={styles.colBim}><Text style={styles.headerText}>{i + 1}°</Text></View>
              ))}
              <View style={styles.colAvg}><Text style={styles.headerText}>Prom. Anual</Text></View>
              <View style={styles.colRec}><Text style={styles.headerText}>Nota Recup.</Text></View>
            </View>

            {cursos.map((c) => (
              <View key={c.cursoId} style={styles.tableRow}>
                <View style={styles.colCourse}><Text style={styles.cellText}>{c.cursoNombre}</Text></View>
                {bimestres.map((b) => {
                  const p = c.periodos.find((per: any) => per.periodoId === b.id)
                  return (
                    <View key={b.id} style={styles.colBim}>
                      <Text style={[styles.gradeText, { color: p?.promedio < 11 && p?.promedio > 0 ? '#ef4444' : '#0f172a' }]}>
                        {p?.promedio > 0 ? `${p.promedio} ${p.literal}` : ''}
                      </Text>
                    </View>
                  )
                })}
                <View style={styles.colAvg}>
                  <Text style={[styles.gradeText, { fontWeight: 'bold' }]}>
                    {c.promedioFinal > 0 ? `${c.promedioFinal} ${c.literalFinal}` : '-'}
                  </Text>
                </View>
                <View style={styles.colRec}><Text style={styles.gradeText}>-</Text></View>
              </View>
            ))}

            <View style={[styles.tableRow, styles.specialRow]}>
              <View style={styles.colCourse}><Text style={{ fontWeight: 'bold', fontSize: 7, paddingLeft: 5 }}>PUNTAJE</Text></View>
              {bimestres.map((b, i) => (
                <View key={b.id} style={styles.colBim}><Text style={styles.gradeText}>{resumen.puntajes[i] || ''}</Text></View>
              ))}
              <View style={styles.colAvg}><Text>-</Text></View>
              <View style={styles.colRec}><Text>-</Text></View>
            </View>

            <View style={[styles.tableRow, styles.specialRow]}>
              <View style={styles.colCourse}><Text style={{ fontWeight: 'bold', fontSize: 7, paddingLeft: 5 }}>PROMEDIO</Text></View>
              {bimestres.map((b, i) => (
                <View key={b.id} style={styles.colBim}><Text style={styles.gradeText}>{resumen.promedios[i] || ''}</Text></View>
              ))}
              <View style={styles.colAvg}><Text>-</Text></View>
              <View style={styles.colRec}><Text>-</Text></View>
            </View>

            <View style={styles.tableRow}>
              <View style={styles.colCourse}><Text style={{ fontSize: 7, paddingLeft: 5 }}>ORDEN DE MÉRITO</Text></View>
              {bimestres.map((b) => <View key={b.id} style={styles.colBim}><Text>-</Text></View>)}
              <View style={styles.colAvg}><Text>-</Text></View>
              <View style={styles.colRec}><Text>-</Text></View>
            </View>

            <View style={styles.tableRow}>
              <View style={styles.colCourse}><Text style={{ fontSize: 7, paddingLeft: 5 }}>COMPORTAMIENTO</Text></View>
              {bimestres.map((b) => <View key={b.id} style={styles.colBim}><Text>-</Text></View>)}
              <View style={styles.colAvg}><Text>-</Text></View>
              <View style={styles.colRec}><Text>-</Text></View>
            </View>

            <View style={styles.tableRow}>
              <View style={styles.colCourse}><Text style={{ fontSize: 7, paddingLeft: 5 }}>INASISTENCIAS</Text></View>
              {bimestres.map((b) => <View key={b.id} style={styles.colBim}><Text>0</Text></View>)}
              <View style={styles.colAvg}><Text>-</Text></View>
              <View style={styles.colRec}><Text>-</Text></View>
            </View>
          </View>

          <View style={styles.bottomGrid}>
            <View style={styles.obsSection}>
               <View style={styles.obsHeader}>
                 <Text style={[styles.obsTitle, { width: 80, borderRightWidth: 1, borderRightColor: '#334155' }]}>FIRMA PADRE</Text>
                 <Text style={styles.obsTitle}>OBSERVACIONES</Text>
               </View>
               {[1,2,3,4].map(i => (
                 <View key={i} style={styles.obsRow}>
                   <View style={styles.obsLabel}><Text>{i}° Bimestre</Text></View>
                   <View style={styles.obsValue}><Text></Text></View>
                 </View>
               ))}
            </View>

            <View style={styles.statusTable}>
              <View style={styles.statusHeader}>
                 <Text style={[styles.statusCell, { flex: 2 }]}>PROMOVIDOS</Text>
                 <Text style={styles.statusCell}>RECUPERACIÓN</Text>
                 <Text style={styles.statusCell}>REPITEN</Text>
              </View>
              <View style={{ flexDirection: 'row', height: 60 }}>
                 <View style={{ flex: 2, borderRightWidth: 1, borderColor: '#334155', padding: 5 }}>
                    <Text style={{ fontSize: 6 }}>ALUMNOS QUE OBTIENEN "AD", "A" O "B" EN TODAS LAS ÁREAS</Text>
                 </View>
                 <View style={{ flex: 1, borderRightWidth: 1, borderColor: '#334155', padding: 5 }}></View>
                 <View style={{ flex: 1, padding: 5 }}>
                    <Text style={{ fontSize: 6 }}>OBTIENEN "C" EN MÁS DE 3 ÁREAS</Text>
                 </View>
              </View>
            </View>
          </View>

          <View style={styles.signatureArea}>
            <View style={styles.signatureLine}><Text>PROFESOR(A)</Text></View>
            <View style={styles.signatureLine}><Text>DIRECTOR(A)</Text></View>
          </View>
        </View>
      </Page>
    </Document>
  )
}
