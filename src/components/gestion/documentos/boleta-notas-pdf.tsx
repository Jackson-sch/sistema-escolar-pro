import React from 'react'
import { Text, View } from '@react-pdf/renderer'
import { DocumentWrapper } from './document-wrapper'
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
  notas: any[]
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
  const studentFull = formatTitleCase(`${student.apellidoPaterno || ''} ${student.apellidoMaterno || ''}, ${student.name || ''}`)
  const gradoNombre = student.nivelAcademico?.grado?.nombre || '-'
  const nivelNombre = student.nivelAcademico?.grado?.nivel?.nombre || '-'
  const seccion = student.nivelAcademico?.seccion || '-'

  const getLiteralBadge = (literal?: string) => {
    switch (literal) {
      case 'AD': return { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' }
      case 'A':  return { bg: '#dbeafe', text: '#1d4ed8', border: '#bfdbfe' }
      case 'B':  return { bg: '#fef3c7', text: '#b45309', border: '#fde68a' }
      case 'C':  return { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca' }
      default:   return { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' }
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
      {/* Datos del Estudiante Card */}
      <View style={{ backgroundColor: '#f8fafc', borderRadius: 6, borderWidth: 1, borderColor: '#e2e8f0', padding: 8, marginVertical: 8 }}>
        <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#0f172a', textTransform: 'uppercase', marginBottom: 5 }}>
          INFORMACIÓN ACADÉMICA DEL ESTUDIANTE
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <View style={{ width: '50%', marginBottom: 4 }}>
            <Text style={{ fontSize: 5.5, color: '#64748b', fontWeight: 'bold' }}>ESTUDIANTE:</Text>
            <Text style={{ fontSize: 7.5, fontWeight: 'bold', color: '#0f172a', marginTop: 1 }}>{studentFull}</Text>
          </View>
          <View style={{ width: '50%', marginBottom: 4 }}>
            <Text style={{ fontSize: 5.5, color: '#64748b', fontWeight: 'bold' }}>DNI / CÓDIGO:</Text>
            <Text style={{ fontSize: 7.5, fontWeight: 'bold', color: '#0f172a', marginTop: 1 }}>
              {student.dni} {student.codigoEstudiante ? `/ ${student.codigoEstudiante}` : ''}
            </Text>
          </View>
          <View style={{ width: '50%' }}>
            <Text style={{ fontSize: 5.5, color: '#64748b', fontWeight: 'bold' }}>NIVEL Y GRADO:</Text>
            <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#0f172a', marginTop: 1 }}>
              {nivelNombre.toUpperCase()} - {gradoNombre}
            </Text>
          </View>
          <View style={{ width: '50%' }}>
            <Text style={{ fontSize: 5.5, color: '#64748b', fontWeight: 'bold' }}>SECCIÓN Y PERIODO:</Text>
            <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#2563eb', marginTop: 1 }}>
              SECCIÓN "{seccion}" / {periodoNombre.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {/* Tabla de Calificaciones */}
      <View style={{ marginVertical: 6 }}>
        <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#0f172a', textTransform: 'uppercase', marginBottom: 4 }}>
          RESULTADOS ACADÉMICOS POR COMPETENCIA
        </Text>

        {/* Encabezado de Tabla */}
        <View style={{ flexDirection: 'row', backgroundColor: '#0f172a', paddingVertical: 4, paddingHorizontal: 6, borderRadius: 3 }}>
          <Text style={{ width: '30%', fontSize: 6.5, fontWeight: 'bold', color: '#ffffff' }}>ÁREA CURRICULAR</Text>
          <Text style={{ width: '52%', fontSize: 6.5, fontWeight: 'bold', color: '#ffffff' }}>COMPETENCIA EVALUADA</Text>
          <Text style={{ width: '18%', fontSize: 6.5, fontWeight: 'bold', color: '#ffffff', textAlign: 'center' }}>CALIFICACIÓN</Text>
        </View>

        {/* Filas de Notas */}
        {notas.map((n, index) => {
          const badgeStyle = getLiteralBadge(n.notaLiteral)
          return (
            <View
              key={`${n.area}-${n.competencia}-${index}`}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 5,
                paddingHorizontal: 6,
                borderBottomWidth: 0.5,
                borderBottomColor: '#e2e8f0',
                backgroundColor: index % 2 === 1 ? '#f8fafc' : '#ffffff',
              }}
            >
              <Text style={{ width: '30%', fontSize: 7, fontWeight: 'bold', color: '#0f172a', paddingRight: 4 }}>
                {n.area}
              </Text>
              <Text style={{ width: '52%', fontSize: 6.5, color: '#334155', paddingRight: 4 }}>
                {n.competencia}
              </Text>
              <View style={{ width: '18%', alignItems: 'center' }}>
                <View
                  style={{
                    backgroundColor: badgeStyle.bg,
                    borderWidth: 0.5,
                    borderColor: badgeStyle.border,
                    paddingVertical: 1.5,
                    paddingHorizontal: 6,
                    borderRadius: 3,
                  }}
                >
                  <Text style={{ fontSize: 7, fontWeight: 'bold', color: badgeStyle.text }}>
                    {n.valor !== undefined && n.valor !== null ? `${Math.round(n.valor)} - ` : ''}
                    {n.notaLiteral || '-'}
                  </Text>
                </View>
              </View>
            </View>
          )
        })}
      </View>

      {/* Apreciación del Tutor / Observaciones */}
      <View style={{ marginVertical: 8, padding: 8, backgroundColor: '#ffffff', borderRadius: 5, borderWidth: 1, borderColor: '#e2e8f0' }}>
        <Text style={{ fontSize: 6.5, fontWeight: 'bold', color: '#475569', textTransform: 'uppercase', marginBottom: 4 }}>
          APRECIACIÓN DEL TUTOR / OBSERVACIONES:
        </Text>
        <View style={{ height: 42, borderBottomWidth: 0.5, borderBottomColor: '#cbd5e1', borderStyle: 'dashed', justifyContent: 'center' }}>
          <Text style={{ fontSize: 6, color: '#94a3b8' }}>
            Desempeño académico satisfactorio en el periodo. Continuar fortaleciendo las competencias digitales y hábito de estudio.
          </Text>
        </View>
      </View>

      {/* Firmas Oficiales - Mantenidas juntas en 1 sola página */}
      <View wrap={false} style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 22 }}>
        <View style={{ width: '38%', alignItems: 'center' }}>
          <View style={{ width: '100%', borderTopWidth: 1, borderTopColor: '#0f172a', marginBottom: 3 }} />
          <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#0f172a' }}>FIRMA DEL TUTOR</Text>
          <Text style={{ fontSize: 5.5, color: '#64748b', marginTop: 1 }}>Docente Tutor de Aula</Text>
        </View>
        <View style={{ width: '38%', alignItems: 'center' }}>
          <View style={{ width: '100%', borderTopWidth: 1, borderTopColor: '#0f172a', marginBottom: 3 }} />
          <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#0f172a' }}>FIRMA DEL DIRECTOR</Text>
          <Text style={{ fontSize: 5.5, color: '#64748b', marginTop: 1 }}>Director(a) General</Text>
        </View>
      </View>
    </DocumentWrapper>
  )
}
