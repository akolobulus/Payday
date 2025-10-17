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
      title: 'Find Quick Gigs',
      description: 'Browse available gigs and earn today',
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
      title: 'My Applications',
      description: 'Track your gig applications and status',
      icons: [
        <div key="icon1" className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
          <Store className="w-4 h-4 text-green-600" />
        </div>,
        <div key="icon2" className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center -ml-2">
          <Trophy className="w-4 h-4 text-purple-600" />
        </div>,
      ],
      highlight: true,
      onClick: () => onNavigate('applications')
    },
    {
      title: 'AI Recommendations',
      description: 'Get personalized gig suggestions',
      icons: [
        <div key="icon1" className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
          <Bot className="w-4 h-4 text-blue-600" />
        </div>,
        <div key="icon2" className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center -ml-2">
          <Users className="w-4 h-4 text-purple-600" />
        </div>,
      ],
      onClick: () => onNavigate('recommendations')
    },
    {
      title: 'My Wallet',
      description: 'View earnings and withdraw funds',
      icons: [
        <div key="icon1" className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center">
          <Folder className="w-4 h-4 text-orange-600" />
        </div>,
      ],
      onClick: () => onNavigate('financial')
    },
    {
      title: 'Analytics',
      description: 'Track your performance',
      icons: [
        <div key="icon1" className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-green-600" />
        </div>,
        <div key="icon2" className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center -ml-2">
          <Lightbulb className="w-4 h-4 text-blue-600" />
        </div>,
      ],
      onClick: () => onNavigate('analytics')
    }
  ];

  const posterLinks: QuickLink[] = [
    {
      title: 'My Gigs',
      description: 'View and manage your posted gigs',
      icons: [
        <div key="icon1" className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center">
          <Package className="w-4 h-4 text-orange-600" />
        </div>,
        <div key="icon2" className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center -ml-2">
          <DollarSign className="w-4 h-4 text-green-600" />
        </div>,
      ],
      onClick: () => onNavigate('my-gigs')
    },
    {
      title: 'View Applicants',
      description: 'Review applications for your gigs',
      icons: [
        <div key="icon1" className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
          <Store className="w-4 h-4 text-green-600" />
        </div>,
        <div key="icon2" className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center -ml-2">
          <Trophy className="w-4 h-4 text-purple-600" />
        </div>,
      ],
      highlight: true,
      onClick: () => onNavigate('my-gigs')
    },
    {
      title: 'Analytics',
      description: 'View your performance metrics',
      icons: [
        <div key="icon1" className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
          <Bot className="w-4 h-4 text-blue-600" />
        </div>,
        <div key="icon2" className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center -ml-2">
          <Users className="w-4 h-4 text-purple-600" />
        </div>,
      ],
      onClick: () => onNavigate('analytics')
    },
    {
      title: 'My Wallet',
      description: 'Manage funds and transactions',
      icons: [
        <div key="icon1" className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center">
          <Folder className="w-4 h-4 text-orange-600" />
        </div>,
      ],
      onClick: () => onNavigate('financial')
    },
    {
      title: 'Reviews',
      description: 'View gig reviews and ratings',
      icons: [
        <div key="icon1" className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-green-600" />
        </div>,
        <div key="icon2" className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center -ml-2">
          <Lightbulb className="w-4 h-4 text-blue-600" />
        </div>,
      ],
      onClick: () => onNavigate('reviews')
    }
  ];

  const links = userType === 'seeker' ? seekerLinks : posterLinks;

  const paydayStats = [
    {
      label: userType === 'seeker' ? 'Total Gigs Completed' : 'Total Gigs Posted',
      value: 0,
      change: '39%',
      icon: <TrendingUp className="w-4 h-4 text-primary" />,
      changeColor: 'text-green-600'
    },
    {
      label: userType === 'seeker' ? 'Total Earnings' : 'Total Spent',
      value: '₦0.0',
      change: '10%',
      icon: <DollarSign className="w-4 h-4 text-primary" />,
      changeColor: 'text-green-600'
    },
    {
      label: userType === 'seeker' ? 'Active Applications' : 'Active Gigs',
      value: 0,
      change: '10%',
      icon: <Clock className="w-4 h-4 text-primary" />,
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
            Welcome to your Payday dashboard - Get paid today, not tomorrow
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

        {/* Stats Section and Gig Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Stats Cards */}
          {paydayStats.map((stat, index) => (
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

        {/* Gig Summary Section */}
        <Card className="mb-6">
          <CardContent className="p-4 sm:p-6">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">Gig Summary</h3>
            <div className="flex items-center justify-center h-32 sm:h-40 text-gray-400">
              <p className="text-xs sm:text-sm text-center">Gig analytics and summary will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
