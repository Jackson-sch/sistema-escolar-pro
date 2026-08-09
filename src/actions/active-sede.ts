"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const ACTIVE_SEDE_COOKIE = "active_sede_id";

export interface SedeOption {
  id: string;
  nombre: string;
  direccion: string | null;
  esPrincipal: boolean;
}

/**
 * Obtener únicamente el ID de la sede activa desde la cookie de sesión
 */
export async function getActiveSedeId() {
  const cookieStore = await cookies();
  const val = cookieStore.get(ACTIVE_SEDE_COOKIE)?.value;
  if (!val || val === "ALL") return null;
  return val;
}

/**
 * Obtener las sedes de la institución actual y la sede activa en la sesión
 */
export async function getActiveSedeAction() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    const institucionId = session.user.institucionId;
    if (!institucionId && session.user.role !== "super_admin") {
      return { error: "Institución no especificada" };
    }

    const where = institucionId ? { institucionId, activo: true } : { activo: true };

    const sedes = await prisma.sede.findMany({
      where,
      select: {
        id: true,
        nombre: true,
        direccion: true,
        esPrincipal: true,
      },
      orderBy: [{ esPrincipal: "desc" }, { nombre: "asc" }],
    });

    if (sedes.length === 0) {
      return { success: true, sedes: [], activeSedeId: null, activeSede: null };
    }

    const cookieStore = await cookies();
    const activeCookieId = cookieStore.get(ACTIVE_SEDE_COOKIE)?.value;

    let activeSede = null;
    if (activeCookieId === "ALL") {
      activeSede = {
        id: "ALL",
        nombre: "Todas las Sedes",
        direccion: "Vista Consolidada",
        esPrincipal: false,
      };
    } else {
      activeSede = sedes.find((s) => s.id === activeCookieId);
      if (!activeSede) {
        // Sede por defecto: la principal o la primera
        activeSede = sedes.find((s) => s.esPrincipal) || sedes[0];
      }
    }

    return {
      success: true,
      sedes,
      activeSedeId: activeSede.id,
      activeSede,
    };
  } catch (error) {
    console.error("Error al obtener la sede activa:", error);
    return { error: "No se pudo recuperar la sede activa" };
  }
}

/**
 * Establecer una nueva sede activa en la sesión (cookie)
 */
export async function setActiveSedeAction(sedeId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    let targetSede: { id: string; nombre: string } | null = null;

    if (sedeId === "ALL") {
      targetSede = { id: "ALL", nombre: "Todas las Sedes" };
    } else {
      targetSede = await prisma.sede.findUnique({
        where: { id: sedeId },
        select: { id: true, nombre: true },
      });
    }

    if (!targetSede) {
      return { error: "Sede no encontrada" };
    }

    const cookieStore = await cookies();
    cookieStore.set(ACTIVE_SEDE_COOKIE, sedeId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 días
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    revalidatePath("/", "layout");
    return { success: true, activeSede: targetSede };
  } catch (error) {
    console.error("Error al establecer la sede activa:", error);
    return { error: "No se pudo cambiar la sede activa" };
  }
}
