import axios from "@/api/axios";
import * as WebBrowser from "expo-web-browser";

export async function startDiditVerification() {
  const response = await axios.post("/didit/session");

  const sessionUrl = response.data.session_url;

  if (!sessionUrl) {
    throw new Error("Didit session URL was not returned.");
  }

  await WebBrowser.openBrowserAsync(sessionUrl);
}
