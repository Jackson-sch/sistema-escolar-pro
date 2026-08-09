import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const startTime = Date.now();

  try {
    // Probar conectividad con la base de datos PostgreSQL
    await prisma.$queryRaw`SELECT 1`;
    const dbLatencyMs = Date.now() - startTime;

    return NextResponse.json(
      {
        status: "ok",
        system: "Sistema Escolar Pro",
        timestamp: new Date().toISOString(),
        database: {
          status: "connected",
          latencyMs: dbLatencyMs,
        },
        uptimeSeconds: Math.floor(process.uptime()),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[HealthCheck Error] Fallo de conexión con la BD:", error);
    return NextResponse.json(
      {
        status: "error",
        system: "Sistema Escolar Pro",
        timestamp: new Date().toISOString(),
        database: {
          status: "disconnected",
          error: error?.message || "Error al conectar con PostgreSQL",
        },
      },
      { status: 503 }
    );
  }
}
