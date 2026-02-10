-- AlterTable
ALTER TABLE "NivelAcademico" ADD COLUMN     "sedeId" TEXT;

-- CreateTable
CREATE TABLE "Sede" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigoIdentifier" TEXT,
    "direccion" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "director" TEXT,
    "institucionId" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sede_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Sede_institucionId_idx" ON "Sede"("institucionId");

-- CreateIndex
CREATE UNIQUE INDEX "Sede_institucionId_nombre_key" ON "Sede"("institucionId", "nombre");

-- AddForeignKey
ALTER TABLE "NivelAcademico" ADD CONSTRAINT "NivelAcademico_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "Sede"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sede" ADD CONSTRAINT "Sede_institucionId_fkey" FOREIGN KEY ("institucionId") REFERENCES "InstitucionEducativa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
