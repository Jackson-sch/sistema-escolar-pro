-- CreateTable
CREATE TABLE "PoliticaAsistencia" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "nivelId" TEXT,
    "turno" "Turno",
    "horaEntrada" TEXT NOT NULL DEFAULT '08:00',
    "horaSalida" TEXT NOT NULL DEFAULT '13:00',
    "tolerancia" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "institucionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PoliticaAsistencia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PoliticaAsistencia_institucionId_idx" ON "PoliticaAsistencia"("institucionId");

-- CreateIndex
CREATE INDEX "PoliticaAsistencia_nivelId_idx" ON "PoliticaAsistencia"("nivelId");

-- AddForeignKey
ALTER TABLE "PoliticaAsistencia" ADD CONSTRAINT "PoliticaAsistencia_institucionId_fkey" FOREIGN KEY ("institucionId") REFERENCES "InstitucionEducativa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoliticaAsistencia" ADD CONSTRAINT "PoliticaAsistencia_nivelId_fkey" FOREIGN KEY ("nivelId") REFERENCES "Nivel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
