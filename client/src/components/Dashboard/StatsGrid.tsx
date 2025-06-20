import { Card, CardContent } from "@/components/ui/card";
import { FileText, Clock, CheckCircle, Mic, TrendingUp, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "@/components/Common/LoadingSpinner";

interface DashboardStats {
  totalScripts: number;
  pendingReview: number;
  approved: number;
  recorded: number;
  drafts: number;
  needsRevision: number;
  workflowCounts: Record<string, number>;
}

export default function StatsGrid() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const statsCards = [
    {
      title: "Total Scripts",
      value: stats?.totalScripts || 0,
      change: "+12%",
      changeLabel: "from last month",
      icon: FileText,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Pending Review",
      value: stats?.pendingReview || 0,
      change: "Needs attention",
      changeLabel: "",
      icon: Clock,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
    {
      title: "Approved",
      value: stats?.approved || 0,
      change: "Ready to record",
      changeLabel: "",
      icon: CheckCircle,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Recorded",
      value: stats?.recorded || 0,
      change: "This month",
      changeLabel: "",
      icon: Mic,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsCards.map((stat, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow duration-200 border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`p-3 ${stat.iconBg} dark:${stat.iconBg.replace('100', '900')} rounded-xl shadow-sm`}>
                  <stat.icon className={`h-6 w-6 ${stat.iconColor} dark:${stat.iconColor.replace('600', '300')}`} />
                </div>
              </div>
              {stat.title === "Pending Review" && stat.value > 0 && (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              )}
              {stat.title === "Total Scripts" && (
                <TrendingUp className="h-4 w-4 text-green-500" />
              )}
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
            </div>
            <div className="mt-4 flex items-center">
              <div className="flex items-center text-sm">
                <span className={
                  stat.title === "Pending Review" 
                    ? "text-yellow-600 dark:text-yellow-400 font-medium" 
                    : "text-green-600 dark:text-green-400 font-medium"
                }>
                  {stat.change}
                </span>
                {stat.changeLabel && (
                  <span className="text-gray-500 dark:text-gray-400 ml-2">{stat.changeLabel}</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
