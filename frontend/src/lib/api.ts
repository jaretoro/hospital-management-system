const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function getToken(): string | null {
  return localStorage.getItem("token");
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? "Something went wrong");
  }

  return response.json();
}

export const api = {
  get:    <T>(endpoint: string)                => request<T>(endpoint),
  post:   <T>(endpoint: string, body: unknown) => request<T>(endpoint, { method: "POST",   body: JSON.stringify(body) }),
  put:    <T>(endpoint: string, body: unknown) => request<T>(endpoint, { method: "PUT",    body: JSON.stringify(body) }),
  patch:  <T>(endpoint: string, body: unknown) => request<T>(endpoint, { method: "PATCH",  body: JSON.stringify(body) }),
  delete: <T>(endpoint: string)                => request<T>(endpoint, { method: "DELETE" }),
};