import { useEffect } from "react";
import { useRoute } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import EnhancedSidebar from "@/components/Layout/EnhancedSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Download, 
  Share,
  User,
  Calendar,
  FolderOpen,
  FileText,
  Clock
} from "lucide-react";
import { Link, useLocation } from "wouter";
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

export default function ScriptViewer() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/scripts/:id");
  const scriptId = params?.id ? parseInt(params.id) : null;
  
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

  const { data: script, isLoading: scriptLoading, error } = useQuery<any>({
    queryKey: ["/api/scripts", scriptId],
    enabled: isAuthenticated && !!scriptId,
  });

  if (isLoading || scriptLoading) {
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

  if (error || !script) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <EnhancedSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FileText className="mx-auto h-16 w-16 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Script not found</h3>
            <p className="text-slate-600 mb-6">
              The script you're looking for doesn't exist or has been deleted.
            </p>
            <Button asChild>
              <Link href="/scripts">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Scripts
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const canEdit = (user as any)?.id === script?.authorId || 
                 ['program_manager', 'administrator'].includes((user as any)?.role);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <EnhancedSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/scripts">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Scripts
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{script.title}</h1>
                <div className="flex items-center space-x-4 mt-1">
                  <Badge className={statusColors[script.status as keyof typeof statusColors] || statusColors.draft}>
                    {script.status}
                  </Badge>
                  {script.episodeNumber && (
                    <span className="text-slate-600">{script.episodeNumber}</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {canEdit && (
                <Button asChild>
                  <Link href={`/scripts/${script.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                </Button>
              )}
              <Button variant="outline">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Script Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Script Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <h4 className="font-medium text-slate-900 mb-1">Author</h4>
                    <div className="flex items-center space-x-2 text-slate-600">
                      <User className="h-4 w-4" />
                      <span>{script.author?.firstName} {script.author?.lastName}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-slate-900 mb-1">Project</h4>
                    <div className="flex items-center space-x-2 text-slate-600">
                      <FolderOpen className="h-4 w-4" />
                      <span>{script.project?.name || 'No project'}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-slate-900 mb-1">Last Updated</h4>
                    <div className="flex items-center space-x-2 text-slate-600">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(script.lastUpdated).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-slate-900 mb-1">Created</h4>
                    <div className="flex items-center space-x-2 text-slate-600">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(script.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {script.broadcastDate && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <h4 className="font-medium text-slate-900 mb-1">Broadcast Date</h4>
                    <p className="text-slate-600">{new Date(script.broadcastDate).toLocaleDateString()}</p>
                  </div>
                )}

                {script.topics && script.topics.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <h4 className="font-medium text-slate-900 mb-2">Topics</h4>
                    <div className="flex flex-wrap gap-2">
                      {script.topics.map((topic: any) => (
                        <Badge key={topic.id} variant="outline">
                          {topic.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Script Content */}
            <Card>
              <CardHeader>
                <CardTitle>Script Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-slate max-w-none">
                  {script.content ? (
                    <div className="text-slate-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border">
                      {script.content}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 italic">No content available for this script</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Audio Link */}
            {script.audioLink && (
              <Card>
                <CardHeader>
                  <CardTitle>Audio Recording</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <p className="text-slate-600 mb-2">
                        Audio file is available for this script.
                      </p>
                      <Button asChild variant="outline">
                        <a href={script.audioLink} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" />
                          Download Audio
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Review Comments */}
            {script.reviewComments && (
              <Card>
                <CardHeader>
                  <CardTitle>Review Comments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-slate-700">{script.reviewComments}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* File Attachments */}
            {script.attachments && script.attachments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Attachments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {script.attachments.map((file: any) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-slate-500" />
                          <div>
                            <p className="text-sm font-medium text-slate-900">{file.name}</p>
                            <p className="text-xs text-slate-500">
                              {file.size} • {new Date(file.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={file.url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}