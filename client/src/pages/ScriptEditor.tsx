import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, Save, Send } from "lucide-react";
import { Link, useLocation } from "wouter";
import LoadingSpinner from "@/components/Common/LoadingSpinner";

const scriptSchema = z.object({
  title: z.string().min(1, "Title is required"),
  episodeNumber: z.string().optional(),
  projectId: z.string().min(1, "Project is required"),
  content: z.string().optional(),
  status: z.string().optional(),
  reviewComments: z.string().optional(),
  broadcastDate: z.string().optional(),
  audioLink: z.string().optional(),
  topicIds: z.array(z.number()).optional(),
});

type ScriptFormData = z.infer<typeof scriptSchema>;

export default function ScriptEditor() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/scripts/:id/edit");
  const isEditing = !!params?.id;
  const scriptId = params?.id ? parseInt(params.id) : null;
  
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();

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

  const form = useForm<ScriptFormData>({
    resolver: zodResolver(scriptSchema),
    defaultValues: {
      title: "",
      episodeNumber: "",
      content: "",
      status: "draft",
      topicIds: [],
    },
  });

  // Fetch existing script if editing
  const { data: script, isLoading: scriptLoading } = useQuery({
    queryKey: ["/api/scripts", scriptId],
    enabled: isAuthenticated && isEditing && !!scriptId,
  });

  // Fetch projects and topics
  const { data: projects } = useQuery({
    queryKey: ["/api/projects"],
    enabled: isAuthenticated,
  });

  const { data: topics } = useQuery({
    queryKey: ["/api/topics"],
    enabled: isAuthenticated,
  });

  // Set form values when script data is loaded
  useEffect(() => {
    if (script && isEditing) {
      form.reset({
        title: script.title || "",
        episodeNumber: script.episodeNumber || "",
        projectId: script.projectId?.toString() || "",
        content: script.content || "",
        status: script.status || "",
        reviewComments: script.reviewComments || "",
        broadcastDate: script.broadcastDate || "",
        audioLink: script.audioLink || "",
        topicIds: script.topics?.map((t: any) => t.id) || [],
      });
    }
  }, [script, isEditing, form]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: ScriptFormData & { action: "draft" | "submit" }) => {
      const url = isEditing ? `/api/scripts/${scriptId}` : "/api/scripts";
      const method = isEditing ? "PUT" : "POST";
      
      return await apiRequest(method, url, {
        ...data,
        status: data.action === "draft" ? "draft" : "submitted",
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
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to save script. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ScriptFormData, action: "draft" | "submit") => {
    saveMutation.mutate({ ...data, action });
  };

  if (isLoading || (isEditing && scriptLoading)) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="pl-64">
        <TopBar 
          title={isEditing ? "Edit Script" : "Create New Script"}
          showBackButton
          backHref="/scripts"
        />
        
        <main className="p-6">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Link href="/scripts">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <span>{isEditing ? "Edit Script" : "Create New Script"}</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <Form {...form}>
                <form className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter script title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="episodeNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Episode Number</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. #127" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="projectId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project *</FormLabel>
                          <Select 
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select project" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {projects?.map((project: any) => (
                                <SelectItem key={project.id} value={project.id.toString()}>
                                  {project.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Topics Multi-select would go here */}
                    <div>
                      <Label>Topics</Label>
                      <div className="text-sm text-gray-500 mt-1">
                        Topic selection will be implemented
                      </div>
                    </div>
                  </div>

                  {/* Rich Text Editor */}
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Script Content</FormLabel>
                        <FormControl>
                          <TipTapEditor
                            content={field.value || ""}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Recording Information - Only for producers/managers */}
                  {(user?.role === "radio_producer" || user?.role === "program_manager" || user?.role === "administrator") && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="broadcastDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Broadcast Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="audioLink"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Audio Link (Google Drive)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://drive.google.com/..." 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Review Comments - Only for managers */}
                  {(user?.role === "program_manager" || user?.role === "administrator") && (
                    <FormField
                      control={form.control}
                      name="reviewComments"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Review Comments</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Add comments for revision..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                    <Button variant="outline" asChild>
                      <Link href="/scripts">Cancel</Link>
                    </Button>
                    
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => onSubmit(form.getValues(), "draft")}
                      disabled={saveMutation.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save as Draft
                    </Button>
                    
                    <Button
                      type="button"
                      onClick={() => onSubmit(form.getValues(), "submit")}
                      disabled={saveMutation.isPending}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Submit for Review
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
