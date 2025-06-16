import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Edit } from "lucide-react";
import StatusBadge from "./StatusBadge";

interface ScriptCardProps {
  script: {
    id: number;
    title: string;
    episodeNumber?: string;
    status: string;
    project: { name: string };
    author: { firstName: string; lastName: string };
    lastUpdated: string;
  };
}

export default function ScriptCard({ script }: ScriptCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h4 className="text-sm font-medium text-gray-900">
                {script.title}
                {script.episodeNumber && (
                  <span className="text-gray-500 ml-2">
                    {script.episodeNumber}
                  </span>
                )}
              </h4>
              <StatusBadge status={script.status} />
            </div>
            <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
              <span>{script.project.name}</span>
              <span>•</span>
              <span>{script.author.firstName} {script.author.lastName}</span>
              <span>•</span>
              <span>
                {new Date(script.lastUpdated).toLocaleDateString()}
              </span>
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
      </CardContent>
    </Card>
  );
}
