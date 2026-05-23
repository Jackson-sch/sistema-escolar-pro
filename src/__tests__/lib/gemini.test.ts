import { describe, it, expect, vi, beforeEach } from "vitest";
import { getGoogleClient, getGeminiModel } from "@/lib/gemini";
import { getSystemVariable } from "@/lib/settings";

// Mock the settings module
vi.mock("@/lib/settings", () => {
  return {
    getSystemVariable: vi.fn(),
  };
});

// Mock the Vercel AI SDK google provider
vi.mock("@ai-sdk/google", () => {
  return {
    createGoogleGenerativeAI: vi.fn((config) => {
      // Return a dummy client function that tracks model invocations
      const clientMock = vi.fn((modelName) => ({
        modelName,
        apiKey: config.apiKey,
      }));
      return clientMock;
    }),
  };
});

describe("Gemini Client & Configuration Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully retrieve client with primary GOOGLE_GENERATIVE_AI_API_KEY", async () => {
    vi.mocked(getSystemVariable).mockImplementation(async (key, defaultValue) => {
      if (key === "GOOGLE_GENERATIVE_AI_API_KEY") return "primary-api-key";
      return defaultValue || "";
    });

    const client = await getGoogleClient();
    // The client function returned by the mock can be invoked to verify apiKey
    const modelInstance = (client as any)("some-model");

    expect(getSystemVariable).toHaveBeenCalledWith("GOOGLE_GENERATIVE_AI_API_KEY");
    expect(modelInstance.apiKey).toBe("primary-api-key");
  });

  it("should fall back to GEMINI api key if primary key is not set", async () => {
    vi.mocked(getSystemVariable).mockImplementation(async (key, defaultValue) => {
      if (key === "GOOGLE_GENERATIVE_AI_API_KEY") return "";
      if (key === "GEMINI") return "fallback-gemini-key";
      return defaultValue || "";
    });

    const client = await getGoogleClient();
    const modelInstance = (client as any)("some-model");

    expect(getSystemVariable).toHaveBeenCalledWith("GOOGLE_GENERATIVE_AI_API_KEY");
    expect(getSystemVariable).toHaveBeenCalledWith("GEMINI");
    expect(modelInstance.apiKey).toBe("fallback-gemini-key");
  });

  it("should resolve to default model gemini-2.5-flash when no GEMINI_MODEL is specified", async () => {
    vi.mocked(getSystemVariable).mockImplementation(async (key, defaultValue) => {
      if (key === "GOOGLE_GENERATIVE_AI_API_KEY") return "api-key";
      if (key === "GEMINI_MODEL") return defaultValue || "";
      return defaultValue || "";
    });

    const modelInstance = await getGeminiModel();
    expect((modelInstance as any).modelName).toBe("gemini-2.5-flash");
  });

  it("should redirect deprecated gemini-3-flash-preview model to gemini-2.5-flash", async () => {
    vi.mocked(getSystemVariable).mockImplementation(async (key, defaultValue) => {
      if (key === "GOOGLE_GENERATIVE_AI_API_KEY") return "api-key";
      if (key === "GEMINI_MODEL") return "gemini-3-flash-preview";
      return defaultValue || "";
    });

    const modelInstance = await getGeminiModel();
    expect((modelInstance as any).modelName).toBe("gemini-2.5-flash");
  });

  it("should accept custom valid GEMINI_MODEL values", async () => {
    vi.mocked(getSystemVariable).mockImplementation(async (key, defaultValue) => {
      if (key === "GOOGLE_GENERATIVE_AI_API_KEY") return "api-key";
      if (key === "GEMINI_MODEL") return "gemini-1.5-pro";
      return defaultValue || "";
    });

    const modelInstance = await getGeminiModel();
    expect((modelInstance as any).modelName).toBe("gemini-1.5-pro");
  });
});
