-- CreateIndex
CREATE INDEX "Asistencia_estudianteId_fecha_idx" ON "Asistencia"("estudianteId", "fecha");

-- CreateIndex
CREATE INDEX "Asistencia_cursoId_idx" ON "Asistencia"("cursoId");

-- CreateIndex
CREATE INDEX "CronogramaPago_estudianteId_pagado_idx" ON "CronogramaPago"("estudianteId", "pagado");

-- CreateIndex
CREATE INDEX "Curso_institucionId_anioAcademico_idx" ON "Curso"("institucionId", "anioAcademico");

-- CreateIndex
CREATE INDEX "Curso_profesorId_idx" ON "Curso"("profesorId");
