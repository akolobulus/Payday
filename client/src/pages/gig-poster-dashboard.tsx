import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ReviewForm, UserRating } from "@/components/ui/review-components";
import CompletionConfirmation from "@/components/ui/completion-confirmation";
import { WalletBalance, PaymentMethodSetup, FundEscrowDialog, EscrowStatus, formatNaira } from "@/components/ui/payment-components";
import { WalletTopUp } from "@/components/ui/wallet-topup";
import { AccountDetails } from "@/components/ui/account-details";
import GamificationDashboard from "@/components/ui/gamification-dashboard";
import AIAssistant from "@/components/ui/ai-assistant";
import ZeroBrokeMode from "@/components/ui/zero-broke-mode";
import SavingsVault from "@/components/ui/savings-vault";
import BudgetTracker from "@/components/ui/budget-tracker";
import DashboardSidebar from "@/components/navigation/dashboard-sidebar";
import DashboardHeader from "@/components/navigation/dashboard-header";
import DashboardOverview from "@/components/dashboard/dashboard-overview";
import { Plus, Briefcase, Users, TrendingUp, Coins, MapPin, Clock, Eye, Star, Video, PhoneCall, Wallet, Shield, Building2, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import { AudioRecorder } from "@/components/ui/audio-recorder";
import { GigApplicationsDialog } from "@/components/ui/gig-applications-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { insertGigSchema } from "@shared/schema";
import type { User, Gig, InsertGig } from "@shared/schema";
import { z } from "zod";

const gigFormSchema = insertGigSchema.extend({
  skillsRequiredText: z.string().min(1, "Please enter required skills"),
});

type GigFormData = z.infer<typeof gigFormSchema>;

export default function GigPosterDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const itemsPerPage = 6;
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  const { data: user } = useQuery<User>({
    queryKey: ['/api/user/profile']
  });

  const { data: wallet } = useQuery<any>({
    queryKey: ['/api/wallet']
  });

  const { data: myGigs, isLoading } = useQuery<Gig[]>({
    queryKey: ['/api/gigs/posted']
  });

  const { data: gigAnalysis } = useQuery<any>({
    queryKey: ['/api/gigs/analysis'],
    enabled: !!myGigs?.length
  });

  const { data: videoCallHistory } = useQuery<any[]>({
    queryKey: ['/api/video-calls/history'],
    enabled: !!user?.id
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
      
      let audioDescriptionUrl = null;
      if (audioBlob) {
        audioDescriptionUrl = "placeholder-audio-url.webm";
      }
      
      return apiRequest('/api/gigs', 'POST', {
        ...gigData,
        skillsRequired,
        audioDescriptionUrl,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gigs/posted'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gigs/analysis'] });
      setIsCreateModalOpen(false);
      form.reset();
      setAudioBlob(null);
      toast({
        title: "Gig created!",
        description: "Your gig has been posted successfully.",
      });
    },
  });

  const updateGigStatusMutation = useMutation({
    mutationFn: ({ gigId, status }: { gigId: string; status: string }) => 
      apiRequest('PATCH', `/api/gigs/${gigId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gigs/posted'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gigs/analysis'] });
    }
  });

  const createVideoCallMutation = useMutation({
    mutationFn: async (gigId: string) => {
      const response = await apiRequest('/api/video-calls/create', 'POST', { gigId });
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Video call created",
        description: "Video call room created successfully. Redirecting...",
      });
      setLocation(`/video-call/${data.roomId}`);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create video call",
        description: error.message || "Could not create video call session",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: GigFormData) => {
    createGigMutation.mutate(data);
  };

  const assignSeekerMutation = useMutation({
    mutationFn: async ({ gigId, seekerId }: { gigId: string; seekerId: string }) => {
      return apiRequest('/api/gigs/' + gigId + '/assign-seeker', 'POST', { seekerId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gigs/posted'] });
      toast({
        title: "Seeker assigned!",
        description: "Please fund the escrow to complete the assignment.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Assignment failed",
        description: error.message || "Unable to assign seeker",
        variant: "destructive",
      });
    }
  });

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

  const totalPages = Math.ceil((myGigs?.length || 0) / itemsPerPage);
  const paginatedGigs = myGigs?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  ) || [];

  const getUserInitials = () => {
    if (!user?.firstName && !user?.lastName) return "U";
    return `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();
  };

  const handleWalletClick = () => {
    setLocation('/wallet');
  };

  const handleProfileClick = () => {
    setActiveTab('profile');
  };

  const handleNotificationsClick = () => {
    toast({
      title: "Notifications",
      description: "No new notifications",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex">
        <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} userType="poster" />
        <div className="flex-1 lg:ml-64 pt-16 lg:pt-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-8">
              <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex">
      <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} userType="poster" />
      
      <div className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <DashboardHeader
          userName={user?.firstName || 'User'}
          userInitials={getUserInitials()}
          walletBalance={wallet?.balance ? wallet.balance / 100 : 0}
          onWalletClick={handleWalletClick}
          onProfileClick={handleProfileClick}
          onNotificationsClick={handleNotificationsClick}
        />
        
        {activeTab === "overview" && (
          <DashboardOverview userType="poster" user={user} onNavigate={setActiveTab} />
        )}

        {activeTab === "my-gigs" && (
          <>
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-800 dark:to-gray-900 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2" data-testid="dashboard-title">
                    Welcome back, {user?.firstName}! 💼
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    Manage your gigs and find the perfect talent for your tasks.
                  </p>
                </div>
                
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700 text-white h-12 px-6" data-testid="create-gig-button">
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

                        <div>
                          <label className="text-sm font-medium">Audio Description (Optional)</label>
                          <AudioRecorder 
                            onAudioRecorded={(blob) => setAudioBlob(blob)}
                          />
                        </div>

                        <div className="flex space-x-4 pt-4">
                          <Button 
                            type="submit" 
                            disabled={createGigMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
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
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                  <Coins className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="total-spent">
                    ₦{myGigs?.filter(g => g.status === 'completed')
                      .reduce((sum, g) => sum + g.budget, 0).toLocaleString() || '0'}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Posted Gigs</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {paginatedGigs.length} of {myGigs?.length || 0} gigs
                </p>
              </div>

              <div className="space-y-4">
                {paginatedGigs.map((gig) => (
                  <Card key={gig.id} className="hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                            <Building2 className="w-8 h-8 text-white" />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1" data-testid={`gig-title-${gig.id}`}>
                                {gig.title}
                              </h4>
                              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  <span data-testid={`gig-location-${gig.id}`}>{gig.location}</span>
                                </div>
                                <Badge variant={getGigStatusColor(gig.status)}>
                                  {getGigStatusDisplay(gig.status)}
                                </Badge>
                                <Badge variant="outline" className="capitalize">
                                  {gig.urgency} Priority
                                </Badge>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <div className="text-2xl font-bold text-green-600 dark:text-green-500" data-testid={`gig-budget-${gig.id}`}>
                                ₦{gig.budget.toLocaleString()}
                              </div>
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2" data-testid={`gig-description-${gig.id}`}>
                            {gig.description}
                          </p>

                          <div className="flex justify-between items-center">
                            <div className="flex flex-wrap gap-2">
                              {gig.skillsRequired.slice(0, 3).map((skill, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {gig.skillsRequired.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{gig.skillsRequired.length - 3}
                                </Badge>
                              )}
                              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 ml-2">
                                <Clock className="w-3 h-3" />
                                <span data-testid={`gig-duration-${gig.id}`}>{gig.estimatedDuration}</span>
                              </div>
                            </div>

                            {gig.status === 'open' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateGigStatusMutation.mutate({ gigId: gig.id, status: 'cancelled' })}
                                disabled={updateGigStatusMutation.isPending}
                                data-testid={`cancel-gig-${gig.id}`}
                              >
                                Cancel Gig
                              </Button>
                            )}
                          </div>

                          {gig.status === 'has_applications' && (
                            <div className="space-y-2 border-t pt-3 mt-3">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-green-600" />
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    5 Applications Received
                                  </span>
                                </div>
                                <GigApplicationsDialog
                                  gigId={gig.id}
                                  gigTitle={gig.title}
                                  onAccept={(seekerId) => {
                                    assignSeekerMutation.mutate({ gigId: gig.id, seekerId });
                                  }}
                                  trigger={
                                    <Button 
                                      size="sm" 
                                      className="bg-green-600 hover:bg-green-700"
                                      data-testid={`view-applications-${gig.id}`}
                                    >
                                      <Users className="h-4 w-4 mr-2" />
                                      View Applications
                                    </Button>
                                  }
                                />
                              </div>
                            </div>
                          )}

                          {gig.status === 'assigned_pending_funding' && (
                            <div className="space-y-2 border-t pt-3 mt-3">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <Shield className="h-4 w-4 text-yellow-600" />
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Escrow Payment Required
                                  </span>
                                </div>
                                <FundEscrowDialog 
                                  gigId={gig.id}
                                  trigger={
                                    <Button 
                                      size="sm" 
                                      className="bg-green-600 hover:bg-green-700"
                                      data-testid={`fund-escrow-${gig.id}`}
                                    >
                                      <Shield className="h-4 w-4 mr-2" />
                                      Fund Escrow (₦{(gig.budget * 1.12).toLocaleString()})
                                    </Button>
                                  }
                                />
                              </div>
                            </div>
                          )}

                          {gig.status === 'assigned' && gig.posterId === user?.id && gig.seekerId && (
                            <div className="space-y-2 border-t pt-3 mt-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Video Interview Available
                                </span>
                                <Button
                                  size="sm"
                                  onClick={() => createVideoCallMutation.mutate(gig.id)}
                                  disabled={createVideoCallMutation.isPending}
                                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                                  data-testid={`button-start-call-${gig.id}`}
                                >
                                  <Video className="h-4 w-4" />
                                  <span>{createVideoCallMutation.isPending ? 'Starting...' : 'Start Video Call'}</span>
                                </Button>
                              </div>
                            </div>
                          )}

                          {['assigned', 'pending_completion', 'awaiting_mutual_confirmation'].includes(gig.status) && user && (
                            <div className="space-y-2 border-t pt-3 mt-3">
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

                          {gig.status === 'completed' && gig.seekerId && (
                            <div className="space-y-2 border-t pt-3 mt-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Gig Seeker:</span>
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
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {!myGigs?.length && (
                <Card className="p-12 text-center border-dashed">
                  <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No gigs posted yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Click the "Post New Gig" button above to create your first gig
                  </p>
                </Card>
              )}

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    data-testid="pagination-prev"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      onClick={() => setCurrentPage(page)}
                      className={currentPage === page ? "bg-green-600 hover:bg-green-700" : ""}
                      data-testid={`pagination-${page}`}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    data-testid="pagination-next"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          </>
        )}

        {activeTab === "conversations" && (
          <div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <MessageSquare className="h-6 w-6" />
                    Conversations
                  </CardTitle>
                  <CardDescription className="text-base">
                    Chat and video call with gig seekers about your posted gigs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your conversations and video call history will appear here once candidates apply to your gigs.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "video-calls" && (
          <div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold">Video Call History</h3>
              <Badge variant="secondary" data-testid="video-calls-count">
                {videoCallHistory?.length || 0} calls
              </Badge>
            </div>

            {videoCallHistory && videoCallHistory.length > 0 ? (
              <div className="space-y-4">
                {videoCallHistory.map((call) => (
                  <Card key={call.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <PhoneCall className="h-4 w-4 text-green-500" />
                            <span className="font-medium" data-testid={`call-gig-title-${call.id}`}>
                              {call.gig?.title || 'Unknown Gig'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{new Date(call.createdAt).toLocaleDateString()}</span>
                            </div>
                            {call.duration && (
                              <div className="flex items-center gap-1">
                                <Video className="h-3 w-3" />
                                <span>{Math.floor(call.duration / 60)}:{(call.duration % 60).toString().padStart(2, '0')}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="text-sm text-gray-500">
                            With: {call.participants?.poster?.id === user?.id 
                              ? call.participants?.seeker?.name 
                              : call.participants?.poster?.name}
                          </div>
                        </div>
                        
                        <Badge 
                          variant={call.status === 'ended' ? 'outline' : call.status === 'active' ? 'default' : 'secondary'}
                          data-testid={`call-status-${call.id}`}
                        >
                          {call.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center border-dashed">
                <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No video calls yet</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Your video call history will appear here once you connect with gig seekers.
                </p>
              </Card>
            )}
          </div>
        </div>
        )}

        {activeTab === "analytics" && (
          <div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Gig Analytics</CardTitle>
                <CardDescription className="text-base">
                  Insights and performance metrics for your posted gigs
                </CardDescription>
              </CardHeader>
              <CardContent>
                {gigAnalysis ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Average Budget</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          ₦{gigAnalysis.averageBudget?.toLocaleString() || '0'}
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {gigAnalysis.completionRate || '0'}%
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Active Seekers</p>
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {gigAnalysis.activeApplications || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">
                    Post gigs to see analytics and insights.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        )}

        {activeTab === "reviews" && (
          <div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Your Business Rating</CardTitle>
                <CardDescription className="text-base">
                  Build your reputation by completing gigs successfully
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {user && <UserRating userId={user.id} size="lg" showCount />}
              </CardContent>
            </Card>
          </div>
        </div>
        )}

        {activeTab === "gamification" && (
          <div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {user && <GamificationDashboard user={user} />}
          </div>
        </div>
        )}

        {activeTab === "ai-assistant" && (
          <div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {user && <AIAssistant userId={user.id} />}
          </div>
        </div>
        )}

        {activeTab === "financial" && (
          <div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-6">
              {user && (
                <>
                  <ZeroBrokeMode user={user} />
                  <SavingsVault userId={user.id} />
                  <BudgetTracker userId={user.id} />
                </>
              )}
            </div>
          </div>
        </div>
        )}

        {activeTab === "profile" && (
          <AccountDetails />
        )}
      </div>
    </div>
  );
}
