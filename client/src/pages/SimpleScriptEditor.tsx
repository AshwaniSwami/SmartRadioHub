import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/Layout/Sidebar";
import TopBar from "@/components/Layout/TopBar";
import TipTapEditor from "@/components/RichTextEditor/TipTapEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Send } from "lucide-react";
import { Link, useLocation } from "wouter";
import LoadingSpinner from "@/components/Common/LoadingSpinner";

export default function SimpleScriptEditor() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/scripts/:id/edit");
  const isEditing = !!params?.id;
  const scriptId = params?.id ? parseInt(params.id) : null;
  
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    episodeNumber: "",
    projectId: "",
    content: "",
    reviewComments: "",
    broadcastDate: "",
    audioLink: "",
    topicIds: [] as number[],
  });

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch script data if editing
  const { data: script, isLoading: scriptLoading } = useQuery({
    queryKey: ["/api/scripts", scriptId],
    enabled: isEditing && !!scriptId,
  });

  // Fetch projects and topics
  const { data: projects = [] } = useQuery({
    queryKey: ["/api/projects"],
    enabled: isAuthenticated,
  });
  
  const { data: topics = [] } = useQuery({
    queryKey: ["/api/topics"],
    enabled: isAuthenticated,
  });

  // Set form values when script data is loaded
  useEffect(() => {
    if (script && isEditing) {
      setFormData({
        title: (script as any)?.title || "",
        episodeNumber: (script as any)?.episodeNumber || "",
        projectId: (script as any)?.projectId?.toString() || "",
        content: (script as any)?.content || "",
        reviewComments: (script as any)?.reviewComments || "",
        broadcastDate: (script as any)?.broadcastDate || "",
        audioLink: (script as any)?.audioLink || "",
        topicIds: (script as any)?.topics?.map((t: any) => t.id) || [],
      });
    }
  }, [script, isEditing]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = isEditing ? `/api/scripts/${scriptId}` : "/api/scripts";
      const method = isEditing ? "PUT" : "POST";
      
      return await apiRequest(method, url, {
        ...data,
        projectId: parseInt(data.projectId),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scripts"] });
      toast({
        title: "Success",
        description: isEditing ? "Script updated successfully!" : "Script created successfully!",
      });
      setLocation("/scripts");
    },
    onError: (error: any) => {
      console.error("Save error:", error);
      toast({
        title: "Error",
        description: "Failed to save script. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (action: "draft" | "submit") => {
    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.projectId) {
      toast({
        title: "Validation Error", 
        description: "Project is required",
        variant: "destructive",
      });
      return;
    }

    const submitData = {
      ...formData,
      status: action === "draft" ? "draft" : "submitted",
    };

    saveMutation.mutate(submitData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTopicChange = (topicId: number, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      topicIds: checked 
        ? [...prev.topicIds, topicId]
        : prev.topicIds.filter(id => id !== topicId)
    }));
  };

  if (isLoading || (isEditing && scriptLoading)) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title={isEditing ? "Edit Script" : "Create New Script"} 
          showBackButton={true}
          backHref="/scripts"
        />
        
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link href="/scripts">
                    <Button variant="ghost" size="sm">
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  </Link>
                  {isEditing ? "Edit Script" : "Create New Script"}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      placeholder="Enter script title"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="episodeNumber">Episode Number</Label>
                    <Input
                      id="episodeNumber"
                      value={formData.episodeNumber}
                      onChange={(e) => handleInputChange("episodeNumber", e.target.value)}
                      placeholder="e.g. #127"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="projectId">Project *</Label>
                    <Select 
                      value={formData.projectId}
                      onValueChange={(value) => handleInputChange("projectId", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
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

                  <div>
                    <Label htmlFor="broadcastDate">Broadcast Date</Label>
                    <Input
                      id="broadcastDate"
                      type="date"
                      value={formData.broadcastDate}
                      onChange={(e) => handleInputChange("broadcastDate", e.target.value)}
                    />
                  </div>
                </div>

                {/* Topics */}
                {Array.isArray(topics) && topics.length > 0 && (
                  <div>
                    <Label>Topics</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {topics.map((topic: any) => (
                        <label key={topic.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.topicIds.includes(topic.id)}
                            onChange={(e) => handleTopicChange(topic.id, e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-sm">{topic.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Content */}
                <div>
                  <Label>Script Content</Label>
                  <div className="mt-2 border rounded-md">
                    <TipTapEditor
                      content={formData.content}
                      onChange={(content) => handleInputChange("content", content)}
                    />
                  </div>
                </div>

                {/* Audio Link - Only for producers and managers */}
                {(user as any)?.role && ['radio_producer', 'program_manager', 'administrator'].includes((user as any).role) && (
                  <div>
                    <Label htmlFor="audioLink">Google Drive Audio Link</Label>
                    <Input
                      id="audioLink"
                      value={formData.audioLink}
                      onChange={(e) => handleInputChange("audioLink", e.target.value)}
                      placeholder="https://drive.google.com/..."
                    />
                  </div>
                )}

                {/* Review Comments - Only for managers */}
                {(user as any)?.role && ['program_manager', 'administrator'].includes((user as any).role) && (
                  <div>
                    <Label htmlFor="reviewComments">Review Comments</Label>
                    <Textarea
                      id="reviewComments"
                      value={formData.reviewComments}
                      onChange={(e) => handleInputChange("reviewComments", e.target.value)}
                      placeholder="Add comments for revision..."
                      rows={3}
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6">
                  <Link href="/scripts">
                    <Button variant="outline" disabled={saveMutation.isPending}>
                      Cancel
                    </Button>
                  </Link>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleSubmit("draft")}
                    disabled={saveMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save as Draft
                  </Button>
                  
                  <Button
                    onClick={() => handleSubmit("submit")}
                    disabled={saveMutation.isPending}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {saveMutation.isPending ? "Saving..." : "Submit for Review"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}