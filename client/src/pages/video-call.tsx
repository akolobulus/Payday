import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MeetingProvider, MeetingConsumer } from "@videosdk.live/react-sdk";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import VideoCallComponent from "@/components/video-call";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  PhoneCall
} from "lucide-react";

// VideoSDK Auth Token - In production, this should come from your backend
const VIDEOSDK_TOKEN = import.meta.env.VITE_VIDEOSDK_TOKEN || "your-videosdk-auth-token";

interface VideoCallPageProps {
  params: {
    roomId: string;
  };
}

interface VideoCallSession {
  id: string;
  roomId: string;
  gigId: string;
  status: string;
  participants: {
    poster?: { id: string; name: string; userType: string };
    seeker?: { id: string; name: string; userType: string };
  };
  session: {
    gigId: string;
    roomId: string;
    status: string;
    posterId: string;
    seekerId: string;
    initiatedBy: string;
    createdAt: string;
  };
}

export default function VideoCallPage({ params }: VideoCallPageProps) {
  const { roomId } = params;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [meetingId, setMeetingId] = useState(roomId);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [callEnded, setCallEnded] = useState(false);
  const [joining, setJoining] = useState(false);

  // Get current user profile
  const { data: user } = useQuery<any>({
    queryKey: ['/api/user/profile']
  });

  // Get video call session status
  const { data: videoCallData, isLoading, error } = useQuery<VideoCallSession>({
    queryKey: ['/api/video-calls', roomId, 'status'],
    queryFn: async () => {
      const response = await fetch(`/api/video-calls/${roomId}/status`);
      if (!response.ok) {
        throw new Error('Failed to fetch video call status');
      }
      return response.json();
    },
    enabled: !!roomId,
    retry: 2,
  });

  // Join video call mutation
  const joinCallMutation = useMutation({
    mutationFn: () => apiRequest('POST', `/api/video-calls/${roomId}/join`),
    onSuccess: () => {
      setJoining(false);
      toast({
        title: "Joined video call",
        description: "You have successfully joined the video call session",
      });
    },
    onError: (error: any) => {
      setJoining(false);
      toast({
        title: "Failed to join call",
        description: error.message || "Could not join the video call",
        variant: "destructive",
      });
    }
  });

  // End video call mutation
  const endCallMutation = useMutation({
    mutationFn: (duration: number) => 
      apiRequest('POST', `/api/video-calls/${roomId}/end`, { duration }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/video-calls'] });
      setCallEnded(true);
    }
  });

  useEffect(() => {
    if (user?.id) {
      setCurrentUserId(user.id);
    }
  }, [user]);

  const handleJoinCall = () => {
    setJoining(true);
    joinCallMutation.mutate();
  };

  const handleCallEnd = (duration: number) => {
    endCallMutation.mutate(duration);
  };

  const handleGoBack = () => {
    if (user?.userType === 'seeker') {
      setLocation('/dashboard/seeker');
    } else {
      setLocation('/dashboard/poster');
    }
  };

  const handleCallError = (error: string) => {
    toast({
      title: "Video call error",
      description: error,
      variant: "destructive",
    });
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <Card>
            <CardHeader>
              <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !videoCallData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Button 
            variant="ghost" 
            onClick={handleGoBack}
            className="mb-4"
            data-testid="button-go-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error?.message || "Video call session not found or you don't have permission to access it."}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Show call ended state
  if (callEnded) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <CardTitle>Video Call Ended</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              The video call has ended successfully. Thank you for using Payday's video interview feature!
            </p>
            <Button onClick={handleGoBack} className="w-full" data-testid="button-return-dashboard">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show join call interface if not yet joined
  if (!joining && videoCallData.session.status === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Button 
            variant="ghost" 
            onClick={handleGoBack}
            className="mb-4"
            data-testid="button-go-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <PhoneCall className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <CardTitle>Join Video Interview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-2">
                <p className="text-lg font-medium">Ready to start your video interview?</p>
                <p className="text-gray-600 dark:text-gray-400">
                  Connect with {videoCallData.participants.poster?.id === currentUserId 
                    ? videoCallData.participants.seeker?.name 
                    : videoCallData.participants.poster?.name} 
                  to discuss the gig details face-to-face.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="font-medium">Room ID:</p>
                  <p className="font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
                    {roomId}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium">Status:</p>
                  <Badge variant="secondary" className="w-fit">
                    {videoCallData.session.status}
                  </Badge>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Make sure your camera and microphone are working properly before joining the call.
                  You can test them in your browser settings.
                </AlertDescription>
              </Alert>

              <div className="flex justify-center">
                <Button 
                  size="lg"
                  onClick={handleJoinCall}
                  disabled={joinCallMutation.isPending}
                  className="px-8"
                  data-testid="button-join-call"
                >
                  {joinCallMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <PhoneCall className="h-4 w-4 mr-2" />
                      Join Video Call
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show video call interface
  return (
    <MeetingProvider
      config={{
        meetingId: meetingId,
        micEnabled: true,
        webcamEnabled: true,
        name: user?.firstName ? `${user.firstName} ${user.lastName}` : "Participant",
        participantId: currentUserId,
      }}
      token={VIDEOSDK_TOKEN}
    >
      <MeetingConsumer>
        {() => (
          <VideoCallComponent
            roomId={roomId}
            gigTitle={videoCallData.gig?.title}
            participants={videoCallData.participants}
            currentUserId={currentUserId}
            onCallEnd={handleCallEnd}
            onError={handleCallError}
          />
        )}
      </MeetingConsumer>
    </MeetingProvider>
  );
}