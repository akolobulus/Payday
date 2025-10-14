import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Plus, X } from "lucide-react";
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
  phone: z.string().min(10, "Please enter a valid phone number"),
  location: z.string().min(2, "Location is required"),
  businessName: z.string().optional(),
  skills: z.array(z.string()).optional(),
  profilePicture: z.string().optional(),
  bio: z.string().optional(),
  cvUrl: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileEditProps {
  trigger?: React.ReactNode;
}

export function ProfileEdit({ trigger }: ProfileEditProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [cvText, setCvText] = useState("");
  const [isExtractingSkills, setIsExtractingSkills] = useState(false);
  const { toast } = useToast();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['/api/user/profile']
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: user?.phone || "",
      location: user?.location || "",
      businessName: user?.businessName || "",
      skills: user?.skills || [],
      profilePicture: user?.profilePicture || "",
      bio: user?.bio || "",
      cvUrl: user?.cvUrl || "",
    },
  });

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        location: user.location,
        businessName: user.businessName || "",
        skills: user.skills || [],
        profilePicture: user.profilePicture || "",
        bio: user.bio || "",
        cvUrl: user.cvUrl || "",
      });
    }
  }, [user, form]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileFormValues) => 
      apiRequest('/api/user/profile', 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      setIsOpen(false);
      toast({
        title: "Profile Updated! 🎉",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  const addSkill = () => {
    if (newSkill.trim() && !form.getValues("skills")?.includes(newSkill.trim())) {
      const currentSkills = form.getValues("skills") || [];
      form.setValue("skills", [...currentSkills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const currentSkills = form.getValues("skills") || [];
    form.setValue("skills", currentSkills.filter(skill => skill !== skillToRemove));
  };

  const extractSkillsFromCV = async () => {
    if (!cvText.trim() || cvText.trim().length < 50) {
      toast({
        title: "CV Too Short",
        description: "Please paste at least 50 characters from your CV",
        variant: "destructive",
      });
      return;
    }

    setIsExtractingSkills(true);
    try {
      const response = await apiRequest('/api/user/extract-cv-skills', 'POST', { cvText });
      const data = await response.json();
      
      if (data.skills && data.skills.length > 0) {
        const currentSkills = form.getValues("skills") || [];
        const combinedSkills = [...currentSkills, ...data.skills];
        const uniqueSkills = Array.from(new Set(combinedSkills));
        form.setValue("skills", uniqueSkills);
      }
      
      if (data.bio) {
        form.setValue("bio", data.bio);
      }
      
      toast({
        title: "Skills Extracted! 🎉",
        description: `Found ${data.skills?.length || 0} skills from your CV`,
      });
      
      setCvText("");
    } catch (error: any) {
      toast({
        title: "Extraction Failed",
        description: error.message || "Failed to extract skills from CV",
        variant: "destructive",
      });
    } finally {
      setIsExtractingSkills(false);
    }
  };

  const watchedSkills = form.watch("skills") || [];

  const nigerianLocations = [
    "Lagos", "Abuja", "Kano", "Ibadan", "Port Harcourt", "Benin City", 
    "Kaduna", "Jos", "Ilorin", "Aba", "Onitsha", "Enugu", "Warri", 
    "Calabar", "Uyo", "Maiduguri", "Zaria", "Owerri", "Bauchi"
  ];

  const popularSkills = [
    "delivery", "tutoring", "data-entry", "social-media", "content-creation",
    "photography", "videography", "graphic-design", "web-development", 
    "mobile-development", "virtual-assistant", "customer-service", 
    "accounting", "marketing", "sales", "cleaning", "cooking", "driving"
  ];

  if (isLoading) {
    return (
      <Button disabled>
        <Edit className="h-4 w-4 mr-2" />
        Loading...
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" data-testid="button-edit-profile">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile to get better gig matches and build trust with clients.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-first-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-last-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="+234 xxx xxx xxxx"
                          data-testid="input-phone"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-location">
                            <SelectValue placeholder="Select your location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {nigerianLocations.map((location) => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {user?.userType === 'poster' && (
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Your business or company name"
                            data-testid="input-business-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            {/* Profile Picture & Bio Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Profile Picture & Bio</CardTitle>
                <CardDescription>
                  Add a profile picture and bio to stand out and build trust with clients.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="profilePicture"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Picture URL</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="https://example.com/your-photo.jpg"
                          data-testid="input-profile-picture"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Tell clients about yourself, your experience, and what makes you great..."
                          rows={4}
                          data-testid="input-bio"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* CV Upload & Skill Extraction (for seekers) */}
            {user?.userType === 'seeker' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Upload CV & Extract Skills</CardTitle>
                  <CardDescription>
                    Paste your CV text below and let AI extract your skills automatically!
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>CV Text</Label>
                    <Textarea 
                      value={cvText}
                      onChange={(e) => setCvText(e.target.value)}
                      placeholder="Paste your CV or resume text here... (minimum 50 characters)"
                      rows={6}
                      data-testid="textarea-cv"
                    />
                  </div>
                  
                  <Button
                    type="button"
                    onClick={extractSkillsFromCV}
                    disabled={isExtractingSkills || cvText.length < 50}
                    data-testid="button-extract-skills"
                  >
                    {isExtractingSkills ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Extracting Skills...
                      </>
                    ) : (
                      "Extract Skills with AI"
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Skills Section (for seekers) */}
            {user?.userType === 'seeker' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Skills & Expertise</CardTitle>
                  <CardDescription>
                    Add your skills to get matched with relevant gigs. Better skills = more opportunities!
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Current Skills */}
                  <div>
                    <Label>Your Skills</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {watchedSkills.map((skill, index) => (
                        <Badge 
                          key={index} 
                          variant="default" 
                          className="pr-1"
                          data-testid={`skill-badge-${skill}`}
                        >
                          {skill}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-auto p-1 ml-1"
                            onClick={() => removeSkill(skill)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                      {watchedSkills.length === 0 && (
                        <p className="text-sm text-gray-500">No skills added yet</p>
                      )}
                    </div>
                  </div>

                  {/* Add New Skill */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a skill"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      data-testid="input-new-skill"
                    />
                    <Button 
                      type="button" 
                      onClick={addSkill}
                      size="sm"
                      data-testid="button-add-skill"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Popular Skills */}
                  <div>
                    <Label className="text-sm">Popular Skills (click to add)</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {popularSkills
                        .filter(skill => !watchedSkills.includes(skill))
                        .slice(0, 12)
                        .map((skill) => (
                        <Button
                          key={skill}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const currentSkills = form.getValues("skills") || [];
                            form.setValue("skills", [...currentSkills, skill]);
                          }}
                          data-testid={`popular-skill-${skill}`}
                        >
                          + {skill}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                data-testid="button-cancel-edit"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                data-testid="button-save-profile"
              >
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}