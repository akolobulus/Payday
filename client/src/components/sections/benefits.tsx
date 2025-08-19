export default function Benefits() {
  const benefits = [
    {
      icon: "fas fa-bolt",
      title: "Instant Payments",
      description: "Get paid in 30 seconds, not 30 days. Direct transfers to your bank account or mobile money wallet.",
    },
    {
      icon: "fas fa-robot",
      title: "AI-Powered Matching",
      description: "Our smart algorithm connects you with the most relevant gigs based on your skills and location.",
    },
    {
      icon: "fas fa-map-marker-alt",
      title: "Local Focus",
      description: "Find opportunities in your neighborhood. Work close to home, school, or wherever you are in Nigeria.",
    },
    {
      icon: "fas fa-shield-alt",
      title: "Secure & Safe",
      description: "All users are verified. Payments are secured with bank-level encryption. Your money and data are protected.",
    },
    {
      icon: "fas fa-gamepad",
      title: "Earn Rewards",
      description: "Build your reliability score by completing gigs. Unlock better opportunities and higher-paying work.",
    },
    {
      icon: "fas fa-mobile-alt",
      title: "Mobile-First Design",
      description: "Optimized for your smartphone. Find, apply, and complete gigs all from your mobile device.",
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
