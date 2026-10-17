export function safeAuthDestination(value: string | null | undefined): string {
  return value?.startsWith("/") && !value.startsWith("//") && !value.includes("\\")
    ? value : "/more";
}
