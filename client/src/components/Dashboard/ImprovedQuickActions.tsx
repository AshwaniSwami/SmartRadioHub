import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FolderPlus, Upload, FileText, Mic, Eye } from "lucide-react";
import { Link } from "wouter";

export default function ImprovedQuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <Button asChild className="h-16 flex-col space-y-1">
            <Link href="/scripts/new">
              <Plus className="h-5 w-5" />
              <span className="text-sm">New Script</span>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="h-16 flex-col space-y-1">
            <Link href="/projects">
              <FolderPlus className="h-5 w-5" />
              <span className="text-sm">New Project</span>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="h-16 flex-col space-y-1">
            <Link href="/scripts">
              <Eye className="h-5 w-5" />
              <span className="text-sm">View Scripts</span>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="h-16 flex-col space-y-1">
            <Link href="/scripts?status=draft">
              <FileText className="h-5 w-5" />
              <span className="text-sm">My Drafts</span>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}