import {
  Text,
  View,
} from '@react-pdf/renderer'
import { DocumentWrapper } from '@/components/gestion/documentos/document-wrapper'
import { Heading } from '@/components/pdfx/heading/pdfx-heading'
import { Stack } from '@/components/pdfx/stack/pdfx-stack'
import { KeyValue } from '@/components/pdfx/key-value/pdfx-key-value'
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/pdfx/table/pdfx-table'
import { Divider } from '@/components/pdfx/divider/pdfx-divider'
import { formatTitleCase } from '@/lib/formats'

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
      institucionCompleta?: any
      logo?: string
    }
    periodos: any[]
    cursos: any[]
    anioAcademico: number
    resumen: {
      puntajes: number[]
      promedios: number[]
    }
    origin?: string
  }
}

const getGradeColor = (val: number) => {
  if (val >= 18) return '#059669' // AD - Success
  if (val >= 15) return '#2563eb' // A - Primary
  if (val >= 11) return '#d97706' // B - Warning
  return '#dc2626'               // C - Destructive
}

export const GradeReportPDF = ({ data }: GradeReportPDFProps) => {
  const { 
    estudiante = { dni: 'S/D', institucion: 'I.E.' } as any, 
    periodos = [], 
    cursos = [], 
    resumen = { puntajes: [], promedios: [] } 
  } = data || {}
  
  const studentNameCapitalized = formatTitleCase(estudiante.nombreCompleto || '')
  const bimestres = [0, 1, 2, 3].map(i => periodos[i] || { id: `empty-${i}`, nombre: `${i + 1}° Bimestre` })
  const verificationCode = `LIB-${estudiante.dni}-${data?.anioAcademico || '2025'}`

  return (
    <DocumentWrapper
      title="Libreta de Notas Informativa"
      docTypeLabel={`Año Académico ${data?.anioAcademico || '2025'}`}
      docId={estudiante.codigo || estudiante.dni}
      verificationCode={verificationCode}
      origin={data.origin}
      institucion={{
        ...(data.estudiante.institucionCompleta || {}),
        nombreInstitucion: data.estudiante.institucionCompleta?.nombreInstitucion || data.estudiante.institucion,
        direccion: data.estudiante.institucionCompleta?.direccion || 'S/D',
        logo: data.estudiante.institucionCompleta?.logo || data.estudiante.logo
      }}
    >
      {/* Datos del Estudiante */}
      <Stack direction="vertical" gap="sm" style={{ marginBottom: 10, marginTop: 10 }}>
        <Heading level={4}>Datos del Estudiante</Heading>
        <KeyValue
          size="sm"
          divided
          direction="horizontal"
          items={[
            { key: 'Estudiante:', value: studentNameCapitalized },
            { key: 'DNI / Código:', value: `${estudiante.dni} / ${estudiante.codigo || 'S/C'}` },
            { key: 'Nivel / Grado:', value: `${estudiante.nivel} - ${estudiante.grado}` },
            { key: 'Sección:', value: `"${estudiante.seccion}"` },
          ]}
        />
      </Stack>

      {/* Tabla de Calificaciones */}
      <Table variant="bordered" zebraStripe>
        <TableHeader>
          <TableRow header>
            <TableCell width="35%">ASIGNATURAS</TableCell>
            <TableCell width="8%" align="center">1º</TableCell>
            <TableCell width="8%" align="center">2º</TableCell>
            <TableCell width="8%" align="center">3º</TableCell>
            <TableCell width="8%" align="center">4º</TableCell>
            <TableCell width="15%" align="center">PROM. ANUAL</TableCell>
            <TableCell width="18%" align="center">SITUACIÓN</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cursos.map((c) => (
            <TableRow key={c.cursoId}>
              <TableCell width="35%">
                <Text style={{ fontSize: 9, fontWeight: 'bold' }}>{c.cursoNombre}</Text>
              </TableCell>
              {bimestres.map((b) => {
                const p = c.periodos.find((per: any) => per.periodoId === b.id)
                return (
                  <TableCell key={b.id} width="8%" align="center">
                    <Text style={{ fontSize: 8, color: p?.promedio > 0 ? getGradeColor(p.promedio) : '#1e293b' }}>
                      {p?.promedio > 0 ? p.literal : ''}
                    </Text>
                  </TableCell>
                )
              })}
              <TableCell width="15%" align="center">
                <Text style={{ fontSize: 9, fontWeight: 'bold', color: c.promedioFinal > 0 ? getGradeColor(c.promedioFinal) : '#1e293b' }}>
                  {c.promedioFinal > 0 ? c.literalFinal : '-'}
                </Text>
              </TableCell>
              <TableCell width="18%" align="center">
                <Text style={{ fontSize: 7, color: '#64748b' }}>-</Text>
              </TableCell>
            </TableRow>
          ))}

          {/* Fila de Puntajes */}
          <TableRow style={{ backgroundColor: '#f1f5f9' }}>
            <TableCell width="35%"><Text style={{ fontSize: 8, fontWeight: 'bold' }}>PUNTAJE BIMESTRAL</Text></TableCell>
            {bimestres.map((b, i) => (
              <TableCell key={b.id} width="8%" align="center"><Text style={{ fontSize: 8 }}>{resumen.puntajes[i] || '-'}</Text></TableCell>
            ))}
            <TableCell width="15%" align="center"><Text>-</Text></TableCell>
            <TableCell width="18%" align="center"><Text>-</Text></TableCell>
          </TableRow>

          {/* Fila de Promedios */}
          <TableRow style={{ backgroundColor: '#f1f5f9' }}>
            <TableCell width="35%"><Text style={{ fontSize: 8, fontWeight: 'bold' }}>PROMEDIO BIMESTRAL</Text></TableCell>
            {bimestres.map((b, i) => (
              <TableCell key={b.id} width="8%" align="center"><Text style={{ fontSize: 8 }}>{resumen.promedios[i] || '-'}</Text></TableCell>
            ))}
            <TableCell width="15%" align="center"><Text>-</Text></TableCell>
            <TableCell width="18%" align="center"><Text>-</Text></TableCell>
          </TableRow>
        </TableBody>
      </Table>

      {/* Resumen y Observaciones */}
      <Stack direction="horizontal" gap="md" style={{ marginTop: 20 }}>
        <Stack direction="vertical" gap="sm" style={{ flex: 1, padding: 10, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 6 }}>
          <Heading level={6} transform="uppercase" color="mutedForeground">Observaciones por Periodo</Heading>
          {[1,2,3,4].map(i => (
            <Stack key={i} direction="horizontal" gap="md" style={{ borderBottomWidth: 0.5, borderBottomColor: '#f1f5f9', paddingVertical: 4 }}>
              <Text style={{ fontSize: 7, width: 60, fontWeight: 'bold' }}>{i}º Bimestre:</Text>
              <View style={{ flex: 1, height: 10 }} />
            </Stack>
          ))}
        </Stack>

        <Stack direction="vertical" gap="sm" style={{ flex: 1, padding: 10, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 6 }}>
          <Heading level={6} transform="uppercase" color="mutedForeground">Escala de Calificación</Heading>
          <Stack direction="vertical" gap="md">
            <Text style={{ fontSize: 7 }}><Text style={{ fontWeight: 'bold', color: '#059669' }}>AD (Logro Destacado):</Text> 18 - 20</Text>
            <Text style={{ fontSize: 7 }}><Text style={{ fontWeight: 'bold', color: '#2563eb' }}>A (Logro Previsto):</Text> 14 - 17</Text>
            <Text style={{ fontSize: 7 }}><Text style={{ fontWeight: 'bold', color: '#d97706' }}>B (En Proceso):</Text> 11 - 13</Text>
            <Text style={{ fontSize: 7 }}><Text style={{ fontWeight: 'bold', color: '#dc2626' }}>C (En Inicio):</Text> 00 - 10</Text>
          </Stack>
        </Stack>
      </Stack>

      {/* Firmas */}
      <Stack direction="horizontal" justify="around" style={{ marginTop: 60 }}>
        <Stack direction="vertical" align="center" style={{ width: '35%' }}>
          <Divider color="#334155" />
          <Text style={{ fontSize: 8, fontWeight: 'bold', marginTop: 4 }}>FIRMA DEL DOCENTE</Text>
        </Stack>
        <Stack direction="vertical" align="center" style={{ width: '35%' }}>
          <Divider color="#334155" />
          <Text style={{ fontSize: 8, fontWeight: 'bold', marginTop: 4 }}>FIRMA DEL DIRECTOR</Text>
        </Stack>
      </Stack>
    </DocumentWrapper>
  )
}
