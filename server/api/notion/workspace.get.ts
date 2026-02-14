import type { TNotionWorkspace } from "~~/core";
import { definedProtectedRoute, getNotionClient } from "~~/server/utils";



export default definedProtectedRoute(async (event) => {
  const notionClient = getNotionClient();
  const me = await notionClient.users.me({});

  if (me.type !== "bot") {
    return createResponse(event, { connected: false } as TNotionWorkspace, { message: "No workspace connected" });
  }

  const workspace: TNotionWorkspace = {
    connected: true,
    id: me.bot.workspace_id,
    name: me.bot.workspace_name ?? undefined,
  };

  return createResponse(event, workspace, { message: "Workspace info" });
});
