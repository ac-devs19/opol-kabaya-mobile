import axios from "@/api/axios";

export async function startDiditVerification(): Promise<string> {
  const response = await axios.post("/didit/session");

  const sessionUrl = response.data?.session_url;

  if (!sessionUrl) {
    throw new Error("Didit session URL was not returned.");
  }

  const parsedUrl = new URL(sessionUrl);

  if (parsedUrl.protocol !== "https:") {
    throw new Error("Invalid Didit verification URL.");
  }

  return sessionUrl;
}
