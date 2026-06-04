/** Fixed Messlo API origin — not configurable in MCP (always api.messlo.com). */
export const MESSLO_API_BASE_URL = "https://api.messlo.com";

export function loadConfig() {
  const apiKey = process.env.MESSLO_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "MESSLO_API_KEY is required. Create a key in Messlo → Integration Tools → API Credentials, then add it to your MCP env."
    );
  }

  return { apiKey, baseUrl: MESSLO_API_BASE_URL };
}
