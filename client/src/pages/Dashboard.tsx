import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/Layout/Sidebar";
import TopBar from "@/components/Layout/TopBar";
import StatsGrid from "@/components/Dashboard/StatsGrid";
import WorkflowOverview from "@/components/Dashboard/WorkflowOverview";
import RecentActivity from "@/components/Dashboard/RecentActivity";
import QuickActions from "@/components/Dashboard/QuickActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Eye, Edit } from "lucide-react";
import { Link } from "wouter";
import LoadingSpinner from "@/components/Common/LoadingSpinner";
import StatusBadge from "@/components/Scripts/StatusBadge";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

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

  const { data: recentScripts, isLoading: scriptsLoading } = useQuery({
    queryKey: ["/api/scripts"],
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="pl-64">
        <TopBar title="Dashboard" />
        
        <main className="p-6 space-y-6">
          <StatsGrid />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Scripts */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Scripts</CardTitle>
                    <Button variant="ghost" asChild>
                      <Link href="/scripts">View all</Link>
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Filters */}
                  <div className="flex items-center space-x-4 mb-6">
                    <Select>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="submitted">Submitted</SelectItem>
                        <SelectItem value="under_review">Under Review</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="All Projects" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Projects</SelectItem>
                        <SelectItem value="morning-show">Morning Show</SelectItem>
                        <SelectItem value="tech-talk">Tech Talk</SelectItem>
                        <SelectItem value="news-brief">News Brief</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Scripts List */}
                  {scriptsLoading ? (
                    <LoadingSpinner />
                  ) : (
                    <div className="space-y-4">
                      {recentScripts?.slice(0, 5).map((script: any) => (
                        <div
                          key={script.id}
                          className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg border border-gray-100"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h4 className="text-sm font-medium text-gray-900">
                                {script.title}
                              </h4>
                              <StatusBadge status={script.status} />
                            </div>
                            <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                              <span>{script.project?.name}</span>
                              <span>•</span>
                              <span>{script.author?.firstName} {script.author?.lastName}</span>
                              <span>•</span>
                              <span>{new Date(script.lastUpdated).toRelativeTimeString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/scripts/${script.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      )) || (
                        <div className="text-center py-8 text-gray-500">
                          No scripts found. <Link href="/scripts/new" className="text-primary hover:underline">Create your first script</Link>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <WorkflowOverview />
              <RecentActivity />
              <QuickActions />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
