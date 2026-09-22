import { describe, it, expect, vi, beforeEach } from "vitest";
import { registerQRAsistenciaAction } from "@/actions/attendance/qr";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

// Mock next-auth
vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  default: {
    user: {
      findFirst: vi.fn(),
    },
    asistencia: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    variableSistema: {
      findUnique: vi.fn(),
    },
    politicaAsistencia: {
      findFirst: vi.fn(),
    },
  },
}));

describe("Attendance QR Server Action Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject QR scan when user is not authenticated", async () => {
    vi.mocked(auth as any).mockResolvedValue(null);

    const result = await registerQRAsistenciaAction("70123456");

    expect(result.error).toBe("No autorizado");
    expect(prisma.user.findFirst).not.toHaveBeenCalled();
  });

  it("should return error if student does not exist", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "usr-1", role: "administrativo" },
    } as any);

    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

    const result = await registerQRAsistenciaAction("99999999");

    expect(result.error).toBe("Estudiante no encontrado");
  });
});
