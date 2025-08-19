import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState<'seeker' | 'poster'>('seeker');

  return (
    <section id="how-it-works" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How Payday Works</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From broke to paid in three simple steps. No waiting, no delays, just instant cash for completed work.
          </p>
        </div>

        {/* User Type Selection */}
        <div className="flex justify-center mb-16">
          <div className="bg-white rounded-full p-2 shadow-lg">
            <div className="flex">
              <Button
                data-testid="tab-seeker"
                onClick={() => setActiveTab('seeker')}
                className={`px-8 py-3 rounded-full font-semibold ${
                  activeTab === 'seeker' 
                    ? 'text-white bg-payday-blue' 
                    : 'text-gray-600 bg-transparent hover:text-payday-blue'
                }`}
              >
                For Gig Seekers
              </Button>
              <Button
                data-testid="tab-poster"
                onClick={() => setActiveTab('poster')}
                className={`px-8 py-3 rounded-full font-semibold ${
                  activeTab === 'poster' 
                    ? 'text-white bg-payday-blue' 
                    : 'text-gray-600 bg-transparent hover:text-payday-blue'
                }`}
              >
                For Gig Posters
              </Button>
            </div>
          </div>
        </div>

        {/* Gig Seekers Flow */}
        {activeTab === 'seeker' && (
          <div className="grid md:grid-cols-3 gap-8" data-testid="seeker-flow">
            <div className="text-center hover-lift bg-white p-8 rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-payday-yellow rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-user-plus text-payday-blue text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Create Your Profile</h3>
              <p className="text-gray-600">
                Sign up in under 2 minutes. List your skills, set your location, and tell us when you're available to work.
              </p>
            </div>

            <div className="text-center hover-lift bg-white p-8 rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-payday-yellow rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-search text-payday-blue text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Find Perfect Gigs</h3>
              <p className="text-gray-600">
                Browse AI-matched gigs near you. Filter by pay, location, and skills. Apply with one tap to gigs that fit your schedule.
              </p>
            </div>

            <div className="text-center hover-lift bg-white p-8 rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-payday-yellow rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-money-bill-wave text-payday-blue text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">3. Get Paid Instantly</h3>
              <p className="text-gray-600">
                Complete the gig, get confirmation from the client, and watch the money hit your account in seconds. No waiting periods!
              </p>
            </div>
          </div>
        )}

        {/* Gig Posters Flow */}
        {activeTab === 'poster' && (
          <div className="grid md:grid-cols-3 gap-8" data-testid="poster-flow">
            <div className="text-center hover-lift bg-white p-8 rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-payday-yellow rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-plus-circle text-payday-blue text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Post Your Gig</h3>
              <p className="text-gray-600">
                Describe what you need done, set your budget, and specify your location. Our AI will match you with the best candidates.
              </p>
            </div>

            <div className="text-center hover-lift bg-white p-8 rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-payday-yellow rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-users text-payday-blue text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Choose Your Worker</h3>
              <p className="text-gray-600">
                Review applications from qualified candidates. Check ratings, reviews, and availability. Accept the best fit for your needs.
              </p>
            </div>

            <div className="text-center hover-lift bg-white p-8 rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-payday-yellow rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-thumbs-up text-payday-blue text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">3. Confirm & Release Payment</h3>
              <p className="text-gray-600">
                When the job is done to your satisfaction, confirm completion. Payment is instantly released to the worker's account.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
