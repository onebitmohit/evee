export function cleanText(value: string, maxLength = 4_000) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function splitCommaList(value: string) {
  return value.split(/[,\n]/).map((item) => item.trim()).filter(Boolean);
}

export function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

export function truncate(value: string, length: number) {
  if (value.length <= length) return value;
  return `${value.slice(0, Math.max(0, length - 1)).trim()}…`;
}
