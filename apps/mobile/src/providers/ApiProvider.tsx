import React, { createContext, useContext, useMemo } from "react";
import { ApiClient } from "@pravaas/api-client";
import { API_BASE_URL } from "../config";
import { useAuthStore } from "../store/authStore";

const ApiContext = createContext<ApiClient | null>(null);

export function ApiProvider({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);

  const client = useMemo(
    () =>
      new ApiClient({
        baseUrl: API_BASE_URL,
        getToken: () => useAuthStore.getState().token,
      }),
    [token],
  );

  return <ApiContext.Provider value={client}>{children}</ApiContext.Provider>;
}

export function useApiClient() {
  const client = useContext(ApiContext);
  if (!client) {
    throw new Error("useApiClient must be used within ApiProvider");
  }
  return client;
}
