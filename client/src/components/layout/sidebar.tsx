import { Link } from "wouter";
import { Briefcase, FileText, MessageSquare, Video, Star, User, BarChart3, LogOut, AudioLines } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarProps {
  userType: "seeker" | "poster";
  userName: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout?: () => void;
}

export default function Sidebar({ userType, userName, activeTab, onTabChange, onLogout }: SidebarProps) {
  const seekerNavItems = [
    { icon: Briefcase, label: "Browse Gigs", value: "browse", testId: "nav-browse" },
    { icon: AudioLines, label: "AI Picks", value: "recommendations", testId: "nav-recommendations" },
    { icon: FileText, label: "My Applications", value: "applications", testId: "nav-applications" },
    { icon: MessageSquare, label: "Chat", value: "chat", testId: "nav-chat" },
    { icon: Video, label: "Video Calls", value: "video-calls", testId: "nav-video-calls" },
    { icon: Star, label: "Reviews", value: "reviews", testId: "nav-reviews" },
    { icon: User, label: "Profile", value: "profile", testId: "nav-profile" },
  ];

  const posterNavItems = [
    { icon: Briefcase, label: "My Gigs", value: "gigs", testId: "nav-gigs" },
    { icon: MessageSquare, label: "Chat", value: "chat", testId: "nav-chat" },
    { icon: Video, label: "Video Calls", value: "video-calls", testId: "nav-video-calls" },
    { icon: BarChart3, label: "Analytics", value: "analytics", testId: "nav-analytics" },
    { icon: Star, label: "Reviews", value: "reviews", testId: "nav-reviews" },
    { icon: User, label: "Profile", value: "profile", testId: "nav-profile" },
  ];

  const navItems = userType === "seeker" ? seekerNavItems : posterNavItems;

  return (
    <div className="flex h-screen w-64 flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <Link href="/">
          <a className="flex items-center gap-2" data-testid="link-home">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white",
              userType === "seeker" ? "bg-blue-600" : "bg-green-600"
            )}>
              P
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Payday</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{userType}</p>
            </div>
          </a>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.value;
            
            return (
              <button
                key={item.value}
                onClick={() => onTabChange(item.value)}
                data-testid={item.testId}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? userType === "seeker"
                      ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                      : "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate" data-testid="text-username">{userName}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {userType === "seeker" ? "Gig Seeker" : "Gig Poster"}
          </p>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={onLogout}
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
