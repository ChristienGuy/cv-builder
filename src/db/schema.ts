import {
  ExtractDocumentTypeFromTypedRxJsonSchema,
  RxJsonSchema,
  toTypedRxJsonSchema,
} from "rxdb";

const userSchemaRaw = {
  title: "user",
  version: 0,
  type: "object",
  primaryKey: "id",
  properties: {
    id: {
      type: "string",
      maxLength: 250,
    },
    email: {
      type: "string",
    },
    password: {
      type: "string",
    },
    // A user can have many snippets
    snippets: {
      type: "array",
      ref: "snippets",
      items: {
        type: "string",
      },
    },
    // A user can have many cvs
    cvs: {
      type: "array",
      ref: "cvs",
      items: {
        type: "string",
      },
    },
  },
} as const;

const userSchemaTyped = toTypedRxJsonSchema(userSchemaRaw);
export type UserDocType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof userSchemaTyped
>;
export const userSchema: RxJsonSchema<UserDocType> = userSchemaTyped;

const snippetSchemaRaw = {
  title: "snippets",
  version: 0,
  type: "object",
  primaryKey: "id",
  properties: {
    id: {
      type: "string",
      maxLength: 250,
    },
    content: {
      type: "string",
    },
    user_id: {
      type: "string",
      ref: "user",
    },
  },
  required: ["id", "content", "user_id"],
} as const;
const snippetSchemaTyped = toTypedRxJsonSchema(snippetSchemaRaw);
export type SnippetDocType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof snippetSchemaTyped
>;
export const snippetSchema: RxJsonSchema<SnippetDocType> = snippetSchemaTyped;

const cvsSchemaRaw = {
  title: "cvs",
  version: 0,
  type: "object",
  primaryKey: "id",
  properties: {
    id: {
      type: "string",
      maxLength: 250,
    },
    title: {
      type: "string",
    },
    snippets: {
      type: "array",
      items: {
        type: "object",
        properties: {
          snippetId: {
            type: "string",
          },
          content: {
            type: "string",
          },
          order: {
            type: "string",
          },
        },
      },
    },
  },
} as const;
const cvsSchemaTyped = toTypedRxJsonSchema(cvsSchemaRaw);
export type CvsDocType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof cvsSchemaTyped
>;
export const cvsSchema: RxJsonSchema<CvsDocType> = cvsSchemaTyped;
