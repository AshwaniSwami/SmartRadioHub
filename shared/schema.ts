import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  date,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - required for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { length: 30 }).notNull().default("scriptwriter"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Projects table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Topics table
export const topics = pgTable("topics", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Scripts table
export const scripts = pgTable("scripts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  episodeNumber: varchar("episode_number", { length: 50 }),
  authorId: varchar("author_id").notNull(),
  projectId: serial("project_id").notNull(),
  content: text("content"),
  status: varchar("status", { length: 30 }).notNull().default("draft"),
  submissionDate: timestamp("submission_date").defaultNow(),
  lastUpdated: timestamp("last_updated").defaultNow(),
  reviewComments: text("review_comments"),
  broadcastDate: date("broadcast_date"),
  audioLink: varchar("audio_link", { length: 500 }),

  isArchived: boolean("is_archived").default(false),
});

// Script topics junction table
export const scriptTopics = pgTable("script_topics", {
  id: serial("id").primaryKey(),
  scriptId: serial("script_id").notNull(),
  topicId: serial("topic_id").notNull(),
});

// Activity logs table
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }).notNull(),
  entityId: serial("entity_id").notNull(),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  scripts: many(scripts),
  activityLogs: many(activityLogs),
}));

export const projectsRelations = relations(projects, ({ many }) => ({
  scripts: many(scripts),
}));

export const topicsRelations = relations(topics, ({ many }) => ({
  scriptTopics: many(scriptTopics),
}));

export const scriptsRelations = relations(scripts, ({ one, many }) => ({
  author: one(users, {
    fields: [scripts.authorId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [scripts.projectId],
    references: [projects.id],
  }),
  scriptTopics: many(scriptTopics),
}));

export const scriptTopicsRelations = relations(scriptTopics, ({ one }) => ({
  script: one(scripts, {
    fields: [scriptTopics.scriptId],
    references: [scripts.id],
  }),
  topic: one(topics, {
    fields: [scriptTopics.topicId],
    references: [topics.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTopicSchema = createInsertSchema(topics).omit({
  id: true,
  createdAt: true,
});

export const insertScriptSchema = createInsertSchema(scripts).omit({
  id: true,
  submissionDate: true,
  lastUpdated: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertTopic = z.infer<typeof insertTopicSchema>;
export type Topic = typeof topics.$inferSelect;
export type InsertScript = z.infer<typeof insertScriptSchema>;
export type Script = typeof scripts.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;

// Extended types with relations
export type ScriptWithDetails = Script & {
  author: User;
  project: Project;
  topics: Topic[];
};

export type ActivityLogWithUser = ActivityLog & {
  user: User;
};

// Role definitions
export const USER_ROLES = {
  SCRIPTWRITER: "scriptwriter",
  PROGRAM_MANAGER: "program_manager",
  RADIO_PRODUCER: "radio_producer",
  ADMINISTRATOR: "administrator",
} as const;

// Status definitions
export const SCRIPT_STATUS = {
  DRAFT: "draft",
  SUBMITTED: "submitted",
  UNDER_REVIEW: "under_review",
  APPROVED: "approved",
  NEEDS_REVISION: "needs_revision",
  RECORDED: "recorded",
  ARCHIVED: "archived",
} as const;
