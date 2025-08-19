import { useQuery } from "@tanstack/react-query";

export default function Stats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/stats'],
  });

  if (isLoading) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `₦${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}k`;
    }
    return num.toString();
  };

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div className="animate-slide-up" data-testid="stat-gig-seekers">
            <div className="text-3xl font-bold text-payday-blue mb-2">
              {stats?.gigSeekers ? `${stats.gigSeekers}+` : '1000+'}
            </div>
            <div className="text-gray-600">Active Gig Seekers</div>
          </div>
          <div className="animate-slide-up" data-testid="stat-gigs-posted">
            <div className="text-3xl font-bold text-payday-blue mb-2">
              {stats?.gigsPosted ? `${stats.gigsPosted}+` : '500+'}
            </div>
            <div className="text-gray-600">Gigs Posted Daily</div>
          </div>
          <div className="animate-slide-up" data-testid="stat-payout">
            <div className="text-3xl font-bold text-payday-blue mb-2">
              {stats?.totalPayout ? formatNumber(stats.totalPayout) : '₦2.5M'}
            </div>
            <div className="text-gray-600">Paid Out Monthly</div>
          </div>
          <div className="animate-slide-up" data-testid="stat-payout-time">
            <div className="text-3xl font-bold text-payday-blue mb-2">30 sec</div>
            <div className="text-gray-600">Average Payout Time</div>
          </div>
        </div>
      </div>
    </section>
  );
}
