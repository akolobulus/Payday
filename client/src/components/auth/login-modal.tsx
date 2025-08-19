import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { loginSchema, type LoginCredentials } from "@shared/schema";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
}

export default function LoginModal({ isOpen, onClose, onSwitchToSignup }: LoginModalProps) {
  const { toast } = useToast();
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginCredentials) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.user.firstName}!`,
      });
      reset();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginCredentials) => {
    loginMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md modal-backdrop">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Welcome Back
          </DialogTitle>
          <p className="text-center text-gray-600">Sign in to your Payday account</p>
        </DialogHeader>

        {/* Demo Accounts Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-semibold text-payday-blue mb-2">Try Demo Accounts:</h4>
          <div className="space-y-2 text-xs">
            <div>
              <strong>Gig Poster:</strong> officialarikpa@gmail.com / 123456789
            </div>
            <div>
              <strong>Gig Seeker:</strong> bulusakolo6@gmail.com / 123456789
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              data-testid="input-email"
              {...register("email")}
              className="mt-1 transition-all duration-200 border-gray-300 focus:border-payday-blue focus:ring-2 focus:ring-payday-blue/20 hover:border-gray-400"
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              data-testid="input-password"
              {...register("password")}
              className="mt-1 transition-all duration-200 border-gray-300 focus:border-payday-blue focus:ring-2 focus:ring-payday-blue/20 hover:border-gray-400"
            />
            {errors.password && (
              <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={setRememberMe}
                data-testid="checkbox-remember"
              />
              <Label htmlFor="remember" className="text-sm">
                Remember me
              </Label>
            </div>
            <Button
              type="button"
              variant="link"
              className="text-payday-blue p-0"
              data-testid="link-forgot-password"
            >
              Forgot password?
            </Button>
          </div>

          <Button
            type="submit"
            className="w-full bg-payday-blue hover:bg-blue-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg disabled:hover:scale-100 disabled:hover:shadow-none"
            disabled={loginMutation.isPending}
            data-testid="button-login-submit"
          >
            {loginMutation.isPending ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Signing In...
              </div>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Button
              variant="link"
              onClick={onSwitchToSignup}
              className="text-payday-blue font-semibold p-0"
              data-testid="link-switch-to-signup"
            >
              Sign up
            </Button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
