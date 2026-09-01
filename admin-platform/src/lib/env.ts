const DEFAULT_API_URL = "http://127.0.0.1:8000/api/v1";

export function getApiBaseUrl() {
  const value = process.env.DJANGO_API_URL?.trim();
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error("DJANGO_API_URL is required in production (for example https://api.example.com/api/v1). ");
  }
  return (value || DEFAULT_API_URL).replace(/\/$/, "");
}

export function secureCookies() {
  return process.env.ADMIN_SECURE_COOKIES === "true" || process.env.NODE_ENV === "production";
}
