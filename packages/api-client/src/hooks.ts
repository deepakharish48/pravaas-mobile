import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type {
  AuthResponse,
  Booking,
  LoginRequest,
  QrCodeResponse,
  SignupRequest,
  IdentityDocument,
} from "@pravaas/types";
import type { ApiClient } from "./client";

export const queryKeys = {
  profile: ["profile"] as const,
  bookings: ["bookings"] as const,
  identity: ["identity"] as const,
  booking: (id: string) => ["bookings", id] as const,
  qr: (id: string) => ["qr", id] as const,
};

export function useLogin(
  client: ApiClient,
  options?: UseMutationOptions<AuthResponse, Error, LoginRequest>,
) {
  return useMutation({
    mutationFn: (data: LoginRequest) => client.login(data),
    ...options,
  });
}

export function useSignup(
  client: ApiClient,
  options?: UseMutationOptions<AuthResponse, Error, SignupRequest>,
) {
  return useMutation({
    mutationFn: (data: SignupRequest) => client.signup(data),
    ...options,
  });
}

export function useProfile(
  client: ApiClient,
  enabled = true,
  options?: Omit<
    UseQueryOptions<{ user: AuthResponse["user"] }>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: () => client.getProfile(),
    enabled,
    ...options,
  });
}

export function useBookings(
  client: ApiClient,
  enabled = true,
  options?: Omit<UseQueryOptions<Booking[]>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: queryKeys.bookings,
    queryFn: () => client.getBookings(),
    enabled,
    ...options,
  });
}

export function useBooking(
  client: ApiClient,
  id: string,
  enabled = true,
  options?: Omit<UseQueryOptions<Booking>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: queryKeys.booking(id),
    queryFn: () => client.getBooking(id),
    enabled: enabled && !!id,
    ...options,
  });
}

export function useUploadBooking(
  client: ApiClient,
  options?: UseMutationOptions<
    Booking,
    Error,
    { uri: string; fileName: string }
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uri, fileName }: { uri: string; fileName: string }) =>
      client.uploadBookingScreenshot(uri, fileName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
    },
    ...options,
  });
}

export function useBookingQr(
  client: ApiClient,
  id: string,
  enabled = true,
  options?: Omit<UseQueryOptions<QrCodeResponse>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: queryKeys.qr(id),
    queryFn: () => client.getBookingQr(id),
    enabled: enabled && !!id,
    ...options,
  });
  
}
export function useIdentityDocuments(
  client: ApiClient,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.identity,
    queryFn: () => client.getIdentityDocuments(),
    enabled,
  });
}

export function useUploadIdentity(
  client: ApiClient,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      uri,
      fileName,
    }: {
      uri: string;
      fileName: string;
    }) =>
      client.uploadIdentityDocument(
        uri,
        fileName,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.identity,
      });
    },
  });
}
