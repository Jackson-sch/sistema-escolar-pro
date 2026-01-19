"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { createSafeAction } from "@/lib/safe-action"
import { CronogramaFilterSchema, CreateCronogramaMasivoSchema } from "@/lib/schemas/finance"
import { z } from "zod"

const REVALIDATE_PATH = "/finanzas"

/**
 * Obtiene el cronograma de pagos (deudas) de estudiantes
 */
export const getCronogramaAction = createSafeAction(
  CronogramaFilterSchema,
  async (filters, session) => {
    const institucionId = session.user.institucionId

    const cronograma = await prisma.cronogramaPago.findMany({
      where: {
        estudiante: {
          institucionId: institucionId || undefined,
          id: filters?.estudianteId,
        },
        conceptoId: filters?.conceptoId,
        pagado: filters?.pagado
      },
      include: {
        estudiante: {
          select: {
            id: true,
            name: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
            codigoModular: true,
            dni: true,
            codigoEstudiante: true,
            nivelAcademicoId: true,
            nivelAcademico: {
              include: {
                grado: true,
                nivel: true
              }
            },
            matriculas: {
              include: {
                nivelAcademico: {
                  include: {
                    grado: true,
                    nivel: true
                  }
                }
              },
              orderBy: { anioAcademico: "desc" },
              take: 1
            }
          }
        },
        concepto: {
          select: { id: true, nombre: true }
        },
        pagos: true
      },
      orderBy: [
        { fechaVencimiento: "asc" },
        { estudiante: { apellidoPaterno: "asc" } }
      ]
    })
    return { success: JSON.parse(JSON.stringify(cronograma)) }
  }
)

/**
 * Crea deudas masivamente para todos los estudiantes de un nivel académico
 */
export const createCronogramaMasivoAction = createSafeAction(
  CreateCronogramaMasivoSchema,
  async (values, session) => {
    const institucionId = session.user.institucionId
    if (!institucionId) return { error: "Institución no identificada." }

    const date = new Date(values.fechaVencimiento)
    const concepto = await prisma.conceptoPago.findUnique({
      where: { id: values.conceptoId, institucionId }
    })

    if (!concepto) {
      return { error: "El concepto de pago seleccionado no existe o no pertenece a su institución." }
    }

    const estudiantes = await prisma.user.findMany({
      where: {
        role: "estudiante",
        institucionId,
        nivelAcademicoId: values.nivelAcademicoId || undefined
      },
      include: {
        matriculas: {
          where: { estado: "activo" },
          select: { descuentoBeca: true, tipoBeca: true, anioAcademico: true },
          take: 1
        },
        cronogramaPagos: {
          where: { conceptoId: values.conceptoId }
        }
      }
    })

    if (estudiantes.length === 0) {
      return { error: "No se encontraron estudiantes para los filtros seleccionados." }
    }

    // Filtrar estudiantes que ya tienen este concepto generado
    const estudiantesSinConcepto = estudiantes.filter(est => est.cronogramaPagos.length === 0)

    if (estudiantesSinConcepto.length === 0) {
      return { error: "Todos los estudiantes seleccionados ya tienen este concepto generado." }
    }

    const results = await prisma.$transaction(
      estudiantesSinConcepto.map((est: any) => {
        const beca = est.matriculas?.[0]?.descuentoBeca || 0
        const montoFinal = Math.max(0, values.monto - beca)

        return prisma.cronogramaPago.create({
          data: {
            estudianteId: est.id,
            conceptoId: values.conceptoId,
            monto: montoFinal,
            fechaVencimiento: date,
            montoPagado: 0,
            pagado: false
          }
        })
      })
    )

    revalidatePath(REVALIDATE_PATH)
    return {
      success: `Cronograma generado exitosamente para ${results.length} estudiantes`,
    }
  },
  { roles: ["administrativo"] }
)

/**
 * Elimina cronogramas masivamente por concepto
 */
export const deleteCronogramaMasivoAction = createSafeAction(
  z.object({
    conceptoId: z.string(),
    nivelAcademicoId: z.string().optional()
  }),
  async (values, session) => {
    const institucionId = session.user.institucionId

    const where: any = {
      conceptoId: values.conceptoId,
      pagado: false,
      montoPagado: 0,
      estudiante: {
        institucionId,
        nivelAcademicoId: values.nivelAcademicoId
      }
    }

    const count = await prisma.cronogramaPago.count({ where })
    if (count === 0) return { error: "No se encontraron cronogramas pendientes para eliminar." }

    await prisma.cronogramaPago.deleteMany({ where })

    revalidatePath(REVALIDATE_PATH)
    return { success: `Se eliminaron ${count} cronogramas correctamente` }
  },
  { roles: ["administrativo"] }
)

/**
 * Actualiza la fecha de vencimiento masivamente
 */
export const updateCronogramaFechaMasivoAction = createSafeAction(
  z.object({
    conceptoId: z.string(),
    nuevaFecha: z.union([z.date(), z.string()]),
    nivelAcademicoId: z.string().optional()
  }),
  async (values, session) => {
    const institucionId = session.user.institucionId
    const nuevaFecha = new Date(values.nuevaFecha)

    const where: any = {
      conceptoId: values.conceptoId,
      pagado: false,
      estudiante: {
        institucionId,
        nivelAcademicoId: values.nivelAcademicoId
      }
    }

    const count = await prisma.cronogramaPago.count({ where })
    if (count === 0) return { error: "No se encontraron cronogramas pendientes para actualizar." }

    await prisma.cronogramaPago.updateMany({
      where,
      data: { fechaVencimiento: nuevaFecha }
    })

    revalidatePath(REVALIDATE_PATH)
    return { success: `Se actualizó la fecha de ${count} cronogramas correctamente` }
  },
  { roles: ["administrativo"] }
)

/**
 * Aplica mora (interés) masivamente
 */
export const applyBulkMoraAction = createSafeAction(
  z.object({
    conceptoId: z.string().optional(),
    nivelAcademicoId: z.string().optional()
  }),
  async (filters, session) => {
    const institucionId = session.user.institucionId
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const cronogramasVencidos = await prisma.cronogramaPago.findMany({
      where: {
        pagado: false,
        fechaVencimiento: { lt: today },
        conceptoId: filters.conceptoId || undefined,
        estudiante: {
          institucionId,
          nivelAcademicoId: filters.nivelAcademicoId || undefined
        }
      },
      include: {
        concepto: true
      }
    })

    if (cronogramasVencidos.length === 0) return { success: "No hay cronogramas vencidos para procesar." }

    let count = 0
    await prisma.$transaction(
      cronogramasVencidos.map(cp => {
        const fechaVencimiento = new Date(cp.fechaVencimiento)
        fechaVencimiento.setHours(0, 0, 0, 0)

        const diffTime = Math.abs(today.getTime() - fechaVencimiento.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        const moraDiaria = cp.concepto.moraDiaria || 0
        const nuevaMora = diffDays * moraDiaria

        count++
        return prisma.cronogramaPago.update({
          where: { id: cp.id },
          data: {
            moraAcumulada: nuevaMora,
            updatedAt: new Date()
          }
        })
      })
    )

    revalidatePath(REVALIDATE_PATH)
    return { success: `Se actualizó el interés por mora de ${count} registros` }
  },
  { roles: ["administrativo"] }
)
