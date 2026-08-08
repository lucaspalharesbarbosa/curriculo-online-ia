import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Extrai até 2 badges curtos a partir do cargo em `hero.title` (separado por `|`). */
export function deriveProfileBadges(title: string): string[] {
  return title
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);
}

export function formatResumePeriod(
  startDate: string,
  endDate: string | null,
): string {
  if (!endDate) {
    return `${startDate} – Atual`;
  }
  return `${startDate} – ${endDate}`;
}
