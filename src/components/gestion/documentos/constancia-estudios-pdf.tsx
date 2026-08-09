import React from 'react'
import { Text, View } from '@react-pdf/renderer'
import { DocumentWrapper } from './document-wrapper'
import { Heading } from '@/components/pdfx/heading/pdfx-heading'
import { Stack } from '@/components/pdfx/stack/pdfx-stack'
import { Divider } from '@/components/pdfx/divider/pdfx-divider'
import { formatTitleCase } from '@/lib/formats'

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
  const studentFull = formatTitleCase(`${student.apellidoPaterno} ${student.apellidoMaterno}, ${student.name}`)
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
      <Stack direction="vertical" gap="lg" style={{ marginTop: 20 }}>
        <Text style={{ fontSize: 11, textAlign: 'justify', lineHeight: 1.8 }}>
          EL QUE SUSCRIBE, DIRECTOR DE LA INSTITUCIÓN EDUCATIVA <Text style={{ fontWeight: 'bold' }}>{"\u0022"}{institucion.nombreInstitucion.toUpperCase()}{"\u0022"}</Text>, HACE CONSTAR QUE:
        </Text>

        <Text style={{ fontSize: 11, textAlign: 'justify', lineHeight: 1.8 }}>
          El(la) estudiante <Text style={{ fontWeight: 'bold' }}>{studentFull}</Text>, identificado(a) con DNI N° {student.dni}, se encuentra matriculado(a) en nuestra institución educativa en el:
        </Text>

        <View style={{ padding: 15, backgroundColor: '#f8fafc', borderRadius: 6, borderWidth: 1, borderColor: '#e2e8f0', marginVertical: 10 }}>
          <Heading level={4} align="center" weight="bold" noMargin>
            {(student.nivelAcademico?.grado?.nombre || '-').toUpperCase()} DE {(student.nivelAcademico?.nivel?.nombre || '-').toUpperCase()}
          </Heading>
          <Heading level={5} align="center" noMargin color="mutedForeground">
            SECCIÓN {"\u0022"}{(student.nivelAcademico?.seccion || '-').toUpperCase()}{"\u0022"}
          </Heading>
        </View>

        <Text style={{ fontSize: 11, textAlign: 'justify', lineHeight: 1.8 }}>
          Correspondiente al Año Académico {anioAcademico}, habiendo cumplido con los requisitos exigidos por las normas legales vigentes.
        </Text>

        <Text style={{ fontSize: 11, textAlign: 'justify', lineHeight: 1.8 }}>
          Se expide la presente constancia a solicitud de la parte interesada para los fines que estime conveniente.
        </Text>

        <Text style={{ marginTop: 24, textAlign: 'right', fontSize: 11 }}>
          Ciudad, {dateStr}
        </Text>

        {/* Firma */}
        <Stack direction="vertical" align="center" style={{ marginTop: 60 }}>
          <View style={{ width: 200 }}>
            <Divider color="#0f172a" />
            <Heading level={6} align="center" weight="bold" style={{ marginTop: 4 }}>EL DIRECTOR</Heading>
            <Text style={{ fontSize: 8, color: '#64748b', textAlign: 'center' }}>{institucion.nombreInstitucion}</Text>
          </View>
        </Stack>
      </Stack>
    </DocumentWrapper>
  )
}
