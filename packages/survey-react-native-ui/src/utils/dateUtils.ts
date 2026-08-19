/**
 * Date and time parsing/formatting utilities for SurveyJS React Native renderer.
 * These helpers perform timezone-neutral conversions to/from strings matching HTML5 standard semantics.
 */

export function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatTime(d: Date): string {
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function formatDateTime(d: Date): string {
  return `${formatDate(d)}T${formatTime(d)}`;
}

export function parseDate(val: any): Date {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  if (typeof val === "string") {
    const parts = val.split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts.map(Number);
      return new Date(year, month - 1, day);
    }
  }
  const fallback = new Date(val);
  return isNaN(fallback.getTime()) ? new Date() : fallback;
}

export function parseTime(val: any): Date {
  const now = new Date();
  if (!val || typeof val !== "string") return now;
  const parts = val.split(":");
  if (parts.length >= 2) {
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
  }
  return now;
}

export function parseDateTime(val: any): Date {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  if (typeof val === "string" && val.includes("T")) {
    const [datePart, timePart] = val.split("T");
    const dParts = datePart.split("-").map(Number);
    const tParts = timePart.split(":").map(Number);
    if (dParts.length === 3 && tParts.length >= 2) {
      return new Date(dParts[0], dParts[1] - 1, dParts[2], tParts[0], tParts[1]);
    }
  }
  const fallback = new Date(val);
  return isNaN(fallback.getTime()) ? new Date() : fallback;
}

/**
 * Calculates the ISO week number for a given Date.
 * Jan 4th is always in Week 1.
 */
export function getISOWeek(date: Date): { year: number, week: number } {
  // Use UTC coordinates to prevent offset/DST skew
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const year = d.getUTCFullYear();
  const firstThursday = new Date(Date.UTC(year, 0, 4));
  const firstThursdayDayNum = firstThursday.getUTCDay() || 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() + 4 - firstThursdayDayNum);
  const week = 1 + Math.round((d.getTime() - firstThursday.getTime()) / 604800000);
  return { year, week };
}

export function formatISOWeek(date: Date): string {
  const { year, week } = getISOWeek(date);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

export function parseISOWeek(weekStr: string): Date {
  if (!weekStr || typeof weekStr !== "string") return new Date();
  const match = weekStr.match(/^(\d{4})-W(\d{2})$/);
  if (!match) return new Date();
  const year = parseInt(match[1], 10);
  const week = parseInt(match[2], 10);
  const d = new Date(Date.UTC(year, 0, 4));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 1 - dayNum);
  d.setUTCDate(d.getUTCDate() + (week - 1) * 7);
  // Convert UTC date to local Date instance
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}
