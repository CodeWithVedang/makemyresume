import type { ResumeSettings } from "./schema";

const SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Formats a stored "YYYY-MM" value. Unknown shapes are returned unchanged. */
export function formatMonth(value: string, format: ResumeSettings["dateFormat"]): string {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return value;
  const year = match[1];
  const monthIndex = Number(match[2]) - 1;
  switch (format) {
    case "MMM YYYY":
      return `${SHORT[monthIndex]} ${year}`;
    case "MMMM YYYY":
      return `${LONG[monthIndex]} ${year}`;
    case "MM/YYYY":
      return `${match[2]}/${year}`;
    case "YYYY":
      return year;
  }
}

export function formatRange(
  start: string,
  end: string,
  format: ResumeSettings["dateFormat"],
  current = false,
): string {
  const from = start ? formatMonth(start, format) : "";
  const to = current ? "Present" : end ? formatMonth(end, format) : "";
  if (from && to) return from === to ? from : `${from} – ${to}`;
  return from || to;
}
