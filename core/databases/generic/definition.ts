import type { TDatabaseSchema } from "../../notion";
import type { TAnyDatabaseDefinition, TDatabaseMeta, TFieldDef } from "../types";

import { z } from "zod";
import { fieldInputSchema, isFormField, SRow } from "../utils";



const RESERVED_KEYS = new Set(["id", "values", "constructor", "__proto__", "prototype"]);

const HIDDEN_COLUMN_KINDS = new Set(["rich_text", "people", "files", "relation", "rollup", "created_by", "last_edited_by", "created_time", "last_edited_time", "unsupported"]);

/**
 * @description
 * Turns a Notion property name into a form-safe field key (camelCase ASCII, unique).
 *
 * @param name - The property name.
 * @param taken - The keys already used.
 * @returns The field key.
 */
export function toFieldKey(name: string, taken: Set<string>): string {
  const words = name
    .normalize("NFKD")
    .replace(/[^\w\s]/g, " ")
    .trim()
    .split(/[\s_]+/)
    .filter(Boolean);

  let base = words
    .map((word, index) => index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("") || "field";

  if (/^\d/.test(base) || RESERVED_KEYS.has(base)) {
    base = `f${base.charAt(0).toUpperCase()}${base.slice(1)}`;
  }

  let key = base;

  for (let i = 2; taken.has(key); i++) {
    key = `${base}${i}`;
  }

  taken.add(key);

  return key;
}

/**
 * @description
 * Builds a definition from the live schema of a data source, so any database shared with the integration works with no code.
 *
 * @param meta - The database summary.
 * @param schema - The live schema.
 * @returns The generated definition.
 */
export function buildGenericDefinition(meta: TDatabaseMeta, schema: TDatabaseSchema): TAnyDatabaseDefinition {
  const taken = new Set<string>();
  const properties = Object.values(schema.properties);
  const ordered = [
    ...properties.filter(property => property.kind === "title"),
    ...properties.filter(property => property.kind !== "title"),
  ];

  const fields: Array<TFieldDef> = ordered.map(property => ({
    key: toFieldKey(property.name, taken),
    property: property.name,
    kind: property.kind,
    label: property.name,
    column: !HIDDEN_COLUMN_KINDS.has(property.kind),
  }));

  const cover: TFieldDef = { key: toFieldKey("cover", taken), kind: "cover", label: "Cover", column: false, placeholder: "https://..." };
  const allFields = [...fields, cover];
  const titleField = fields.find(field => field.kind === "title")?.key ?? fields[0]?.key ?? "title";

  const shape: Record<string, z.ZodType> = {};

  for (const field of allFields.filter(isFormField)) {
    shape[field.key] = fieldInputSchema(field.kind);
  }

  return {
    slug: meta.slug,
    id: meta.id,
    dataSourceId: schema.dataSourceId,
    title: meta.title || "Untitled",
    icon: meta.icon?.type === "emoji" ? meta.icon.value : undefined,
    registered: false,
    titleField,
    fields: allFields,
    rowSchema: SRow,
    inputSchema: z.object(shape),
    views: { default: "table" },
  };
}
