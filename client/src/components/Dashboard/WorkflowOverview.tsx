import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "@/components/Common/LoadingSpinner";

export default function WorkflowOverview() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  const workflowSteps = [
    { 
      label: "Draft", 
      count: stats?.workflowCounts?.draft || 0, 
      color: "bg-gray-400" 
    },
    { 
      label: "Submitted", 
      count: stats?.workflowCounts?.submitted || 0, 
      color: "bg-blue-500" 
    },
    { 
      label: "Under Review", 
      count: stats?.workflowCounts?.under_review || 0, 
      color: "bg-yellow-500" 
    },
    { 
      label: "Approved", 
      count: stats?.workflowCounts?.approved || 0, 
      color: "bg-green-500" 
    },
    { 
      label: "Needs Revision", 
      count: stats?.workflowCounts?.needs_revision || 0, 
      color: "bg-red-500" 
    },
    { 
      label: "Recorded", 
      count: stats?.workflowCounts?.recorded || 0, 
      color: "bg-purple-500" 
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflow Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {workflowSteps.map((step) => (
            <div key={step.label} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 ${step.color} rounded-full`} />
                <span className="text-sm text-gray-600">{step.label}</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {step.count}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
