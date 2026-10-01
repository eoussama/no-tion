import type { DataSourceObjectResponse, PageObjectResponse } from "@notionhq/client";
import type { TPropertyKind, TPropertyRequest, TPropertyValue } from "../core/notion";

import { describe, expect, it } from "vitest";
import { normalizeImageUrl, normalizeSchema, pageCover, pageIcon, readProperty, readPropertyValue, writeProperty } from "../core/notion";



type TPageProperty = PageObjectResponse["properties"][string];
type TLooseRequest = Record<string, unknown>;

const RICH_TEXT_KINDS = new Set<TPropertyKind>(["title", "rich_text"]);
const OPTION_KINDS = new Set<TPropertyKind>(["select", "status"]);

/**
 * @description
 * Turns a property request (what is sent to Notion) into the matching response shape (what Notion sends back),
 * for the subset of fields `readPropertyValue` uses.
 *
 * @param kind - The property kind.
 * @param request - The property request.
 * @returns The response-shaped property.
 */
function toResponse(kind: TPropertyKind, request: TPropertyRequest): TPageProperty {
  const value = (request as TLooseRequest)[kind];

  if (RICH_TEXT_KINDS.has(kind)) {
    return { id: "x", type: kind, [kind]: (value as Array<{ text: { content: string } }>).map(item => ({ type: "text", plain_text: item.text.content })) } as unknown as TPageProperty;
  }

  if (OPTION_KINDS.has(kind)) {
    return { id: "x", type: kind, [kind]: value ? { id: "o", name: (value as { name: string }).name, color: "blue" } : null } as unknown as TPageProperty;
  }

  if (kind === "multi_select") {
    return { id: "x", type: kind, multi_select: (value as Array<{ name: string }>).map(option => ({ id: option.name, name: option.name, color: "default" })) } as unknown as TPageProperty;
  }

  if (kind === "date") {
    return { id: "x", type: kind, date: value ? { start: (value as { start: string }).start, end: null, time_zone: null } : null } as unknown as TPageProperty;
  }

  return { id: "x", type: kind, [kind]: value } as unknown as TPageProperty;
}

function roundTrip(kind: TPropertyKind, value: TPropertyValue): TPropertyValue {
  const request = writeProperty(kind, value);

  if (!request) {
    throw new Error(`${kind} is not writable`);
  }

  return readPropertyValue(toResponse(kind, request));
}

describe("property round trip", () => {
  it.each<[TPropertyKind, TPropertyValue]>([
    ["title", "Inception"],
    ["rich_text", "A thief who steals corporate secrets"],
    ["number", 8.8],
    ["number", 0],
    ["select", "Movie"],
    ["multi_select", ["Christopher Nolan", "Leonardo DiCaprio"]],
    ["multi_select", []],
    ["status", "To Watch"],
    ["date", "2010-07-16"],
    ["checkbox", true],
    ["checkbox", false],
    ["url", "https://www.imdb.com/title/tt1375666/"],
    ["email", "someone@example.com"],
    ["phone_number", "+212 600 000 000"],
  ])("%s keeps %j", (kind, value) => {
    expect(roundTrip(kind, value)).toEqual(value);
  });

  it("splits long text into 2000-character chunks and joins them back", () => {
    const long = "a".repeat(4500);
    const request = writeProperty("rich_text", long) as { rich_text: Array<{ text: { content: string } }> };

    expect(request.rich_text).toHaveLength(3);
    expect(roundTrip("rich_text", long)).toBe(long);
  });

  it("treats empty strings as no value", () => {
    expect(writeProperty("url", "")).toEqual({ url: null });
    expect(writeProperty("select", "  ")).toEqual({ select: null });
    expect(writeProperty("date", "")).toEqual({ date: null });
    expect(writeProperty("number", "")).toEqual({ number: null });
    expect(roundTrip("select", null)).toBeNull();
    expect(roundTrip("url", null)).toBeNull();
  });

  it("never clears a status (Notion rejects it) and ignores read-only kinds", () => {
    expect(writeProperty("status", null)).toBeUndefined();
    expect(writeProperty("formula", "x")).toBeUndefined();
    expect(writeProperty("people", ["a"])).toBeUndefined();
  });

  it("reads a property by name and read-only kinds", () => {
    const page = {
      properties: {
        Name: { id: "title", type: "title", title: [{ plain_text: "Dune" }] },
        ID: { id: "u", type: "unique_id", unique_id: { prefix: "MOV", number: 42 } },
        Total: { id: "f", type: "formula", formula: { type: "number", number: 3 } },
        Who: { id: "p", type: "people", people: [{ object: "user", id: "u1", name: "Ouss" }, { object: "user", id: "u2" }] },
      },
    } as unknown as Pick<PageObjectResponse, "properties">;

    expect(readProperty(page, "Name")).toBe("Dune");
    expect(readProperty(page, "ID")).toBe("MOV-42");
    expect(readProperty(page, "Total")).toBe(3);
    expect(readProperty(page, "Who")).toEqual(["Ouss", "u2"]);
    expect(readProperty(page, "Missing")).toBeNull();
  });
});

describe("normalizeSchema", () => {
  it("keeps kinds, options with colors, status groups and the title property", () => {
    const dataSource = {
      id: "ds-1",
      properties: {
        Name: { id: "title", name: "Name", type: "title", title: {} },
        Type: { id: "t", name: "Type", type: "select", select: { options: [{ id: "1", name: "Movie", color: "blue" }, { id: "2", name: "TV Series", color: "pink" }] } },
        Status: { id: "s", name: "Status", type: "status", status: { options: [{ id: "a", name: "To Watch", color: "default" }], groups: [{ id: "g", name: "To-do", color: "gray", option_ids: ["a"] }] } },
        Weird: { id: "w", name: "Weird", type: "button", button: {} },
      },
    } as unknown as DataSourceObjectResponse;

    const schema = normalizeSchema(dataSource);

    expect(schema.dataSourceId).toBe("ds-1");
    expect(schema.titleProperty).toBe("Name");
    expect(schema.properties.Type?.options?.map(option => `${option.name}:${option.color}`)).toEqual(["Movie:blue", "TV Series:pink"]);
    expect(schema.properties.Status?.groups?.[0]?.optionIds).toEqual(["a"]);
    expect(schema.properties.Status?.writable).toBe(true);
    expect(schema.properties.Weird?.kind).toBe("unsupported");
    expect(schema.properties.Weird?.writable).toBe(false);
  });
});

describe("page cover and icon", () => {
  it("reads external and file covers", () => {
    expect(pageCover({ cover: { type: "external", external: { url: "https://img/x.jpg" } } })).toBe("https://img/x.jpg");
    expect(pageCover({ cover: { type: "file", file: { url: "https://s3/x.jpg", expiry_time: "" } } })).toBe("https://s3/x.jpg");
    expect(pageCover({ cover: null })).toBeNull();
  });

  it("turns a srcset saved as a cover into a single URL", () => {
    const srcset = "https://img/a_UY480.jpg 320w, https://img/a_UY720.jpg 480w, https://img/a_UY3000.jpg 2000w";

    expect(normalizeImageUrl(srcset)).toBe("https://img/a_UY720.jpg");
    expect(normalizeImageUrl(srcset, 100)).toBe("https://img/a_UY480.jpg");
    expect(pageCover({ cover: { type: "external", external: { url: srcset } } })).toBe("https://img/a_UY720.jpg");
    expect(normalizeImageUrl("https://img/plain.jpg")).toBe("https://img/plain.jpg");
  });

  it("reads emoji and URL icons", () => {
    expect(pageIcon({ icon: { type: "emoji", emoji: "🎬" } })).toEqual({ type: "emoji", value: "🎬" });
    expect(pageIcon({ icon: { type: "external", external: { url: "https://i/x.png" } } })).toEqual({ type: "url", value: "https://i/x.png" });
    expect(pageIcon({ icon: null })).toBeNull();
  });
});
