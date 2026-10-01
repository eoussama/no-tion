import type { PageObjectResponse } from "@notionhq/client";
import type { TDatabaseSchema, TPropertyValue, TSelectOption } from "../../notion";
import type { TAnyDatabaseDefinition, TDefinitionContext, TFieldDef, TFieldKind, TNotionWrite, TRow, TRowValues } from "../types";

import { z } from "zod";
import { isWritableKind, pageCover, pageIcon, readProperty, writeProperty } from "../../notion";



export const SPageIcon = z.object({ type: z.enum(["emoji", "url"]), value: z.string() }).nullable();
export const SPropertyValue = z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]).nullable();

export const SBaseRow = z.object({
  id: z.string(),
  notionUrl: z.string(),
  cover: z.string().nullable(),
  icon: SPageIcon,
  createdTime: z.string(),
  lastEditedTime: z.string(),
});

export const SRow = SBaseRow.extend({ values: z.record(z.string(), SPropertyValue) });

const REQUIRED = "Required";

/**
 * @description
 * Kinds edited as plain text.
 */
const TEXT_KINDS: ReadonlySet<TFieldKind> = new Set<TFieldKind>(["title", "rich_text", "phone_number"]);

/**
 * @description
 * Builds the zod schema validating a single field of a create input.
 * Optional text-like fields accept an empty string, which is stored as "no value".
 *
 * @param kind - The field kind.
 * @param required - Whether a value is required.
 * @returns The zod schema.
 */
export function fieldInputSchema(kind: TFieldKind, required: boolean = false): z.ZodType<TPropertyValue | undefined, TPropertyValue | undefined> {
  if (TEXT_KINDS.has(kind)) {
    return required ? z.string(REQUIRED).trim().min(1, REQUIRED) : z.string().nullable().optional();
  }

  if (kind === "url" || kind === "cover") {
    return required
      ? z.url({ error: "A valid URL is required", protocol: /^https?$/ })
      : z.union([z.literal(""), z.url({ error: "Must be a valid URL", protocol: /^https?$/ })]).nullable().optional();
  }

  if (kind === "email") {
    return required ? z.email("A valid email is required") : z.union([z.literal(""), z.email("Must be a valid email")]).nullable().optional();
  }

  if (kind === "number") {
    return required ? z.number(REQUIRED) : z.number().nullable().optional();
  }

  if (kind === "select" || kind === "status" || kind === "date") {
    return required ? z.string(REQUIRED).min(1, REQUIRED) : z.string().nullable().optional();
  }

  if (kind === "multi_select") {
    return required ? z.array(z.string()).min(1, REQUIRED) : z.array(z.string()).optional();
  }

  if (kind === "checkbox") {
    return z.boolean().optional();
  }

  return SPropertyValue.optional();
}

/**
 * @description
 * The empty form value of a field kind.
 *
 * @param kind - The field kind.
 * @returns The empty value.
 */
export function emptyValue(kind: TFieldKind): TPropertyValue {
  if (TEXT_KINDS.has(kind) || kind === "url" || kind === "email" || kind === "cover") {
    return "";
  }

  if (kind === "multi_select") {
    return [];
  }

  return kind === "checkbox" ? false : null;
}

/**
 * @description
 * Tells whether a field is editable in forms.
 *
 * @param field - The field.
 * @returns `true` when the field is shown in the create/edit form.
 */
export function isFormField(field: TFieldDef): boolean {
  if (field.form !== undefined) {
    return field.form;
  }

  return field.kind === "cover" || isWritableKind(field.kind);
}

/**
 * @description
 * The fields shown in the create/edit form.
 *
 * @param def - The database definition.
 * @returns The form fields.
 */
export function getFormFields(def: TAnyDatabaseDefinition): Array<TFieldDef> {
  return def.fields.filter(isFormField);
}

/**
 * @description
 * The fields shown as table columns.
 *
 * @param def - The database definition.
 * @returns The column fields.
 */
export function getColumnFields(def: TAnyDatabaseDefinition): Array<TFieldDef> {
  return def.fields.filter(field => field.column !== false);
}

/**
 * @description
 * Finds a field by key.
 *
 * @param def - The database definition.
 * @param key - The field key.
 * @returns The field, if any.
 */
export function getField(def: TAnyDatabaseDefinition, key: string): TFieldDef | undefined {
  return def.fields.find(field => field.key === key);
}

/**
 * @description
 * Resolves the options of a select, multi-select or status field: live schema first, static fallback otherwise.
 *
 * @param field - The field.
 * @param schema - The live schema, if loaded.
 * @returns The options.
 */
export function resolveOptions(field: TFieldDef, schema?: TDatabaseSchema | null): Array<TSelectOption> {
  const live = field.property ? schema?.properties[field.property]?.options : undefined;

  if (live && live.length > 0) {
    return live;
  }

  return (field.options ?? []).map(name => ({ id: name, name, color: "default" as const }));
}

/**
 * @description
 * Whether a field accepts options that do not exist in the live schema yet (Notion creates them on write).
 *
 * @param field - The field.
 * @returns `true` if new options may be created.
 */
export function allowsNewOptions(field: TFieldDef): boolean {
  return field.allowNewOptions ?? field.kind === "multi_select";
}

/**
 * @description
 * Builds an empty form input for a definition, with its defaults applied.
 *
 * @param def - The database definition.
 * @returns The empty input.
 */
export function emptyInput(def: TAnyDatabaseDefinition): TRowValues {
  const input: TRowValues = {};

  for (const field of getFormFields(def)) {
    input[field.key] = def.defaults?.[field.key] ?? emptyValue(field.kind);
  }

  return input;
}

/**
 * @description
 * Builds a form input from an existing row (for editing).
 *
 * @param def - The database definition.
 * @param row - The row.
 * @returns The input.
 */
export function rowToInput(def: TAnyDatabaseDefinition, row: TRow): TRowValues {
  const input: TRowValues = {};

  for (const field of getFormFields(def)) {
    input[field.key] = row.values[field.key] ?? emptyValue(field.kind);
  }

  return input;
}

/**
 * @description
 * Clears the values of fields hidden by their `visibleWhen` condition.
 *
 * @param def - The database definition.
 * @param input - The form input.
 * @returns The cleaned input.
 */
export function cleanInput(def: TAnyDatabaseDefinition, input: TRowValues): TRowValues {
  const cleaned: TRowValues = { ...input };

  for (const field of getFormFields(def)) {
    if (field.visibleWhen && !field.visibleWhen(input)) {
      cleaned[field.key] = emptyValue(field.kind);
    }
  }

  return cleaned;
}

/**
 * @description
 * Generic page → row mapping, driven by the definition fields.
 *
 * @param def - The database definition.
 * @param page - The Notion page.
 * @returns The row.
 */
export function rowFromPage(def: TAnyDatabaseDefinition, page: PageObjectResponse): TRow {
  const values: TRowValues = {};
  const cover = pageCover(page);

  for (const field of def.fields) {
    values[field.key] = field.kind === "cover" ? cover : field.property ? readProperty(page, field.property) : null;
  }

  return {
    id: page.id,
    notionUrl: page.url,
    cover,
    icon: pageIcon(page),
    createdTime: page.created_time,
    lastEditedTime: page.last_edited_time,
    values,
  };
}

/**
 * @description
 * Maps a page to a row, using the definition's own mapping when it has one.
 *
 * @param def - The database definition.
 * @param page - The Notion page.
 * @param ctx - The definition context.
 * @returns The row.
 */
export function fromNotion(def: TAnyDatabaseDefinition, page: PageObjectResponse, ctx: TDefinitionContext): TRow {
  return def.fromNotion ? def.fromNotion(page, ctx) : rowFromPage(def, page);
}

/**
 * @description
 * Generic input → Notion mapping, driven by the definition fields. Keys absent from the input are left untouched.
 *
 * @param def - The database definition.
 * @param input - The (possibly partial) input.
 * @param ctx - The definition context (the live property kind wins over the declared one).
 * @returns The Notion properties and cover.
 */
export function inputToNotion(def: TAnyDatabaseDefinition, input: Partial<TRowValues>, ctx?: TDefinitionContext): TNotionWrite {
  const write: TNotionWrite = { properties: {} };

  for (const field of getFormFields(def)) {
    const value = input[field.key];

    if (value === undefined) {
      continue;
    }

    if (field.kind === "cover") {
      write.cover = typeof value === "string" && value.trim() ? value.trim() : null;
      continue;
    }

    if (!field.property) {
      continue;
    }

    const kind = ctx?.schema.properties[field.property]?.kind ?? field.kind;
    const property = writeProperty(kind, value);

    if (property) {
      write.properties[field.property] = property;
    }
  }

  return write;
}

/**
 * @description
 * Maps an input to Notion, using the definition's own mapping when it has one.
 *
 * @param def - The database definition.
 * @param input - The (possibly partial) input.
 * @param ctx - The definition context.
 * @returns The Notion properties and cover.
 */
export function toNotion(def: TAnyDatabaseDefinition, input: Partial<TRowValues>, ctx: TDefinitionContext): TNotionWrite {
  return def.toNotion ? def.toNotion(input, ctx) : inputToNotion(def, input, ctx);
}

/**
 * @description
 * Checks that select and status values exist in the live schema, so a typo does not silently create a new option in Notion.
 *
 * @param def - The database definition.
 * @param input - The (possibly partial) input.
 * @param schema - The live schema.
 * @returns An error message per offending field key (empty when valid).
 */
export function validateOptions(def: TAnyDatabaseDefinition, input: Partial<TRowValues>, schema: TDatabaseSchema): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const field of getFormFields(def)) {
    const value = input[field.key];

    if (!["select", "status", "multi_select"].includes(field.kind) || allowsNewOptions(field) || value === undefined || value === null || value === "") {
      continue;
    }

    const options = field.property ? schema.properties[field.property]?.options : undefined;

    if (!options || options.length === 0) {
      continue;
    }

    const names = new Set(options.map(option => option.name));
    const unknown = (Array.isArray(value) ? value : [String(value)]).filter(name => !names.has(name));

    if (unknown.length > 0) {
      errors[field.key] = `Unknown option "${unknown.join("\", \"")}" for ${field.label}`;
    }
  }

  return errors;
}

/**
 * @description
 * Builds a temporary row from an input, for optimistic updates.
 *
 * @param def - The database definition.
 * @param input - The input.
 * @param base - The row to patch (for updates) or `undefined` (for creates).
 * @returns The optimistic row.
 */
export function optimisticRow(def: TAnyDatabaseDefinition, input: Partial<TRowValues>, base?: TRow): TRow {
  const now = new Date().toISOString();
  const values: TRowValues = { ...base?.values };
  let cover = base?.cover ?? null;

  for (const field of def.fields) {
    const value = input[field.key];

    if (value === undefined) {
      continue;
    }

    const normalized = value === "" ? null : value;

    values[field.key] = normalized;

    if (field.kind === "cover") {
      cover = typeof normalized === "string" ? normalized : null;
    }
  }

  return {
    id: base?.id ?? `optimistic-${Math.random().toString(36).slice(2)}`,
    notionUrl: base?.notionUrl ?? "",
    icon: base?.icon ?? null,
    createdTime: base?.createdTime ?? now,
    lastEditedTime: now,
    cover,
    values,
  };
}

/**
 * @description
 * The display title of a row.
 *
 * @param def - The database definition.
 * @param row - The row.
 * @returns The title, or "Untitled".
 */
export function getRowTitle(def: TAnyDatabaseDefinition, row: TRow): string {
  const title = row.values[def.titleField];

  return typeof title === "string" && title.trim() ? title : "Untitled";
}

/**
 * @description
 * Tells whether a row is a not-yet-confirmed optimistic insert.
 *
 * @param row - The row.
 * @returns `true` for optimistic rows.
 */
export function isOptimisticRow(row: TRow): boolean {
  return row.id.startsWith("optimistic-");
}
