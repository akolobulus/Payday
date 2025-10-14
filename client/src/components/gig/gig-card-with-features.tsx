import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, DollarSign, Users, PlayCircle, PauseCircle, AlertCircle } from "lucide-react";
import { formatNaira } from "@/components/ui/payment-components";
import type { Gig } from "@shared/schema";

interface GigCardWithFeaturesProps {
  gig: Gig;
  applicantCount?: number;
  onApply?: () => void;
  showApplicantCount?: boolean;
  showAudioPlayer?: boolean;
}

export default function GigCardWithFeatures({ 
  gig, 
  applicantCount = 0, 
  onApply,
  showApplicantCount = false,
  showAudioPlayer = true
}: GigCardWithFeaturesProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setAudioError(false);
    setIsPlaying(false);

    if (gig.audioDescriptionUrl) {
      const audio = new Audio(gig.audioDescriptionUrl);
      audioRef.current = audio;
      
      const handleEnded = () => setIsPlaying(false);
      const handleError = () => {
        setAudioError(true);
        setIsPlaying(false);
      };

      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);

      return () => {
        audio.pause();
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        audioRef.current = null;
      };
    }
  }, [gig.audioDescriptionUrl]);

  const handlePlayAudio = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setAudioError(false);
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          setAudioError(true);
          setIsPlaying(false);
        });
    }
  };

  const urgencyColors = {
    low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
  };

  return (
    <Card className="hover:shadow-lg transition-shadow" data-testid={`card-gig-${gig.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2" data-testid={`text-gig-title-${gig.id}`}>
              {gig.title}
            </CardTitle>
            <CardDescription className="line-clamp-2" data-testid={`text-gig-description-${gig.id}`}>
              {gig.description}
            </CardDescription>
          </div>
          <Badge className={urgencyColors[gig.urgency as keyof typeof urgencyColors]} data-testid={`badge-urgency-${gig.id}`}>
            {gig.urgency}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {gig.audioDescriptionUrl && showAudioPlayer && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            {audioError ? (
              <>
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <span className="text-sm text-red-600 dark:text-red-400">
                  Audio not available
                </span>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handlePlayAudio}
                  data-testid={`button-audio-${gig.id}`}
                  className="text-blue-600 dark:text-blue-400"
                >
                  {isPlaying ? (
                    <PauseCircle className="h-5 w-5" />
                  ) : (
                    <PlayCircle className="h-5 w-5" />
                  )}
                </Button>
                <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  {isPlaying ? "Playing audio description..." : "Play audio description"}
                </span>
              </>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {gig.skillsRequired.map((skill) => (
            <Badge key={skill} variant="outline" data-testid={`badge-skill-${skill}`}>
              {skill}
            </Badge>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="h-4 w-4 mr-2" />
            {gig.location}
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Clock className="h-4 w-4 mr-2" />
            {gig.estimatedDuration}
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <DollarSign className="h-4 w-4 mr-2" />
            <span className="font-semibold text-gray-900 dark:text-white" data-testid={`text-budget-${gig.id}`}>
              {formatNaira(gig.budget)}
            </span>
          </div>
          {showApplicantCount && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Users className="h-4 w-4 mr-2" />
              <span data-testid={`text-applicant-count-${gig.id}`}>
                {applicantCount} {applicantCount === 1 ? 'applicant' : 'applicants'}
              </span>
            </div>
          )}
        </div>

        {onApply && (
          <Button 
            className="w-full" 
            onClick={onApply}
            data-testid={`button-apply-${gig.id}`}
          >
            Apply Now
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
