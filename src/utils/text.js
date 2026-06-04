export function textResult(obj) {
  const text =
    typeof obj === "string" ? obj : JSON.stringify(obj, null, 2);
  return {
    content: [{ type: "text", text }],
  };
}

export function maskKeyPrefix(prefix) {
  if (!prefix) return "(unknown)";
  const s = String(prefix);
  if (s.length <= 8) return `${s.slice(0, 4)}…`;
  return `${s.slice(0, 8)}…`;
}
