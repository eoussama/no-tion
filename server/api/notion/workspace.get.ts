import type { TNullable } from "@eoussama/core";
import { Client } from "@notionhq/client";



export type TNotionDatabase = {
  id: string;
  title: string;
  icon?: string;
  lastEditedTime: string;
};

export type TNotionUser = {
  name: string;
  avatarUrl?: string;
};

export type TNotionWorkspace = {
  name: string;
  icon?: string;
};

export type TNotionWorkspaceData = {
  user: TNullable<TNotionUser>;
  workspace: TNullable<TNotionWorkspace>;
  databases: TNotionDatabase[];
};

export default defineEventHandler(async (event): Promise<TNotionWorkspaceData> => {
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
    let user: TNullable<TNotionUser> = null;
    let workspace: TNullable<TNotionWorkspace> = null;

    if (me.type === "person" && me.person.email) {
      user = {
        name: me.name || "Unknown User",
        avatarUrl: me.avatar_url || undefined,
      };
    }
    else if (me.type === "bot") {
      user = {
        name: me.name || "Bot User",
        avatarUrl: me.avatar_url || undefined,
      };

      // If it's a bot with workspace owner, get workspace details
      if (me.bot.owner.type === "workspace" && me.bot.owner.workspace) {
        // Search for any page to trigger workspace detection (result not used)
        await notion.search({
          page_size: 1,
        });

        // Get workspace name from bot owner
        workspace = {
          name: me.bot.workspace_name || "Workspace",
          icon: undefined, // Workspace icon is not directly available via API
        };
      }
    }

    // Fetch databases
    const response = await notion.search({
      sort: { direction: "descending", timestamp: "last_edited_time" },
    }) as { results: Array<{ object: string; id: string; [key: string]: unknown }> };

    const databases: TNotionDatabase[] = response.results
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
      workspace,
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
