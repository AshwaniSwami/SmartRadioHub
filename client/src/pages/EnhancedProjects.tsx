import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import EnhancedSidebar from "@/components/Layout/EnhancedSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FileUploadZone from "@/components/FileUpload/FileUploadZone";
import { 
  Plus, 
  Edit, 
  Trash2, 
  FolderOpen, 
  FileText, 
  Mic, 
  Eye,
  Calendar,
  User,
  MoreVertical,
  Folder,
  Upload,
  File,
  Download
} from "lucide-react";
import { Link } from "wouter";
import LoadingSpinner from "@/components/Common/LoadingSpinner";

export default function EnhancedProjects() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [projectFiles, setProjectFiles] = useState<Record<number, any[]>>({});
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "Redirecting to login...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: projects = [], isLoading: projectsLoading } = useQuery<any[]>({
    queryKey: ["/api/projects"],
    enabled: isAuthenticated,
  });

  const { data: projectScripts = [], isLoading: scriptsLoading } = useQuery<any[]>({
    queryKey: ["/api/scripts", { projectId: selectedProject?.id }],
    queryFn: async () => {
      if (!selectedProject?.id) return [];
      return await apiRequest("GET", `/api/scripts?projectId=${selectedProject.id}`);
    },
    enabled: isAuthenticated && !!selectedProject?.id,
  });

  const { data: serverProjectFiles = [], isLoading: filesLoading } = useQuery<any[]>({
    queryKey: ["/api/projects", selectedProject?.id, "files"],
    queryFn: async () => {
      if (!selectedProject?.id) return [];
      return await apiRequest("GET", `/api/projects/${selectedProject.id}/files`);
    },
    enabled: isAuthenticated && !!selectedProject?.id,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/projects", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Project created successfully!",
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PATCH", `/api/projects/${editingProject.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Success",
        description: "Project updated successfully!",
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Project deleted successfully!",
      });
      if (selectedProject?.id === arguments[0]) {
        setSelectedProject(null);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({ name: "", description: "" });
    setEditingProject(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Project name is required",
        variant: "destructive",
      });
      return;
    }

    if (editingProject) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (project: any) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  const handleFilesUploaded = (files: any[]) => {
    if (selectedProject) {
      // Invalidate the query to refetch files from server
      queryClient.invalidateQueries({ 
        queryKey: ["/api/projects", selectedProject.id, "files"] 
      });
      
      toast({
        title: "Files uploaded",
        description: `${files.length} file(s) uploaded successfully to ${selectedProject.name}`,
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading || projectsLoading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <EnhancedSidebar />
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
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <EnhancedSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
              <p className="text-slate-600">Organize your radio content by projects</p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingProject ? "Edit Project" : "Create New Project"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Project Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter project name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter project description"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {editingProject ? "Update" : "Create"} Project
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Projects List */}
          <div className="w-80 bg-white border-r border-slate-200 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold text-slate-900 mb-4">All Projects ({projects.length})</h3>
              <div className="space-y-2">
                {projects.map((project: any) => (
                  <Card 
                    key={project.id} 
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedProject?.id === project.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedProject(project)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Folder className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-slate-900 truncate">{project.name}</h4>
                            <p className="text-sm text-slate-500 truncate">
                              {project.description || "No description"}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(project);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(project.id);
                            }}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                        <span>Scripts: {project.scriptCount || 0}</span>
                        <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {projects.length === 0 && (
                  <div className="text-center py-8">
                    <Folder className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                    <h3 className="text-sm font-medium text-slate-900">No projects</h3>
                    <p className="text-sm text-slate-500 mb-4">
                      Create your first project to get started.
                    </p>
                    <Button onClick={() => setIsDialogOpen(true)} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Project
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="flex-1 overflow-y-auto">
            {selectedProject ? (
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">{selectedProject.name}</h2>
                      <p className="text-slate-600">{selectedProject.description}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button asChild className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700">
                        <Link href={`/scripts/new?projectId=${selectedProject.id}`}>
                          <Plus className="h-4 w-4 mr-2" />
                          New Script
                        </Link>
                      </Button>
                      <Button asChild variant="outline">
                        <Link href={`/recordings?projectId=${selectedProject.id}`}>
                          <Mic className="h-4 w-4 mr-2" />
                          Recordings
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {/* Project Stats */}
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{projectScripts.length}</div>
                        <div className="text-sm text-slate-600">Total Scripts</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {projectScripts.filter((s: any) => s.status === 'approved').length}
                        </div>
                        <div className="text-sm text-slate-600">Approved</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {projectScripts.filter((s: any) => s.status === 'draft').length}
                        </div>
                        <div className="text-sm text-slate-600">Drafts</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {projectScripts.filter((s: any) => s.status === 'recorded').length}
                        </div>
                        <div className="text-sm text-slate-600">Recorded</div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Tabs for Scripts and Files */}
                <Tabs defaultValue="scripts" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="scripts">Scripts</TabsTrigger>
                    <TabsTrigger value="files">Files</TabsTrigger>
                  </TabsList>

                  <TabsContent value="scripts" className="mt-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Scripts</h3>
                      {scriptsLoading ? (
                        <LoadingSpinner />
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {projectScripts.map((script: any) => (
                            <Card key={script.id} className="hover:shadow-lg transition-shadow">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <h4 className="font-medium text-slate-900 truncate flex-1">
                                    {script.title}
                                  </h4>
                                  <Badge variant={script.status === 'approved' ? 'default' : 'secondary'}>
                                    {script.status}
                                  </Badge>
                                </div>
                                
                                <div className="space-y-2 text-sm text-slate-600">
                                  <div className="flex items-center space-x-2">
                                    <User className="h-4 w-4" />
                                    <span>{script.author?.firstName} {script.author?.lastName}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>{new Date(script.lastUpdated).toLocaleDateString()}</span>
                                  </div>
                                </div>

                                <div className="flex justify-between items-center mt-4">
                                  <Button asChild variant="outline" size="sm">
                                    <Link href={`/scripts/${script.id}`}>
                                      <Eye className="h-4 w-4 mr-1" />
                                      View
                                    </Link>
                                  </Button>
                                  <Button asChild variant="ghost" size="sm">
                                    <Link href={`/scripts/${script.id}/edit`}>
                                      <Edit className="h-4 w-4 mr-1" />
                                      Edit
                                    </Link>
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                          
                          {projectScripts.length === 0 && (
                            <div className="col-span-full text-center py-8">
                              <FileText className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                              <h3 className="text-sm font-medium text-slate-900">No scripts yet</h3>
                              <p className="text-sm text-slate-500 mb-4">
                                Create your first script for this project.
                              </p>
                              <Button asChild>
                                <Link href={`/scripts/new?projectId=${selectedProject.id}`}>
                                  <Plus className="h-4 w-4 mr-2" />
                                  Create Script
                                </Link>
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="files" className="mt-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Project Files</h3>
                        <FileUploadZone 
                          onFilesUploaded={handleFilesUploaded}
                          projectId={selectedProject.id}
                          maxFiles={20}
                          maxSize={100 * 1024 * 1024} // 100MB
                        />
                      </div>

                      {/* Display uploaded files */}
                      {serverProjectFiles && serverProjectFiles.length > 0 && (
                        <div>
                          <h4 className="font-medium text-slate-900 mb-3">
                            Uploaded Files ({serverProjectFiles.length})
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {serverProjectFiles.map((file: any) => (
                              <Card key={file.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                  <div className="flex items-start space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                      <File className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h5 className="font-medium text-slate-900 truncate">{file.name}</h5>
                                      <p className="text-sm text-slate-500">
                                        {formatFileSize(file.size)}
                                      </p>
                                      <p className="text-xs text-slate-400">
                                        {new Date(file.uploadedAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="mt-3">
                                    <Button variant="outline" size="sm" className="w-full">
                                      <Download className="h-4 w-4 mr-2" />
                                      Download
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      {!filesLoading && (!serverProjectFiles || serverProjectFiles.length === 0) && (
                        <div className="text-center py-8">
                          <Upload className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                          <h3 className="text-sm font-medium text-slate-900">No files uploaded</h3>
                          <p className="text-sm text-slate-500">
                            Upload files using the area above to get started.
                          </p>
                        </div>
                      )}

                      {filesLoading && (
                        <div className="text-center py-8">
                          <LoadingSpinner />
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <FolderOpen className="mx-auto h-16 w-16 text-slate-400 mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Select a project</h3>
                  <p className="text-slate-600">
                    Choose a project from the left to view its scripts and files.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}