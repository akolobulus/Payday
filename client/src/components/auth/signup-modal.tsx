import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { z } from "zod";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const signupFormSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  agreeToTerms: z.boolean().refine((val) => val, {
    message: "You must agree to the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupFormSchema>;

export default function SignupModal({ isOpen, onClose, onSwitchToLogin }: SignupModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [userType, setUserType] = useState<'seeker' | 'poster'>('seeker');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      userType: 'seeker',
      skills: [],
      agreeToTerms: false,
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: Omit<SignupFormData, 'confirmPassword' | 'agreeToTerms'>) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Account Created Successfully",
        description: `Welcome to Payday, ${data.user.firstName}!`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      reset();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Signup Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleUserTypeChange = (type: 'seeker' | 'poster') => {
    setUserType(type);
    setValue('userType', type);
    if (type === 'poster') {
      setSelectedSkills([]);
      setValue('skills', []);
    }
  };

  const handleSkillChange = (skill: string, checked: boolean) => {
    let newSkills;
    if (checked) {
      newSkills = [...selectedSkills, skill];
    } else {
      newSkills = selectedSkills.filter(s => s !== skill);
    }
    setSelectedSkills(newSkills);
    setValue('skills', newSkills);
  };

  const onSubmit = (data: SignupFormData) => {
    const { confirmPassword, agreeToTerms, ...submitData } = data;
    signupMutation.mutate(submitData);
  };

  const skills = [
    { value: "delivery", label: "Delivery" },
    { value: "tutoring", label: "Tutoring" },
    { value: "cleaning", label: "Cleaning" },
    { value: "data-entry", label: "Data Entry" },
    { value: "photography", label: "Photography" },
    { value: "writing", label: "Writing" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-screen overflow-y-auto modal-backdrop">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Join Payday
          </DialogTitle>
          <p className="text-center text-gray-600">Start earning money today</p>
        </DialogHeader>

        {/* User Type Selection */}
        <div className="mb-6">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              type="button"
              onClick={() => handleUserTypeChange('seeker')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                userType === 'seeker' 
                  ? 'text-white bg-payday-blue' 
                  : 'text-gray-600 bg-transparent hover:text-payday-blue'
              }`}
              data-testid="button-seeker-type"
            >
              Gig Seeker
            </Button>
            <Button
              type="button"
              onClick={() => handleUserTypeChange('poster')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                userType === 'poster' 
                  ? 'text-white bg-payday-blue' 
                  : 'text-gray-600 bg-transparent hover:text-payday-blue'
              }`}
              data-testid="button-poster-type"
            >
              Gig Poster
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="John"
                data-testid="input-first-name"
                {...register("firstName")}
                className="mt-1"
              />
              {errors.firstName && (
                <p className="text-sm text-destructive mt-1">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                data-testid="input-last-name"
                {...register("lastName")}
                className="mt-1"
              />
              {errors.lastName && (
                <p className="text-sm text-destructive mt-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              data-testid="input-email"
              {...register("email")}
              className="mt-1"
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+234 xxx xxx xxxx"
              data-testid="input-phone"
              {...register("phone")}
              className="mt-1"
            />
            {errors.phone && (
              <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Select onValueChange={(value) => setValue("location", value)}>
              <SelectTrigger className="mt-1" data-testid="select-location">
                <SelectValue placeholder="Select your city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jos">Jos</SelectItem>
                <SelectItem value="abuja">Abuja</SelectItem>
                <SelectItem value="lagos">Lagos</SelectItem>
                <SelectItem value="ibadan">Ibadan</SelectItem>
                <SelectItem value="kano">Kano</SelectItem>
                <SelectItem value="port-harcourt">Port Harcourt</SelectItem>
              </SelectContent>
            </Select>
            {errors.location && (
              <p className="text-sm text-destructive mt-1">{errors.location.message}</p>
            )}
          </div>

          {/* Seeker-specific fields */}
          {userType === 'seeker' && (
            <div data-testid="seeker-fields">
              <Label>Skills (Select all that apply)</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {skills.map((skill) => (
                  <div key={skill.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`skill-${skill.value}`}
                      checked={selectedSkills.includes(skill.value)}
                      onCheckedChange={(checked) => 
                        handleSkillChange(skill.value, checked as boolean)
                      }
                      data-testid={`checkbox-skill-${skill.value}`}
                    />
                    <Label htmlFor={`skill-${skill.value}`} className="text-sm">
                      {skill.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Poster-specific fields */}
          {userType === 'poster' && (
            <div data-testid="poster-fields">
              <Label htmlFor="businessName">Business/Organization Name</Label>
              <Input
                id="businessName"
                placeholder="Your business name"
                data-testid="input-business-name"
                {...register("businessName")}
                className="mt-1"
              />
              {errors.businessName && (
                <p className="text-sm text-destructive mt-1">{errors.businessName.message}</p>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a strong password"
              data-testid="input-password"
              {...register("password")}
              className="mt-1"
            />
            {errors.password && (
              <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              data-testid="input-confirm-password"
              {...register("confirmPassword")}
              className="mt-1"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="agreeToTerms"
              {...register("agreeToTerms")}
              data-testid="checkbox-agree-terms"
            />
            <Label htmlFor="agreeToTerms" className="text-sm">
              I agree to the{" "}
              <Button variant="link" className="text-payday-blue p-0 h-auto">
                Terms of Service
              </Button>{" "}
              and{" "}
              <Button variant="link" className="text-payday-blue p-0 h-auto">
                Privacy Policy
              </Button>
            </Label>
          </div>
          {errors.agreeToTerms && (
            <p className="text-sm text-destructive">{errors.agreeToTerms.message}</p>
          )}

          <Button
            type="submit"
            className="w-full bg-payday-blue hover:bg-blue-700"
            disabled={signupMutation.isPending}
            data-testid="button-signup-submit"
          >
            {signupMutation.isPending ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Button
              variant="link"
              onClick={onSwitchToLogin}
              className="text-payday-blue font-semibold p-0"
              data-testid="link-switch-to-login"
            >
              Sign in
            </Button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
