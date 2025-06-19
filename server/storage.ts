import {
  users,
  projects,
  topics,
  scripts,
  scriptTopics,
  activityLogs,
  type User,
  type UpsertUser,
  type Project,
  type InsertProject,
  type Topic,
  type InsertTopic,
  type Script,
  type InsertScript,
  type ScriptWithDetails,
  type ActivityLog,
  type InsertActivityLog,
  type ActivityLogWithUser,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like, inArray, sql } from "drizzle-orm";

export interface IStorage {
  // User operations - required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Project operations
  getProjects(): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  
  // Topic operations
  getTopics(): Promise<Topic[]>;
  createTopic(topic: InsertTopic): Promise<Topic>;
  
  // Script operations
  getScripts(filters?: {
    status?: string;
    projectId?: number;
    authorId?: string;
    search?: string;
  }): Promise<ScriptWithDetails[]>;
  getScript(id: number): Promise<ScriptWithDetails | undefined>;
  createScript(script: InsertScript, topicIds?: number[]): Promise<Script>;
  updateScript(id: number, script: Partial<InsertScript>, topicIds?: number[]): Promise<Script>;
  deleteScript(id: number): Promise<void>;
  
  // Dashboard stats
  getDashboardStats(): Promise<{
    totalScripts: number;
    pendingReview: number;
    approved: number;
    recorded: number;
    drafts: number;
    needsRevision: number;
    workflowCounts: Record<string, number>;
  }>;
  
  // Activity logging
  logActivity(activity: InsertActivityLog): Promise<ActivityLog>;
  getRecentActivity(limit?: number): Promise<ActivityLogWithUser[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Project operations
  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(projects.name);
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  // Topic operations
  async getTopics(): Promise<Topic[]> {
    return await db.select().from(topics).orderBy(topics.name);
  }

  async createTopic(topic: InsertTopic): Promise<Topic> {
    const [newTopic] = await db.insert(topics).values(topic).returning();
    return newTopic;
  }

  // Script operations
  async getScripts(filters?: {
    status?: string;
    projectId?: number;
    authorId?: string;
    search?: string;
  }): Promise<ScriptWithDetails[]> {
    const conditions = [];
    
    if (filters?.status) {
      conditions.push(eq(scripts.status, filters.status));
    }
    
    if (filters?.projectId) {
      conditions.push(eq(scripts.projectId, filters.projectId));
    }
    
    if (filters?.authorId) {
      conditions.push(eq(scripts.authorId, filters.authorId));
    }
    
    if (filters?.search) {
      conditions.push(
        or(
          like(scripts.title, `%${filters.search}%`),
          like(scripts.content, `%${filters.search}%`)
        )
      );
    }

    const results = await db
      .select({
        script: scripts,
        author: users,
        project: projects,
      })
      .from(scripts)
      .innerJoin(users, eq(scripts.authorId, users.id))
      .innerJoin(projects, eq(scripts.projectId, projects.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(scripts.lastUpdated));

    // Get topics for each script
    const scriptsWithTopics = await Promise.all(
      results.map(async (result) => {
        const scriptTopicRows = await db
          .select({ topic: topics })
          .from(scriptTopics)
          .innerJoin(topics, eq(scriptTopics.topicId, topics.id))
          .where(eq(scriptTopics.scriptId, result.script.id));

        return {
          ...result.script,
          author: result.author,
          project: result.project,
          topics: scriptTopicRows.map(row => row.topic),
        };
      })
    );

    return scriptsWithTopics;
  }

  async getScript(id: number): Promise<ScriptWithDetails | undefined> {
    const [result] = await db
      .select({
        script: scripts,
        author: users,
        project: projects,
      })
      .from(scripts)
      .innerJoin(users, eq(scripts.authorId, users.id))
      .innerJoin(projects, eq(scripts.projectId, projects.id))
      .where(eq(scripts.id, id));

    if (!result) return undefined;

    const scriptTopicRows = await db
      .select({ topic: topics })
      .from(scriptTopics)
      .innerJoin(topics, eq(scriptTopics.topicId, topics.id))
      .where(eq(scriptTopics.scriptId, id));

    return {
      ...result.script,
      author: result.author,
      project: result.project,
      topics: scriptTopicRows.map(row => row.topic),
    };
  }

  async createScript(script: InsertScript, topicIds?: number[]): Promise<Script> {
    const [newScript] = await db.insert(scripts).values(script).returning();

    if (topicIds && topicIds.length > 0) {
      await db.insert(scriptTopics).values(
        topicIds.map(topicId => ({
          scriptId: newScript.id,
          topicId,
        }))
      );
    }

    return newScript;
  }

  async updateScript(id: number, script: Partial<InsertScript>, topicIds?: number[]): Promise<Script> {
    const [updatedScript] = await db
      .update(scripts)
      .set({ ...script, lastUpdated: new Date() })
      .where(eq(scripts.id, id))
      .returning();

    if (topicIds !== undefined) {
      // Remove existing topics
      await db.delete(scriptTopics).where(eq(scriptTopics.scriptId, id));
      
      // Add new topics
      if (topicIds.length > 0) {
        await db.insert(scriptTopics).values(
          topicIds.map(topicId => ({
            scriptId: id,
            topicId,
          }))
        );
      }
    }

    return updatedScript;
  }

  async deleteScript(id: number): Promise<void> {
    await db.delete(scriptTopics).where(eq(scriptTopics.scriptId, id));
    await db.delete(scripts).where(eq(scripts.id, id));
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    totalScripts: number;
    pendingReview: number;
    approved: number;
    recorded: number;
    drafts: number;
    needsRevision: number;
    workflowCounts: Record<string, number>;
  }> {
    const counts = await db
      .select({
        status: scripts.status,
        count: sql<number>`count(*)`,
      })
      .from(scripts)
      .groupBy(scripts.status);

    const statusCounts = counts.reduce((acc, row) => {
      acc[row.status] = Number(row.count);
      return acc;
    }, {} as Record<string, number>);

    return {
      totalScripts: counts.reduce((sum, row) => sum + Number(row.count), 0),
      pendingReview: statusCounts.under_review || 0,
      approved: statusCounts.approved || 0,
      recorded: statusCounts.recorded || 0,
      drafts: statusCounts.draft || 0,
      needsRevision: statusCounts.needs_revision || 0,
      workflowCounts: statusCounts,
    };
  }

  // Activity logging
  async logActivity(activity: InsertActivityLog): Promise<ActivityLog> {
    const [newActivity] = await db.insert(activityLogs).values(activity).returning();
    return newActivity;
  }

  async getRecentActivity(limit = 10): Promise<ActivityLogWithUser[]> {
    const results = await db
      .select({
        activity: activityLogs,
        user: users,
      })
      .from(activityLogs)
      .innerJoin(users, eq(activityLogs.userId, users.id))
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit);

    return results.map(result => ({
      ...result.activity,
      user: result.user,
    }));
  }
}

export const storage = new DatabaseStorage();
