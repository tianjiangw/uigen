import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock server-only so it doesn't throw in test environment
vi.mock("server-only", () => ({}));

// Mock next/headers cookies
const mockCookieSet = vi.fn();
const mockCookieStore = { set: mockCookieSet };
vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue(mockCookieStore),
}));

import { createSession } from "@/lib/auth";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode("development-secret-key");

describe("createSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sets a cookie named auth-token", async () => {
    await createSession("user-123", "test@example.com");

    const [name] = mockCookieSet.mock.calls[0];
    expect(name).toBe("auth-token");
  });

  it("sets httpOnly, sameSite lax, path /", async () => {
    await createSession("user-123", "test@example.com");

    const [, , options] = mockCookieSet.mock.calls[0];
    expect(options.httpOnly).toBe(true);
    expect(options.sameSite).toBe("lax");
    expect(options.path).toBe("/");
  });

  it("sets expiry ~7 days in the future", async () => {
    const before = Date.now();
    await createSession("user-123", "test@example.com");
    const after = Date.now();

    const [, , options] = mockCookieSet.mock.calls[0];
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    expect(options.expires.getTime()).toBeGreaterThanOrEqual(before + sevenDaysMs - 1000);
    expect(options.expires.getTime()).toBeLessThanOrEqual(after + sevenDaysMs + 1000);
  });

  it("sets a valid signed JWT containing userId and email", async () => {
    await createSession("user-123", "test@example.com");

    const [, token] = mockCookieSet.mock.calls[0];
    expect(token.split(".")).toHaveLength(3);

    const { payload } = await jwtVerify(token, JWT_SECRET);
    expect(payload.userId).toBe("user-123");
    expect(payload.email).toBe("test@example.com");
  });

  it("sets secure: false outside production", async () => {
    vi.stubEnv("NODE_ENV", "test");
    await createSession("user-123", "test@example.com");

    const [, , options] = mockCookieSet.mock.calls[0];
    expect(options.secure).toBe(false);
    vi.unstubAllEnvs();
  });

  it("sets secure: true in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    await createSession("user-123", "test@example.com");

    const [, , options] = mockCookieSet.mock.calls[0];
    expect(options.secure).toBe(true);
    vi.unstubAllEnvs();
  });
});
