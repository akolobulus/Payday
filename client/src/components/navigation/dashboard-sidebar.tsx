import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Grid,
  ShoppingBag,
  Store,
  FolderKanban,
  MessageSquare,
  Calendar,
  GraduationCap,
  Bookmark,
  Settings,
  Menu,
  X,
  LogOut,
  Home,
  ChevronDown
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userType: 'seeker' | 'poster';
}

const seekerMenuItems = [
  { id: 'overview', label: 'Overview', icon: Grid },
  { id: 'browse', label: 'Browse Gigs', icon: ShoppingBag },
  { id: 'my-gigs', label: 'My Gigs', icon: Store },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'chat', label: 'Conversations', icon: MessageSquare },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'learning', label: 'Learning', icon: GraduationCap },
  { id: 'saved', label: 'Saved', icon: Bookmark },
];

const posterMenuItems = [
  { id: 'overview', label: 'Overview', icon: Grid },
  { id: 'post-gig', label: 'Post Gig', icon: ShoppingBag },
  { id: 'manage-gigs', label: 'Manage Gigs', icon: Store },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'chat', label: 'Conversations', icon: MessageSquare },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'learning', label: 'Learning', icon: GraduationCap },
  { id: 'saved', label: 'Saved', icon: Bookmark },
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
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <span className="font-bold text-xl text-payday-blue">Payday</span>
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
          fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-40
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:w-64
          ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full'}
        `}
        data-testid="dashboard-sidebar"
      >
        <div className="flex flex-col h-full">
          {/* Logo - Desktop */}
          <div className="hidden lg:flex items-center p-6 border-b border-gray-200">
            <span className="font-bold text-2xl text-payday-blue">Payday</span>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto pt-20 lg:pt-6 pb-6 px-4">
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
                        ? 'bg-gray-100 text-gray-900' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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
          <div className="border-t border-gray-200 p-4 space-y-2">
            <button
              onClick={() => onTabChange('settings')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              data-testid="sidebar-settings"
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </button>
            <Link href="/">
              <button
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                data-testid="sidebar-home"
              >
                <Home className="h-5 w-5" />
                <span>Home</span>
              </button>
            </Link>
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
