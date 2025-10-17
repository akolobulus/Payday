import { Store, Users, Folder, BookOpen, TrendingUp, Clock, DollarSign, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

interface QuickLink {
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight?: boolean;
  onClick: () => void;
}

interface DashboardOverviewProps {
  userType: 'seeker' | 'poster';
  user?: User;
  onNavigate: (tab: string) => void;
}

export default function DashboardOverview({ userType, user, onNavigate }: DashboardOverviewProps) {
  const { data: stats } = useQuery<any>({
    queryKey: ['/api/dashboard/stats']
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const seekerLinks: QuickLink[] = [
    {
      title: 'Browse Gigs',
      description: 'Find and apply to available gigs in your area',
      icon: <div className="flex gap-2 items-center">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <Store className="w-5 h-5 text-blue-600" />
        </div>
      </div>,
      onClick: () => onNavigate('browse')
    },
    {
      title: 'My Gigs',
      description: 'Track your ongoing and completed gigs',
      icon: <div className="flex gap-2 items-center">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <Trophy className="w-5 h-5 text-green-600" />
        </div>
      </div>,
      highlight: true,
      onClick: () => onNavigate('my-gigs')
    },
    {
      title: 'My Projects',
      description: 'View all your projects and submissions',
      icon: <div className="flex gap-2 items-center">
        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
          <Folder className="w-5 h-5 text-purple-600" />
        </div>
      </div>,
      onClick: () => onNavigate('projects')
    },
    {
      title: 'Learning',
      description: 'Take courses to improve your skills',
      icon: <div className="flex gap-2 items-center">
        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-orange-600" />
        </div>
      </div>,
      onClick: () => onNavigate('learning')
    }
  ];

  const posterLinks: QuickLink[] = [
    {
      title: 'Post Gig',
      description: 'Create a new gig posting',
      icon: <div className="flex gap-2 items-center">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <Store className="w-5 h-5 text-blue-600" />
        </div>
      </div>,
      onClick: () => onNavigate('post-gig')
    },
    {
      title: 'Manage Gigs',
      description: 'Monitor and manage all your gig postings',
      icon: <div className="flex gap-2 items-center">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <Trophy className="w-5 h-5 text-green-600" />
        </div>
      </div>,
      highlight: true,
      onClick: () => onNavigate('manage-gigs')
    },
    {
      title: 'Find Talent',
      description: 'Browse available gig seekers',
      icon: <div className="flex gap-2 items-center">
        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
          <Users className="w-5 h-5 text-purple-600" />
        </div>
      </div>,
      onClick: () => onNavigate('projects')
    },
    {
      title: 'Learning',
      description: 'Learn how to maximize your hiring',
      icon: <div className="flex gap-2 items-center">
        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-orange-600" />
        </div>
      </div>,
      onClick: () => onNavigate('learning')
    }
  ];

  const links = userType === 'seeker' ? seekerLinks : posterLinks;

  const seekerStats = [
    {
      label: 'Total Gigs Completed',
      value: user?.totalGigsCompleted || 0,
      change: '+30%',
      icon: <Trophy className="w-5 h-5 text-blue-500" />
    },
    {
      label: 'Hours Worked',
      value: (user?.totalGigsCompleted || 0) * 3.5,
      change: '+10%',
      icon: <Clock className="w-5 h-5 text-green-500" />
    },
    {
      label: 'Total Earnings',
      value: `₦${(stats?.totalEarnings / 100 || 0).toLocaleString()}`,
      change: '+15%',
      icon: <DollarSign className="w-5 h-5 text-orange-500" />
    }
  ];

  const posterStats = [
    {
      label: 'Total Gigs Posted',
      value: stats?.totalGigs || 0,
      change: '+20%',
      icon: <Trophy className="w-5 h-5 text-blue-500" />
    },
    {
      label: 'Active Gigs',
      value: stats?.activeGigs || 0,
      change: '+5%',
      icon: <Clock className="w-5 h-5 text-green-500" />
    },
    {
      label: 'Total Spent',
      value: `₦${(stats?.totalSpent / 100 || 0).toLocaleString()}`,
      change: '+12%',
      icon: <DollarSign className="w-5 h-5 text-orange-500" />
    }
  ];

  const displayStats = userType === 'seeker' ? seekerStats : posterStats;

  return (
    <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 break-words">
            <span className="text-gray-500">{getGreeting()}</span>{' '}
            <span className="text-payday-blue">{user?.firstName || 'User'}!</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Welcome to your {userType === 'seeker' ? 'gig seeker' : 'gig poster'} marketplace dashboard
          </p>
        </div>

        {/* Quick Links Section */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Quick Links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {links.map((link, index) => (
              <Card
                key={index}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  link.highlight ? 'border-2 border-payday-blue' : ''
                }`}
                onClick={link.onClick}
                data-testid={`quick-link-${index}`}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="mb-3 sm:mb-4">{link.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{link.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{link.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {displayStats.map((stat, index) => (
            <Card key={index} data-testid={`stat-${index}`}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {stat.icon}
                    <span className="text-xs sm:text-sm text-gray-600 truncate">{stat.label}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xl sm:text-2xl font-bold truncate">{stat.value}</span>
                  <span className="text-xs sm:text-sm text-green-600 flex items-center gap-1 whitespace-nowrap">
                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                    {stat.change}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Agent Summary - Placeholder */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">Activity Summary</h3>
            <div className="flex items-center justify-center h-24 sm:h-32 text-gray-400">
              <p className="text-xs sm:text-sm text-center">Recent activity will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
