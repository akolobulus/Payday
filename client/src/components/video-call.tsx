import { useState, useEffect, useRef, useMemo } from "react";
import { useMeeting, useParticipant } from "@videosdk.live/react-sdk";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  PhoneOff,
  Monitor,
  MonitorOff,
  Users,
  Clock,
  AlertCircle
} from "lucide-react";

interface VideoCallControlsProps {
  localMicOn: boolean;
  localWebcamOn: boolean;
  toggleMic: () => void;
  toggleWebcam: () => void;
  leave: () => void;
  isScreenSharing: boolean;
  toggleScreenShare?: () => void;
}

function VideoCallControls({ 
  localMicOn, 
  localWebcamOn, 
  toggleMic, 
  toggleWebcam, 
  leave, 
  isScreenSharing,
  toggleScreenShare 
}: VideoCallControlsProps) {
  return (
    <div className="flex justify-center items-center space-x-4 p-4 bg-gray-900 rounded-lg">
      <Button
        variant={localMicOn ? "default" : "destructive"}
        size="lg"
        onClick={toggleMic}
        className="rounded-full w-14 h-14"
        data-testid="button-toggle-mic"
      >
        {localMicOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
      </Button>
      
      <Button
        variant={localWebcamOn ? "default" : "destructive"}
        size="lg"
        onClick={toggleWebcam}
        className="rounded-full w-14 h-14"
        data-testid="button-toggle-video"
      >
        {localWebcamOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
      </Button>

      {toggleScreenShare && (
        <Button
          variant={isScreenSharing ? "destructive" : "secondary"}
          size="lg"
          onClick={toggleScreenShare}
          className="rounded-full w-14 h-14"
          data-testid="button-toggle-screen-share"
        >
          {isScreenSharing ? <MonitorOff className="h-6 w-6" /> : <Monitor className="h-6 w-6" />}
        </Button>
      )}
      
      <Button
        variant="destructive"
        size="lg"
        onClick={leave}
        className="rounded-full w-14 h-14"
        data-testid="button-end-call"
      >
        <PhoneOff className="h-6 w-6" />
      </Button>
    </div>
  );
}

interface ParticipantViewProps {
  participantId: string;
  name?: string;
  isLocal?: boolean;
}

function ParticipantView({ participantId, name, isLocal }: ParticipantViewProps) {
  const micRef = useRef<HTMLAudioElement>(null);
  const { webcamStream, micStream, webcamOn, micOn, isLocal: localParticipant, displayName } = useParticipant(participantId);

  const videoStream = useMemo(() => {
    if (webcamOn && webcamStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      return mediaStream;
    }
  }, [webcamStream, webcamOn]);

  const audioStream = useMemo(() => {
    if (micOn && micStream && !localParticipant) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(micStream.track);
      return mediaStream;
    }
  }, [micStream, micOn, localParticipant]);

  // Play audio for remote participants
  useEffect(() => {
    if (audioStream && micRef.current) {
      micRef.current.srcObject = audioStream;
      micRef.current.play().catch(console.error);
    }
  }, [audioStream]);

  const participantName = name || displayName || (isLocal ? "You" : `Participant ${participantId.slice(0, 6)}`);
  const initials = participantName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden">
      {/* Video Stream */}
      {videoStream && webcamOn ? (
        <video
          autoPlay
          muted={isLocal}
          className="w-full h-full object-cover"
          ref={(videoElement) => {
            if (videoElement && videoStream) {
              videoElement.srcObject = videoStream;
            }
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          <Avatar className="w-24 h-24">
            <AvatarFallback className="text-2xl bg-blue-600 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      {/* Audio for remote participants */}
      <audio ref={micRef} autoPlay muted={localParticipant} />

      {/* Participant Info */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant={micOn ? "default" : "destructive"} className="text-xs">
              {micOn ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}
            </Badge>
            <Badge variant={webcamOn ? "default" : "destructive"} className="text-xs">
              {webcamOn ? <Video className="h-3 w-3" /> : <VideoOff className="h-3 w-3" />}
            </Badge>
          </div>
          <div className="bg-black bg-opacity-60 px-2 py-1 rounded text-white text-sm">
            {participantName}
            {isLocal && " (You)"}
          </div>
        </div>
      </div>
    </div>
  );
}

interface VideoCallComponentProps {
  roomId: string;
  gigTitle?: string;
  participants: {
    poster?: { id: string; name: string; userType: string };
    seeker?: { id: string; name: string; userType: string };
  };
  currentUserId?: string;
  onCallEnd: (duration: number) => void;
  onError?: (error: string) => void;
}

export default function VideoCallComponent({
  roomId,
  gigTitle,
  participants,
  currentUserId,
  onCallEnd,
  onError
}: VideoCallComponentProps) {
  const { toast } = useToast();
  const [callStartTime] = useState(Date.now());
  const [callDuration, setCallDuration] = useState(0);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // VideoSDK meeting hook
  const {
    join,
    leave,
    toggleMic,
    toggleWebcam,
    startRecording,
    stopRecording,
    participants: meetingParticipants,
    localMicOn,
    localWebcamOn,
    localScreenShareOn,
    toggleScreenShare
  } = useMeeting({
    onMeetingJoined: () => {
      toast({
        title: "Joined video call",
        description: "You have successfully joined the video call",
      });
    },
    onMeetingLeft: () => {
      const duration = Math.floor((Date.now() - callStartTime) / 1000);
      setCallDuration(duration);
      onCallEnd(duration);
    },
    onParticipantJoined: (participant) => {
      toast({
        title: "Participant joined",
        description: `${participant.displayName || 'Someone'} joined the call`,
      });
    },
    onParticipantLeft: (participant) => {
      toast({
        title: "Participant left",
        description: `${participant.displayName || 'Someone'} left the call`,
      });
    },
    onError: (error) => {
      console.error("VideoSDK Error:", error);
      toast({
        title: "Video call error",
        description: error.message || "An error occurred during the video call",
        variant: "destructive",
      });
      onError?.(error.message || "Video call error occurred");
    }
  });

  // Timer for call duration
  useEffect(() => {
    const interval = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - callStartTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [callStartTime]);

  // Auto-join meeting on component mount
  useEffect(() => {
    join();
  }, [join]);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleScreenShareToggle = () => {
    toggleScreenShare();
    setIsScreenSharing(!localScreenShareOn);
  };

  // Get participant details
  const getParticipantName = (participantId: string): string => {
    if (participantId === currentUserId) {
      return "You";
    }
    
    const participant = participants.poster?.id === participantId 
      ? participants.poster 
      : participants.seeker?.id === participantId 
        ? participants.seeker 
        : null;

    return participant?.name || `User ${participantId.slice(0, 6)}`;
  };

  const participantIds = Array.from(meetingParticipants.keys());
  const hasParticipants = participantIds.length > 0;

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {gigTitle || "Video Interview"}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Room: {roomId}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
              <Clock className="h-4 w-4" />
              <span data-testid="call-duration">{formatDuration(callDuration)}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
              <Users className="h-4 w-4" />
              <span data-testid="participant-count">{participantIds.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4">
        {!hasParticipants ? (
          <div className="h-full flex items-center justify-center">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  <span>Waiting for participants</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Share this room ID with the other participant to start the video call.
                </p>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                  <p className="font-mono text-sm text-center">{roomId}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className={`h-full grid gap-4 ${
            participantIds.length === 1 
              ? 'grid-cols-1' 
              : participantIds.length === 2 
                ? 'grid-cols-2' 
                : 'grid-cols-2 grid-rows-2'
          }`}>
            {participantIds.map((participantId) => (
              <div key={participantId} className="min-h-[300px]">
                <ParticipantView
                  participantId={participantId}
                  name={getParticipantName(participantId)}
                  isLocal={participantId === currentUserId}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 bg-white dark:bg-gray-800 border-t">
        <VideoCallControls
          localMicOn={localMicOn}
          localWebcamOn={localWebcamOn}
          toggleMic={toggleMic}
          toggleWebcam={toggleWebcam}
          leave={leave}
          isScreenSharing={localScreenShareOn}
          toggleScreenShare={handleScreenShareToggle}
        />
      </div>
    </div>
  );
}