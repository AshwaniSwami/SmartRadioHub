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
  LogOut,
  Plus,
  TrendingUp
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Projects", href: "/projects", icon: FolderOpen },
  { name: "Scripts", href: "/scripts", icon: FileText },
  { name: "Recordings", href: "/recordings", icon: Mic },
  { name: "Archive", href: "/archive", icon: Archive },
];

const managementNavigation = [
  { name: "Users", href: "/users", icon: Users },
  { name: "Topics", href: "/topics", icon: Tags },
];

export default function EnhancedSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  
  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const canAccessManagement = (user as any)?.role === "administrator" || (user as any)?.role === "program_manager";

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="flex-shrink-0 w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl">
      {/* Logo Section */}
      <div className="flex items-center justify-center h-16 px-6 border-b border-slate-700/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Radio className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            SMART Radio
          </h1>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="px-4 py-4 border-b border-slate-700/50">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">{stats?.totalScripts || 0}</div>
            <div className="text-xs text-slate-400">Scripts</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-400">{stats?.approved || 0}</div>
            <div className="text-xs text-slate-400">Approved</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-4 px-3 space-y-1">
        {navigation.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href}>
              <div className={`
                flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                ${isActive 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }
              `}>
                <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.name}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Quick Actions */}
      <div className="px-3 mt-6">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Quick Actions
        </div>
        <div className="space-y-2">
          <Button asChild className="w-full justify-start bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700">
            <Link href="/scripts/new">
              <Plus className="mr-2 h-4 w-4" />
              New Script
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700">
            <Link href="/projects">
              <FolderOpen className="mr-2 h-4 w-4" />
              Manage Projects
            </Link>
          </Button>
        </div>
      </div>

      {/* Management Section */}
      {canAccessManagement && (
        <div className="px-3 mt-6">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Management
          </div>
          <nav className="space-y-1">
            {managementNavigation.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              
              return (
                <Link key={item.name} href={item.href}>
                  <div className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }
                  `}>
                    <Icon className={`mr-3 h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* User Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/50">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-white">
              {(user as any)?.firstName?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {(user as any)?.firstName} {(user as any)?.lastName}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {(user as any)?.role?.replace('_', ' ') || 'User'}
            </p>
          </div>
        </div>
        <Button 
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}