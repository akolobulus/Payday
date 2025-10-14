import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mic, MicOff } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Gig } from "@shared/schema";

interface ApplyToGigDialogProps {
  gig: Gig;
  trigger?: React.ReactNode;
}

export default function ApplyToGigDialog({ gig, trigger }: ApplyToGigDialogProps) {
  const [open, setOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const applyMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/gigs/${gig.id}/applications`, "POST", {
        coverLetter,
        audioUrl,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gigs/available"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gigs/my-applications"] });
      queryClient.invalidateQueries({ queryKey: [`/api/gigs/${gig.id}/applications/count`] });
      
      toast({
        title: "Application Submitted",
        description: "Your application has been sent to the gig poster.",
      });
      
      setOpen(false);
      setCoverLetter("");
      setAudioUrl(null);
    },
    onError: (error: any) => {
      toast({
        title: "Application Failed",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    },
  });

  const handleRecordAudio = async () => {
    if (isRecording) {
      setIsRecording(false);
      
      const response = await apiRequest("/api/uploads/audio", "POST", {});
      setAudioUrl(response.url);
      
      toast({
        title: "Audio Recorded",
        description: "Your audio introduction has been recorded.",
      });
    } else {
      setIsRecording(true);
      toast({
        title: "Recording Started",
        description: "Recording your audio introduction...",
      });
    }
  };

  const handleSubmit = () => {
    if (!coverLetter.trim()) {
      toast({
        title: "Cover Letter Required",
        description: "Please write a cover letter before applying.",
        variant: "destructive",
      });
      return;
    }
    
    applyMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button data-testid={`button-apply-gig-${gig.id}`}>
            Apply Now
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle data-testid="dialog-title-apply">Apply for {gig.title}</DialogTitle>
          <DialogDescription>
            Tell the poster why you're the best fit for this gig
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="coverLetter">Cover Letter *</Label>
            <Textarea
              id="coverLetter"
              placeholder="Explain why you're a great fit for this gig, mention your relevant skills and experience..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={6}
              className="mt-2"
              data-testid="textarea-cover-letter"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {coverLetter.length}/500 characters
            </p>
          </div>

          <div>
            <Label>Audio Introduction (Optional)</Label>
            <div className="mt-2 flex items-center gap-3">
              <Button
                type="button"
                variant={isRecording ? "destructive" : "outline"}
                onClick={handleRecordAudio}
                className="gap-2"
                data-testid="button-record-audio"
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-4 w-4" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4" />
                    {audioUrl ? "Re-record" : "Record Audio"}
                  </>
                )}
              </Button>
              {audioUrl && (
                <span className="text-sm text-green-600 dark:text-green-400" data-testid="text-audio-recorded">
                  ✓ Audio recorded
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Record a brief introduction to stand out
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              data-testid="button-cancel-apply"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={applyMutation.isPending}
              data-testid="button-submit-application"
            >
              {applyMutation.isPending ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
