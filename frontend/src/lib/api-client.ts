/**
 * Typed API Client Wrapper
 * Handles CSRF Injection, Global 401/403 intercepts, and Typed Responses
 */

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, data: any) {
    super(data?.detail || "API Error");
    this.status = status;
    this.data = data;
  }
}

export async function fetchClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  };

  // CSRF Token Injection
  if (typeof window !== "undefined") {
    const csrfMeta = document.querySelector('meta[name="csrf-token"]');
    if (csrfMeta) {
      defaultHeaders["X-CSRF-Token"] = csrfMeta.getAttribute("content") || "";
    }
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    // Required to send HttpOnly JWT Cookies across subdomains (if applicable)
    credentials: "include", 
  };

  const response = await fetch(`/api/v1${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    
    // Global Authentication/Authorization Interceptor
    if (response.status === 401 || response.status === 403) {
      if (typeof window !== "undefined") {
        console.error("401/403 Triggered: Terminating session securely.");
        // Hard-redirect drops React state ensuring no dirty leaks
        window.location.href = "/auth/login?session_expired=true";
      }
    }
    
    throw new ApiError(response.status, errorData);
  }

  // Support 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
