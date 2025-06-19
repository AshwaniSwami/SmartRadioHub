import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  FileText, 
  FolderOpen, 
  Mic, 
  Archive, 
  Users, 
  Tags,
  Radio,
  LogOut
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Scripts", href: "/scripts", icon: FileText },
  { name: "Projects", href: "/projects", icon: FolderOpen },
  { name: "Recordings", href: "/recordings", icon: Mic },
  { name: "Archive", href: "/archive", icon: Archive },
];

const managementNavigation = [
  { name: "Users", href: "/users", icon: Users },
  { name: "Topics", href: "/topics", icon: Tags },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  
  const { data: scriptCount } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    select: (data: any) => data?.totalScripts || 0,
  });

  const canAccessManagement = user?.role === "administrator" || user?.role === "program_manager";

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="flex-shrink-0 w-64 bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl border-r border-slate-700">
      {/* Logo Section */}
      <div className="flex items-center justify-center h-16 px-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Radio className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">SMART Radio</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full justify-start ${
                    isActive 
                      ? "bg-primary/10 text-primary hover:bg-primary/20" 
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  {item.name}
                  {item.name === "Scripts" && scriptCount && (
                    <span className="ml-auto bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                      {scriptCount}
                    </span>
                  )}
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Management Section */}
        {canAccessManagement && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Management
            </h3>
            <div className="space-y-1">
              {managementNavigation.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link key={item.name} href={item.href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={`w-full justify-start ${
                        isActive 
                          ? "bg-primary/10 text-primary hover:bg-primary/20" 
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <item.icon className="h-4 w-4 mr-3" />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* User Profile */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate capitalize">
              {user?.role?.replace("_", " ")}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleLogout}
            className="text-gray-400 hover:text-gray-600"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
