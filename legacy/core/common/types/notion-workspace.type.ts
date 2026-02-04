import type { TNullable } from "@eoussama/core";

import type { TNotionUser } from "./notion-user.type";
import type { TFailedNotionDatabase, TNotionDatabase } from "./notion-database.type";



export type TNotionWorkspace = {
  name: string
  icon?: string
}

export type TNotionWorkspaceData = {
  user: TNullable<TNotionUser>
  databases: Array<TNotionDatabase>
  workspace: TNullable<TNotionWorkspace>
  failedDatabases: Array<TFailedNotionDatabase>
}
