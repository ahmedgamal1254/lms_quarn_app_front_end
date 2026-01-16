export function utcToLocalDateTime(
  utcString: string,
  options?: Intl.DateTimeFormatOptions,
  locale: string = typeof window !== "undefined"
    ? navigator.language
    : "en-US"
) {
  if (!utcString) return "";

  const date = new Date(utcString);

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    ...options,
  }).format(date);
}

export function utcToLocalDate(
  utcString: string,
  locale = "ar-EG"
) {
  return new Date(utcString).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function utcToLocalTime(
  utcString: string,
  locale = "ar-EG"
) {
  return new Date(utcString).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function timeToUTC(time: string, date: string) {
  // time: "22:00"
  // date: "2026-01-20"

  const localDateTime = new Date(`${date}T${time}`);
  return localDateTime.toISOString(); // UTC
}

export const formatDateForInput = (isoDate: string) => {
  return isoDate ? isoDate.split('T')[0] : '';
};