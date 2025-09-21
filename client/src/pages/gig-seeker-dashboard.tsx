import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ReviewForm, UserRating } from "@/components/ui/review-components";
import { Search, MapPin, Clock, Star, TrendingUp, Briefcase, DollarSign } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { User, Gig } from "@shared/schema";

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
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: user } = useQuery<User>({
    queryKey: ['/api/user/profile']
  });

  const { data: availableGigs, isLoading: gigsLoading } = useQuery<Gig[]>({
    queryKey: ['/api/gigs/available']
  });

  const { data: myGigs } = useQuery<Gig[]>({
    queryKey: ['/api/gigs/my-applications']
  });

  const { data: recommendations, isLoading: recLoading } = useQuery<GigRecommendation[]>({
    queryKey: ['/api/gigs/recommendations'],
    enabled: !!user?.skills?.length
  });

  const applyToGigMutation = useMutation({
    mutationFn: (gigId: string) => apiRequest(`/api/gigs/${gigId}/apply`, 'POST'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gigs/available'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gigs/my-applications'] });
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

  const filteredGigs = availableGigs?.filter(gig => 
    gig.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gig.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gig.category.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (gigsLoading || recLoading) {
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
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2" data-testid="dashboard-title">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-blue-100 text-lg">
            Ready to find your next gig? Let's get you earning today!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Applications</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="active-applications">
                {myGigs?.length || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Gigs</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="available-gigs">
                {filteredGigs.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Recommendations</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="recommendations-count">
                {recommendations?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Skills</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="skills-count">
                {user?.skills?.length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="browse" data-testid="tab-browse">Browse Gigs</TabsTrigger>
            <TabsTrigger value="recommendations" data-testid="tab-recommendations">AI Recommendations</TabsTrigger>
            <TabsTrigger value="applications" data-testid="tab-applications">My Applications</TabsTrigger>
            <TabsTrigger value="reviews" data-testid="tab-reviews">Reviews</TabsTrigger>
            <TabsTrigger value="profile" data-testid="tab-profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search for gigs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="search-gigs"
              />
            </div>

            {/* Gigs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGigs.map((gig) => (
                <Card key={gig.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg" data-testid={`gig-title-${gig.id}`}>
                        {gig.title}
                      </CardTitle>
                      <Badge variant={getUrgencyColor(gig.urgency)}>
                        {gig.urgency}
                      </Badge>
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

                    <Button 
                      className="w-full" 
                      onClick={() => applyToGigMutation.mutate(gig.id)}
                      disabled={applyToGigMutation.isPending}
                      data-testid={`apply-gig-${gig.id}`}
                    >
                      {applyToGigMutation.isPending ? 'Applying...' : 'Apply Now'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredGigs.length === 0 && (
              <Card className="p-8 text-center">
                <CardContent className="space-y-4">
                  <Search className="h-12 w-12 text-gray-400 mx-auto" />
                  <h3 className="text-lg font-semibold">No gigs found</h3>
                  <p className="text-gray-500">
                    Try adjusting your search or check back later for new opportunities.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>AI-Powered Recommendations</span>
                </CardTitle>
                <CardDescription>
                  Personalized gig suggestions based on your skills and preferences
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations?.map((rec, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <CardTitle className="text-lg" data-testid={`recommendation-title-${index}`}>
                      {rec.title}
                    </CardTitle>
                    <CardDescription data-testid={`recommendation-description-${index}`}>
                      {rec.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-green-600" data-testid={`recommendation-budget-${index}`}>
                        ₦{rec.budget.toLocaleString()}
                      </span>
                      <Badge variant={getUrgencyColor(rec.urgency)}>
                        {rec.urgency}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm" data-testid={`recommendation-duration-${index}`}>
                        {rec.estimatedDuration}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {rec.skillsRequired.map((skill, skillIndex) => (
                        <Badge key={skillIndex} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {!recommendations?.length && (
              <Card className="p-8 text-center">
                <CardContent className="space-y-4">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto" />
                  <h3 className="text-lg font-semibold">Building your recommendations</h3>
                  <p className="text-gray-500">
                    Complete your profile and add skills to get personalized gig recommendations.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="applications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>My Applications</CardTitle>
                <CardDescription>
                  Track your gig applications and their status
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
                      <Badge variant={gig.status === 'assigned' ? 'default' : 'secondary'}>
                        {gig.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-green-600">₦{gig.budget.toLocaleString()}</span>
                      <span className="text-sm text-gray-500">{gig.estimatedDuration}</span>
                    </div>
                    
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
              <Card className="p-8 text-center">
                <CardContent className="space-y-4">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto" />
                  <h3 className="text-lg font-semibold">No applications yet</h3>
                  <p className="text-gray-500">
                    Start browsing gigs and apply to opportunities that match your skills.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  My Reviews & Ratings
                </CardTitle>
                <CardDescription>
                  See what gig posters are saying about your work
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
                      Reviews will appear here after gig posters rate your completed work.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>
                  Manage your skills and preferences for better gig matching
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <p className="text-lg" data-testid="profile-name">
                      {user?.firstName} {user?.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Location</label>
                    <p className="text-lg" data-testid="profile-location">
                      {user?.location}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Skills</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {user?.skills?.map((skill, index) => (
                      <Badge key={index} variant="default">
                        {skill}
                      </Badge>
                    ))}
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