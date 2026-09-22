"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { CNEB_AREAS } from "./seed-cneb-data";

interface SeedCnebParams {
  nivelId?: string;
}

export async function seedCnebTemplateAction({ nivelId }: SeedCnebParams = {}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado. Inicie sesión para continuar." };
    }

    const institucionId = session.user.institucionId;
    if (!institucionId) {
      return { error: "No se encontró la institución vinculada al usuario." };
    }

    let createdCount = 0;
    let competenciesCount = 0;
    let capacitiesCount = 0;

    for (const areaData of CNEB_AREAS) {
      const areaCodigo = nivelId
        ? `${areaData.codigo}_${nivelId.slice(-4)}`
        : areaData.codigo;

      // 1. Buscar si el área ya existe (por código o por nombre dentro del mismo nivel)
      let area = await prisma.areaCurricular.findFirst({
        where: {
          institucionId,
          OR: [
            { codigo: areaCodigo },
            {
              nombre: areaData.nombre,
              nivelId: nivelId || null,
            },
          ],
        },
      });

      if (!area) {
        area = await prisma.areaCurricular.create({
          data: {
            codigo: areaCodigo,
            nombre: areaData.nombre,
            descripcion: areaData.descripcion,
            color: areaData.color,
            icono: areaData.icono,
            orden: areaData.orden,
            institucionId,
            nivelId: nivelId || undefined,
            activa: true,
          },
        });
        createdCount++;
      } else if (nivelId && !area.nivelId) {
        // Si el área existía huérfana sin nivel, asociarla al nivel actual
        area = await prisma.areaCurricular.update({
          where: { id: area.id },
          data: { nivelId },
        });
      }

      // 2. Procesar competencias y sus capacidades oficiales
      for (const compData of areaData.competencias) {
        let comp = await prisma.competencia.findFirst({
          where: {
            areaCurricularId: area.id,
            nombre: compData.nombre,
          },
        });

        if (!comp) {
          comp = await prisma.competencia.create({
            data: {
              areaCurricularId: area.id,
              nombre: compData.nombre,
              descripcion: compData.descripcion,
            },
          });
          competenciesCount++;
        }

        // 3. Poblar capacidades oficiales MINEDU si faltan
        if (compData.capacidades && compData.capacidades.length > 0) {
          const capNombres = compData.capacidades.map((c) => c.nombre);
          const capsExistentes = await prisma.capacidad.findMany({
            where: {
              competenciaId: comp.id,
              nombre: { in: capNombres },
            },
            select: { nombre: true },
          });

          const existentesCapsSet = new Set(
            capsExistentes.map((c) => c.nombre),
          );
          const capsToCreate = compData.capacidades.filter(
            (c) => !existentesCapsSet.has(c.nombre),
          );

          if (capsToCreate.length > 0) {
            await prisma.capacidad.createMany({
              data: capsToCreate.map((c) => ({
                competenciaId: comp.id,
                nombre: c.nombre,
                descripcion: c.descripcion || null,
              })),
            });
            capacitiesCount += capsToCreate.length;
          }
        }
      }
    }

    revalidatePath("/gestion/academico/areas");
    revalidatePath("/gestion/academico/competencias");

    return {
      success: `Malla CNEB actualizada: ${createdCount} áreas nuevas, ${competenciesCount} competencias y ${capacitiesCount} capacidades oficiales MINEDU.`,
    };
  } catch (error: any) {
    console.error("Error in seedCnebTemplateAction:", error);
    return { error: "No se pudo cargar la malla oficial CNEB." };
  }
}
