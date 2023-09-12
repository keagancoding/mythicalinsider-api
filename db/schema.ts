import { InferSelectModel, sql } from "drizzle-orm";
import {
  pgTable,
  varchar,
  json,
  integer,
  doublePrecision,
  boolean,
  timestamp,
  text,
  unique,
  index,
} from "drizzle-orm/pg-core";

type Metadata = {
  boxed?: boolean;
  grade?: string;
  level?: string;
  blended?: boolean;
  blended_count?: number;
  hidden_skills?: {
    name: string;
  }[];
  class?: {
    name: string;
    description: string;
    ability1Name: string;
    ability2Name: string;
    ability3Name: string;
    ability4Name: string;
  };
};

export const items = pgTable(
  "items",
  {
    id: varchar("id", { length: 150 }).primaryKey(),
    owner_id: varchar("owner_id", { length: 50 }),
    owner_username: varchar("owner_username", { length: 50 }),
    private: boolean("private").default(false),
    status: varchar("status", { length: 50 }),
    name: varchar("name", { length: 200 }),
    mint: integer("mint"),
    description: text("description"),
    floor: doublePrecision("floor"),
    image: varchar("image", { length: 400 }),
    collection_order: integer("collection_order").default(999),
    updated_at: timestamp("updated_at").defaultNow(),
    metadata: json("metadata").$type<Metadata>(),
  },
  (items) => {
    return {
      name_mint_idx: unique("name_mint_idx").on(items.name, items.mint),
      owner_username_idx: unique("owner_username_idx").on(
        items.owner_username,
        items.id
      ),
      username_index: index("username_index").on(items.owner_username),
    };
  }
);

export type Item = InferSelectModel<typeof items>;
