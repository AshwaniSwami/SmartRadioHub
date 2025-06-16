import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { Link } from "wouter";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export default function EmptyState({ 
  title, 
  description, 
  actionLabel, 
  actionHref,
  icon: Icon = FileText 
}: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="p-12">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <Icon className="h-full w-full" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 mb-6">{description}</p>
          {actionLabel && actionHref && (
            <Button asChild>
              <Link href={actionHref}>{actionLabel}</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
