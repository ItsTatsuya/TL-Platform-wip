import { afterEach, describe, expect, it, vi } from "vitest";
import { getApiBaseUrl, secureCookies } from "./env";

afterEach(() => vi.unstubAllEnvs());

describe("admin environment", () => {
  it("uses an explicit API root without a trailing slash", () => {
    vi.stubEnv("DJANGO_API_URL", "https://api.example.test/api/v1/");
    expect(getApiBaseUrl()).toBe("https://api.example.test/api/v1");
  });

  it("fails clearly when production API configuration is absent", () => {
    vi.stubEnv("DJANGO_API_URL", ""); vi.stubEnv("NODE_ENV", "production");
    expect(() => getApiBaseUrl()).toThrow(/DJANGO_API_URL is required/);
  });

  it("requires secure cookies in production", () => {
    vi.stubEnv("ADMIN_SECURE_COOKIES", ""); vi.stubEnv("NODE_ENV", "production");
    expect(secureCookies()).toBe(true);
  });
});
