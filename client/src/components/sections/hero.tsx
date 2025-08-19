import { Button } from "@/components/ui/button";

interface HeroProps {
  onOpenSignup: () => void;
}

export default function Hero({ onOpenSignup }: HeroProps) {
  return (
    <section className="pt-20 pb-16 gradient-bg text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
          {/* Hero Content */}
          <div className="text-center lg:text-left mb-12 lg:mb-0">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 animate-slide-up">
              End Your{" "}
              <span className="text-payday-yellow">Broke Days</span>{" "}
              Forever
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 mb-8 leading-relaxed animate-slide-up">
              Connect with instant-paying gigs in your area. Perfect for Nigerian students and fresh graduates who need money today, not tomorrow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slide-up">
              <Button 
                data-testid="button-start-earning"
                onClick={onOpenSignup}
                size="lg"
                className="bg-payday-yellow text-payday-blue px-8 py-4 text-lg font-semibold hover:bg-yellow-400 hover-lift shadow-lg"
              >
                Start Earning Today
              </Button>
              <Button 
                data-testid="button-post-gig"
                variant="outline"
                onClick={onOpenSignup}
                size="lg"
                className="border-2 border-white text-white px-8 py-4 text-lg font-semibold hover:bg-white hover:text-payday-blue"
              >
                Post a Gig
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="flex justify-center animate-fade-in">
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
              alt="Happy Nigerian youth using mobile phones" 
              className="rounded-2xl shadow-2xl max-w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
