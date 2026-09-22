import { describe, it, expect, vi, beforeEach } from "vitest";
import { conciliarTransaccionesBancariasAction } from "@/actions/finance/conciliacion";
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
    cronogramaPago: {
      findFirst: vi.fn(),
    },
    $transaction: vi.fn((cb) =>
      cb({
        cronogramaPago: {
          update: vi.fn(),
        },
        pago: {
          create: vi.fn(),
        },
        auditLog: {
          create: vi.fn(),
        },
      })
    ),
  },
}));

describe("Bank Reconciliation Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject reconciliation when unauthenticated", async () => {
    vi.mocked(auth as any).mockResolvedValue(null);

    const result = await conciliarTransaccionesBancariasAction([
      { identificador: "71234567", monto: 350, referencia: "BCP-9921" },
    ]);

    expect(result.error).toBe("No autorizado");
  });

  it("should process and reconcile pending debts when student and debt match", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "usr-admin", name: "Admin", email: "admin@colegio.pe", institucionId: "inst-1" },
    } as any);

    vi.mocked(prisma.user.findFirst).mockResolvedValue({
      id: "est-10",
      name: "Carlos",
      apellidoPaterno: "Vargas",
      apellidoMaterno: "Ruiz",
      institucionId: "inst-1",
    } as any);

    vi.mocked(prisma.cronogramaPago.findFirst).mockResolvedValue({
      id: "crono-5",
      estudianteId: "est-10",
      monto: 350,
      montoPagado: 0,
      pagado: false,
      fechaVencimiento: new Date(),
      concepto: { nombre: "Pensión Marzo" },
    } as any);

    const result = await conciliarTransaccionesBancariasAction([
      { identificador: "71234567", monto: 350, referencia: "BCP-9921", canal: "BCP" },
    ]);

    expect(result.success).toBe(true);
    expect(result.data?.exitosos).toBe(1);
    expect(result.data?.montoTotalConciliado).toBe(350);
    expect(result.data?.detalles[0].estado).toBe("CONCILIADO");
  });
});
