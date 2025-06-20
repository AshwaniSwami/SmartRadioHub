import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import { Link, useLocation } from "wouter";
import Sidebar from "@/components/Layout/Sidebar";
import TopBar from "@/components/Layout/TopBar";

export default function SimpleScriptCreator() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    episodeNumber: "",
    projectId: "",
    content: "",
    status: "draft"
  });

  const { data: projects = [] } = useQuery<any[]>({
    queryKey: ["/api/projects"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/scripts", {
        ...data,
        projectId: parseInt(data.projectId),
        authorId: user?.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scripts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Script created successfully!",
      });
      setLocation("/scripts");
    },
    onError: (error: any) => {
      console.error("Script creation error:", error);
      toast({
        title: "Error",
        description: "Failed to create script. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.projectId) {
      toast({
        title: "Validation Error",
        description: "Please fill in title and project.",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <TopBar 
          title="Create New Script" 
          showBackButton 
          backHref="/scripts" 
        />
        
        <div className="p-6">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link href="/scripts">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                Create New Script
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      placeholder="Enter script title"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="episodeNumber">Episode Number</Label>
                    <Input
                      id="episodeNumber"
                      value={formData.episodeNumber}
                      onChange={(e) => handleInputChange("episodeNumber", e.target.value)}
                      placeholder="e.g., Episode 1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectId">Project *</Label>
                  <Select 
                    value={formData.projectId} 
                    onValueChange={(value) => handleInputChange("projectId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(projects) && projects.map((project: any) => (
                        <SelectItem key={project.id} value={project.id.toString()}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => handleInputChange("content", e.target.value)}
                    placeholder="Enter script content..."
                    rows={10}
                    className="min-h-[200px]"
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {createMutation.isPending ? "Creating..." : "Create Script"}
                  </Button>
                  
                  <Link href="/scripts">
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}