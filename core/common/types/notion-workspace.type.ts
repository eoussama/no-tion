import type { TNullable } from "@eoussama/core";

import type { TFailedNotionDatabase, TNotionDatabase } from "./notion-database.type";
import type { TNotionUser } from "./notion-user.type";



export type TNotionWorkspace = {
  id?: string;
  name?: string;
  connected: boolean;
};
