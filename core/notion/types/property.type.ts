import type { TNullable } from "@eoussama/core";



/**
 * @description
 * Notion property types this app knows how to read. Anything else is reported as `unsupported`.
 */
export const PROPERTY_KINDS = [
  "title",
  "rich_text",
  "number",
  "select",
  "multi_select",
  "status",
  "date",
  "checkbox",
  "url",
  "email",
  "phone_number",
  "people",
  "files",
  "relation",
  "formula",
  "rollup",
  "unique_id",
  "created_time",
  "last_edited_time",
  "created_by",
  "last_edited_by",
  "unsupported",
] as const;

/**
 * @description
 * Property kinds that can be written through the API by this app.
 * The others are displayed read-only.
 */
export const WRITABLE_PROPERTY_KINDS = [
  "title",
  "rich_text",
  "number",
  "select",
  "multi_select",
  "status",
  "date",
  "checkbox",
  "url",
  "email",
  "phone_number",
] as const;

/**
 * @description
 * Notion's named colors for select, multi-select and status options.
 */
export const NOTION_COLORS = ["default", "gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"] as const;

export type TPropertyKind = (typeof PROPERTY_KINDS)[number];
export type TWritablePropertyKind = (typeof WRITABLE_PROPERTY_KINDS)[number];
export type TNotionColor = (typeof NOTION_COLORS)[number];

export type TSelectOption = {
  id: string;
  name: string;
  color: TNotionColor;
};

export type TStatusGroup = {
  id: string;
  name: string;
  color: TNotionColor;
  optionIds: Array<string>;
};

export type TPropertySchema = {
  id: string;
  name: string;
  kind: TPropertyKind;
  writable: boolean;
  options?: Array<TSelectOption>;
  groups?: Array<TStatusGroup>;
};

export type TDatabaseSchema = {
  dataSourceId: string;
  titleProperty: string;
  properties: Record<string, TPropertySchema>;
};

/**
 * @description
 * A property value as exchanged with the client:
 * - title, rich_text, url, email, phone_number, select, status, date (ISO start), created/edited time → `string | null`
 * - number → `number | null`
 * - checkbox → `boolean`
 * - multi_select, people, files, relation → `string[]`
 */
export type TPropertyValue = TNullable<string | number | boolean | Array<string>>;

/**
 * @description
 * The page icon, normalized.
 */
export type TPageIcon = TNullable<{ type: "emoji" | "url"; value: string }>;
