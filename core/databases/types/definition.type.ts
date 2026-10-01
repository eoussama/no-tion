import type { TNullable } from "@eoussama/core";
import type { PageObjectResponse } from "@notionhq/client";
import type { z } from "zod";
import type { TDatabaseSchema, TPageIcon, TPropertyKind, TPropertyRequest, TPropertyValue } from "../../notion";
import type { TLookupResult } from "./lookup.type";



/**
 * @description
 * The plain values of a row (or a form input), keyed by field key.
 */
export type TRowValues = Record<string, TPropertyValue>;

/**
 * @description
 * Page-level data every row carries, whatever the database.
 */
export type TBaseRow = {
  id: string;
  notionUrl: string;
  cover: TNullable<string>;
  icon: TPageIcon;
  createdTime: string;
  lastEditedTime: string;
};

/**
 * @description
 * A database row as sent to the client: page-level data plus the field values.
 */
export type TRow<TValues extends TRowValues = TRowValues> = TBaseRow & { values: TValues };

/**
 * @description
 * A field kind: a Notion property kind, or `cover` for the page cover (not a property).
 */
export type TFieldKind = TPropertyKind | "cover";

/**
 * @description
 * Context passed to definition hooks: the live schema of the data source.
 */
export type TDefinitionContext = {
  schema: TDatabaseSchema;
};

export type TFieldDef<TInput extends TRowValues = TRowValues> = {
  /** Key of the value in `row.values` and in the form input. */
  key: string;
  /** The Notion property name. Absent for `cover`. */
  property?: string;
  kind: TFieldKind;
  label: string;
  required?: boolean;
  /** Show as a table column (default `true`). */
  column?: boolean;
  /** Show in the create/edit form (default: when the kind is writable). */
  form?: boolean;
  placeholder?: string;
  description?: string;
  /** Static fallback options when the live schema has none. */
  options?: ReadonlyArray<string>;
  /** Whether unknown select options may be created in Notion (default: only for multi-select). */
  allowNewOptions?: boolean;
  /** Conditional visibility in the form (hidden fields are cleared on submit). */
  visibleWhen?: (values: Partial<TInput>) => boolean;
};

export type TLookupDef<TValues extends TRowValues = TRowValues, TInput extends TRowValues = TRowValues> = {
  /** Lookup provider name, as served by `/api/lookup/:provider` (e.g. `movies`). */
  provider: string;
  /** Short label shown in the UI (e.g. `IMDb`). */
  label: string;
  placeholder?: string;
  /** Maps a lookup result to a (partial) form input. */
  toInput: (result: TLookupResult, ctx: TDefinitionContext) => Partial<TInput>;
  /** Fields that are read-only once prefilled from a lookup result. */
  locked?: ReadonlyArray<keyof TInput & string>;
  /** Finds an existing row the input would duplicate. */
  duplicateOf?: (input: Partial<TInput>, rows: ReadonlyArray<TRow<TValues>>) => TRow<TValues> | undefined;
};

export type TViewMode = "table" | "gallery";

export type TViewsDef = {
  default: TViewMode;
  gallery?: {
    /** Field key holding the cover image (defaults to the page cover). */
    cover?: string;
    /** Field keys shown as tags under the title. */
    badges?: ReadonlyArray<string>;
    /** Secondary line under the tags (e.g. "Season 3 · Episode 7"). */
    subtitle?: (values: TRowValues) => string;
  };
};

/**
 * @description
 * What Notion needs to create or update a page.
 */
export type TNotionWrite = {
  properties: Record<string, TPropertyRequest>;
  cover?: TNullable<string>;
};

export type TDatabaseDefinition<TValues extends TRowValues = TRowValues, TInput extends TRowValues = TRowValues> = {
  slug: string;
  /** The Notion database id. */
  id: string;
  /** The data source id; defaults to the database's first data source. */
  dataSourceId?: string;
  title: string;
  /** An emoji. */
  icon?: string;
  description?: string;
  /** `true` for code-registered definitions, `false` for definitions generated from a live schema. */
  registered: boolean;
  /** The field holding the row title. */
  titleField: string;
  fields: ReadonlyArray<TFieldDef<TInput>>;
  rowSchema: z.ZodType<TRow<TValues>>;
  /** Validates a create input; `.partial()` validates an update. Shared by the client form and the server route. */
  inputSchema: z.ZodObject;
  defaults?: Partial<TInput>;
  views?: TViewsDef;
  lookup?: TLookupDef<TValues, TInput>;
  /** Custom page → row mapping (default: generic via `fields`). */
  fromNotion?: (page: PageObjectResponse, ctx: TDefinitionContext) => TRow<TValues>;
  /** Custom input → Notion mapping (default: generic via `fields`). */
  toNotion?: (input: Partial<TInput>, ctx: TDefinitionContext) => TNotionWrite;
};

/**
 * @description
 * A definition with its type parameters erased, as stored in the registry.
 */
export type TAnyDatabaseDefinition = TDatabaseDefinition<TRowValues, TRowValues>;
