import { describe, it, expect, vi, beforeEach } from "vitest";
import { registrarPagoAction } from "@/actions/finance/pagos";
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
    $transaction: vi.fn((callback) =>
      callback({
        cronogramaPago: {
          findFirst: vi.fn(),
          update: vi.fn(),
        },
        pago: {
          create: vi.fn(),
        },
      })
    ),
  },
}));

describe("Finance Server Actions Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("registrarPagoAction", () => {
    it("should reject payment registration if user is unauthenticated", async () => {
      vi.mocked(auth as any).mockResolvedValue(null);

      const result = await registrarPagoAction({
        cronogramaId: "crono-1",
        monto: 150,
      });

      expect(result.error).toBeDefined();
    });

    it("should reject payment with invalid or negative amount", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "usr-1", role: "administrativo", institucionId: "inst-1" },
      } as any);

      const result = await registrarPagoAction({
        cronogramaId: "crono-1",
        monto: -50,
      });

      expect(result.error).toBeDefined();
    });
  });
});
