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
    <section className="relative pt-32 pb-24 bg-white overflow-hidden">
      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 w-16 h-16 bg-blue-100 rounded-lg transform rotate-12 animate-pulse-slow"></div>
      <div className="absolute top-40 right-20 w-12 h-12 bg-yellow-100 rounded-full animate-pulse-slow"></div>
      <div className="absolute bottom-20 left-20 w-14 h-14 bg-purple-100 rounded-lg transform -rotate-12 animate-pulse-slow"></div>
      <div className="absolute bottom-32 right-10 w-10 h-10 bg-green-100 rounded-full animate-pulse-slow"></div>
      <div className="absolute top-1/2 left-5 w-8 h-8 bg-pink-100 rounded-lg transform rotate-45 animate-pulse-slow"></div>
      <div className="absolute top-1/3 right-5 w-12 h-12 bg-indigo-100 rounded-full animate-pulse-slow"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-600 mb-8 animate-slide-up">
            <span className="font-medium">Shop</span>
            <span className="text-gray-400">→</span>
            <span className="font-medium">Marketplace</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-8 animate-slide-up">
            <span className="text-gray-900">End Your </span>
            <span className="text-payday-blue">Broke Days</span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-600 mb-12 leading-relaxed animate-slide-up max-w-3xl mx-auto">
            Connect with instant-paying gigs in your area. Perfect for Nigerian students and fresh graduates who need money today, not tomorrow.
          </p>
          
          {/* Demo Account Buttons */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-8 animate-slide-up max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Try Demo Accounts:</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => handleDemoLogin('seeker')}
                disabled={loginMutation.isPending}
                variant="outline"
                size="lg"
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100"
                data-testid="button-demo-seeker"
              >
                {loginMutation.isPending ? "Logging in..." : "Demo: Gig Seeker 👨‍💼"}
              </Button>
              <Button 
                onClick={() => handleDemoLogin('poster')}
                disabled={loginMutation.isPending}
                variant="outline"
                size="lg"
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100"
                data-testid="button-demo-poster"
              >
                {loginMutation.isPending ? "Logging in..." : "Demo: Gig Poster 🏢"}
              </Button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <Button 
              data-testid="button-start-earning"
              onClick={onOpenSignup}
              size="lg"
              className="bg-payday-blue text-white px-8 py-6 text-lg font-semibold hover:bg-blue-700 hover-lift shadow-lg"
            >
              Start Earning Today
            </Button>
            <Button 
              data-testid="button-post-gig"
              onClick={onOpenSignup}
              size="lg"
              variant="outline"
              className="border-2 border-gray-300 text-gray-700 px-8 py-6 text-lg font-semibold hover:bg-gray-50"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
