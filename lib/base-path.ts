const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim() ?? "";

export const basePath = configuredBasePath && configuredBasePath !== "/"
  ? `/${configuredBasePath.replace(/^\/+|\/+$/g, "")}`
  : "";

export function withBasePath(value: string) {
  if (!basePath || !value.startsWith("/") || value.startsWith("//")) return value;
  if (value === basePath || value.startsWith(`${basePath}/`)) return value;
  return `${basePath}${value}`;
}

export function withoutBasePath(value: string) {
  if (!basePath || value === basePath) return value === basePath ? "/" : value;
  return value.startsWith(`${basePath}/`) ? value.slice(basePath.length) : value;
}

export function absoluteSiteUrl(siteUrl: string, value = "") {
  const root = siteUrl.replace(/\/+$/, "");
  const path = value.replace(/^\/+/, "");
  return path ? `${root}/${path}` : root;
}
