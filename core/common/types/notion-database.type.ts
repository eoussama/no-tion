export type TNotionDatabase<TRow = never> = {
  id: string;
  url: string;
  title: string;
  lastEditedTime: string;
  rows: TRow extends never ? readonly [] : Array<TRow>;
};
