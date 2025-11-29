import AppError from "./errors";

export async function fetchJson(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, init);
  const text = await res.text();
  let data: unknown = null;
  try {
    if (text) data = JSON.parse(text);
  } catch {
    // not json
  }

  if (!res.ok) {
    const message =
      data && typeof data === "object" && "error" in data
        ? String((data as Record<string, unknown>)["error"])
        : res.statusText || "Request failed";
    throw new AppError(message, res.status || 500);
  }

  return data;
}

export default fetchJson;
