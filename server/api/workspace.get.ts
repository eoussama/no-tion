import { defineProtectedRoute, getWorkspace, toHttpError } from "~~/server/utils";



/**
 * @description
 * The Notion workspace the integration is connected to.
 */
export default defineProtectedRoute(async (event) => {
  try {
    const workspace = await getWorkspace();

    return createResponse(event, workspace, { message: workspace.connected ? "Workspace info" : "No workspace connected" });
  }
  catch (error) {
    throw toHttpError(error);
  }
});
