import { Client } from "@notionhq/client";



export interface NotionDatabase {
  id: string;
  title: string;
  icon?: string;
  lastEditedTime: string;
}

export interface NotionUser {
  name: string;
  avatarUrl?: string;
}

export interface NotionWorkspaceData {
  user: NotionUser | null;
  databases: NotionDatabase[];
}

export default defineEventHandler(async (event): Promise<NotionWorkspaceData> => {
  const config = useRuntimeConfig(event);
  const apiKey = config.notionApiKey;

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "Notion API key is not configured. Please add NUXT_NOTION_API_KEY to your .env file.",
    });
  }

  try {
    const notion = new Client({ auth: apiKey });

    // Fetch user info
    const me = await notion.users.me({});
    let user: NotionUser | null = null;

    if (me.type === "person" && me.person.email) {
      user = {
        name: me.name || "Unknown User",
        avatarUrl: me.avatar_url || undefined,
      };
    }
    else if (me.type === "bot" && me.bot.owner.type === "workspace") {
      user = {
        name: me.bot.owner.workspace ? "Workspace" : me.name || "Bot User",
        avatarUrl: me.avatar_url || undefined,
      };
    }

    // Fetch databases
    const response = await notion.search({
      sort: { direction: "descending", timestamp: "last_edited_time" },
    }) as { results: Array<{ object: string; id: string; [key: string]: unknown }> };

    const databases: NotionDatabase[] = response.results
      .filter(result => result.object === "database")
      .map((db) => {
        return {
          id: db.id,
          title: (db.title as Array<{ plain_text?: string }>)?.[0]?.plain_text || "Untitled Database",
          icon: (db.icon as { emoji?: string; external?: { url?: string } })?.emoji || (db.icon as { emoji?: string; external?: { url?: string } })?.external?.url || undefined,
          lastEditedTime: new Date(db.last_edited_time as string).toLocaleString(),
        };
      });

    return {
      user,
      databases,
    };
  }
  catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Failed to fetch Notion data";

    throw createError({
      statusCode: 500,
      statusMessage: errorMessage,
    });
  }
});
