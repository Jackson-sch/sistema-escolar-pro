import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST, DELETE } from "@/app/api/upload/route";
import { auth } from "@/auth";
import { uploadFile, deleteFile } from "@/lib/storage";
import { NextRequest } from "next/server";

// Mock next-auth
vi.mock("@/auth", () => {
  return {
    auth: vi.fn(),
  };
});

// Mock storage
vi.mock("@/lib/storage", () => {
  return {
    uploadFile: vi.fn(),
    deleteFile: vi.fn(),
  };
});

describe("File Upload API Router Security & Validation Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Helper to create a NextRequest Mock with FormData
  const createMockRequest = (formData: FormData): NextRequest => {
    return {
      formData: async () => formData,
    } as unknown as NextRequest;
  };

  it("should return 401 Unauthorized when user session is not active (POST)", async () => {
    vi.mocked(auth as any).mockResolvedValue(null);

    const formData = new FormData();
    const req = createMockRequest(formData);

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("No autorizado");
  });

  it("should return 400 when no file is present in request body", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "1", role: "super_admin" } } as any);

    const formData = new FormData();
    const req = createMockRequest(formData);

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("No se encontró ningún archivo");
  });

  it("should reject files exceeding 4MB limit", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "1", role: "super_admin" } } as any);

    const mockFile = new File([new ArrayBuffer(5 * 1024 * 1024)], "large-file.png", {
      type: "image/png",
    });

    const formData = new FormData();
    formData.append("file", mockFile);
    const req = createMockRequest(formData);

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("demasiado grande");
  });

  it("should block insecure MIME types (XSS Vector: SVG, HTML)", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "1", role: "super_admin" } } as any);

    const svgFile = new File(["<svg></svg>"], "attack.svg", {
      type: "image/svg+xml",
    });

    const formData = new FormData();
    formData.append("file", svgFile);
    const req = createMockRequest(formData);

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("Tipo de archivo no permitido");
  });

  it("should block files with insecure double extensions or hazardous extensions (XSS Vector: HTML)", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "1", role: "super_admin" } } as any);

    const htmlFile = new File(["<h1>Attack</h1>"], "photo.png.html", {
      type: "image/png", // Lie about MIME type but suffix has .html
    });

    const formData = new FormData();
    formData.append("file", htmlFile);
    const req = createMockRequest(formData);

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("Extensión de archivo peligrosa");
  });

  it("should allow safe standard document formats and proceed to store them", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "1", role: "super_admin" } } as any);
    vi.mocked(uploadFile).mockResolvedValue("https://storage.provider/uploads/doc.pdf");

    const pdfFile = new File([new ArrayBuffer(1024)], "academic-syllabus.pdf", {
      type: "application/pdf",
    });

    const formData = new FormData();
    formData.append("file", pdfFile);
    const req = createMockRequest(formData);

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.url).toBe("https://storage.provider/uploads/doc.pdf");
    expect(uploadFile).toHaveBeenCalledWith(pdfFile);
  });

  it("should return 401 Unauthorized when session is not active (DELETE)", async () => {
    vi.mocked(auth as any).mockResolvedValue(null);

    const req = {
      json: async () => ({ url: "https://storage.provider/uploads/doc.pdf" }),
    } as unknown as NextRequest;

    const response = await DELETE(req);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("No autorizado");
  });

  it("should reject delete request when file URL is missing", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "1", role: "super_admin" } } as any);

    const req = {
      json: async () => ({ url: "" }),
    } as unknown as NextRequest;

    const response = await DELETE(req);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("URL de archivo requerida");
  });

  it("should successfully invoke storage delete when valid URL is given", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "1", role: "super_admin" } } as any);
    vi.mocked(deleteFile).mockResolvedValue(true);

    const targetUrl = "https://storage.provider/uploads/doc.pdf";
    const req = {
      json: async () => ({ url: targetUrl }),
    } as unknown as NextRequest;

    const response = await DELETE(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(deleteFile).toHaveBeenCalledWith(targetUrl);
  });
});
