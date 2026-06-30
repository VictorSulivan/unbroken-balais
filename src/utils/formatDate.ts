const TZ = "Europe/Paris";

export function fmtDate(date: Date | string, opts: Intl.DateTimeFormatOptions): string {
  return new Date(date).toLocaleDateString("fr-FR", { timeZone: TZ, ...opts });
}
1