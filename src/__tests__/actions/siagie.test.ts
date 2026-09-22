import { describe, it, expect, vi, beforeEach } from "vitest";
import { getSiagieExportDataAction } from "@/actions/siagie";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

// Mock next-auth
vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  default: {
    nivelAcademico: {
      findUnique: vi.fn(),
    },
    periodoAcademico: {
      findUnique: vi.fn(),
    },
    curso: {
      findMany: vi.fn(),
    },
    nota: {
      findMany: vi.fn(),
    },
  },
}));

describe("SIAGIE Official Export Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject export if user is unauthenticated", async () => {
    vi.mocked(auth as any).mockResolvedValue(null);

    const result = await getSiagieExportDataAction({
      nivelAcademicoId: "sec-1",
      periodoId: "per-1",
    });

    expect(result.error).toBe("No autorizado");
  });

  it("should generate xlsx binary base64 when parameters and records exist", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "usr-1", role: "administrativo" },
    } as any);

    vi.mocked(prisma.nivelAcademico.findUnique).mockResolvedValue({
      id: "sec-1",
      seccion: "A",
      grado: {
        nombre: "1ro Secundaria",
        nivelId: "niv-sec",
        nivel: { nombre: "Secundaria" },
      },
      institucion: {
        nombre: "Colegio San Martín",
        codigoModular: "1234567",
      },
      students: [
        {
          id: "est-1",
          role: "estudiante",
          codigoEstudiante: "EST001",
          dni: "71234567",
          tipoDocumento: "DNI",
          name: "Juan",
          apellidoPaterno: "Pérez",
          apellidoMaterno: "Gómez",
        },
      ],
    } as any);

    vi.mocked(prisma.periodoAcademico.findUnique).mockResolvedValue({
      id: "per-1",
      nombre: "I Bimestre",
      anioEscolar: 2026,
    } as any);

    vi.mocked(prisma.curso.findMany).mockResolvedValue([
      {
        id: "cur-1",
        nombre: "Matemática",
        areaCurricular: {
          orden: 1,
          competencias: [
            { id: "comp-1", nombre: "Resuelve problemas de cantidad" },
          ],
        },
      },
    ] as any);

    vi.mocked(prisma.nota.findMany).mockResolvedValue([
      {
        id: "nota-1",
        estudianteId: "est-1",
        valorLiteral: "AD",
        valor: null,
        comentario: "Excelente desempeño autónomo",
        evaluacion: {
          periodoId: "per-1",
          cursoId: "cur-1",
        },
      },
    ] as any);

    const result = await getSiagieExportDataAction({
      nivelAcademicoId: "sec-1",
      periodoId: "per-1",
    });

    expect(result.success).toBe(true);
    expect(result.base64).toBeDefined();
    expect(result.fileName).toContain("SIAGIE_1234567_1ro_Secundaria_A");
  });
});
