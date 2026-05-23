import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCurricularAreasAction, upsertAreaAction } from "@/actions/academic";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

// Mock next-auth
vi.mock("@/auth", () => {
  return {
    auth: vi.fn(),
  };
});

// Mock next/cache
vi.mock("next/cache", () => {
  return {
    revalidatePath: vi.fn(),
  };
});

// Mock prisma client
vi.mock("@/lib/prisma", () => {
  return {
    default: {
      areaCurricular: {
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        findFirst: vi.fn(),
      },
    },
  };
});

describe("Academic Server Actions Security & Isolation Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCurricularAreasAction", () => {
    it("should reject fetching areas when user is not authenticated", async () => {
      vi.mocked(auth as any).mockResolvedValue(null);

      const result = await getCurricularAreasAction();

      expect(result.error).toContain("No autorizado");
      expect(prisma.areaCurricular.findMany).not.toHaveBeenCalled();
    });

    it("should filter results by session's institucionId if user is not super_admin", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: {
          id: "usr-1",
          role: "administrativo",
          institucionId: "inst-123",
        },
      } as any);

      vi.mocked(prisma.areaCurricular.findMany).mockResolvedValue([
        { id: "area-1", nombre: "Matemáticas", institucionId: "inst-123" },
      ] as any);

      const result = await getCurricularAreasAction();

      expect(result.data).toBeDefined();
      expect(prisma.areaCurricular.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            institucionId: "inst-123",
          },
        })
      );
    });

    it("should NOT filter results by session's institucionId if user is super_admin", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: {
          id: "usr-1",
          role: "super_admin",
        },
      } as any);

      vi.mocked(prisma.areaCurricular.findMany).mockResolvedValue([
        { id: "area-1", nombre: "Matemáticas", institucionId: "inst-123" },
      ] as any);

      const result = await getCurricularAreasAction();

      expect(result.data).toBeDefined();
      expect(prisma.areaCurricular.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        })
      );
    });
  });

  describe("upsertAreaAction", () => {
    it("should reject execution if user is not authenticated", async () => {
      vi.mocked(auth as any).mockResolvedValue(null);

      const result = await upsertAreaAction({ nombre: "Comunicación" });

      expect(result.error).toContain("No autorizado");
      expect(prisma.areaCurricular.create).not.toHaveBeenCalled();
    });

    it("should reject execution if user lacks proper administrative roles (e.g. docente/padre)", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: {
          id: "usr-1",
          role: "docente",
          institucionId: "inst-123",
        },
      } as any);

      const result = await upsertAreaAction({ nombre: "Comunicación" });

      expect(result.error).toContain("No tienes permiso");
      expect(prisma.areaCurricular.create).not.toHaveBeenCalled();
    });

    it("should successfully allow super_admin to execute the upsert operation", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: {
          id: "usr-1",
          role: "super_admin",
        },
      } as any);

      const inputData = {
        nombre: "Ciencias",
        nivelId: "nivel-1",
      };

      vi.mocked(prisma.areaCurricular.create).mockResolvedValue({
        id: "area-new",
        ...inputData,
      } as any);

      const result = await upsertAreaAction(inputData);

      expect(result.data).toBeDefined();
      expect(prisma.areaCurricular.create).toHaveBeenCalled();
    });

    it("should successfully allow admin to execute and bind institucionId from session", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: {
          id: "usr-1",
          role: "administrativo",
          institucionId: "inst-123",
        },
      } as any);

      const inputData = {
        nombre: "Ciencias",
        nivelId: "nivel-1",
      };

      vi.mocked(prisma.areaCurricular.create).mockResolvedValue({
        id: "area-new",
        institucionId: "inst-123",
        ...inputData,
      } as any);

      const result = await upsertAreaAction(inputData);

      expect(result.data).toBeDefined();
      expect(prisma.areaCurricular.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            institucionId: "inst-123",
          }),
        })
      );
    });
  });
});
