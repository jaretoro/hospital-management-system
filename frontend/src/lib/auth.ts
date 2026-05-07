export interface AuthUser {
  id:          string;
  name:        string;
  email:       string;
  role:        "admin" | "doctor";
  phoneNumber: string;
  isActive:    boolean;
}

export function saveAuth(token: string, user: AuthUser): void {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function getUser(): AuthUser | null {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function clearAuth(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}