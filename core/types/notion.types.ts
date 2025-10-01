import type { TNullable } from "@eoussama/core";



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
  databases: Array<TNotionDatabase>;
};
