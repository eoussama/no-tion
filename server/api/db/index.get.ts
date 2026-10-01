import { defineProtectedRoute, listDatabases, toHttpError } from "~~/server/utils";



/**
 * @description
 * Lists the databases: registered ones plus every data source shared with the integration.
 */
export default defineProtectedRoute(async (event) => {
  try {
    return createResponse(event, await listDatabases(), { message: "Databases" });
  }
  catch (error) {
    throw toHttpError(error);
  }
});
