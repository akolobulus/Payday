import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Briefcase, 
  Trophy, 
  Bot, 
  Wallet, 
  MessageSquare, 
  Video, 
  BarChart3, 
  Star, 
  User, 
  Menu, 
  X,
  LogOut,
  Home
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import paydayLogoPath from "@assets/20250819_104458-removebg-preview_1755623157202.png";

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userType: 'seeker' | 'poster';
}

const seekerMenuItems = [
  { id: 'browse', label: 'My Gigs', icon: Briefcase },
  { id: 'gamification', label: 'Achievements', icon: Trophy },
  { id: 'ai-assistant', label: 'AI Assistant', icon: Bot },
  { id: 'financial', label: 'Financial', icon: Wallet },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'video-calls', label: 'Video', icon: Video },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'profile', label: 'Profile', icon: User },
];

const posterMenuItems = [
  { id: 'my-gigs', label: 'My Gigs', icon: Briefcase },
  { id: 'gamification', label: 'Achievements', icon: Trophy },
  { id: 'ai-assistant', label: 'AI Assistant', icon: Bot },
  { id: 'financial', label: 'Financial', icon: Wallet },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'video-calls', label: 'Video', icon: Video },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'profile', label: 'Profile', icon: User },
];

export default function DashboardSidebar({ activeTab, onTabChange, userType }: DashboardSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const menuItems = userType === 'seeker' ? seekerMenuItems : posterMenuItems;

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest('/api/auth/logout', 'POST'),
    onSuccess: () => {
      toast({
        title: "Logged out successfully",
        description: "See you next time!",
      });
      setLocation('/');
    },
  });

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Header with Menu Toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <img src={paydayLogoPath} alt="Payday" className="w-8 h-8" />
            <span className="font-bold text-lg text-payday-blue dark:text-white">Payday</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            data-testid="button-mobile-menu-toggle"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-40
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:w-64
          ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full'}
        `}
        data-testid="dashboard-sidebar"
      >
        <div className="flex flex-col h-full">
          {/* Logo - Desktop */}
          <div className="hidden lg:flex items-center gap-2 p-6 border-b border-gray-200 dark:border-gray-800">
            <img src={paydayLogoPath} alt="Payday" className="w-10 h-10" />
            <span className="font-bold text-xl text-payday-blue dark:text-white">Payday</span>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto pt-20 lg:pt-6 pb-6 px-3">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    data-testid={`sidebar-${item.id}`}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                      transition-colors duration-150
                      ${isActive 
                        ? 'bg-payday-blue text-white' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Footer Actions */}
          <div className="border-t border-gray-200 dark:border-gray-800 p-3 space-y-1">
            <Link href="/">
              <button
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                data-testid="sidebar-home"
              >
                <Home className="h-5 w-5" />
                <span>Home</span>
              </button>
            </Link>
            <button
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              data-testid="sidebar-logout"
            >
              <LogOut className="h-5 w-5" />
              <span>{logoutMutation.isPending ? 'Logging out...' : 'Logout'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
          data-testid="mobile-menu-overlay"
        />
      )}
    </>
  );
}
