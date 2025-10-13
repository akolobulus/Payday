import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface HeroProps {
  onOpenSignup: () => void;
}

export default function Hero({ onOpenSignup }: HeroProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", credentials);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Demo Login Successful",
        description: `Welcome ${data.user.firstName}! Redirecting to your dashboard...`,
      });
      
      const dashboardPath = data.user.userType === 'seeker' ? '/dashboard/seeker' : '/dashboard/poster';
      setLocation(dashboardPath);
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Login failed. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDemoLogin = (userType: 'seeker' | 'poster') => {
    const credentials = userType === 'seeker' 
      ? { email: "bulusakolo6@gmail.com", password: "123456789" }
      : { email: "officialarikpa@gmail.com", password: "123456789" };
    
    loginMutation.mutate(credentials);
  };

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
            
            {/* Demo Account Buttons */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6 animate-slide-up">
              <h3 className="text-lg font-semibold mb-4 text-payday-yellow">Try Demo Accounts:</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => handleDemoLogin('seeker')}
                  disabled={loginMutation.isPending}
                  variant="outline"
                  size="lg"
                  className="flex-1 bg-white/20 border-white text-white hover:bg-white hover:text-payday-blue"
                  data-testid="button-demo-seeker"
                >
                  {loginMutation.isPending ? "Logging in..." : "Demo: Gig Seeker 👨‍💼"}
                </Button>
                <Button 
                  onClick={() => handleDemoLogin('poster')}
                  disabled={loginMutation.isPending}
                  variant="outline"
                  size="lg"
                  className="flex-1 bg-white/20 border-white text-white hover:bg-white hover:text-payday-blue"
                  data-testid="button-demo-poster"
                >
                  {loginMutation.isPending ? "Logging in..." : "Demo: Gig Poster 🏢"}
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slide-up">
              <Button 
                data-testid="button-start-earning"
                onClick={onOpenSignup}
                size="lg"
                className="bg-payday-yellow text-payday-blue px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold hover:bg-yellow-400 hover-lift shadow-lg w-full sm:w-auto"
              >
                Start Earning Today
              </Button>
              <Button 
                data-testid="button-post-gig"
                onClick={onOpenSignup}
                size="lg"
                className="bg-payday-blue text-white border-2 border-payday-blue px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold hover:bg-blue-700 hover:border-blue-700 w-full sm:w-auto"
              >
                Post Your Gig
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
