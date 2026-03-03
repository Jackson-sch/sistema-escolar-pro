-- CreateEnum
CREATE TYPE "GeneroUniforme" AS ENUM ('MASCULINO', 'FEMENINO', 'UNISEX');

-- CreateEnum
CREATE TYPE "TipoTalla" AS ENUM ('NUMERICA', 'ALFABETICA');

-- CreateEnum
CREATE TYPE "TipoMovimiento" AS ENUM ('ENTRADA', 'SALIDA', 'AJUSTE');

-- CreateEnum
CREATE TYPE "EstadoVentaUniforme" AS ENUM ('RESERVADO', 'EN_PRUEBA', 'APROBADO', 'PAGADO', 'ENTREGADO', 'CANCELADO');

-- CreateTable
CREATE TABLE "CategoriaUniforme" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategoriaUniforme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Uniforme" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "categoriaId" TEXT NOT NULL,
    "genero" "GeneroUniforme" NOT NULL DEFAULT 'UNISEX',
    "imagen" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Uniforme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VarianteUniforme" (
    "id" TEXT NOT NULL,
    "uniformeId" TEXT NOT NULL,
    "talla" TEXT NOT NULL,
    "tipoTalla" "TipoTalla" NOT NULL DEFAULT 'ALFABETICA',
    "precio" DOUBLE PRECISION NOT NULL,
    "sedeId" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "stockMinimo" INTEGER NOT NULL DEFAULT 5,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VarianteUniforme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimientoInventario" (
    "id" TEXT NOT NULL,
    "varianteId" TEXT NOT NULL,
    "tipo" "TipoMovimiento" NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "motivo" TEXT,
    "referencia" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimientoInventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VentaUniforme" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "padreId" TEXT,
    "sedeId" TEXT NOT NULL,
    "estado" "EstadoVentaUniforme" NOT NULL DEFAULT 'RESERVADO',
    "total" DOUBLE PRECISION NOT NULL,
    "observaciones" TEXT,
    "cronogramaPagoId" TEXT,
    "aprobadoPorId" TEXT,
    "aprobadoEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VentaUniforme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetalleVentaUniforme" (
    "id" TEXT NOT NULL,
    "ventaId" TEXT NOT NULL,
    "varianteId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "DetalleVentaUniforme_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CategoriaUniforme_nombre_key" ON "CategoriaUniforme"("nombre");

-- CreateIndex
CREATE INDEX "Uniforme_categoriaId_idx" ON "Uniforme"("categoriaId");

-- CreateIndex
CREATE INDEX "VarianteUniforme_sedeId_idx" ON "VarianteUniforme"("sedeId");

-- CreateIndex
CREATE INDEX "VarianteUniforme_uniformeId_idx" ON "VarianteUniforme"("uniformeId");

-- CreateIndex
CREATE UNIQUE INDEX "VarianteUniforme_uniformeId_talla_sedeId_key" ON "VarianteUniforme"("uniformeId", "talla", "sedeId");

-- CreateIndex
CREATE INDEX "MovimientoInventario_varianteId_idx" ON "MovimientoInventario"("varianteId");

-- CreateIndex
CREATE UNIQUE INDEX "VentaUniforme_codigo_key" ON "VentaUniforme"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "VentaUniforme_cronogramaPagoId_key" ON "VentaUniforme"("cronogramaPagoId");

-- CreateIndex
CREATE INDEX "VentaUniforme_estudianteId_idx" ON "VentaUniforme"("estudianteId");

-- CreateIndex
CREATE INDEX "VentaUniforme_padreId_idx" ON "VentaUniforme"("padreId");

-- CreateIndex
CREATE INDEX "VentaUniforme_estado_idx" ON "VentaUniforme"("estado");

-- CreateIndex
CREATE INDEX "DetalleVentaUniforme_ventaId_idx" ON "DetalleVentaUniforme"("ventaId");

-- AddForeignKey
ALTER TABLE "Uniforme" ADD CONSTRAINT "Uniforme_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CategoriaUniforme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VarianteUniforme" ADD CONSTRAINT "VarianteUniforme_uniformeId_fkey" FOREIGN KEY ("uniformeId") REFERENCES "Uniforme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VarianteUniforme" ADD CONSTRAINT "VarianteUniforme_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "Sede"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoInventario" ADD CONSTRAINT "MovimientoInventario_varianteId_fkey" FOREIGN KEY ("varianteId") REFERENCES "VarianteUniforme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaUniforme" ADD CONSTRAINT "VentaUniforme_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaUniforme" ADD CONSTRAINT "VentaUniforme_padreId_fkey" FOREIGN KEY ("padreId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaUniforme" ADD CONSTRAINT "VentaUniforme_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "Sede"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaUniforme" ADD CONSTRAINT "VentaUniforme_cronogramaPagoId_fkey" FOREIGN KEY ("cronogramaPagoId") REFERENCES "CronogramaPago"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaUniforme" ADD CONSTRAINT "VentaUniforme_aprobadoPorId_fkey" FOREIGN KEY ("aprobadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleVentaUniforme" ADD CONSTRAINT "DetalleVentaUniforme_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "VentaUniforme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleVentaUniforme" ADD CONSTRAINT "DetalleVentaUniforme_varianteId_fkey" FOREIGN KEY ("varianteId") REFERENCES "VarianteUniforme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
