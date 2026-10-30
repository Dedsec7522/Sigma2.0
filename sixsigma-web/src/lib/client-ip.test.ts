import { afterEach, describe, expect, it, vi } from "vitest";
import { clientIp } from "./client-ip";

const req = (headers: Record<string, string>) => new Request("https://example.test/api/enquiry", { headers });

afterEach(() => vi.unstubAllEnvs());

describe("clientIp", () => {
  it("ignores the client-controlled first X-Forwarded-For hop", () => {
    expect(clientIp(req({ "x-forwarded-for": "203.0.113.9, 198.51.100.7" }))).toBe("198.51.100.7");
  });

  it("prefers the configured trusted header", () => {
    vi.stubEnv("TRUSTED_IP_HEADER", "cf-connecting-ip");
    expect(clientIp(req({ "cf-connecting-ip": "192.0.2.4", "x-forwarded-for": "203.0.113.9" }))).toBe("192.0.2.4");
  });

  it("falls back to x-real-ip, then 'unknown'", () => {
    expect(clientIp(req({ "x-real-ip": "192.0.2.5" }))).toBe("192.0.2.5");
    expect(clientIp(req({}))).toBe("unknown");
  });
});
