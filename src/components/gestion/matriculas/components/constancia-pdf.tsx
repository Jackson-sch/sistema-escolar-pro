import { Text, View } from "@react-pdf/renderer";
import { DocumentWrapper } from "@/components/gestion/documentos/document-wrapper";
import { Heading } from "@/components/pdfx/heading/pdfx-heading";
import { Stack } from "@/components/pdfx/stack/pdfx-stack";
import { KeyValue } from "@/components/pdfx/key-value/pdfx-key-value";
import { Divider } from "@/components/pdfx/divider/pdfx-divider";
import { formatTitleCase } from "@/lib/formats";

interface ConstanciaMatriculaPDFProps {
  enrollment: {
    id: string;
    anioAcademico: number;
    estudiante: {
      name: string;
      apellidoPaterno: string;
      apellidoMaterno: string;
      dni: string;
    };
    nivelAcademico: {
      seccion: string;
      grado: { nombre: string };
      nivel: { nombre: string };
    };
  };
  institucion: any;
  verificationCode?: string;
}

export const ConstanciaMatriculaPDF = ({
  enrollment,
  institucion,
  verificationCode,
}: ConstanciaMatriculaPDFProps) => {
  console.log("🚀 ~ ConstanciaMatriculaPDF ~ institucion:", institucion)
  const studentFullName = formatTitleCase(`${enrollment.estudiante.apellidoPaterno} ${enrollment.estudiante.apellidoMaterno}, ${enrollment.estudiante.name}`);
  const today = new Date().toLocaleDateString("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <DocumentWrapper
      title="Constancia de Matrícula"
      docTypeLabel={`AÑO ACADÉMICO ${enrollment.anioAcademico}`}
      docId={enrollment.estudiante.dni}
      institucion={institucion}
      verificationCode={verificationCode}
    >
      <Stack direction="vertical" gap="md" style={{ marginTop: 10 }}>
        <Text style={{ fontSize: 11, textAlign: "justify", lineHeight: 1.45 }}>
          La Dirección de la Institución Educativa{" "}
          <Text style={{ fontWeight: 'bold' }}>
            {institucion.nombreInstitucion || institucion.nombre}
          </Text>
          , perteneciente a la {institucion.ugel || "UGEL correspondiente"},
          hace constar por medio de la presente que el estudiante:
        </Text>

        <View
          style={{
            marginVertical: 8,
            padding: 10,
            borderLeftWidth: 4,
            borderLeftColor: "#0f172a",
            backgroundColor: "#f8fafc",
            borderRadius: 4
          }}
        >
          <Heading level={3} noMargin style={{ fontSize: 14 }}>
            {studentFullName}
          </Heading>
          <Text style={{ fontSize: 10, color: "#64748b", marginTop: 4 }}>
            DOCUMENTO DE IDENTIDAD (DNI): {enrollment.estudiante.dni}
          </Text>
        </View>

        <Text style={{ fontSize: 11, textAlign: "justify", lineHeight: 1.45 }}>
          Se encuentra debidamente <Text style={{ fontWeight: 'bold' }}>MATRICULADO</Text> para cursar estudios
          correspondientes al <Text style={{ fontWeight: 'bold' }}>Año Académico {enrollment.anioAcademico}</Text>, conforme a los registros oficiales de esta casa de estudios. El
          estudiante ha quedado expedito en la siguiente ubicación académica:
        </Text>

        <Stack direction="vertical" gap="sm" style={{ marginVertical: 10, padding: 10, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8 }}>
          <Heading level={6} color="mutedForeground" transform="uppercase" noMargin style={{ fontSize: 8, marginBottom: 4 }}>Ubicación Académica</Heading>
          <KeyValue
            size="sm"
            divided
            items={[
              { key: 'Nivel Educativo:', value: enrollment.nivelAcademico.nivel.nombre },
              { key: 'Grado / Año:', value: enrollment.nivelAcademico.grado.nombre },
              { key: 'Sección Asignada:', value: `"${enrollment.nivelAcademico.seccion}"` },
            ]}
          />
        </Stack>

        <Text style={{ fontSize: 11, textAlign: "justify", lineHeight: 1.45 }}>
          En fe de lo cual y a solicitud verbal de la parte interesada, se firma y
          sella la presente para los fines que el interesado estime conveniente.
        </Text>

        <Text style={{ marginTop: 20, textAlign: "right", fontSize: 11 }}>
          {institucion.distrito || "Ciudad"}, {today}
        </Text>

        {/* Firma */}
        <Stack direction="vertical" align="center" style={{ marginTop: 60 }}>
          <View style={{ width: 220 }}>
            <Divider color="#0f172a" spacing="none" />
            <Heading level={6} align="center" weight="bold" noMargin style={{ marginTop: 6, fontSize: 10 }}>LA DIRECCIÓN</Heading>
            <Text style={{ fontSize: 8, color: "#64748b", textAlign: 'center' }}>
              {institucion.nombreInstitucion || institucion.nombre}
            </Text>
          </View>
        </Stack>
      </Stack>
    </DocumentWrapper>
  );
};
