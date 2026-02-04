import type { TNullable } from "@eoussama/core";



export type TNotionDatabase = {
  id: string
  title: string
  lastEditedTime: string

  icon?: string
}

export type TFailedNotionDatabase = {
  id: string
  reason: string
}
