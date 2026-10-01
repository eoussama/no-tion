import type { TNullable } from "@eoussama/core";
import type { CreatePageParameters, DataSourceObjectResponse, PageObjectResponse } from "@notionhq/client";
import type { TDatabaseSchema, TNotionColor, TPageIcon, TPropertyKind, TPropertySchema, TPropertyValue, TSelectOption, TWritablePropertyKind } from "../types";

import { NOTION_COLORS, PROPERTY_KINDS, WRITABLE_PROPERTY_KINDS } from "../types";



type TPagePropertyResponse = PageObjectResponse["properties"][string];
type TSchemaPropertyResponse = DataSourceObjectResponse["properties"][string];
type TRichText = Array<{ plain_text: string }>;

/**
 * @description
 * The request shape of a single property value, as accepted by `pages.create` and `pages.update`.
 */
export type TPropertyRequest = NonNullable<CreatePageParameters["properties"]>[string];

/**
 * @description
 * Notion's limit for a single rich text item content.
 */
const RICH_TEXT_CHUNK = 2000;

function toKind(type: string): TPropertyKind {
  return (PROPERTY_KINDS as ReadonlyArray<string>).includes(type) ? type as TPropertyKind : "unsupported";
}

function toColor(color: string | undefined): TNotionColor {
  return (NOTION_COLORS as ReadonlyArray<string>).includes(color ?? "") ? color as TNotionColor : "default";
}

function toOptions(options: Array<{ id: string; name: string; color?: string }>): Array<TSelectOption> {
  return options.map(option => ({ id: option.id, name: option.name, color: toColor(option.color) }));
}

function toRichText(value: string): Array<{ type: "text"; text: { content: string } }> {
  const chunks: Array<{ type: "text"; text: { content: string } }> = [];

  for (let i = 0; i < value.length; i += RICH_TEXT_CHUNK) {
    chunks.push({ type: "text", text: { content: value.slice(i, i + RICH_TEXT_CHUNK) } });
  }

  return chunks;
}

function userName(user: { id: string }): string {
  const name = (user as { name?: TNullable<string> }).name;

  return name || user.id;
}

function asString(value: TPropertyValue): TNullable<string> {
  if (value === null || value === undefined) {
    return null;
  }

  const str = String(value).trim();

  return str.length > 0 ? str : null;
}

function asNumber(value: TPropertyValue): TNullable<number> {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const num = typeof value === "number" ? value : Number(value);

  return Number.isFinite(num) ? num : null;
}

function asStringArray(value: TPropertyValue): Array<string> {
  if (Array.isArray(value)) {
    return value.map(item => item.trim()).filter(item => item.length > 0);
  }

  const str = asString(value);

  return str ? [str] : [];
}

/**
 * @description
 * Joins a Notion rich text array into plain text.
 *
 * @param richText - The rich text items.
 * @returns The plain text.
 */
export function plainText(richText: TNullable<TRichText> | undefined): string {
  return (richText ?? []).map(item => item.plain_text).join("");
}

/**
 * @description
 * Tells whether a property kind can be written by this app.
 *
 * @param kind - The property kind.
 * @returns `true` if the kind is writable.
 */
export function isWritableKind(kind: TPropertyKind): kind is TWritablePropertyKind {
  return (WRITABLE_PROPERTY_KINDS as ReadonlyArray<string>).includes(kind);
}

/**
 * @description
 * Reads a raw Notion property value (as found in `page.properties[name]`) into a plain value.
 *
 * @param property - The raw property value.
 * @returns The plain value (see `TPropertyValue`).
 */
export function readPropertyValue(property: TPagePropertyResponse | undefined): TPropertyValue {
  if (!property) {
    return null;
  }

  switch (property.type) {
    case "title":
      return plainText(property.title);

    case "rich_text":
      return plainText(property.rich_text);

    case "number":
      return property.number;

    case "select":
      return property.select?.name ?? null;

    case "multi_select":
      return property.multi_select.map(option => option.name);

    case "status":
      return property.status?.name ?? null;

    case "date":
      return property.date?.start ?? null;

    case "checkbox":
      return property.checkbox;

    case "url":
      return property.url;

    case "email":
      return property.email;

    case "phone_number":
      return property.phone_number;

    case "people":
      return property.people.map(person => userName(person));

    case "files":
      return property.files.map(file => file.type === "external" ? file.external.url : file.type === "file" ? file.file.url : (file as { name: string }).name);

    case "relation":
      return property.relation.map(relation => relation.id);

    case "created_time":
      return property.created_time;

    case "last_edited_time":
      return property.last_edited_time;

    case "created_by":
      return userName(property.created_by);

    case "last_edited_by":
      return userName(property.last_edited_by);

    case "unique_id":
      return property.unique_id.number === null ? null : [property.unique_id.prefix, property.unique_id.number].filter(part => part !== null).join("-");

    case "formula": {
      const formula = property.formula;

      switch (formula.type) {
        case "string": return formula.string;

        case "number": return formula.number;

        case "boolean": return formula.boolean;

        case "date": return formula.date?.start ?? null;

        default: return null;
      }
    }

    case "rollup": {
      const rollup = property.rollup;

      switch (rollup.type) {
        case "number": return rollup.number;

        case "date": return rollup.date?.start ?? null;

        case "array": return rollup.array.map(item => String(readPropertyValue(item as TPagePropertyResponse) ?? "")).filter(Boolean);

        default: return null;
      }
    }

    default:
      return null;
  }
}

/**
 * @description
 * Reads a property of a page by its name.
 *
 * @param page - The page (only its properties are used).
 * @param name - The property name.
 * @returns The plain value (see `TPropertyValue`).
 */
export function readProperty(page: Pick<PageObjectResponse, "properties">, name: string): TPropertyValue {
  return readPropertyValue(page.properties[name]);
}

/**
 * @description
 * Converts a plain value into the request shape Notion expects for a property of the given kind.
 * Empty strings are treated as "no value".
 *
 * @param kind - The property kind.
 * @param value - The plain value.
 * @returns The request value, or `undefined` when the kind cannot be written (or a status is cleared, which Notion does not allow).
 */
export function writeProperty(kind: TPropertyKind, value: TPropertyValue): TPropertyRequest | undefined {
  switch (kind) {
    case "title":
      return { title: toRichText(asString(value) ?? "") };

    case "rich_text":
      return { rich_text: toRichText(asString(value) ?? "") };

    case "number":
      return { number: asNumber(value) };

    case "select": {
      const name = asString(value);

      return { select: name ? { name } : null };
    }

    case "multi_select":
      return { multi_select: asStringArray(value).map(name => ({ name })) };

    case "status": {
      const name = asString(value);

      return name ? { status: { name } } : undefined;
    }

    case "date": {
      const start = asString(value);

      return { date: start ? { start } : null };
    }

    case "checkbox":
      return { checkbox: value === true || value === "true" };

    case "url":
      return { url: asString(value) };

    case "email":
      return { email: asString(value) };

    case "phone_number":
      return { phone_number: asString(value) };

    default:
      return undefined;
  }
}

/**
 * @description
 * Normalizes a data source's property configuration into a compact, serializable schema.
 *
 * @param dataSource - The data source (from `dataSources.retrieve`).
 * @returns The normalized schema.
 */
export function normalizeSchema(dataSource: Pick<DataSourceObjectResponse, "id" | "properties">): TDatabaseSchema {
  const properties: Record<string, TPropertySchema> = {};
  let titleProperty = "";

  for (const [name, config] of Object.entries(dataSource.properties) as Array<[string, TSchemaPropertyResponse]>) {
    const kind = toKind(config.type);
    const schema: TPropertySchema = { id: config.id, name, kind, writable: isWritableKind(kind) };

    if (config.type === "select") {
      schema.options = toOptions(config.select.options);
    }
    else if (config.type === "multi_select") {
      schema.options = toOptions(config.multi_select.options);
    }
    else if (config.type === "status") {
      schema.options = toOptions(config.status.options);
      schema.groups = config.status.groups.map(group => ({ id: group.id, name: group.name, color: toColor(group.color), optionIds: group.option_ids }));
    }
    else if (config.type === "title") {
      titleProperty = name;
    }

    properties[name] = schema;
  }

  return { dataSourceId: dataSource.id, titleProperty, properties };
}

/**
 * @description
 * Some covers were saved as a `srcset` ("url 320w, url 480w, ...") instead of a URL.
 * Picks the widest candidate up to `maxWidth` (or the narrowest when all are wider); plain URLs are returned as is.
 *
 * @param value - The stored image URL or srcset.
 * @param maxWidth - The preferred maximum width, in pixels.
 * @returns A single image URL.
 */
export function normalizeImageUrl(value: string, maxWidth: number = 800): string {
  const trimmed = value.trim();

  if (!/\s/.test(trimmed)) {
    return trimmed;
  }

  const candidates = trimmed
    .split(/,\s+(?=https?:\/\/)/)
    .map((candidate) => {
      const [url = "", descriptor = ""] = candidate.trim().split(/\s+/);
      const width = Number.parseInt(descriptor, 10);

      return { url, width: Number.isFinite(width) ? width : 0 };
    })
    .filter(candidate => /^https?:\/\//.test(candidate.url))
    .sort((a, b) => a.width - b.width);

  const fitting = candidates.filter(candidate => candidate.width <= maxWidth);

  return (fitting.at(-1) ?? candidates[0])?.url ?? trimmed;
}

/**
 * @description
 * Extracts the cover image URL of a page.
 *
 * @param page - The page.
 * @param page.cover - The page cover.
 * @returns The cover URL, if any.
 */
export function pageCover(page: { cover: PageObjectResponse["cover"] }): TNullable<string> {
  const cover = page.cover;

  if (!cover) {
    return null;
  }

  if (cover.type === "external") {
    return normalizeImageUrl(cover.external.url);
  }

  if (cover.type === "file") {
    return cover.file.url;
  }

  return null;
}

/**
 * @description
 * Extracts the icon of a page, database or data source.
 *
 * @param page - The object carrying the icon.
 * @param page.icon - The icon.
 * @returns The normalized icon, if any.
 */
export function pageIcon(page: { icon: PageObjectResponse["icon"] }): TPageIcon {
  const icon = page.icon;

  if (!icon) {
    return null;
  }

  switch (icon.type) {
    case "emoji": return { type: "emoji", value: icon.emoji };

    case "external": return { type: "url", value: icon.external.url };

    case "file": return { type: "url", value: icon.file.url };

    case "custom_emoji": return { type: "url", value: icon.custom_emoji.url };

    default: return null;
  }
}
