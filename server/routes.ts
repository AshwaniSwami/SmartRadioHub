import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertScriptSchema, insertProjectSchema, insertTopicSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get('/api/dashboard/activity', isAuthenticated, async (req: any, res) => {
    try {
      const activity = await storage.getRecentActivity();
      res.json(activity);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      res.status(500).json({ message: "Failed to fetch recent activity" });
    }
  });

  // Script routes
  app.get('/api/scripts', isAuthenticated, async (req: any, res) => {
    try {
      const { status, projectId, authorId, search } = req.query;
      const filters = {
        status: status as string,
        projectId: projectId ? parseInt(projectId as string) : undefined,
        authorId: authorId as string,
        search: search as string,
      };
      
      const scripts = await storage.getScripts(filters);
      res.json(scripts);
    } catch (error) {
      console.error("Error fetching scripts:", error);
      res.status(500).json({ message: "Failed to fetch scripts" });
    }
  });

  app.get('/api/scripts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const script = await storage.getScript(id);
      
      if (!script) {
        return res.status(404).json({ message: "Script not found" });
      }
      
      res.json(script);
    } catch (error) {
      console.error("Error fetching script:", error);
      res.status(500).json({ message: "Failed to fetch script" });
    }
  });

  app.post('/api/scripts', isAuthenticated, async (req: any, res) => {
    try {
      const scriptData = insertScriptSchema.parse({
        ...req.body,
        authorId: req.user.claims.sub,
      });
      
      const { topicIds } = req.body;
      const script = await storage.createScript(scriptData, topicIds);
      
      // Log activity
      await storage.logActivity({
        userId: req.user.claims.sub,
        action: "created",
        entityType: "script",
        entityId: script.id,
        details: `Created script: ${script.title}`,
      });
      
      res.status(201).json(script);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating script:", error);
      res.status(500).json({ message: "Failed to create script" });
    }
  });

  app.put('/api/scripts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingScript = await storage.getScript(id);
      
      if (!existingScript) {
        return res.status(404).json({ message: "Script not found" });
      }

      // Check permissions
      const userRole = req.user.claims.role || 'scriptwriter';
      const userId = req.user.claims.sub;
      
      if (existingScript.authorId !== userId && !['program_manager', 'administrator'].includes(userRole)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const updateData = { ...req.body };
      delete updateData.topicIds;
      
      const scriptData = insertScriptSchema.partial().parse(updateData);
      const { topicIds } = req.body;
      
      const script = await storage.updateScript(id, scriptData, topicIds);
      
      // Log activity
      await storage.logActivity({
        userId: req.user.claims.sub,
        action: "updated",
        entityType: "script",
        entityId: id,
        details: `Updated script: ${script.title}`,
      });
      
      res.json(script);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating script:", error);
      res.status(500).json({ message: "Failed to update script" });
    }
  });

  app.delete('/api/scripts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingScript = await storage.getScript(id);
      
      if (!existingScript) {
        return res.status(404).json({ message: "Script not found" });
      }

      // Check permissions
      const userRole = req.user.claims.role || 'scriptwriter';
      const userId = req.user.claims.sub;
      
      if (existingScript.authorId !== userId && !['administrator'].includes(userRole)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      await storage.deleteScript(id);
      
      // Log activity
      await storage.logActivity({
        userId: req.user.claims.sub,
        action: "deleted",
        entityType: "script",
        entityId: id,
        details: `Deleted script: ${existingScript.title}`,
      });
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting script:", error);
      res.status(500).json({ message: "Failed to delete script" });
    }
  });

  // Project routes
  app.get('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userRole = req.user.claims.role || 'scriptwriter';
      
      if (!['program_manager', 'administrator'].includes(userRole)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      
      // Log activity
      await storage.logActivity({
        userId: req.user.claims.sub,
        action: "created",
        entityType: "project",
        entityId: project.id,
        details: `Created project: ${project.name}`,
      });
      
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  // Topic routes
  app.get('/api/topics', isAuthenticated, async (req: any, res) => {
    try {
      const topics = await storage.getTopics();
      res.json(topics);
    } catch (error) {
      console.error("Error fetching topics:", error);
      res.status(500).json({ message: "Failed to fetch topics" });
    }
  });

  app.post('/api/topics', isAuthenticated, async (req: any, res) => {
    try {
      const userRole = req.user.claims.role || 'scriptwriter';
      
      if (!['program_manager', 'administrator'].includes(userRole)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const topicData = insertTopicSchema.parse(req.body);
      const topic = await storage.createTopic(topicData);
      
      // Log activity
      await storage.logActivity({
        userId: req.user.claims.sub,
        action: "created",
        entityType: "topic",
        entityId: topic.id,
        details: `Created topic: ${topic.name}`,
      });
      
      res.status(201).json(topic);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating topic:", error);
      res.status(500).json({ message: "Failed to create topic" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
