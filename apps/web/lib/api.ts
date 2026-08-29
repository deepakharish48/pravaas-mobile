const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export async function api(
  path: string,
  options: RequestInit = {},
) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (
    options.body &&
    !(options.body instanceof FormData)
  ) {
    headers["Content-Type"] =
      "application/json";
  }

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,
      headers,
    },
  );

  const contentType =
    response.headers.get("content-type") ?? "";

  if (!response.ok) {
    if (
      contentType.includes(
        "application/json",
      )
    ) {
      throw await response.json();
    }

    throw new Error(await response.text());
  }

  if (
    contentType.includes(
      "application/json",
    )
  ) {
    return response.json();
  }

  return response.text();
}