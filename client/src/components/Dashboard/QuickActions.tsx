import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FolderOpen, Search, UserPlus } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function QuickActions() {
  const { user } = useAuth();
  const canManage = user?.role === "administrator" || user?.role === "program_manager";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          className="w-full justify-start bg-primary/10 text-primary hover:bg-primary/20" 
          variant="ghost"
          asChild
        >
          <Link href="/scripts/new">
            <Plus className="h-4 w-4 mr-3" />
            Create New Script
          </Link>
        </Button>
        
        {canManage && (
          <Button 
            className="w-full justify-start" 
            variant="ghost"
            asChild
          >
            <Link href="/projects/new">
              <FolderOpen className="h-4 w-4 mr-3" />
              New Project
            </Link>
          </Button>
        )}
        
        <Button className="w-full justify-start" variant="ghost">
          <Search className="h-4 w-4 mr-3" />
          Advanced Search
        </Button>
        
        {user?.role === "administrator" && (
          <Button className="w-full justify-start" variant="ghost">
            <UserPlus className="h-4 w-4 mr-3" />
            Invite User
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
