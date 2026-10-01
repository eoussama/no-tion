import { archiveRow, defineDbRoute, getPageIdParam } from "~~/server/utils";



/**
 * @description
 * Archives a row (moves the page to Notion's trash).
 */
export default defineDbRoute(async ({ event, db }) => {
  const pageId = getPageIdParam(event);

  await archiveRow(db, pageId);

  return createResponse(event, { id: pageId }, { message: "Row archived" });
});
