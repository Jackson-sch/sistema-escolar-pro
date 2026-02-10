-- CreateEnum
CREATE TYPE "EstadoComprobante" AS ENUM ('PENDIENTE', 'EN_REVISION', 'APROBADO', 'RECHAZADO');

-- AlterTable
ALTER TABLE "ConceptoPago" ADD COLUMN     "moraDiaria" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "CronogramaPago" ADD COLUMN     "moraAcumulada" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "FichaPsicopedagogica" ADD COLUMN     "visibleParaPadres" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Matricula" ADD COLUMN     "descuentoBeca" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "tipoBeca" TEXT DEFAULT 'ninguna';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "carnetConadis" TEXT,
ADD COLUMN     "centroSaludPreferido" TEXT,
ADD COLUMN     "discapacidades" TEXT,
ADD COLUMN     "lenguaMaterna" TEXT,
ADD COLUMN     "lugarNacimiento" TEXT,
ADD COLUMN     "medicamentos" TEXT,
ADD COLUMN     "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "nombreContactoEmergencia2" TEXT,
ADD COLUMN     "numeroHermanos" INTEGER,
ADD COLUMN     "paisNacimiento" TEXT,
ADD COLUMN     "parentescoContactoEmergencia" TEXT,
ADD COLUMN     "parentescoContactoEmergencia2" TEXT,
ADD COLUMN     "peso" DOUBLE PRECISION,
ADD COLUMN     "religion" TEXT,
ADD COLUMN     "restriccionesAlimenticias" TEXT,
ADD COLUMN     "seguroMedico" TEXT,
ADD COLUMN     "talla" DOUBLE PRECISION,
ADD COLUMN     "telefonoContactoEmergencia2" TEXT;

-- CreateTable
CREATE TABLE "Logro" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL,
    "categoria" TEXT NOT NULL DEFAULT 'OTROS',
    "institucion" TEXT,
    "adjunto" TEXT,
    "estudianteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Logro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VariableSistema" (
    "id" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'string',
    "descripcion" TEXT,
    "seccion" TEXT DEFAULT 'general',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VariableSistema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComprobantePago" (
    "id" TEXT NOT NULL,
    "cronogramaId" TEXT NOT NULL,
    "padreId" TEXT NOT NULL,
    "archivoUrl" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "bancoOrigen" TEXT,
    "numeroOperacion" TEXT,
    "fechaOperacion" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoComprobante" NOT NULL DEFAULT 'PENDIENTE',
    "motivoRechazo" TEXT,
    "verificadoPorId" TEXT,
    "verificadoEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComprobantePago_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Logro_estudianteId_idx" ON "Logro"("estudianteId");

-- CreateIndex
CREATE UNIQUE INDEX "VariableSistema_clave_key" ON "VariableSistema"("clave");

-- CreateIndex
CREATE INDEX "VariableSistema_clave_idx" ON "VariableSistema"("clave");

-- CreateIndex
CREATE INDEX "VariableSistema_seccion_idx" ON "VariableSistema"("seccion");

-- CreateIndex
CREATE INDEX "ComprobantePago_cronogramaId_idx" ON "ComprobantePago"("cronogramaId");

-- CreateIndex
CREATE INDEX "ComprobantePago_padreId_idx" ON "ComprobantePago"("padreId");

-- CreateIndex
CREATE INDEX "ComprobantePago_estado_idx" ON "ComprobantePago"("estado");

-- AddForeignKey
ALTER TABLE "Logro" ADD CONSTRAINT "Logro_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComprobantePago" ADD CONSTRAINT "ComprobantePago_cronogramaId_fkey" FOREIGN KEY ("cronogramaId") REFERENCES "CronogramaPago"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComprobantePago" ADD CONSTRAINT "ComprobantePago_padreId_fkey" FOREIGN KEY ("padreId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComprobantePago" ADD CONSTRAINT "ComprobantePago_verificadoPorId_fkey" FOREIGN KEY ("verificadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
