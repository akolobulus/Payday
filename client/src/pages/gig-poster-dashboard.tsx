import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ReviewForm, UserRating } from "@/components/ui/review-components";
import CompletionConfirmation from "@/components/ui/completion-confirmation";
import { Plus, Briefcase, Users, TrendingUp, DollarSign, MapPin, Clock, Eye, Star } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertGigSchema } from "@shared/schema";
import type { User, Gig, InsertGig } from "@shared/schema";
import { z } from "zod";

const gigFormSchema = insertGigSchema.extend({
  skillsRequiredText: z.string().min(1, "Please enter required skills"),
});

type GigFormData = z.infer<typeof gigFormSchema>;

export default function GigPosterDashboard() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const { data: user } = useQuery<User>({
    queryKey: ['/api/user/profile']
  });

  const { data: myGigs, isLoading } = useQuery<Gig[]>({
    queryKey: ['/api/gigs/posted']
  });

  const { data: gigAnalysis } = useQuery<any>({
    queryKey: ['/api/gigs/analysis'],
    enabled: !!myGigs?.length
  });

  const form = useForm<GigFormData>({
    resolver: zodResolver(gigFormSchema),
    defaultValues: {
      title: "",
      description: "",
      budget: 0,
      category: "",
      location: "",
      urgency: "medium",
      estimatedDuration: "",
      skillsRequiredText: "",
    },
  });

  const createGigMutation = useMutation({
    mutationFn: async (data: GigFormData) => {
      const { skillsRequiredText, ...gigData } = data;
      const skillsRequired = skillsRequiredText.split(',').map(s => s.trim()).filter(Boolean);
      
      return apiRequest('/api/gigs', 'POST', {
        ...gigData,
        skillsRequired,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gigs/posted'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gigs/analysis'] });
      setIsCreateModalOpen(false);
      form.reset();
    },
  });

  const updateGigStatusMutation = useMutation({
    mutationFn: ({ gigId, status }: { gigId: string; status: string }) => 
      apiRequest(`/api/gigs/${gigId}/status`, 'PATCH', { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gigs/posted'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gigs/analysis'] });
    }
  });

  const onSubmit = (data: GigFormData) => {
    createGigMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'default';
      case 'assigned': return 'secondary';
      case 'completed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'default';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getGigStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'secondary';
      case 'assigned': return 'default';
      case 'pending_completion': return 'outline';
      case 'awaiting_mutual_confirmation': return 'outline';
      case 'completed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getGigStatusDisplay = (status: string) => {
    switch (status) {
      case 'open': return 'Open';
      case 'assigned': return 'In Progress';
      case 'pending_completion': return 'Pending Completion';
      case 'awaiting_mutual_confirmation': return 'Awaiting Confirmation';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 pt-20">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 pt-20">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-8 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2" data-testid="dashboard-title">
                Welcome back, {user?.firstName}! 💼
              </h1>
              <p className="text-green-100 text-lg">
                Manage your gigs and find the perfect talent for your tasks.
              </p>
            </div>
            
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" size="lg" data-testid="create-gig-button">
                  <Plus className="h-5 w-5 mr-2" />
                  Post New Gig
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Gig</DialogTitle>
                  <DialogDescription>
                    Post a new gig to find the right talent for your task.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gig Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Social Media Content Creation" {...field} data-testid="gig-title-input" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe what you need done, requirements, and expectations..."
                              className="min-h-[100px]"
                              {...field} 
                              data-testid="gig-description-input"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="budget"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Budget (₦)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="5000"
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                data-testid="gig-budget-input"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="estimatedDuration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estimated Duration</FormLabel>
                            <FormControl>
                              <Input placeholder="2-3 hours" {...field} data-testid="gig-duration-input" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="gig-category-select">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="delivery">Delivery</SelectItem>
                                <SelectItem value="tutoring">Tutoring</SelectItem>
                                <SelectItem value="cleaning">Cleaning</SelectItem>
                                <SelectItem value="data-entry">Data Entry</SelectItem>
                                <SelectItem value="social-media">Social Media</SelectItem>
                                <SelectItem value="photography">Photography</SelectItem>
                                <SelectItem value="content-creation">Content Creation</SelectItem>
                                <SelectItem value="customer-service">Customer Service</SelectItem>
                                <SelectItem value="handyman">Handyman</SelectItem>
                                <SelectItem value="event-assistance">Event Assistance</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="urgency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Urgency</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="gig-urgency-select">
                                  <SelectValue placeholder="Select urgency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Low - Within a week</SelectItem>
                                <SelectItem value="medium">Medium - Within 2-3 days</SelectItem>
                                <SelectItem value="high">High - Today/Tomorrow</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="Jos, Plateau or Remote" {...field} data-testid="gig-location-input" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="skillsRequiredText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Required Skills</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="photography, editing, social media (comma separated)"
                              {...field} 
                              data-testid="gig-skills-input"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex space-x-4 pt-4">
                      <Button 
                        type="submit" 
                        disabled={createGigMutation.isPending}
                        data-testid="submit-gig-button"
                      >
                        {createGigMutation.isPending ? 'Creating...' : 'Create Gig'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsCreateModalOpen(false)}
                        data-testid="cancel-gig-button"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Gigs Posted</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="total-gigs">
                {myGigs?.length || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Gigs</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="active-gigs">
                {myGigs?.filter(g => g.status === 'open' || g.status === 'assigned').length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Gigs</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="completed-gigs">
                {myGigs?.filter(g => g.status === 'completed').length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="total-spent">
                ₦{myGigs?.filter(g => g.status === 'completed')
                  .reduce((sum, g) => sum + g.budget, 0).toLocaleString() || '0'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="gigs" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="gigs" data-testid="tab-gigs">My Gigs</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reviews" data-testid="tab-reviews">Reviews</TabsTrigger>
            <TabsTrigger value="profile" data-testid="tab-profile">Business Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="gigs" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Posted Gigs</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myGigs?.map((gig) => (
                <Card key={gig.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg" data-testid={`gig-title-${gig.id}`}>
                        {gig.title}
                      </CardTitle>
                      <div className="flex space-x-2">
                        <Badge variant={getGigStatusColor(gig.status)}>
                          {getGigStatusDisplay(gig.status)}
                        </Badge>
                        <Badge variant={getUrgencyColor(gig.urgency)}>
                          {gig.urgency}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className="text-sm" data-testid={`gig-description-${gig.id}`}>
                      {gig.description.substring(0, 100)}...
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-bold text-green-600" data-testid={`gig-budget-${gig.id}`}>
                          ₦{gig.budget.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm" data-testid={`gig-duration-${gig.id}`}>
                          {gig.estimatedDuration}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 text-gray-500">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm" data-testid={`gig-location-${gig.id}`}>
                        {gig.location}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {gig.skillsRequired.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {gig.skillsRequired.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{gig.skillsRequired.length - 3} more
                        </Badge>
                      )}
                    </div>

                    {/* Completion Confirmation Component for assigned and completion states */}
                    {['assigned', 'pending_completion', 'awaiting_mutual_confirmation'].includes(gig.status) && user && (
                      <div className="space-y-2">
                        <CompletionConfirmation 
                          gig={gig} 
                          currentUser={user}
                          onStatusUpdate={() => {
                            queryClient.invalidateQueries({ queryKey: ['/api/gigs/posted'] });
                            queryClient.invalidateQueries({ queryKey: ['/api/gigs/analysis'] });
                          }}
                        />
                      </div>
                    )}

                    {gig.status === 'open' && (
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => updateGigStatusMutation.mutate({
                          gigId: gig.id, 
                          status: 'cancelled'
                        })}
                        disabled={updateGigStatusMutation.isPending}
                        data-testid={`cancel-gig-${gig.id}`}
                      >
                        Cancel Gig
                      </Button>
                    )}

                    {gig.status === 'completed' && gig.seekerId && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Assigned to:</span>
                          <UserRating userId={gig.seekerId} size="sm" />
                        </div>
                        <ReviewForm 
                          gig={gig}
                          revieweeId={gig.seekerId}
                          revieweeName="Gig Seeker"
                          onSuccess={() => {
                            queryClient.invalidateQueries({ queryKey: ['/api/user', gig.seekerId, 'rating'] });
                          }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {!myGigs?.length && (
              <Card className="p-8 text-center">
                <CardContent className="space-y-4">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto" />
                  <h3 className="text-lg font-semibold">No gigs posted yet</h3>
                  <p className="text-gray-500">
                    Post your first gig to start finding talented individuals for your tasks.
                  </p>
                  <Button onClick={() => setIsCreateModalOpen(true)} data-testid="post-first-gig">
                    Post Your First Gig
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gig Performance Analytics</CardTitle>
                <CardDescription>
                  Insights about your posted gigs and success rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-medium">Most Popular Categories</h4>
                    {myGigs && myGigs.length > 0 ? (
                      <div className="space-y-2">
                        {Object.entries(
                          myGigs.reduce((acc, gig) => {
                            acc[gig.category] = (acc[gig.category] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)
                        ).map(([category, count]) => (
                          <div key={category} className="flex justify-between">
                            <span className="capitalize">{category}</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No data available yet</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Success Rate</h4>
                    <div className="text-2xl font-bold text-green-600">
                      {myGigs && myGigs.length > 0 
                        ? `${Math.round((myGigs.filter(g => g.status === 'completed').length / myGigs.length) * 100)}%`
                        : '0%'
                      }
                    </div>
                    <p className="text-sm text-gray-500">
                      {myGigs?.filter(g => g.status === 'completed').length || 0} of {myGigs?.length || 0} gigs completed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  My Reviews & Ratings
                </CardTitle>
                <CardDescription>
                  See what gig seekers are saying about working with you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* User's Overall Rating */}
                  <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Your Overall Rating</h3>
                    {user && <UserRating userId={user.id} size="lg" showCount />}
                  </div>
                  
                  {/* Reviews Received */}
                  <div>
                    <h4 className="text-md font-semibold mb-4">Recent Reviews</h4>
                    <p className="text-gray-500 text-center py-8">
                      Reviews will appear here after gig seekers complete your gigs and leave feedback.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Business Profile</CardTitle>
                <CardDescription>
                  Manage your business information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Business Name</label>
                    <p className="text-lg" data-testid="business-name">
                      {user?.businessName || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Contact Person</label>
                    <p className="text-lg" data-testid="contact-person">
                      {user?.firstName} {user?.lastName}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-lg" data-testid="business-email">
                      {user?.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Location</label>
                    <p className="text-lg" data-testid="business-location">
                      {user?.location}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}