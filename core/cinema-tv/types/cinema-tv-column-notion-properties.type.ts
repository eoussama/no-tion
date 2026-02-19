import type { TNullable } from "@eoussama/core";



export type TCinemaTvColumnNotionProperties = {
  Episode: {
    id: string;
    type: "number";
    number: TNullable<number>;
  };

  Status: {
    id: string;
    type: "status";
    status: TNullable<{
      id: string;
      name: string;
      color: string;
    }>;
  };

  Genre: {
    id: string;
    type: "select";
    select: TNullable<{
      id: string;
      name: string;
      color: string;
    }>;
  };

  Info: {
    id: string;
    type: "url";
    url: TNullable<string>;
  };

  Type: {
    id: string;
    type: "select";
    select: TNullable<{
      id: string;
      name: string;
      color: string;
    }>;
  };

  Season: {
    id: string;
    type: "number";
    number: TNullable<number>;
  };

  Score: {
    id: string;
    type: "number";
    number: TNullable<number>;
  };

  Franchises: {
    id: string;
    type: "multi_select";
    multi_select: Array<{
      id: string;
      name: string;
      color: string;
    }>;
  };

  Name: {
    id: string;
    type: "title";
    title: Array<{
      type: "text";
      text: {
        content: string;
        link: TNullable<{ url: string }>;
      };
      annotations: {
        bold: boolean;
        italic: boolean;
        strikethrough: boolean;
        underline: boolean;
        code: boolean;
        color: string;
      };
      plain_text: string;
      href: TNullable<string>;
    }>;
  };
};
