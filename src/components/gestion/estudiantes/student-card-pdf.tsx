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

// Dimensiones estándar CR80 (85.6mm x 53.98mm) convertidas a puntos
const CARD_WIDTH = 242.6 // ~85.6mm
const CARD_HEIGHT = 153 // ~54mm

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    padding: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#ffffff',
  },
  // Diseño de fondo (Acento superior)
  accentTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 45,
    backgroundColor: '#0f172a', // Color primario oscuro
  },
  header: {
    flexDirection: 'row',
    padding: 8,
    alignItems: 'center',
    zIndex: 10,
  },
  logo: {
    width: 25,
    height: 25,
    marginRight: 6,
  },
  schoolInfo: {
    flex: 1,
  },
  schoolName: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  schoolSub: {
    fontSize: 5,
    color: '#94a3b8',
  },
  content: {
    flexDirection: 'row',
    padding: 10,
    paddingTop: 15,
    flex: 1,
  },
  photoContainer: {
    width: 60,
    height: 75,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#0f172a',
    backgroundColor: '#f1f5f9',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  infoContainer: {
    flex: 1,
    paddingLeft: 10,
    justifyContent: 'center',
  },
  studentLabel: {
    fontSize: 5,
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 1,
  },
  studentName: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
    lineHeight: 1.1,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  detailCol: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 4.5,
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 6.5,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  dniBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#f1f5f9',
    padding: '2 5',
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
  },
  dniValue: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#0f172a',
    fontFamily: 'Helvetica-Bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#0f172a',
  },
  // Reverso del Carnet
  backCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backTitle: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#0f172a',
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  backText: {
    fontSize: 5,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 1.4,
  },
  qrPlaceholder: {
    width: 40,
    height: 40,
    backgroundColor: '#000000',
    marginVertical: 5,
  },
  backFooter: {
    fontSize: 4,
    color: '#94a3b8',
    marginTop: 5,
  }
})

interface StudentCardPDFProps {
  student: {
    name: string
    apellidoPaterno: string
    apellidoMaterno: string
    dni: string
    image?: string | null
    nivelAcademico?: {
      seccion: string
      grado: { nombre: string }
      nivel: { nombre: string }
    }
  }
  institucion: {
    nombreInstitucion: string
    lema?: string
    codigoModular?: string
  }
}

export const StudentCardPDF = ({ student, institucion }: StudentCardPDFProps) => {
  const fullName = `${student.name}`
  const lastNames = `${student.apellidoPaterno} ${student.apellidoMaterno}`

  return (
    <Document title={`Carnet-${student.dni}`}>
      <Page size="A4" style={styles.page}>
        {/* Lado Frontal */}
        <View style={styles.cardContainer}>
          <View style={styles.accentTop} />

          <View style={styles.header}>
            <View style={styles.schoolInfo}>
              <Text style={styles.schoolName}>{institucion.nombreInstitucion}</Text>
              <Text style={styles.schoolSub}>CARNET ESTUDIANTIL {new Date().getFullYear()}</Text>
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.photoContainer}>
              {student.image ? (
                <Image src={student.image} style={styles.photo} />
              ) : (
                <Text style={{ fontSize: 15, color: '#CBD5E1', fontWeight: 'bold' }}>
                  {student.name.charAt(0)}{student.apellidoPaterno.charAt(0)}
                </Text>
              )}
            </View>

            <View style={styles.infoContainer}>
              <View style={{ marginBottom: 5 }}>
                <Text style={styles.studentLabel}>Estudiante</Text>
                <Text style={styles.studentName}>{fullName}</Text>
                <Text style={[styles.studentName, { marginTop: -2 }]}>{lastNames}</Text>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailCol}>
                  <Text style={styles.detailLabel}>Nivel</Text>
                  <Text style={styles.detailValue}>{student.nivelAcademico?.nivel.nombre || 'N/A'}</Text>
                </View>
                <View style={styles.detailCol}>
                  <Text style={styles.detailLabel}>Grado</Text>
                  <Text style={styles.detailValue}>{student.nivelAcademico?.grado.nombre || 'N/A'}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailCol}>
                  <Text style={styles.detailLabel}>Sección</Text>
                  <Text style={styles.detailValue}>"{student.nivelAcademico?.seccion || '-'}"</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.dniBadge}>
            <Text style={styles.dniValue}>DNI {student.dni}</Text>
          </View>

          <View style={styles.footer} />
        </View>

        {/* Lado Posterior (Reverso) */}
        <View style={styles.backCard}>
          <Text style={styles.backTitle}>Condiciones de Uso</Text>

          <Text style={styles.backText}>
            Este carnet es personal e intransferible. Identifica al portador como estudiante regular de nuestra institución.
            En caso de pérdida, informar inmediatamente a la secretaría académica.
          </Text>

          <View style={styles.qrPlaceholder} />
          <Text style={{ fontSize: 4, color: '#000' }}>VALIDACIÓN DIGITAL</Text>

          <View style={{ width: '100%', borderTopWidth: 0.5, borderTopColor: '#e2e8f0', paddingTop: 4, alignItems: 'center' }}>
            <Text style={styles.backText}>Código Modular: {institucion.codigoModular || '---'}</Text>
            <Text style={styles.backFooter}>Generado por SGE PRO © {new Date().getFullYear()}</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
