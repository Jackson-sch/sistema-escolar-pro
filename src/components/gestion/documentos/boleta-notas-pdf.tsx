import React from 'react'
import { Text, View } from '@react-pdf/renderer'
import { DocumentWrapper } from './document-wrapper'
import { Heading } from '@/components/pdfx/heading/pdfx-heading'
import { KeyValue } from '@/components/pdfx/key-value/pdfx-key-value'
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/pdfx/table/pdfx-table'
import { Stack } from '@/components/pdfx/stack/pdfx-stack'
import { Divider } from '@/components/pdfx/divider/pdfx-divider'
import { formatTitleCase } from '@/lib/formats'

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

const getGradeColor = (grade?: string) => {
  switch (grade) {
    case 'AD': return '#059669' // Success
    case 'A': return '#2563eb'  // Primary/Info
    case 'B': return '#d97706'  // Warning
    case 'C': return '#dc2626'  // Destructive
    default: return '#64748b'
  }
}

export const BoletaNotasPDF = ({
  student,
  notas,
  periodoNombre,
  anioAcademico,
  institucion,
  verificationCode
}: BoletaNotasPDFProps) => {
  const studentFull = formatTitleCase(`${student.apellidoPaterno} ${student.apellidoMaterno}, ${student.name}`)

  return (
    <DocumentWrapper
      title="Boleta de Información del Estudiante"
      docTypeLabel={`Año Escolar ${anioAcademico}`}
      docId={student.codigoEstudiante || student.dni}
      institucion={institucion}
      verificationCode={verificationCode}
    >
      {/* Datos del Estudiante */}
      <Stack direction="vertical" gap="md" style={{ marginBottom: 20 }}>
        <Heading level={4}>Datos del Estudiante</Heading>
        <KeyValue
          size="sm"
          divided
          direction="horizontal"
          items={[
            { key: 'Estudiante:', value: studentFull },
            { key: 'DNI / Código:', value: `${student.dni} ${student.codigoEstudiante ? `/ ${student.codigoEstudiante}` : ''}` },
            { key: 'Nivel / Grado:', value: `${student.nivelAcademico?.grado?.nivel?.nombre || '-'} - ${student.nivelAcademico?.grado?.nombre || '-'}` },
            { key: 'Sección / Periodo:', value: `"${student.nivelAcademico.seccion}" / ${periodoNombre}` },
          ]}
        />
      </Stack>

      <Divider spacing="md" />

      {/* Tabla de Calificaciones */}
      <Stack direction="vertical" gap="md" style={{ marginBottom: 20 }}>
        <Heading level={4}>Resultados Académicos por Competencia</Heading>
        <Table variant="bordered" zebraStripe>
          <TableHeader>
            <TableRow header>
              <TableCell width="35%">Área Curricular</TableCell>
              <TableCell width="45%">Competencia Evaluada</TableCell>
              <TableCell width="20%" align="center">Calificación</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notas.map((n) => (
              <TableRow key={`${n.area}-${n.competencia}`}>
                <TableCell width="35%">
                  <Text style={{ fontSize: 9, fontWeight: 'bold' }}>{n.area}</Text>
                </TableCell>
                <TableCell width="45%">
                  <Text style={{ fontSize: 8, color: '#4b5563' }}>{n.competencia}</Text>
                </TableCell>
                <TableCell width="20%" align="center">
                  <Text style={{ fontSize: 10, fontWeight: 'bold', color: getGradeColor(n.notaLiteral) }}>
                    {n.valor !== undefined ? `${Math.round(n.valor)} - ` : ''}{n.notaLiteral || '-'}
                  </Text>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Stack>

      {/* Resumen Final */}
      <Stack direction="vertical" gap="sm" style={{ marginTop: 20, padding: 12, backgroundColor: '#f8fafc', borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' }}>
        <Heading level={6} color="mutedForeground" transform="uppercase">Apreciación del Tutor / Observaciones</Heading>
        <View style={{ minHeight: 60, borderBottomWidth: 0.5, borderBottomColor: '#cbd5e1', borderStyle: 'dashed', marginTop: 8 }} />
      </Stack>

      {/* Firmas */}
      <Stack direction="horizontal" justify="between" style={{ marginTop: 60 }}>
        <Stack direction="vertical" align="center" style={{ width: '40%' }}>
          <Divider color="#0f172a" />
          <Heading level={6} weight="bold" style={{ marginTop: 4 }}>FIRMA DEL TUTOR</Heading>
        </Stack>
        <Stack direction="vertical" align="center" style={{ width: '40%' }}>
          <Divider color="#0f172a" />
          <Heading level={6} weight="bold" style={{ marginTop: 4 }}>FIRMA DEL DIRECTOR</Heading>
        </Stack>
      </Stack>
    </DocumentWrapper>
  )
}
