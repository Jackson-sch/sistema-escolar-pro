"use server";

import prisma from "@/lib/prisma";
import { serialize } from "@/lib/dto";
import { auth } from "@/auth";
import { getActiveSedeAction } from "@/actions/active-sede";

export interface InstitutionHeaderInfo {
  nombreInstitucion: string;
  nombreComercial?: string | null;
  codigoModular?: string | null;
  sedePrincipalNombre?: string | null;
  sedePrincipalDireccion?: string | null;
  sedePrincipalTelefono?: string | null;
  sedeActivaNombre?: string | null;
  ugel?: string | null;
  distrito?: string | null;
  departamento?: string | null;
  academicYear?: number | string;
}

/**
 * Obtiene los datos de la institución educativa para la sesión actual
 */
export async function getInstitucionAction() {
  try {
    const session = await auth();
    const institucionId = session?.user?.institucionId;

    const institucion = await prisma.institucionEducativa.findFirst({
      where: institucionId ? { id: institucionId } : undefined,
      include: {
        sedes: {
          where: { activo: true },
          orderBy: [{ esPrincipal: "desc" }, { nombre: "asc" }],
        },
      },
    });

    return {
      data: institucion ? serialize(institucion) : null,
    };
  } catch (error) {
    console.error("Error fetching institucion:", error);
    return { error: "No se pudieron obtener los datos de la institución" };
  }
}

/**
 * Obtiene datos específicos de una institución por su ID
 */
export async function getInstitucionByIdAction(id?: string) {
  try {
    const institucion = await prisma.institucionEducativa.findFirst({
      where: { id: id || undefined },
      select: {
        id: true,
        cicloEscolarActual: true,
        nombreInstitucion: true,
        logo: true,
      },
    });
    return { data: serialize(institucion) };
  } catch (error) {
    console.error("Error fetching institucion by id:", error);
    return { error: "No se pudieron obtener los datos de la institución" };
  }
}

/**
 * Obtiene las sedes de la institución
 */
export async function getSedesAction(institucionId?: string) {
  try {
    const sedes = await prisma.sede.findMany({
      where: institucionId ? { institucionId } : undefined,
      orderBy: [{ esPrincipal: "desc" }, { nombre: "asc" }],
    });
    return { data: serialize(sedes) };
  } catch (error) {
    console.error("Error fetching sedes:", error);
    return { error: "No se pudieron obtener las sedes" };
  }
}

/**
 * Obtiene toda la información de la institución y sede principal/activa para los encabezados de Excel
 */
export async function getExcelHeaderInfoAction(): Promise<{
  data?: InstitutionHeaderInfo;
  error?: string;
}> {
  try {
    const session = await auth();
    const institucionId = session?.user?.institucionId;

    const institucion = await prisma.institucionEducativa.findFirst({
      where: institucionId ? { id: institucionId } : undefined,
      include: {
        sedes: {
          where: { activo: true },
          orderBy: [{ esPrincipal: "desc" }, { nombre: "asc" }],
        },
      },
    });

    if (!institucion) {
      return {
        data: {
          nombreInstitucion: "Colegio San José",
          codigoModular: "1234567",
          sedePrincipalNombre: "Sede Principal",
          sedePrincipalDireccion: "Av. Principal 123",
          academicYear: new Date().getFullYear(),
        },
      };
    }

    const sedePrincipal =
      institucion.sedes.find((s) => s.esPrincipal) || institucion.sedes[0];

    const activeSedeRes = await getActiveSedeAction();
    const activeSedeName =
      activeSedeRes && "activeSede" in activeSedeRes && activeSedeRes.activeSede
        ? activeSedeRes.activeSede.nombre
        : null;

    const headerInfo: InstitutionHeaderInfo = {
      nombreInstitucion: institucion.nombreInstitucion,
      nombreComercial: institucion.nombreComercial,
      codigoModular: institucion.codigoModular,
      sedePrincipalNombre: sedePrincipal?.nombre || "Sede Principal",
      sedePrincipalDireccion:
        sedePrincipal?.direccion || institucion.direccion || null,
      sedePrincipalTelefono:
        sedePrincipal?.telefono || institucion.telefono || null,
      sedeActivaNombre: activeSedeName,
      ugel: institucion.ugel,
      distrito: institucion.distrito,
      departamento: institucion.departamento,
      academicYear:
        institucion.cicloEscolarActual || new Date().getFullYear(),
    };

    return { data: serialize(headerInfo) };
  } catch (error) {
    console.error("Error fetching Excel header info:", error);
    return {
      data: {
        nombreInstitucion: "Colegio San José",
        codigoModular: "1234567",
        sedePrincipalNombre: "Sede Principal",
        academicYear: new Date().getFullYear(),
      },
    };
  }
}
