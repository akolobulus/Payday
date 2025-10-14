import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, X, User, Star, Briefcase, MapPin, Award } from "lucide-react";
import { AudioPlayer } from "@/components/ui/audio-recorder";
import { useToast } from "@/hooks/use-toast";

interface Application {
  id: string;
  seekerId: string;
  seekerName: string;
  seekerLocation: string;
  skills: string[];
  experience: string;
  rating: number;
  totalGigs: number;
  coverLetter: string;
  audioUrl?: string;
}

interface GigApplicationsDialogProps {
  gigId: string;
  gigTitle: string;
  onAccept?: (seekerId: string) => void;
  onReject?: (applicationId: string) => void;
  trigger: React.ReactNode;
}

const SAMPLE_APPLICATIONS: Application[] = [
  {
    id: "app-1",
    seekerId: "seeker-1",
    seekerName: "Chioma Adebayo",
    seekerLocation: "Lagos",
    skills: ["Photography", "Video Editing", "Social Media"],
    experience: "3 years",
    rating: 4.8,
    totalGigs: 47,
    coverLetter: "I have extensive experience in content creation and photography. I've worked with several brands and can deliver high-quality work within your timeline.",
    audioUrl: "placeholder-audio.webm"
  },
  {
    id: "app-2",
    seekerId: "seeker-2",
    seekerName: "Emeka Okonkwo",
    seekerLocation: "Abuja",
    skills: ["Content Creation", "Photography", "Graphic Design"],
    experience: "2 years",
    rating: 4.5,
    totalGigs: 32,
    coverLetter: "I specialize in creative photography and content creation for social media. My portfolio includes work for top brands in Nigeria.",
  },
  {
    id: "app-3",
    seekerId: "seeker-3",
    seekerName: "Fatima Ibrahim",
    seekerLocation: "Jos",
    skills: ["Social Media Management", "Photography", "Content Strategy"],
    experience: "4 years",
    rating: 4.9,
    totalGigs: 65,
    coverLetter: "With 4 years of experience in social media content creation, I understand the importance of visual storytelling and engagement.",
  },
  {
    id: "app-4",
    seekerId: "seeker-4",
    seekerName: "Tunde Williams",
    seekerLocation: "Lagos",
    skills: ["Photography", "Videography", "Editing"],
    experience: "5 years",
    rating: 4.7,
    totalGigs: 89,
    coverLetter: "Professional photographer with 5 years experience. I deliver exceptional quality and have worked on over 80 successful projects.",
  },
];

export function GigApplicationsDialog({ gigId, gigTitle, onAccept, onReject, trigger }: GigApplicationsDialogProps) {
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const [viewingProfile, setViewingProfile] = useState<Application | null>(null);
  const { toast } = useToast();

  const handleAccept = (application: Application) => {
    toast({
      title: "Application Accepted",
      description: `${application.seekerName} has been assigned to this gig`,
    });
    onAccept?.(application.seekerId);
  };

  const handleReject = (application: Application) => {
    toast({
      title: "Application Rejected",
      description: `${application.seekerName}'s application has been rejected`,
    });
    onReject?.(application.id);
  };

  const handleViewProfile = (application: Application) => {
    setViewingProfile(application);
  };

  if (viewingProfile) {
    return (
      <Dialog open={!!viewingProfile} onOpenChange={() => setViewingProfile(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Applicant Profile</DialogTitle>
            <DialogDescription>
              Detailed information about {viewingProfile.seekerName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-blue-600 text-white text-xl">
                  {viewingProfile.seekerName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-bold">{viewingProfile.seekerName}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="h-3 w-3" />
                  {viewingProfile.seekerLocation}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-bold">{viewingProfile.rating}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Rating</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Briefcase className="h-4 w-4" />
                  <span className="font-bold">{viewingProfile.totalGigs}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Completed Gigs</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Award className="h-4 w-4" />
                  <span className="font-bold">{viewingProfile.experience}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Experience</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Skills & Expertise</h4>
              <div className="flex flex-wrap gap-2">
                {viewingProfile.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Cover Letter</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{viewingProfile.coverLetter}</p>
            </div>

            {viewingProfile.audioUrl && (
              <div>
                <h4 className="font-semibold mb-2">Audio Introduction</h4>
                <AudioPlayer audioUrl={viewingProfile.audioUrl} label="Listen to introduction" />
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={() => {
                  handleAccept(viewingProfile);
                  setViewingProfile(null);
                }}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-2" />
                Accept & Assign
              </Button>
              <Button 
                onClick={() => {
                  handleReject(viewingProfile);
                  setViewingProfile(null);
                }}
                variant="outline"
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Applications for: {gigTitle}</DialogTitle>
          <DialogDescription>
            Review applications and select the best candidate for your gig
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {SAMPLE_APPLICATIONS.map((app) => (
            <Card 
              key={app.id} 
              className={`transition-all ${selectedApplication === app.id ? 'ring-2 ring-green-500' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                      {app.seekerName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-lg">{app.seekerName}</h4>
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {app.seekerLocation}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            {app.rating} ({app.totalGigs} gigs)
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">{app.experience} exp</Badge>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {app.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {app.coverLetter}
                    </p>

                    {app.audioUrl && (
                      <div className="mb-3">
                        <AudioPlayer audioUrl={app.audioUrl} label="Audio introduction" />
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewProfile(app)}
                        data-testid={`button-view-profile-${app.id}`}
                      >
                        <User className="h-3 w-3 mr-1" />
                        View Full Profile
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAccept(app)}
                        className="bg-green-600 hover:bg-green-700"
                        data-testid={`button-accept-${app.id}`}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(app)}
                        data-testid={`button-reject-${app.id}`}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
