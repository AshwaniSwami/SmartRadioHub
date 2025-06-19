import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import EnhancedSidebar from "@/components/Layout/EnhancedSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { 
  FileText, 
  FolderOpen, 
  CheckCircle, 
  Clock, 
  Mic, 
  TrendingUp,
  Plus,
  Eye,
  Edit,
  User,
  Calendar,
  BarChart3
} from "lucide-react";
import { Link } from "wouter";
import LoadingSpinner from "@/components/Common/LoadingSpinner";

export default function EnhancedDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

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

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    enabled: isAuthenticated,
  });

  const { data: recentScripts = [], isLoading: scriptsLoading } = useQuery<any[]>({
    queryKey: ["/api/scripts"],
    enabled: isAuthenticated,
  });

  const { data: projects = [] } = useQuery<any[]>({
    queryKey: ["/api/projects"],
    enabled: isAuthenticated,
  });

  if (isLoading || statsLoading) {
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

  const statusCounts = {
    total: stats?.totalScripts || 0,
    draft: stats?.drafts || 0,
    pendingReview: stats?.pendingReview || 0,
    approved: stats?.approved || 0,
    recorded: stats?.recorded || 0,
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <EnhancedSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Welcome back, {(user as any)?.firstName || 'User'}
              </h1>
              <p className="text-slate-600 mt-1">
                Here's what's happening with your radio content today
              </p>
            </div>
            
            <div className="flex space-x-3">
              <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Link href="/scripts/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New Script
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/projects">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Projects
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Scripts</p>
                    <p className="text-3xl font-bold">{statusCounts.total}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm font-medium">Drafts</p>
                    <p className="text-3xl font-bold">{statusCounts.draft}</p>
                  </div>
                  <Edit className="h-8 w-8 text-yellow-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Pending Review</p>
                    <p className="text-3xl font-bold">{statusCounts.pendingReview}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Approved</p>
                    <p className="text-3xl font-bold">{statusCounts.approved}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Recorded</p>
                    <p className="text-3xl font-bold">{statusCounts.recorded}</p>
                  </div>
                  <Mic className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Scripts */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span>Recent Scripts</span>
                    </CardTitle>
                    <Button variant="ghost" asChild>
                      <Link href="/scripts">View all</Link>
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {scriptsLoading ? (
                    <LoadingSpinner />
                  ) : Array.isArray(recentScripts) && recentScripts.length > 0 ? (
                    <div className="space-y-4">
                      {recentScripts.slice(0, 5).map((script: any) => (
                        <div
                          key={script.id}
                          className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-lg border border-slate-100 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="text-sm font-medium text-slate-900">
                                {script.title}
                              </h4>
                              <Badge variant={script.status === 'approved' ? 'default' : 'secondary'}>
                                {script.status}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-xs text-slate-500">
                              <span className="flex items-center space-x-1">
                                <User className="h-3 w-3" />
                                <span>{script.author?.firstName} {script.author?.lastName}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <FolderOpen className="h-3 w-3" />
                                <span>{script.project?.name}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>{new Date(script.lastUpdated).toLocaleDateString()}</span>
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/scripts/${script.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/scripts/${script.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                      <h3 className="text-sm font-medium text-slate-900">No scripts yet</h3>
                      <p className="text-sm text-slate-500 mb-4">
                        Create your first script to get started.
                      </p>
                      <Button asChild>
                        <Link href="/scripts/new">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Script
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Projects Overview */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FolderOpen className="h-5 w-5" />
                    <span>Projects</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {Array.isArray(projects) && projects.length > 0 ? (
                    <div className="space-y-3">
                      {projects.slice(0, 5).map((project: any) => (
                        <div
                          key={project.id}
                          className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-slate-900 truncate">
                              {project.name}
                            </h4>
                            <p className="text-xs text-slate-500">
                              Scripts: {project.scriptCount || 0}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href="/projects">
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      ))}
                      {projects.length > 5 && (
                        <div className="text-center pt-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href="/projects">View all projects</Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <FolderOpen className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                      <h3 className="text-sm font-medium text-slate-900">No projects</h3>
                      <p className="text-xs text-slate-500 mb-3">
                        Create a project to organize your scripts.
                      </p>
                      <Button asChild size="sm">
                        <Link href="/projects">
                          <Plus className="h-3 w-3 mr-1" />
                          Create Project
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Workflow Status */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Workflow Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { label: "Drafts", value: statusCounts.draft, color: "bg-yellow-500" },
                      { label: "Under Review", value: statusCounts.pendingReview, color: "bg-orange-500" },
                      { label: "Approved", value: statusCounts.approved, color: "bg-green-500" },
                      { label: "Recorded", value: statusCounts.recorded, color: "bg-purple-500" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                          <span className="text-sm text-slate-600">{item.label}</span>
                        </div>
                        <span className="text-sm font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}