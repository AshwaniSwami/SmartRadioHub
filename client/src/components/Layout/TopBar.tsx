import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Plus, Search, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

interface TopBarProps {
  title: string;
  showBackButton?: boolean;
  backHref?: string;
}

export default function TopBar({ title, showBackButton, backHref }: TopBarProps) {
  const [search, setSearch] = useState("");

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {showBackButton && backHref && (
              <Button variant="ghost" size="sm" asChild>
                <Link href={backHref}>
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
            )}
            <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
            <div className="hidden md:flex items-center space-x-2">
              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                Online
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search scripts, projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64 pl-10"
              />
            </div>
            
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
            
            {/* Quick Actions */}
            <Button asChild>
              <Link href="/scripts/new">
                <Plus className="h-4 w-4 mr-2" />
                New Script
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
