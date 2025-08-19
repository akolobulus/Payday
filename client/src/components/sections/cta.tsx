import { Button } from "@/components/ui/button";

interface CTAProps {
  onOpenSignup: () => void;
}

export default function CTA({ onOpenSignup }: CTAProps) {
  return (
    <section className="py-20 gradient-bg text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to End Your Broke Days?</h2>
        <p className="text-xl text-blue-100 mb-8">
          Join thousands of Nigerian youth who have already discovered financial freedom through Payday.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            data-testid="button-start-earning-cta"
            onClick={onOpenSignup}
            size="lg"
            className="bg-payday-yellow text-payday-blue px-8 py-4 text-lg font-semibold hover:bg-yellow-400 hover-lift shadow-lg"
          >
            <i className="fas fa-rocket mr-2"></i>
            Start Earning Now
          </Button>
          <Button 
            data-testid="button-post-gig-cta"
            variant="outline"
            onClick={onOpenSignup}
            size="lg"
            className="border-2 border-white text-white px-8 py-4 text-lg font-semibold hover:bg-white hover:text-payday-blue"
          >
            <i className="fas fa-plus-circle mr-2"></i>
            Post Your First Gig
          </Button>
        </div>
      </div>
    </section>
  );
}
