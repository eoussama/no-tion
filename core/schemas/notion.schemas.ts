import { z } from "zod";



export const databasePageSchema = z.object({
  id: z.string().min(1),
  infoUrl: z.string().url().nullable(),
});

export const databasePagesResponseSchema = z.object({
  pages: z.array(databasePageSchema),
});

export const failedNotionDatabaseSchema = z.object({
  id: z.string().min(1),
  reason: z.string().min(1),
});

export const notionDatabaseSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  icon: z.string().min(1).optional(),
  lastEditedTime: z.string().min(1),
});

export const notionUserSchema = z
  .object({
    name: z.string().min(1),
    avatarUrl: z.string().url().optional(),
  })
  .nullable();

export const notionWorkspaceSchema = z
  .object({
    name: z.string().min(1),
    icon: z.string().min(1).optional(),
  })
  .nullable();

export const notionWorkspaceDataSchema = z.object({
  user: notionUserSchema,
  workspace: notionWorkspaceSchema,
  databases: z.array(notionDatabaseSchema),
  failedDatabases: z.array(failedNotionDatabaseSchema),
});
