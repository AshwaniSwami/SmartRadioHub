import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import EnhancedSidebar from "@/components/Layout/EnhancedSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2,
  FileText,
  User,
  Calendar,
  Filter,
  SortAsc
} from "lucide-react";
import { Link } from "wouter";
import LoadingSpinner from "@/components/Common/LoadingSpinner";

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  submitted: "bg-blue-100 text-blue-800", 
  under_review: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  needs_revision: "bg-red-100 text-red-800",
  recorded: "bg-purple-100 text-purple-800",
  archived: "bg-slate-100 text-slate-800"
};

export default function EnhancedScripts() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [sortBy, setSortBy] = useState("lastUpdated");

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

  const { data: allScripts = [], isLoading: scriptsLoading } = useQuery<any[]>({
    queryKey: ["/api/scripts"],
    enabled: isAuthenticated,
  });

  const { data: projects = [] } = useQuery<any[]>({
    queryKey: ["/api/projects"],
    enabled: isAuthenticated,
  });

  // Filter and search scripts
  const filteredScripts = useMemo(() => {
    let filtered = [...allScripts];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(script => 
        script.title?.toLowerCase().includes(query) ||
        script.content?.toLowerCase().includes(query) ||
        script.episodeNumber?.toLowerCase().includes(query) ||
        script.author?.firstName?.toLowerCase().includes(query) ||
        script.author?.lastName?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(script => script.status === statusFilter);
    }

    // Project filter
    if (projectFilter !== "all") {
      filtered = filtered.filter(script => script.projectId?.toString() === projectFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title?.localeCompare(b.title) || 0;
        case "status":
          return a.status?.localeCompare(b.status) || 0;
        case "created":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "lastUpdated":
        default:
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      }
    });

    return filtered;
  }, [allScripts, searchQuery, statusFilter, projectFilter, sortBy]);

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/scripts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scripts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Script deleted successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to delete script. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: number, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading || scriptsLoading) {
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
              <h1 className="text-2xl font-bold text-slate-900">Scripts</h1>
              <p className="text-slate-600">Manage all your radio scripts and content</p>
            </div>
            
            <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Link href="/scripts/new">
                <Plus className="h-4 w-4 mr-2" />
                New Script
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search scripts, titles, content, authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="needs_revision">Needs Revision</SelectItem>
                <SelectItem value="recorded">Recorded</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            {/* Project Filter */}
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {Array.isArray(projects) && projects.map((project: any) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lastUpdated">Last Updated</SelectItem>
                <SelectItem value="created">Date Created</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>

            {/* Results count */}
            <div className="text-sm text-slate-600">
              {filteredScripts.length} of {allScripts.length} scripts
            </div>
          </div>
        </div>

        {/* Scripts List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredScripts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-16 w-16 text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {searchQuery || statusFilter !== "all" || projectFilter !== "all" 
                  ? "No scripts match your filters" 
                  : "No scripts yet"
                }
              </h3>
              <p className="text-slate-600 mb-6">
                {searchQuery || statusFilter !== "all" || projectFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Create your first script to get started"
                }
              </p>
              {!(searchQuery || statusFilter !== "all" || projectFilter !== "all") && (
                <Button asChild>
                  <Link href="/scripts/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Script
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredScripts.map((script: any) => (
                <Card key={script.id} className="hover:shadow-lg transition-all duration-200 group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold text-slate-900 truncate">
                          {script.title}
                        </CardTitle>
                        {script.episodeNumber && (
                          <p className="text-sm text-slate-500">{script.episodeNumber}</p>
                        )}
                      </div>
                      <Badge className={`ml-2 ${statusColors[script.status as keyof typeof statusColors] || statusColors.draft}`}>
                        {script.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {/* Project */}
                    <div className="text-sm text-slate-600">
                      <strong>Project:</strong> {script.project?.name || 'No project'}
                    </div>

                    {/* Author & Date */}
                    <div className="space-y-1 text-sm text-slate-600">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>{script.author?.firstName} {script.author?.lastName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(script.lastUpdated).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Content Preview */}
                    {script.content && (
                      <div className="text-sm text-slate-600">
                        <div className="line-clamp-2">
                          {script.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                      <div className="flex space-x-1">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/scripts/${script.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/scripts/${script.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(script.id, script.title)}
                        disabled={deleteMutation.isPending}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}