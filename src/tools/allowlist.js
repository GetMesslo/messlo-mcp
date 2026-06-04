const BLOCKED_PREFIXES = [
  "/api/admin",
  "/api/admin-dashboard",
  "/api/impersonation",
  "/api/webhook/stripe",
  "/api/webhook/razorpay",
  "/api/webhook/paypal",
  "/api/webhook/dodo",
  "/api/payments/webhook",
  "/webhook/",
];

export function isPathAllowed(path) {
  const p = String(path || "").trim();
  if (!p.startsWith("/")) return false;
  if (p.includes("..")) return false;
  if (!p.startsWith("/api/") && !p.startsWith("/v1/")) return false;
  for (const blocked of BLOCKED_PREFIXES) {
    if (p.startsWith(blocked)) return false;
  }
  return true;
}
