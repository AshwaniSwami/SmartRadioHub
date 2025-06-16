import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Check, Plus, Mic, Edit } from "lucide-react";
import LoadingSpinner from "@/components/Common/LoadingSpinner";

const activityIcons = {
  created: Plus,
  approved: Check,
  recorded: Mic,
  updated: Edit,
};

const activityColors = {
  created: "bg-blue-100 text-blue-600",
  approved: "bg-green-100 text-green-600", 
  recorded: "bg-purple-100 text-purple-600",
  updated: "bg-yellow-100 text-yellow-600",
};

export default function RecentActivity() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["/api/dashboard/activity"],
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities?.map((activity: any) => {
            const Icon = activityIcons[activity.action as keyof typeof activityIcons] || Plus;
            const colorClass = activityColors[activity.action as keyof typeof activityColors] || "bg-gray-100 text-gray-600";
            
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                  <Icon className="h-3 w-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">
                      {activity.user.firstName} {activity.user.lastName}
                    </span>{" "}
                    {activity.details}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          }) || (
            <div className="text-center text-gray-500 py-4">
              No recent activity
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
