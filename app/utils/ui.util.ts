import type { TFieldKind, TNotionColor, TPageIcon } from "~~/core";



/**
 * @description
 * Notion-like icon of each property kind (table headers, property lists, form labels).
 */
const KIND_ICONS: Record<TFieldKind, string> = {
  title: "i-lucide-type",
  rich_text: "i-lucide-align-left",
  number: "i-lucide-hash",
  select: "i-lucide-circle-chevron-down",
  multi_select: "i-lucide-list",
  status: "i-lucide-circle-dot-dashed",
  date: "i-lucide-calendar",
  checkbox: "i-lucide-square-check",
  url: "i-lucide-link",
  email: "i-lucide-at-sign",
  phone_number: "i-lucide-phone",
  people: "i-lucide-users",
  files: "i-lucide-paperclip",
  relation: "i-lucide-arrow-up-right",
  formula: "i-lucide-sigma",
  rollup: "i-lucide-search",
  unique_id: "i-lucide-key-round",
  created_time: "i-lucide-clock",
  last_edited_time: "i-lucide-clock",
  created_by: "i-lucide-circle-user",
  last_edited_by: "i-lucide-circle-user",
  cover: "i-lucide-image",
  unsupported: "i-lucide-circle-help",
};

/**
 * @description
 * The icon of a property kind.
 *
 * @param kind - The field kind.
 * @returns The icon name.
 */
export function propertyIcon(kind: TFieldKind): string {
  return KIND_ICONS[kind] ?? KIND_ICONS.unsupported;
}

/**
 * @description
 * Fallback icon of a database without an emoji or image icon.
 */
export const DATABASE_ICON = "i-lucide-database";

/**
 * @description
 * Colors used for generated tones (poster placeholders, card bands), in a pleasant order.
 */
const TONES: ReadonlyArray<TNotionColor> = ["blue", "green", "yellow", "pink", "purple", "orange", "brown", "red", "gray"];

/**
 * @description
 * A stable Notion color for any string (e.g. a row id), for placeholders.
 *
 * @param seed - The string to derive the color from.
 * @returns The color.
 */
export function toneOf(seed: string): TNotionColor {
  let hash = 0;

  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }

  return TONES[Math.abs(hash) % TONES.length] ?? "gray";
}

/**
 * @description
 * Tag background utility of a Notion color (literal strings so Tailwind generates them).
 */
export const TONE_BACKGROUNDS: Record<TNotionColor, string> = {
  default: "bg-tag-default",
  gray: "bg-tag-gray",
  brown: "bg-tag-brown",
  orange: "bg-tag-orange",
  yellow: "bg-tag-yellow",
  green: "bg-tag-green",
  blue: "bg-tag-blue",
  purple: "bg-tag-purple",
  pink: "bg-tag-pink",
  red: "bg-tag-red",
};

/**
 * @description
 * Up to three initials of a title, for poster placeholders.
 *
 * @param title - The title.
 * @returns The monogram.
 */
export function monogram(title: string): string {
  const words = title.replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean);

  if (words.length === 1) {
    return (words[0] ?? "").slice(0, 2).toUpperCase();
  }

  return words.slice(0, 3).map(word => word[0]).join("").toUpperCase();
}

/**
 * @description
 * Whether a page icon is an emoji (rendered as text) rather than an image.
 *
 * @param icon - The page icon.
 * @returns The emoji, if any.
 */
export function emojiOf(icon: TPageIcon | undefined): string | undefined {
  return icon?.type === "emoji" ? icon.value : undefined;
}

const RELATIVE = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

const UNITS: ReadonlyArray<[Intl.RelativeTimeFormatUnit, number]> = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
];

/**
 * @description
 * A short relative time ("just now", "2 hours ago", "yesterday").
 *
 * @param date - The date (ISO string or timestamp).
 * @param now - The reference time.
 * @returns The formatted time.
 */
export function formatRelative(date: string | number | null | undefined, now: number = Date.now()): string {
  if (date === null || date === undefined || date === "") {
    return "";
  }

  const time = typeof date === "number" ? date : new Date(date).getTime();

  if (Number.isNaN(time)) {
    return "";
  }

  const seconds = Math.round((time - now) / 1000);

  if (Math.abs(seconds) < 60) {
    return "just now";
  }

  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) {
      return RELATIVE.format(Math.round(seconds / size), unit);
    }
  }

  return "just now";
}

/**
 * @description
 * The host and path of a URL, without protocol or `www.` (e.g. `imdb.com/title/tt0816692`).
 *
 * @param value - The URL.
 * @returns The short form, or the value itself when it is not a URL.
 */
export function shortUrl(value: string): string {
  try {
    const url = new URL(value);

    return `${url.hostname.replace(/^www\./, "")}${url.pathname}`.replace(/\/$/, "");
  }
  catch {
    return value;
  }
}
