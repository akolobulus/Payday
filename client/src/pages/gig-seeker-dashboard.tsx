import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ReviewForm, UserRating } from "@/components/ui/review-components";
import CompletionConfirmation from "@/components/ui/completion-confirmation";
import { WalletBalance, PaymentMethodSetup, WithdrawalDialog, EscrowStatus, formatNaira } from "@/components/ui/payment-components";
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
import { Search, MapPin, Clock, Star, TrendingUp, Briefcase, Coins, Video, PhoneCall, Wallet, ArrowUpRight, ChevronLeft, ChevronRight, Building2, MessageSquare, X, Check } from "lucide-react";
import { AudioPlayer } from "@/components/ui/audio-recorder";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import type { User, Gig, GigApplication } from "@shared/schema";
import { GIG_CATEGORIES, COUNTRIES, getStatesForCountry, getGroupedStatesForCountry, SKILL_CATEGORIES } from "@shared/constants";

interface JobMatchResult {
  score: number;
  reasoning: string;
  skillsMatch: string[];
  suggestions: string;
}

interface GigRecommendation {
  title: string;
  description: string;
  budget: number;
  category: string;
  urgency: 'low' | 'medium' | 'high';
  estimatedDuration: string;
  skillsRequired: string[];
}

export default function GigSeekerDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    category: "all",
    locationCountry: "all",
    locationState: "all",
    skills: [] as string[],
  });
  const [skillsPopoverOpen, setSkillsPopoverOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const itemsPerPage = 6;
  
  const { data: user } = useQuery<User>({
    queryKey: ['/api/user/profile']
  });

  const { data: wallet } = useQuery<any>({
    queryKey: ['/api/wallet']
  });

  const { data: availableGigs, isLoading: gigsLoading } = useQuery<Gig[]>({
    queryKey: ['/api/gigs/available']
  });

  // Get all applications with comprehensive status history
  const { data: myApplications } = useQuery<Array<{ application: GigApplication; gig: Gig }>>({
    queryKey: ['/api/applications/my-applications']
  });

  // Keep existing assigned gigs query for active work
  const { data: myGigs } = useQuery<Gig[]>({
    queryKey: ['/api/gigs/my-applications']
  });

  const { data: recommendations, isLoading: recLoading } = useQuery<GigRecommendation[]>({
    queryKey: ['/api/gigs/recommendations'],
    enabled: !!user?.skills?.length
  });

  const { data: videoCallHistory } = useQuery<any[]>({
    queryKey: ['/api/video-calls/history'],
    enabled: !!user?.id
  });

  const applyToGigMutation = useMutation({
    mutationFn: (gigId: string) => apiRequest('POST', `/api/gigs/${gigId}/apply`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gigs/available'] });
      queryClient.invalidateQueries({ queryKey: ['/api/applications/my-applications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gigs/my-applications'] });
      toast({
        title: "Application submitted!",
        description: "Your application has been sent successfully.",
      });
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

  // Memoize available states based on selected country
  const availableStates = useMemo(() => {
    if (!filters.locationCountry || filters.locationCountry === "all") return [];
    const grouped = getGroupedStatesForCountry(filters.locationCountry);
    if (grouped) {
      return grouped;
    }
    return getStatesForCountry(filters.locationCountry);
  }, [filters.locationCountry]);

  // Memoize filtered gigs
  const filteredGigs = useMemo(() => {
    return availableGigs?.filter(gig => {
      const matchesSearch = searchQuery === "" ||
        gig.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gig.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = filters.category === "" || filters.category === "all" || 
        gig.category === filters.category;
      
      // Location matching with backwards compatibility
      let matchesLocation = true;
      if (filters.locationCountry && filters.locationCountry !== "all") {
        const gigLocation = gig.location.toLowerCase();
        
        if (filters.locationState && filters.locationState !== "all") {
          // If state is selected, match by state
          matchesLocation = gigLocation.includes(filters.locationState.toLowerCase());
        } else {
          // If only country is selected, match by:
          // 1. Country name itself, OR
          // 2. Any state within that country
          const countryMatch = gigLocation.includes(filters.locationCountry.toLowerCase());
          const statesInCountry = getStatesForCountry(filters.locationCountry);
          const stateMatch = statesInCountry.some(state => 
            gigLocation.includes(state.toLowerCase())
          );
          matchesLocation = countryMatch || stateMatch;
        }
      }
      
      // Skills matching
      const matchesSkills = filters.skills.length === 0 ||
        filters.skills.some(skill => gig.skillsRequired.includes(skill));
      
      return matchesSearch && matchesCategory && matchesLocation && matchesSkills;
    }) || [];
  }, [availableGigs, searchQuery, filters]);

  const totalPages = Math.ceil(filteredGigs.length / itemsPerPage);
  const paginatedGigs = filteredGigs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSkill = (skill: string) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setFilters({
      category: "all",
      locationCountry: "all",
      locationState: "all",
      skills: [],
    });
    setSearchQuery("");
    setCurrentPage(1);
  };

  if (gigsLoading || recLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex">
        <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} userType="seeker" />
        <div className="flex-1 lg:ml-64 pt-16 lg:pt-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-8">
              <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
                <div className="lg:col-span-3 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-48 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex">
      <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} userType="seeker" />
      
      <div className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <DashboardHeader
          userName={user?.firstName || 'User'}
          userInitials={getUserInitials()}
          walletBalance={wallet?.balance ? wallet.balance / 100 : 0}
          onWalletClick={handleWalletClick}
          onProfileClick={handleProfileClick}
          onNotificationsClick={handleNotificationsClick}
          onSearch={(query) => setSearchQuery(query)}
        />
        
        {activeTab === "overview" && (
          <DashboardOverview userType="seeker" user={user} onNavigate={setActiveTab} />
        )}

        {activeTab === "browse" && (
          <>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4" data-testid="dashboard-title">
                    Over {availableGigs?.length || 0}+ gigs to apply
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                    Your Next Big Opportunity Starts Right Here - Explore the Best Gigs and Take the First Step Toward Your Future!
                  </p>
                </div>

                <div className="relative max-w-4xl mx-auto">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search by gig title, keywords, description..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-12 h-14 text-base bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                    data-testid="search-gigs"
                  />
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Filters</CardTitle>
                    {(filters.category !== "all" || filters.locationCountry !== "all" || filters.skills.length > 0) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="h-8 px-2 text-xs"
                        data-testid="clear-filters"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Clear
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Category Filter */}
                    <div>
                      <h4 className="font-semibold mb-3 text-sm text-gray-900 dark:text-white">Category</h4>
                      <Select
                        value={filters.category}
                        onValueChange={(value) => {
                          setFilters(prev => ({ ...prev, category: value }));
                          setCurrentPage(1);
                        }}
                      >
                        <SelectTrigger className="w-full" data-testid="filter-category">
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all" data-testid="category-all">All Categories</SelectItem>
                          {GIG_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value} data-testid={`category-${cat.value}`}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Location Filter - Hierarchical */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="font-semibold mb-3 text-sm text-gray-900 dark:text-white">Location</h4>
                      <div className="space-y-3">
                        <Select
                          value={filters.locationCountry}
                          onValueChange={(value) => {
                            setFilters(prev => ({ 
                              ...prev, 
                              locationCountry: value,
                              locationState: "" // Reset state when country changes
                            }));
                            setCurrentPage(1);
                          }}
                        >
                          <SelectTrigger className="w-full" data-testid="filter-country">
                            <SelectValue placeholder="Select Country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all" data-testid="country-all">All Countries</SelectItem>
                            {COUNTRIES.map((country) => (
                              <SelectItem key={country} value={country} data-testid={`country-${country}`}>
                                {country}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={filters.locationState}
                          onValueChange={(value) => {
                            setFilters(prev => ({ ...prev, locationState: value }));
                            setCurrentPage(1);
                          }}
                          disabled={!filters.locationCountry}
                        >
                          <SelectTrigger className="w-full" data-testid="filter-state">
                            <SelectValue placeholder={filters.locationCountry ? "Select State/Region" : "Select country first"} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all" data-testid="state-all">All States/Regions</SelectItem>
                            {typeof availableStates === 'object' && !Array.isArray(availableStates) ? (
                              // Grouped states (like Nigeria with zones)
                              Object.entries(availableStates).map(([zone, states]) => (
                                <SelectGroup key={zone}>
                                  <SelectLabel>{zone}</SelectLabel>
                                  {states.map((state) => (
                                    <SelectItem key={state} value={state} data-testid={`state-${state}`}>
                                      {state}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              ))
                            ) : Array.isArray(availableStates) ? (
                              // Simple array of states
                              availableStates.map((state) => (
                                <SelectItem key={state} value={state} data-testid={`state-${state}`}>
                                  {state}
                                </SelectItem>
                              ))
                            ) : null}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Skills Filter */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="font-semibold mb-3 text-sm text-gray-900 dark:text-white">Skills Required</h4>
                      <Popover open={skillsPopoverOpen} onOpenChange={setSkillsPopoverOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={skillsPopoverOpen}
                            className="w-full justify-between text-left font-normal"
                            data-testid="filter-skills"
                          >
                            {filters.skills.length > 0
                              ? `${filters.skills.length} skill${filters.skills.length > 1 ? 's' : ''} selected`
                              : "Select skills..."}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search skills..." />
                            <CommandList>
                              <CommandEmpty>No skill found.</CommandEmpty>
                              {Object.entries(SKILL_CATEGORIES).map(([category, skills]) => (
                                <CommandGroup key={category} heading={category}>
                                  {skills.map((skill) => (
                                    <CommandItem
                                      key={skill}
                                      value={skill}
                                      onSelect={() => toggleSkill(skill)}
                                      data-testid={`skill-${skill}`}
                                    >
                                      <div className="flex items-center gap-2 flex-1">
                                        <Checkbox
                                          checked={filters.skills.includes(skill)}
                                          className="pointer-events-none"
                                        />
                                        <span className="text-sm">{skill}</span>
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              ))}
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      {filters.skills.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {filters.skills.map((skill) => (
                            <Badge
                              key={skill}
                              variant="secondary"
                              className="text-xs"
                              data-testid={`selected-skill-${skill}`}
                            >
                              {skill}
                              <button
                                onClick={() => toggleSkill(skill)}
                                className="ml-1 hover:text-destructive"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-3 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Latest gigs</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {paginatedGigs.length} of {filteredGigs.length} gigs
                  </p>
                </div>

                <div className="space-y-4">
                  {paginatedGigs.map((gig) => (
                    <Card key={gig.id} className="hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700" data-testid={`gig-card-${gig.id}`}>
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
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
                                  <div className="flex items-center gap-1">
                                    <Badge variant="outline" className="capitalize">
                                      {gig.urgency} Priority
                                    </Badge>
                                  </div>
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

                            {gig.audioDescriptionUrl && (
                              <div className="mb-4">
                                <AudioPlayer audioUrl={gig.audioDescriptionUrl} label="Listen to Requirements" />
                              </div>
                            )}

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

                              <Button
                                onClick={() => applyToGigMutation.mutate(gig.id)}
                                disabled={applyToGigMutation.isPending}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                data-testid={`apply-gig-${gig.id}`}
                              >
                                Apply now
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {paginatedGigs.length === 0 && (
                  <Card className="p-12 text-center border-dashed">
                    <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No gigs found</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Try adjusting your filters or search criteria
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
                        className={currentPage === page ? "bg-blue-600 hover:bg-blue-700" : ""}
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
          </div>
          </>
        )}

        {activeTab === "recommendations" && (
          <div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                  AI-Powered Recommendations
                </CardTitle>
                <CardDescription className="text-base">
                  Personalized gig suggestions based on your skills and preferences
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations?.map((rec, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg" data-testid={`recommendation-title-${index}`}>
                        {rec.title}
                      </CardTitle>
                      <Badge variant={getUrgencyColor(rec.urgency)} className="capitalize">
                        {rec.urgency}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm" data-testid={`recommendation-description-${index}`}>
                      {rec.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-green-600" data-testid={`recommendation-budget-${index}`}>
                        ₦{rec.budget.toLocaleString()}
                      </span>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span data-testid={`recommendation-duration-${index}`}>{rec.estimatedDuration}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {rec.skillsRequired.map((skill, skillIndex) => (
                        <Badge key={skillIndex} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {!recommendations?.length && (
              <Card className="p-12 text-center border-dashed">
                <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Building your recommendations</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Complete your profile and add skills to get personalized gig recommendations.
                </p>
              </Card>
            )}
          </div>
        </div>
        )}

        {activeTab === "applications" && (
          <div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">My Applications</CardTitle>
                <CardDescription className="text-base">
                  Track all your gig applications and their status (pending, approved, rejected, completed)
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="space-y-4">
              {myGigs?.map((gig) => (
                <Card key={gig.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg" data-testid={`my-gig-title-${gig.id}`}>
                        {gig.title}
                      </CardTitle>
                      <Badge variant={getGigStatusColor(gig.status)}>
                        {getGigStatusDisplay(gig.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-green-600">₦{gig.budget.toLocaleString()}</span>
                      <span className="text-sm text-gray-500">{gig.estimatedDuration}</span>
                    </div>
                    
                    {['pending_completion', 'awaiting_mutual_confirmation'].includes(gig.status) && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <Coins className="h-5 w-5 text-yellow-600" />
                          <div>
                            <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                              Pending Payment
                            </p>
                            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300" data-testid={`pending-payment-${gig.id}`}>
                              ₦{gig.budget.toLocaleString()}
                            </p>
                            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                              Payment will be released once both parties confirm completion
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {gig.status === 'assigned' && gig.seekerId === user?.id && (
                      <div className="space-y-2 border-t pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Video Interview Available
                          </span>
                          <Button
                            size="sm"
                            onClick={() => createVideoCallMutation.mutate(gig.id)}
                            disabled={createVideoCallMutation.isPending}
                            className="flex items-center gap-2"
                            data-testid={`button-start-call-${gig.id}`}
                          >
                            <Video className="h-4 w-4" />
                            <span>{createVideoCallMutation.isPending ? 'Starting...' : 'Start Video Call'}</span>
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">
                          Connect with the gig poster to discuss details before starting work
                        </p>
                      </div>
                    )}

                    {['assigned', 'pending_completion', 'awaiting_mutual_confirmation'].includes(gig.status) && user && (
                      <div className="space-y-2 border-t pt-3">
                        <CompletionConfirmation 
                          gig={gig} 
                          currentUser={user}
                          onStatusUpdate={() => {
                            queryClient.invalidateQueries({ queryKey: ['/api/gigs/my-applications'] });
                            queryClient.invalidateQueries({ queryKey: ['/api/gigs/available'] });
                          }}
                        />
                      </div>
                    )}
                    
                    {gig.status === 'completed' && gig.posterId && (
                      <div className="space-y-2 border-t pt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Gig Poster:</span>
                          <UserRating userId={gig.posterId} size="sm" />
                        </div>
                        <ReviewForm 
                          gig={gig}
                          revieweeId={gig.posterId}
                          revieweeName="Gig Poster"
                          onSuccess={() => {
                            queryClient.invalidateQueries({ queryKey: ['/api/user', gig.posterId, 'rating'] });
                          }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {!myGigs?.length && (
              <Card className="p-12 text-center border-dashed">
                <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No applications yet</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Start browsing gigs and apply to opportunities that match your skills.
                </p>
              </Card>
            )}
          </div>
        </div>
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
                  Chat and video call with gig posters about your applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Your conversations and video call history will appear here once you apply to gigs.
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
                            <PhoneCall className="h-4 w-4 text-blue-500" />
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
                  Your video call history will appear here once you start connecting with gig posters.
                </p>
              </Card>
            )}
          </div>
        </div>
        )}

        {activeTab === "reviews" && (
          <div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Your Reviews & Rating</CardTitle>
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

        {activeTab === "analytics" && (
          <div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Analytics Dashboard</CardTitle>
                  <CardDescription>Track your performance and earnings</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    Analytics features coming soon. Monitor your gig performance, earnings trends, and success metrics.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
