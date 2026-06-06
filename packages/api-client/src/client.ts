import type {
  AuthResponse,
  Booking,
  LoginRequest,
  QrCodeResponse,
  SignupRequest,
} from "@pravaas/types";

export interface ApiClientConfig {
  baseUrl: string;
  getToken?: () => string | null;
}

export class ApiClient {
  private baseUrl: string;
  private getToken?: () => string | null;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.getToken = config.getToken;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = this.getToken?.();
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    if (
      options.body &&
      !(options.body instanceof FormData) &&
      !headers["Content-Type"]
    ) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText,
        statusCode: response.status,
      }));
      throw error;
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  login(data: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  signup(data: SignupRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  getProfile(): Promise<{ user: AuthResponse["user"] }> {
    return this.request("/auth/me");
  }

  getBookings(): Promise<Booking[]> {
    return this.request<Booking[]>("/bookings");
  }

  getBooking(id: string): Promise<Booking> {
    return this.request<Booking>(`/bookings/${id}`);
  }

  uploadBookingScreenshot(uri: string, fileName: string): Promise<Booking> {
    const formData = new FormData();
    formData.append("file", {
      uri,
      name: fileName,
      type: "image/jpeg",
    } as unknown as Blob);

    return this.request<Booking>("/bookings/upload", {
      method: "POST",
      body: formData,
    });
  }

  getBookingQr(id: string): Promise<QrCodeResponse> {
    return this.request<QrCodeResponse>(`/qr/${id}`);
  }
}
