import type { TCinemaTvColumnNotionRow } from "./cinema-tv-column-notion-row.type";
import type { TCinemaTvDatabase } from "./cinema-tv-database.type";



export type TCinemaTvColumnNotionDatabase = Omit<TCinemaTvDatabase, "rows"> & { rows: Array<TCinemaTvColumnNotionRow> };
