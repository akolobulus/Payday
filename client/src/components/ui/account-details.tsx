import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";

const profileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  profilePicture: z.string().optional(),
  bannerPhoto: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function AccountDetails() {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['/api/user/profile']
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      profilePicture: user?.profilePicture || undefined,
      bannerPhoto: undefined,
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const response = await apiRequest('PUT', '/api/user/profile', data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  const handlePhoneVerify = () => {
    toast({
      title: "Verification sent",
      description: "Please check your phone for the verification code",
    });
  };

  const getUserInitials = () => {
    if (!user?.firstName && !user?.lastName) return "U";
    return `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900" data-testid="text-account-details-title">
          Account Details
        </h1>
        <p className="text-gray-600 mt-2">Update your profile photo and personal detail</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Personal Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-6">Personal Information</h2>
                
                <div className="space-y-6">
                  {/* First Name */}
                  <div>
                    <Label htmlFor="firstName" className="text-gray-700">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      {...register("firstName")}
                      disabled={!isEditing}
                      className="mt-1"
                      data-testid="input-first-name"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <Label htmlFor="lastName" className="text-gray-700">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      {...register("lastName")}
                      disabled={!isEditing}
                      className="mt-1"
                      data-testid="input-last-name"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                    )}
                  </div>

                  {/* Email Address */}
                  <div>
                    <Label htmlFor="email" className="text-gray-700">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      disabled={!isEditing}
                      className="mt-1"
                      data-testid="input-email"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label htmlFor="phone" className="text-gray-700">
                        Phone Number
                      </Label>
                      {!user?.isVerified && (
                        <Badge variant="outline" className="text-orange-600 border-orange-300">
                          Not Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        id="phone"
                        {...register("phone")}
                        disabled={!isEditing}
                        className="flex-1"
                        data-testid="input-phone"
                      />
                      {!user?.isVerified && !isEditing && (
                        <Button
                          type="button"
                          variant="link"
                          onClick={handlePhoneVerify}
                          className="text-blue-600"
                          data-testid="button-verify-phone"
                        >
                          Verify
                        </Button>
                      )}
                    </div>
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Photos */}
          <div className="space-y-6">
            {/* Profile Photo */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-4">Profile Photo</h2>
                <div className="flex flex-col items-center">
                  <Avatar className="w-32 h-32 mb-4">
                    <AvatarImage src={user?.profilePicture || undefined} alt={user?.firstName} />
                    <AvatarFallback className="text-2xl bg-gray-200">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      data-testid="button-upload-photo"
                    >
                      <Camera className="h-4 w-4" />
                      Change Photo
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Banner Photo */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-4">Banner Photo</h2>
                <div className="relative aspect-video bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg overflow-hidden">
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="Banner"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-white">
                      <Upload className="h-12 w-12 opacity-50" />
                    </div>
                  )}
                </div>
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full mt-4 gap-2"
                    data-testid="button-upload-banner"
                  >
                    <Upload className="h-4 w-4" />
                    Change Banner
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end gap-4">
          {isEditing ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                data-testid="button-save-changes"
              >
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              onClick={() => setIsEditing(true)}
              data-testid="button-edit-account"
            >
              Edit account info
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
