-- CreateTable
CREATE TABLE "FavoritoUniforme" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "uniformeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoritoUniforme_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FavoritoUniforme_userId_idx" ON "FavoritoUniforme"("userId");

-- CreateIndex
CREATE INDEX "FavoritoUniforme_uniformeId_idx" ON "FavoritoUniforme"("uniformeId");

-- CreateIndex
CREATE UNIQUE INDEX "FavoritoUniforme_userId_uniformeId_key" ON "FavoritoUniforme"("userId", "uniformeId");

-- AddForeignKey
ALTER TABLE "FavoritoUniforme" ADD CONSTRAINT "FavoritoUniforme_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoritoUniforme" ADD CONSTRAINT "FavoritoUniforme_uniformeId_fkey" FOREIGN KEY ("uniformeId") REFERENCES "Uniforme"("id") ON DELETE CASCADE ON UPDATE CASCADE;
