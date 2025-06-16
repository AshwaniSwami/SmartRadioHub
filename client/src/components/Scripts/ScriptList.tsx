import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Edit, Trash2 } from "lucide-react";
import StatusBadge from "./StatusBadge";
import LoadingSpinner from "@/components/Common/LoadingSpinner";
import EmptyState from "@/components/Common/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface Script {
  id: number;
  title: string;
  episodeNumber?: string;
  status: string;
  project: { name: string };
  author: { firstName: string; lastName: string };
  lastUpdated: string;
  authorId: string;
}

interface ScriptListProps {
  scripts: Script[];
  isLoading: boolean;
  error: Error | null;
}

export default function ScriptList({ scripts, isLoading, error }: ScriptListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (scriptId: number) => {
      await apiRequest("DELETE", `/api/scripts/${scriptId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scripts"] });
      toast({
        title: "Success",
        description: "Script deleted successfully",
      });
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
        description: "Failed to delete script",
        variant: "destructive",
      });
    },
  });

  const canEdit = (script: Script) => {
    return script.authorId === user?.id || 
           user?.role === "administrator" || 
           user?.role === "program_manager";
  };

  const canDelete = (script: Script) => {
    return script.authorId === user?.id || user?.role === "administrator";
  };

  const handleDelete = (scriptId: number, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteMutation.mutate(scriptId);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Error loading scripts: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!scripts || scripts.length === 0) {
    return (
      <EmptyState
        title="No scripts found"
        description="Get started by creating your first script"
        actionLabel="Create Script"
        actionHref="/scripts/new"
      />
    );
  }

  return (
    <div className="space-y-4">
      {scripts.map((script) => (
        <Card key={script.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-medium text-gray-900">
                    {script.title}
                  </h3>
                  {script.episodeNumber && (
                    <span className="text-sm text-gray-500">
                      {script.episodeNumber}
                    </span>
                  )}
                  <StatusBadge status={script.status} />
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{script.project.name}</span>
                  <span>•</span>
                  <span>{script.author.firstName} {script.author.lastName}</span>
                  <span>•</span>
                  <span>
                    Updated {new Date(script.lastUpdated).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
                
                {canEdit(script) && (
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/scripts/${script.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
                
                {canDelete(script) && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDelete(script.id, script.title)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
