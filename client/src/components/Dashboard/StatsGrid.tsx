import { Card, CardContent } from "@/components/ui/card";
import { FileText, Clock, CheckCircle, Mic } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "@/components/Common/LoadingSpinner";

export default function StatsGrid() {
  const { data: stats, isLoading } = useQuery({
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
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className={`p-2 ${stat.iconBg} rounded-lg`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <span className={
                  stat.title === "Pending Review" 
                    ? "text-yellow-600 font-medium" 
                    : "text-green-600 font-medium"
                }>
                  {stat.change}
                </span>
                {stat.changeLabel && (
                  <span className="text-gray-500 ml-2">{stat.changeLabel}</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
