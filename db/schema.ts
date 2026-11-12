import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
export const rooms = sqliteTable("rooms", {
 code: text("code").primaryKey(), secret: text("secret").notNull(),
 stage: text("stage").notNull().default("waiting"), seq: integer("seq").notNull().default(0),
 updated: integer("updated").notNull(), created: integer("created").notNull(),
 playing: integer("playing").notNull().default(0), position: integer("position").notNull().default(0),
 round: integer("round").notNull().default(0),
 mission: integer("mission").notNull().default(1),
 completed: integer("completed").notNull().default(0)
});
export const devices = sqliteTable("devices", {
 id: text("id").primaryKey(), room: text("room").notNull(), label: text("label").notNull(),
 seen: integer("seen").notNull(), done: integer("done").notNull().default(-1)
});
