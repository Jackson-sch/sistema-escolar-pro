-- CreateEnum
CREATE TYPE "Role" AS ENUM ('estudiante', 'profesor', 'administrativo', 'padre');

-- CreateEnum
CREATE TYPE "TipoGestion" AS ENUM ('PUBLICA', 'PRIVADA', 'PARROQUIAL', 'CONVENIO');

-- CreateEnum
CREATE TYPE "Modalidad" AS ENUM ('PRESENCIAL', 'DISTANCIA', 'SEMIPRESENCIAL');

-- CreateEnum
CREATE TYPE "Turno" AS ENUM ('MANANA', 'TARDE', 'NOCHE', 'CONTINUO');

-- CreateEnum
CREATE TYPE "EscalaCalificacion" AS ENUM ('VIGESIMAL', 'LITERAL', 'DESCRIPTIVA');

-- CreateEnum
CREATE TYPE "TipoPeriodo" AS ENUM ('BIMESTRE', 'TRIMESTRE', 'SEMESTRE', 'ANUAL');

-- CreateEnum
CREATE TYPE "TipoContrato" AS ENUM ('NOMBRADO', 'CONTRATADO', 'PRATICANTE', 'SUPLENTE');

-- CreateEnum
CREATE TYPE "EscalaMagisterial" AS ENUM ('I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII');

-- CreateEnum
CREATE TYPE "EstadoProspecto" AS ENUM ('INTERESADO', 'EVALUANDO', 'ADMITIDO', 'RECHAZADO', 'MATRICULADO');

-- CreateEnum
CREATE TYPE "AlcanceCurso" AS ENUM ('SECCION_ESPECIFICA', 'TODO_EL_GRADO', 'TODO_EL_NIVEL', 'TODO_LA_INSTITUCION');

-- CreateTable
CREATE TABLE "Cargo" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "jerarquia" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "sistemico" BOOLEAN NOT NULL DEFAULT false,
    "institucionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cargo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstadoUsuario" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "color" TEXT,
    "permiteLogin" BOOLEAN NOT NULL DEFAULT true,
    "esActivo" BOOLEAN NOT NULL DEFAULT true,
    "sistemico" BOOLEAN NOT NULL DEFAULT false,
    "orden" INTEGER,
    "institucionId" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EstadoUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoDocumento" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "categoria" TEXT,
    "requiereAprobacion" BOOLEAN NOT NULL DEFAULT false,
    "plantillaDefault" TEXT,
    "formatosPermitidos" TEXT[],
    "vigencia" INTEGER,
    "sistemico" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "institucionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TipoDocumento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoEvaluacion" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "categoria" TEXT,
    "pesoMinimo" DOUBLE PRECISION,
    "pesoMaximo" DOUBLE PRECISION,
    "pesoSugerido" DOUBLE PRECISION,
    "permiteRecuperacion" BOOLEAN NOT NULL DEFAULT true,
    "requiereFecha" BOOLEAN NOT NULL DEFAULT true,
    "color" TEXT,
    "sistemico" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "institucionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TipoEvaluacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistorialEstadoUsuario" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "estadoAnteriorId" TEXT,
    "estadoNuevoId" TEXT NOT NULL,
    "motivo" TEXT,
    "observaciones" TEXT,
    "cambiadoPorId" TEXT NOT NULL,
    "fechaCambio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistorialEstadoUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permiso" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "modulo" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permiso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolPermiso" (
    "id" TEXT NOT NULL,
    "rol" "Role" NOT NULL,
    "permisoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RolPermiso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsuarioPermiso" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "permisoId" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaFin" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "UsuarioPermiso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CargoPermiso" (
    "id" TEXT NOT NULL,
    "cargoId" TEXT NOT NULL,
    "permisoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CargoPermiso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstitucionEducativa" (
    "id" TEXT NOT NULL,
    "codigoModular" TEXT NOT NULL,
    "nombreInstitucion" TEXT NOT NULL,
    "nombreComercial" TEXT,
    "tipoGestion" "TipoGestion" NOT NULL,
    "modalidad" "Modalidad" NOT NULL,
    "ugel" TEXT NOT NULL,
    "dre" TEXT NOT NULL,
    "ubigeo" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "distrito" TEXT NOT NULL,
    "provincia" TEXT NOT NULL,
    "departamento" TEXT NOT NULL,
    "telefono" TEXT,
    "email" TEXT,
    "sitioWeb" TEXT,
    "resolucionCreacion" TEXT,
    "fechaCreacion" TIMESTAMP(3),
    "resolucionActual" TEXT,
    "logo" TEXT,
    "directorId" TEXT,
    "cicloEscolarActual" INTEGER NOT NULL DEFAULT 2025,
    "fechaInicioClases" TIMESTAMP(3) NOT NULL,
    "fechaFinClases" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstitucionEducativa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "password" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'estudiante',
    "apellidoPaterno" TEXT,
    "apellidoMaterno" TEXT,
    "dni" TEXT,
    "fechaNacimiento" TIMESTAMP(3),
    "sexo" TEXT,
    "estadoCivil" TEXT,
    "nacionalidad" TEXT DEFAULT 'PERUANA',
    "direccion" TEXT,
    "ubigeo" TEXT,
    "distrito" TEXT,
    "provincia" TEXT,
    "departamento" TEXT,
    "telefono" TEXT,
    "telefonoEmergencia" TEXT,
    "codigoEstudiante" TEXT,
    "codigoSiagie" TEXT,
    "codigoModular" TEXT,
    "numeroExpediente" TEXT,
    "tipoSangre" TEXT,
    "alergias" TEXT,
    "condicionesMedicas" TEXT,
    "contactoEmergencia" TEXT,
    "cargoId" TEXT,
    "estadoId" TEXT NOT NULL,
    "area" TEXT,
    "fechaIngreso" TIMESTAMP(3),
    "fechaSalida" TIMESTAMP(3),
    "numeroContrato" TEXT,
    "nivelAcademicoId" TEXT,
    "turno" "Turno",
    "viveConPadres" BOOLEAN,
    "tipoVivienda" TEXT,
    "serviciosBasicos" TEXT,
    "transporteEscolar" BOOLEAN DEFAULT false,
    "becario" BOOLEAN DEFAULT false,
    "tipoBeca" TEXT,
    "programaSocial" TEXT,
    "especialidad" TEXT,
    "titulo" TEXT,
    "colegioProfesor" TEXT,
    "fechaContratacion" TIMESTAMP(3),
    "tipoContrato" TEXT,
    "escalaMagisterial" TEXT,
    "ocupacion" TEXT,
    "lugarTrabajo" TEXT,
    "ingresoFamiliar" TEXT,
    "gradoInstruccion" TEXT,
    "institucionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RelacionFamiliar" (
    "id" TEXT NOT NULL,
    "padreTutorId" TEXT NOT NULL,
    "hijoId" TEXT NOT NULL,
    "parentesco" TEXT NOT NULL,
    "contactoPrimario" BOOLEAN NOT NULL DEFAULT false,
    "autorizadoRecoger" BOOLEAN NOT NULL DEFAULT true,
    "viveCon" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER,

    CONSTRAINT "RelacionFamiliar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nivel" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "institucionId" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Nivel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Grado" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT,
    "orden" INTEGER NOT NULL,
    "nivelId" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Grado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NivelAcademico" (
    "id" TEXT NOT NULL,
    "seccion" TEXT NOT NULL,
    "descripcion" TEXT,
    "capacidad" INTEGER NOT NULL DEFAULT 30,
    "capacidadMaxima" INTEGER,
    "aulaAsignada" TEXT,
    "nivelId" TEXT NOT NULL,
    "gradoId" TEXT NOT NULL,
    "tutorId" TEXT,
    "institucionId" TEXT NOT NULL,
    "anioAcademico" INTEGER NOT NULL DEFAULT 2025,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "turno" "Turno" NOT NULL DEFAULT 'MANANA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NivelAcademico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PeriodoAcademico" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoPeriodo" NOT NULL,
    "numero" INTEGER NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "anioEscolar" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "institucionId" TEXT NOT NULL,

    CONSTRAINT "PeriodoAcademico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AreaCurricular" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT,
    "orden" INTEGER,
    "color" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "competenciasTexto" TEXT,
    "institucionId" TEXT NOT NULL,
    "creditos" INTEGER,
    "nivelId" TEXT,
    "parentId" TEXT,

    CONSTRAINT "AreaCurricular_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Curso" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT,
    "anioAcademico" INTEGER NOT NULL,
    "horasSemanales" INTEGER,
    "creditos" INTEGER,
    "areaCurricularId" TEXT NOT NULL,
    "nivelAcademicoId" TEXT NOT NULL,
    "gradoId" TEXT,
    "profesorId" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "alcance" "AlcanceCurso" NOT NULL DEFAULT 'SECCION_ESPECIFICA',
    "institucionId" TEXT,
    "nivelId" TEXT,

    CONSTRAINT "Curso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Horario" (
    "id" TEXT NOT NULL,
    "cursoId" TEXT NOT NULL,
    "diaSemana" INTEGER NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "aula" TEXT,

    CONSTRAINT "Horario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Matricula" (
    "id" TEXT NOT NULL,
    "numeroMatricula" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "nivelAcademicoId" TEXT NOT NULL,
    "anioAcademico" INTEGER NOT NULL,
    "fechaMatricula" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" TEXT NOT NULL DEFAULT 'activo',
    "esPrimeraVez" BOOLEAN NOT NULL DEFAULT false,
    "esRepitente" BOOLEAN NOT NULL DEFAULT false,
    "procedencia" TEXT,
    "observaciones" TEXT,

    CONSTRAINT "Matricula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatriculaCurso" (
    "id" TEXT NOT NULL,
    "matriculaId" TEXT NOT NULL,
    "cursoId" TEXT NOT NULL,
    "fechaInscripcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" TEXT NOT NULL DEFAULT 'activo',
    "userId" TEXT,

    CONSTRAINT "MatriculaCurso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evaluacion" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipoEvaluacionId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "fechaLimite" TIMESTAMP(3),
    "peso" DOUBLE PRECISION NOT NULL,
    "notaMinima" DOUBLE PRECISION,
    "escalaCalificacion" "EscalaCalificacion" NOT NULL DEFAULT 'VIGESIMAL',
    "cursoId" TEXT NOT NULL,
    "periodoId" TEXT NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "recuperable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "capacidadId" TEXT,

    CONSTRAINT "Evaluacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nota" (
    "id" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "valorLiteral" TEXT,
    "valorDescriptivo" TEXT,
    "comentario" TEXT,
    "estudianteId" TEXT NOT NULL,
    "cursoId" TEXT NOT NULL,
    "evaluacionId" TEXT NOT NULL,
    "registradoPor" TEXT,
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modificadoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Nota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asistencia" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "presente" BOOLEAN NOT NULL,
    "tardanza" BOOLEAN NOT NULL DEFAULT false,
    "horaLlegada" TEXT,
    "justificada" BOOLEAN NOT NULL DEFAULT false,
    "justificacion" TEXT,
    "estudianteId" TEXT NOT NULL,
    "cursoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "registradoPorId" TEXT,

    CONSTRAINT "Asistencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Documento" (
    "id" TEXT NOT NULL,
    "tipoDocumentoId" TEXT NOT NULL,
    "descripcion" TEXT,
    "verificado" BOOLEAN NOT NULL DEFAULT false,
    "archivoUrl" TEXT,
    "codigo" TEXT NOT NULL,
    "codigoVerificacion" TEXT,
    "contenido" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "datosAdicionales" JSONB,
    "emisorId" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'activo',
    "estudianteId" TEXT,
    "fechaEmision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaExpiracion" TIMESTAMP(3),
    "firmado" BOOLEAN NOT NULL DEFAULT false,
    "formato" TEXT NOT NULL DEFAULT 'PDF',
    "plantilla" TEXT,
    "titulo" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Documento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pago" (
    "id" TEXT NOT NULL,
    "numeroBoleta" TEXT,
    "concepto" TEXT NOT NULL,
    "descripcion" TEXT,
    "monto" DOUBLE PRECISION NOT NULL,
    "moneda" TEXT NOT NULL DEFAULT 'PEN',
    "fechaVencimiento" TIMESTAMP(3) NOT NULL,
    "fechaPago" TIMESTAMP(3),
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "metodoPago" TEXT,
    "referenciaPago" TEXT,
    "numeroOperacion" TEXT,
    "entidadBancaria" TEXT,
    "comprobante" TEXT,
    "recibo" TEXT,
    "estudianteId" TEXT NOT NULL,
    "observaciones" TEXT,
    "descuento" DOUBLE PRECISION DEFAULT 0,
    "mora" DOUBLE PRECISION DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cronogramaPagoId" TEXT,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Anuncio" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "resumen" TEXT,
    "imagen" TEXT,
    "fechaPublicacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaExpiracion" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "dirigidoA" TEXT NOT NULL,
    "importante" BOOLEAN NOT NULL DEFAULT false,
    "urgente" BOOLEAN NOT NULL DEFAULT false,
    "fijado" BOOLEAN NOT NULL DEFAULT false,
    "autorId" TEXT NOT NULL,
    "vistas" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Anuncio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evento" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "imagen" TEXT,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "horaInicio" TEXT,
    "horaFin" TEXT,
    "fechaLimiteInscripcion" TIMESTAMP(3),
    "ubicacion" TEXT,
    "aula" TEXT,
    "direccion" TEXT,
    "modalidad" TEXT,
    "enlaceVirtual" TEXT,
    "tipo" TEXT NOT NULL,
    "categoria" TEXT,
    "publico" BOOLEAN NOT NULL DEFAULT true,
    "dirigidoA" TEXT,
    "capacidadMaxima" INTEGER,
    "requiereInscripcion" BOOLEAN NOT NULL DEFAULT false,
    "organizadorId" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'programado',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Competencia" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "areaCurricularId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Competencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Capacidad" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "competenciaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Capacidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prospecto" (
    "id" TEXT NOT NULL,
    "dni" TEXT,
    "nombre" TEXT NOT NULL,
    "apellidoPaterno" TEXT NOT NULL,
    "apellidoMaterno" TEXT NOT NULL,
    "fechaNacimiento" TIMESTAMP(3),
    "email" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "gradoInteresId" TEXT NOT NULL,
    "anioPostulacion" INTEGER NOT NULL,
    "estado" "EstadoProspecto" NOT NULL DEFAULT 'INTERESADO',
    "institucionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prospecto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admision" (
    "id" TEXT NOT NULL,
    "prospectoId" TEXT NOT NULL,
    "fechaEntrevista" TIMESTAMP(3),
    "resultadoExamen" TEXT,
    "observaciones" TEXT,
    "autorizadoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FichaPsicopedagogica" (
    "id" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "especialistaId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "motivo" TEXT,
    "descripcion" TEXT NOT NULL,
    "recomendaciones" TEXT,
    "categoriaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FichaPsicopedagogica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoriaIncidente" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "CategoriaIncidente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConceptoPago" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "montoSugerido" DOUBLE PRECISION NOT NULL,
    "moneda" TEXT NOT NULL DEFAULT 'PEN',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "institucionId" TEXT NOT NULL,

    CONSTRAINT "ConceptoPago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CronogramaPago" (
    "id" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "conceptoId" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "montoPagado" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fechaVencimiento" TIMESTAMP(3) NOT NULL,
    "pagado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CronogramaPago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AnuncioToGrado" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AnuncioToGrado_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_AnuncioToNivel" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AnuncioToNivel_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_EventoToGrado" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventoToGrado_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_EventoToNivel" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventoToNivel_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cargo_codigo_key" ON "Cargo"("codigo");

-- CreateIndex
CREATE INDEX "Cargo_activo_idx" ON "Cargo"("activo");

-- CreateIndex
CREATE INDEX "Cargo_institucionId_idx" ON "Cargo"("institucionId");

-- CreateIndex
CREATE UNIQUE INDEX "Cargo_codigo_institucionId_key" ON "Cargo"("codigo", "institucionId");

-- CreateIndex
CREATE UNIQUE INDEX "EstadoUsuario_codigo_key" ON "EstadoUsuario"("codigo");

-- CreateIndex
CREATE INDEX "EstadoUsuario_esActivo_idx" ON "EstadoUsuario"("esActivo");

-- CreateIndex
CREATE INDEX "EstadoUsuario_sistemico_idx" ON "EstadoUsuario"("sistemico");

-- CreateIndex
CREATE INDEX "EstadoUsuario_institucionId_idx" ON "EstadoUsuario"("institucionId");

-- CreateIndex
CREATE UNIQUE INDEX "EstadoUsuario_codigo_institucionId_key" ON "EstadoUsuario"("codigo", "institucionId");

-- CreateIndex
CREATE UNIQUE INDEX "TipoDocumento_codigo_key" ON "TipoDocumento"("codigo");

-- CreateIndex
CREATE INDEX "TipoDocumento_categoria_idx" ON "TipoDocumento"("categoria");

-- CreateIndex
CREATE INDEX "TipoDocumento_sistemico_idx" ON "TipoDocumento"("sistemico");

-- CreateIndex
CREATE INDEX "TipoDocumento_institucionId_idx" ON "TipoDocumento"("institucionId");

-- CreateIndex
CREATE UNIQUE INDEX "TipoDocumento_codigo_institucionId_key" ON "TipoDocumento"("codigo", "institucionId");

-- CreateIndex
CREATE UNIQUE INDEX "TipoEvaluacion_codigo_key" ON "TipoEvaluacion"("codigo");

-- CreateIndex
CREATE INDEX "TipoEvaluacion_categoria_idx" ON "TipoEvaluacion"("categoria");

-- CreateIndex
CREATE INDEX "TipoEvaluacion_sistemico_idx" ON "TipoEvaluacion"("sistemico");

-- CreateIndex
CREATE INDEX "TipoEvaluacion_institucionId_idx" ON "TipoEvaluacion"("institucionId");

-- CreateIndex
CREATE UNIQUE INDEX "TipoEvaluacion_codigo_institucionId_key" ON "TipoEvaluacion"("codigo", "institucionId");

-- CreateIndex
CREATE INDEX "HistorialEstadoUsuario_usuarioId_idx" ON "HistorialEstadoUsuario"("usuarioId");

-- CreateIndex
CREATE INDEX "HistorialEstadoUsuario_fechaCambio_idx" ON "HistorialEstadoUsuario"("fechaCambio");

-- CreateIndex
CREATE UNIQUE INDEX "Permiso_codigo_key" ON "Permiso"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "RolPermiso_rol_permisoId_key" ON "RolPermiso"("rol", "permisoId");

-- CreateIndex
CREATE INDEX "UsuarioPermiso_usuarioId_idx" ON "UsuarioPermiso"("usuarioId");

-- CreateIndex
CREATE INDEX "UsuarioPermiso_permisoId_idx" ON "UsuarioPermiso"("permisoId");

-- CreateIndex
CREATE INDEX "UsuarioPermiso_activo_idx" ON "UsuarioPermiso"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "UsuarioPermiso_usuarioId_permisoId_key" ON "UsuarioPermiso"("usuarioId", "permisoId");

-- CreateIndex
CREATE INDEX "CargoPermiso_cargoId_idx" ON "CargoPermiso"("cargoId");

-- CreateIndex
CREATE INDEX "CargoPermiso_permisoId_idx" ON "CargoPermiso"("permisoId");

-- CreateIndex
CREATE UNIQUE INDEX "CargoPermiso_cargoId_permisoId_key" ON "CargoPermiso"("cargoId", "permisoId");

-- CreateIndex
CREATE UNIQUE INDEX "InstitucionEducativa_codigoModular_key" ON "InstitucionEducativa"("codigoModular");

-- CreateIndex
CREATE UNIQUE INDEX "InstitucionEducativa_directorId_key" ON "InstitucionEducativa"("directorId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_dni_key" ON "User"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "User_codigoEstudiante_key" ON "User"("codigoEstudiante");

-- CreateIndex
CREATE UNIQUE INDEX "User_codigoSiagie_key" ON "User"("codigoSiagie");

-- CreateIndex
CREATE UNIQUE INDEX "User_codigoModular_key" ON "User"("codigoModular");

-- CreateIndex
CREATE INDEX "User_cargoId_idx" ON "User"("cargoId");

-- CreateIndex
CREATE INDEX "User_estadoId_idx" ON "User"("estadoId");

-- CreateIndex
CREATE UNIQUE INDEX "RelacionFamiliar_padreTutorId_hijoId_key" ON "RelacionFamiliar"("padreTutorId", "hijoId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_userId_key" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Nivel_nombre_key" ON "Nivel"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Nivel_institucionId_nombre_key" ON "Nivel"("institucionId", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Grado_nivelId_codigo_key" ON "Grado"("nivelId", "codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Grado_nivelId_orden_key" ON "Grado"("nivelId", "orden");

-- CreateIndex
CREATE UNIQUE INDEX "NivelAcademico_nivelId_gradoId_seccion_anioAcademico_instit_key" ON "NivelAcademico"("nivelId", "gradoId", "seccion", "anioAcademico", "institucionId");

-- CreateIndex
CREATE UNIQUE INDEX "PeriodoAcademico_tipo_numero_anioEscolar_institucionId_key" ON "PeriodoAcademico"("tipo", "numero", "anioEscolar", "institucionId");

-- CreateIndex
CREATE UNIQUE INDEX "AreaCurricular_codigo_institucionId_key" ON "AreaCurricular"("codigo", "institucionId");

-- CreateIndex
CREATE UNIQUE INDEX "Curso_codigo_anioAcademico_nivelAcademicoId_key" ON "Curso"("codigo", "anioAcademico", "nivelAcademicoId");

-- CreateIndex
CREATE UNIQUE INDEX "Curso_codigo_anioAcademico_gradoId_key" ON "Curso"("codigo", "anioAcademico", "gradoId");

-- CreateIndex
CREATE UNIQUE INDEX "Curso_codigo_anioAcademico_institucionId_key" ON "Curso"("codigo", "anioAcademico", "institucionId");

-- CreateIndex
CREATE UNIQUE INDEX "Curso_codigo_anioAcademico_nivelId_key" ON "Curso"("codigo", "anioAcademico", "nivelId");

-- CreateIndex
CREATE UNIQUE INDEX "Horario_cursoId_diaSemana_horaInicio_key" ON "Horario"("cursoId", "diaSemana", "horaInicio");

-- CreateIndex
CREATE UNIQUE INDEX "Matricula_numeroMatricula_key" ON "Matricula"("numeroMatricula");

-- CreateIndex
CREATE UNIQUE INDEX "Matricula_estudianteId_anioAcademico_key" ON "Matricula"("estudianteId", "anioAcademico");

-- CreateIndex
CREATE UNIQUE INDEX "MatriculaCurso_matriculaId_cursoId_key" ON "MatriculaCurso"("matriculaId", "cursoId");

-- CreateIndex
CREATE INDEX "Evaluacion_tipoEvaluacionId_idx" ON "Evaluacion"("tipoEvaluacionId");

-- CreateIndex
CREATE UNIQUE INDEX "Nota_estudianteId_evaluacionId_key" ON "Nota"("estudianteId", "evaluacionId");

-- CreateIndex
CREATE UNIQUE INDEX "Asistencia_estudianteId_cursoId_fecha_key" ON "Asistencia"("estudianteId", "cursoId", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "Documento_codigo_key" ON "Documento"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Documento_codigoVerificacion_key" ON "Documento"("codigoVerificacion");

-- CreateIndex
CREATE INDEX "Documento_tipoDocumentoId_idx" ON "Documento"("tipoDocumentoId");

-- CreateIndex
CREATE UNIQUE INDEX "Pago_numeroBoleta_key" ON "Pago"("numeroBoleta");

-- CreateIndex
CREATE INDEX "Competencia_areaCurricularId_idx" ON "Competencia"("areaCurricularId");

-- CreateIndex
CREATE INDEX "Capacidad_competenciaId_idx" ON "Capacidad"("competenciaId");

-- CreateIndex
CREATE UNIQUE INDEX "Prospecto_dni_key" ON "Prospecto"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "Admision_prospectoId_key" ON "Admision"("prospectoId");

-- CreateIndex
CREATE INDEX "FichaPsicopedagogica_estudianteId_idx" ON "FichaPsicopedagogica"("estudianteId");

-- CreateIndex
CREATE INDEX "FichaPsicopedagogica_especialistaId_idx" ON "FichaPsicopedagogica"("especialistaId");

-- CreateIndex
CREATE UNIQUE INDEX "CategoriaIncidente_nombre_key" ON "CategoriaIncidente"("nombre");

-- CreateIndex
CREATE INDEX "CronogramaPago_estudianteId_idx" ON "CronogramaPago"("estudianteId");

-- CreateIndex
CREATE INDEX "CronogramaPago_conceptoId_idx" ON "CronogramaPago"("conceptoId");

-- CreateIndex
CREATE INDEX "_AnuncioToGrado_B_index" ON "_AnuncioToGrado"("B");

-- CreateIndex
CREATE INDEX "_AnuncioToNivel_B_index" ON "_AnuncioToNivel"("B");

-- CreateIndex
CREATE INDEX "_EventoToGrado_B_index" ON "_EventoToGrado"("B");

-- CreateIndex
CREATE INDEX "_EventoToNivel_B_index" ON "_EventoToNivel"("B");

-- AddForeignKey
ALTER TABLE "Cargo" ADD CONSTRAINT "Cargo_institucionId_fkey" FOREIGN KEY ("institucionId") REFERENCES "InstitucionEducativa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstadoUsuario" ADD CONSTRAINT "EstadoUsuario_institucionId_fkey" FOREIGN KEY ("institucionId") REFERENCES "InstitucionEducativa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TipoDocumento" ADD CONSTRAINT "TipoDocumento_institucionId_fkey" FOREIGN KEY ("institucionId") REFERENCES "InstitucionEducativa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TipoEvaluacion" ADD CONSTRAINT "TipoEvaluacion_institucionId_fkey" FOREIGN KEY ("institucionId") REFERENCES "InstitucionEducativa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialEstadoUsuario" ADD CONSTRAINT "HistorialEstadoUsuario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialEstadoUsuario" ADD CONSTRAINT "HistorialEstadoUsuario_estadoAnteriorId_fkey" FOREIGN KEY ("estadoAnteriorId") REFERENCES "EstadoUsuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialEstadoUsuario" ADD CONSTRAINT "HistorialEstadoUsuario_estadoNuevoId_fkey" FOREIGN KEY ("estadoNuevoId") REFERENCES "EstadoUsuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialEstadoUsuario" ADD CONSTRAINT "HistorialEstadoUsuario_cambiadoPorId_fkey" FOREIGN KEY ("cambiadoPorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolPermiso" ADD CONSTRAINT "RolPermiso_permisoId_fkey" FOREIGN KEY ("permisoId") REFERENCES "Permiso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioPermiso" ADD CONSTRAINT "UsuarioPermiso_permisoId_fkey" FOREIGN KEY ("permisoId") REFERENCES "Permiso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioPermiso" ADD CONSTRAINT "UsuarioPermiso_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CargoPermiso" ADD CONSTRAINT "CargoPermiso_cargoId_fkey" FOREIGN KEY ("cargoId") REFERENCES "Cargo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CargoPermiso" ADD CONSTRAINT "CargoPermiso_permisoId_fkey" FOREIGN KEY ("permisoId") REFERENCES "Permiso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstitucionEducativa" ADD CONSTRAINT "InstitucionEducativa_directorId_fkey" FOREIGN KEY ("directorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_cargoId_fkey" FOREIGN KEY ("cargoId") REFERENCES "Cargo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_estadoId_fkey" FOREIGN KEY ("estadoId") REFERENCES "EstadoUsuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_institucionId_fkey" FOREIGN KEY ("institucionId") REFERENCES "InstitucionEducativa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_nivelAcademicoId_fkey" FOREIGN KEY ("nivelAcademicoId") REFERENCES "NivelAcademico"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelacionFamiliar" ADD CONSTRAINT "RelacionFamiliar_hijoId_fkey" FOREIGN KEY ("hijoId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelacionFamiliar" ADD CONSTRAINT "RelacionFamiliar_padreTutorId_fkey" FOREIGN KEY ("padreTutorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nivel" ADD CONSTRAINT "Nivel_institucionId_fkey" FOREIGN KEY ("institucionId") REFERENCES "InstitucionEducativa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grado" ADD CONSTRAINT "Grado_nivelId_fkey" FOREIGN KEY ("nivelId") REFERENCES "Nivel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NivelAcademico" ADD CONSTRAINT "NivelAcademico_gradoId_fkey" FOREIGN KEY ("gradoId") REFERENCES "Grado"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NivelAcademico" ADD CONSTRAINT "NivelAcademico_institucionId_fkey" FOREIGN KEY ("institucionId") REFERENCES "InstitucionEducativa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NivelAcademico" ADD CONSTRAINT "NivelAcademico_nivelId_fkey" FOREIGN KEY ("nivelId") REFERENCES "Nivel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NivelAcademico" ADD CONSTRAINT "NivelAcademico_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeriodoAcademico" ADD CONSTRAINT "PeriodoAcademico_institucionId_fkey" FOREIGN KEY ("institucionId") REFERENCES "InstitucionEducativa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AreaCurricular" ADD CONSTRAINT "AreaCurricular_institucionId_fkey" FOREIGN KEY ("institucionId") REFERENCES "InstitucionEducativa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AreaCurricular" ADD CONSTRAINT "AreaCurricular_nivelId_fkey" FOREIGN KEY ("nivelId") REFERENCES "Nivel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AreaCurricular" ADD CONSTRAINT "AreaCurricular_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "AreaCurricular"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Curso" ADD CONSTRAINT "Curso_areaCurricularId_fkey" FOREIGN KEY ("areaCurricularId") REFERENCES "AreaCurricular"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Curso" ADD CONSTRAINT "Curso_gradoId_fkey" FOREIGN KEY ("gradoId") REFERENCES "Grado"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Curso" ADD CONSTRAINT "Curso_institucionId_fkey" FOREIGN KEY ("institucionId") REFERENCES "InstitucionEducativa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Curso" ADD CONSTRAINT "Curso_nivelAcademicoId_fkey" FOREIGN KEY ("nivelAcademicoId") REFERENCES "NivelAcademico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Curso" ADD CONSTRAINT "Curso_nivelId_fkey" FOREIGN KEY ("nivelId") REFERENCES "Nivel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Curso" ADD CONSTRAINT "Curso_profesorId_fkey" FOREIGN KEY ("profesorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Horario" ADD CONSTRAINT "Horario_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Matricula" ADD CONSTRAINT "Matricula_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Matricula" ADD CONSTRAINT "Matricula_nivelAcademicoId_fkey" FOREIGN KEY ("nivelAcademicoId") REFERENCES "NivelAcademico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatriculaCurso" ADD CONSTRAINT "MatriculaCurso_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatriculaCurso" ADD CONSTRAINT "MatriculaCurso_matriculaId_fkey" FOREIGN KEY ("matriculaId") REFERENCES "Matricula"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatriculaCurso" ADD CONSTRAINT "MatriculaCurso_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluacion" ADD CONSTRAINT "Evaluacion_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluacion" ADD CONSTRAINT "Evaluacion_periodoId_fkey" FOREIGN KEY ("periodoId") REFERENCES "PeriodoAcademico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluacion" ADD CONSTRAINT "Evaluacion_tipoEvaluacionId_fkey" FOREIGN KEY ("tipoEvaluacionId") REFERENCES "TipoEvaluacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluacion" ADD CONSTRAINT "Evaluacion_capacidadId_fkey" FOREIGN KEY ("capacidadId") REFERENCES "Capacidad"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nota" ADD CONSTRAINT "Nota_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nota" ADD CONSTRAINT "Nota_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nota" ADD CONSTRAINT "Nota_evaluacionId_fkey" FOREIGN KEY ("evaluacionId") REFERENCES "Evaluacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asistencia" ADD CONSTRAINT "Asistencia_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asistencia" ADD CONSTRAINT "Asistencia_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asistencia" ADD CONSTRAINT "Asistencia_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_tipoDocumentoId_fkey" FOREIGN KEY ("tipoDocumentoId") REFERENCES "TipoDocumento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_emisorId_fkey" FOREIGN KEY ("emisorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_cronogramaPagoId_fkey" FOREIGN KEY ("cronogramaPagoId") REFERENCES "CronogramaPago"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anuncio" ADD CONSTRAINT "Anuncio_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evento" ADD CONSTRAINT "Evento_organizadorId_fkey" FOREIGN KEY ("organizadorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competencia" ADD CONSTRAINT "Competencia_areaCurricularId_fkey" FOREIGN KEY ("areaCurricularId") REFERENCES "AreaCurricular"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Capacidad" ADD CONSTRAINT "Capacidad_competenciaId_fkey" FOREIGN KEY ("competenciaId") REFERENCES "Competencia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prospecto" ADD CONSTRAINT "Prospecto_institucionId_fkey" FOREIGN KEY ("institucionId") REFERENCES "InstitucionEducativa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admision" ADD CONSTRAINT "Admision_prospectoId_fkey" FOREIGN KEY ("prospectoId") REFERENCES "Prospecto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admision" ADD CONSTRAINT "Admision_autorizadoPorId_fkey" FOREIGN KEY ("autorizadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FichaPsicopedagogica" ADD CONSTRAINT "FichaPsicopedagogica_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FichaPsicopedagogica" ADD CONSTRAINT "FichaPsicopedagogica_especialistaId_fkey" FOREIGN KEY ("especialistaId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FichaPsicopedagogica" ADD CONSTRAINT "FichaPsicopedagogica_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CategoriaIncidente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConceptoPago" ADD CONSTRAINT "ConceptoPago_institucionId_fkey" FOREIGN KEY ("institucionId") REFERENCES "InstitucionEducativa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CronogramaPago" ADD CONSTRAINT "CronogramaPago_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CronogramaPago" ADD CONSTRAINT "CronogramaPago_conceptoId_fkey" FOREIGN KEY ("conceptoId") REFERENCES "ConceptoPago"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnuncioToGrado" ADD CONSTRAINT "_AnuncioToGrado_A_fkey" FOREIGN KEY ("A") REFERENCES "Anuncio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnuncioToGrado" ADD CONSTRAINT "_AnuncioToGrado_B_fkey" FOREIGN KEY ("B") REFERENCES "Grado"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnuncioToNivel" ADD CONSTRAINT "_AnuncioToNivel_A_fkey" FOREIGN KEY ("A") REFERENCES "Anuncio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnuncioToNivel" ADD CONSTRAINT "_AnuncioToNivel_B_fkey" FOREIGN KEY ("B") REFERENCES "Nivel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventoToGrado" ADD CONSTRAINT "_EventoToGrado_A_fkey" FOREIGN KEY ("A") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventoToGrado" ADD CONSTRAINT "_EventoToGrado_B_fkey" FOREIGN KEY ("B") REFERENCES "Grado"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventoToNivel" ADD CONSTRAINT "_EventoToNivel_A_fkey" FOREIGN KEY ("A") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventoToNivel" ADD CONSTRAINT "_EventoToNivel_B_fkey" FOREIGN KEY ("B") REFERENCES "Nivel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
