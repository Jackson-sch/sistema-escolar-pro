-- CreateEnum
CREATE TYPE "TipoCuentaBancaria" AS ENUM ('BANCO', 'BILLETERA_DIGITAL');

-- AlterTable
ALTER TABLE "HistorialEstadoUsuario" ADD COLUMN     "institucionId" TEXT;

-- AlterTable
ALTER TABLE "MovimientoInventario" ADD COLUMN     "institucionId" TEXT;

-- CreateTable
CREATE TABLE "CuentaBancaria" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoCuentaBancaria" NOT NULL DEFAULT 'BANCO',
    "numero" TEXT NOT NULL,
    "cci" TEXT,
    "titular" TEXT NOT NULL,
    "tipoCuenta" TEXT,
    "qrCode" TEXT,
    "esPrincipal" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "institucionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CuentaBancaria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CuentaBancaria_institucionId_idx" ON "CuentaBancaria"("institucionId");

-- CreateIndex
CREATE INDEX "CuentaBancaria_activo_idx" ON "CuentaBancaria"("activo");

-- AddForeignKey
ALTER TABLE "HistorialEstadoUsuario" ADD CONSTRAINT "HistorialEstadoUsuario_institucionId_fkey" FOREIGN KEY ("institucionId") REFERENCES "InstitucionEducativa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoInventario" ADD CONSTRAINT "MovimientoInventario_institucionId_fkey" FOREIGN KEY ("institucionId") REFERENCES "InstitucionEducativa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CuentaBancaria" ADD CONSTRAINT "CuentaBancaria_institucionId_fkey" FOREIGN KEY ("institucionId") REFERENCES "InstitucionEducativa"("id") ON DELETE SET NULL ON UPDATE CASCADE;
