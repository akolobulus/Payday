export default function Benefits() {
  const benefits = [
    {
      icon: "fas fa-bolt",
      title: "Instant Payments & Wallet",
      description: "Get paid in 30 seconds with escrow protection. Manage earnings, top-up, and withdraw instantly to your bank or mobile money.",
    },
    {
      icon: "fas fa-robot",
      title: "AI-Powered Matching & Zee Assistant",
      description: "Smart algorithm matches you with perfect gigs. Chat with Zee, our AI assistant, for career advice, gig suggestions, and CV optimization.",
    },
    {
      icon: "fas fa-piggy-bank",
      title: "Zero Broke Mode & Savings",
      description: "Access microloans when you need them. Set savings targets and automate deposits from your earnings to reach your financial goals.",
    },
    {
      icon: "fas fa-chart-line",
      title: "Budget Tracker & Analytics",
      description: "Track monthly expenses, manage budgets across categories, and get insights on your earnings and spending patterns.",
    },
    {
      icon: "fas fa-comments",
      title: "In-App Chat & Video Calls",
      description: "Communicate directly with gig posters and seekers. Conduct video interviews with screen sharing and call recording features.",
    },
    {
      icon: "fas fa-gamepad",
      title: "Gamification & Rewards",
      description: "Earn badges, build streaks, unlock achievements, and climb leaderboards. Build your trust score for better opportunities.",
    },
    {
      icon: "fas fa-shield-alt",
      title: "Verification & Security",
      description: "All users verified with ratings and reviews. Bank-level encryption, escrow protection, and trust scores ensure safe transactions.",
    },
    {
      icon: "fas fa-map-marker-alt",
      title: "Local Gig Discovery",
      description: "Find opportunities in your neighborhood. Browse by category, location, urgency, and budget. Work close to home or school.",
    },
    {
      icon: "fas fa-mobile-alt",
      title: "Mobile-First Design",
      description: "Optimized for smartphones. Post gigs with text or audio descriptions. Apply with cover letters and audio introductions.",
    },
  ];

  return (
    <section id="benefits" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Payday?</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're not just another gig platform. We're your solution to financial stress, built specifically for Nigerian youth.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="hover-lift bg-gray-50 p-8 rounded-xl"
              data-testid={`benefit-${index}`}
            >
              <div className="w-12 h-12 bg-payday-blue rounded-lg flex items-center justify-center mb-6">
                <i className={`${benefit.icon} text-white text-xl`}></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
