import { Store, Users, Folder, BookOpen, TrendingUp, Clock, DollarSign, Trophy, Package, Bot, Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

interface QuickLink {
  title: string;
  description: string;
  icons: React.ReactNode[];
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
      title: 'Sell Agent',
      description: 'Create and sell AI agents',
      icons: [
        <div key="icon1" className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center">
          <Package className="w-4 h-4 text-orange-600" />
        </div>,
        <div key="icon2" className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center -ml-2">
          <DollarSign className="w-4 h-4 text-green-600" />
        </div>,
      ],
      onClick: () => onNavigate('browse')
    },
    {
      title: 'Manage Store',
      description: 'Manage and customize your store whenever you want',
      icons: [
        <div key="icon1" className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
          <Store className="w-4 h-4 text-green-600" />
        </div>,
        <div key="icon2" className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center -ml-2">
          <Trophy className="w-4 h-4 text-purple-600" />
        </div>,
      ],
      highlight: true,
      onClick: () => onNavigate('agent-store')
    },
    {
      title: 'Browse Agents',
      description: 'Discover AI agents',
      icons: [
        <div key="icon1" className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
          <Bot className="w-4 h-4 text-blue-600" />
        </div>,
        <div key="icon2" className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center -ml-2">
          <Users className="w-4 h-4 text-purple-600" />
        </div>,
      ],
      onClick: () => onNavigate('agent-store')
    },
    {
      title: 'My Projects',
      description: 'View and manage projects',
      icons: [
        <div key="icon1" className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center">
          <Folder className="w-4 h-4 text-orange-600" />
        </div>,
      ],
      onClick: () => onNavigate('projects')
    },
    {
      title: 'Learn',
      description: 'Educational resources',
      icons: [
        <div key="icon1" className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-green-600" />
        </div>,
        <div key="icon2" className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center -ml-2">
          <Lightbulb className="w-4 h-4 text-blue-600" />
        </div>,
      ],
      onClick: () => onNavigate('learning')
    }
  ];

  const posterLinks: QuickLink[] = [
    {
      title: 'Sell Agent',
      description: 'Create and sell AI agents',
      icons: [
        <div key="icon1" className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center">
          <Package className="w-4 h-4 text-orange-600" />
        </div>,
        <div key="icon2" className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center -ml-2">
          <DollarSign className="w-4 h-4 text-green-600" />
        </div>,
      ],
      onClick: () => onNavigate('seller')
    },
    {
      title: 'Manage Store',
      description: 'Manage and customize your store whenever you want',
      icons: [
        <div key="icon1" className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
          <Store className="w-4 h-4 text-green-600" />
        </div>,
        <div key="icon2" className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center -ml-2">
          <Trophy className="w-4 h-4 text-purple-600" />
        </div>,
      ],
      highlight: true,
      onClick: () => onNavigate('agent-store')
    },
    {
      title: 'Browse Agents',
      description: 'Discover AI agents',
      icons: [
        <div key="icon1" className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
          <Bot className="w-4 h-4 text-blue-600" />
        </div>,
        <div key="icon2" className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center -ml-2">
          <Users className="w-4 h-4 text-purple-600" />
        </div>,
      ],
      onClick: () => onNavigate('agent-store')
    },
    {
      title: 'My Projects',
      description: 'View and manage projects',
      icons: [
        <div key="icon1" className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center">
          <Folder className="w-4 h-4 text-orange-600" />
        </div>,
      ],
      onClick: () => onNavigate('projects')
    },
    {
      title: 'Learn',
      description: 'Educational resources',
      icons: [
        <div key="icon1" className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-green-600" />
        </div>,
        <div key="icon2" className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center -ml-2">
          <Lightbulb className="w-4 h-4 text-blue-600" />
        </div>,
      ],
      onClick: () => onNavigate('learning')
    }
  ];

  const links = userType === 'seeker' ? seekerLinks : posterLinks;

  const autonomsStats = [
    {
      label: 'Total Agents Deployed',
      value: 0,
      change: '39%',
      icon: <TrendingUp className="w-4 h-4 text-primary" />,
      changeColor: 'text-green-600'
    },
    {
      label: 'Total Hours Saved',
      value: 0,
      change: '10%',
      icon: <Clock className="w-4 h-4 text-primary" />,
      changeColor: 'text-green-600'
    },
    {
      label: 'Total Cost Saved',
      value: '₦0.0',
      change: '10%',
      icon: <DollarSign className="w-4 h-4 text-primary" />,
      changeColor: 'text-green-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 break-words">
            <span className="text-primary">{getGreeting()}</span>{' '}
            <span className="text-gray-900">{user?.firstName || 'User'}!</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Welcome to your AI Agent marketplace dashboard
          </p>
        </div>

        {/* Quick Links Section */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Quick Links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
            {links.map((link, index) => (
              <Card
                key={index}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  link.highlight ? 'border-2 border-primary' : ''
                }`}
                onClick={link.onClick}
                data-testid={`quick-link-${index}`}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex gap-1 mb-3 sm:mb-4">{link.icons}</div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{link.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{link.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats Section and Agent Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Stats Cards */}
          {autonomsStats.map((stat, index) => (
            <Card key={index} data-testid={`stat-${index}`} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-3">
                  {stat.icon}
                  <span className="text-xs sm:text-sm text-gray-600 font-medium">{stat.label}</span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</span>
                  <div className="flex items-center gap-1">
                    <span className={`text-sm font-semibold ${stat.changeColor}`}>
                      {stat.change}
                    </span>
                    <TrendingUp className={`w-3 h-3 ${stat.changeColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Agent Summary Section */}
        <Card className="mb-6">
          <CardContent className="p-4 sm:p-6">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">Agent Summary</h3>
            <div className="flex items-center justify-center h-32 sm:h-40 text-gray-400">
              <p className="text-xs sm:text-sm text-center">Agent analytics and summary will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
