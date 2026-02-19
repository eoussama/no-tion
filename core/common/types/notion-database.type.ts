export type TNotionDatabase<T> = {
  id: string;
  url: string;
  title: string;
  rows: Array<T>;
  lastEditedTime: string;
};
