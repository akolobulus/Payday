import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Clock, Users, AlertCircle, Play } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Gig, User } from "@shared/schema";

interface CompletionConfirmationProps {
  gig: Gig;
  currentUser: User;
  onStatusUpdate?: () => void;
}

interface CompletionStatus {
  gigStatus: string;
  confirmation: {
    id: string;
    gigId: string;
    confirmedBySeeker: boolean;
    confirmedByPoster: boolean;
    seekerConfirmedAt: string | null;
    posterConfirmedAt: string | null;
    createdAt: string;
  } | null;
  mutuallyConfirmed: boolean;
  canInitiateCompletion: boolean;
  canConfirmCompletion: boolean;
  canSubmitReviews: boolean;
}

export function CompletionConfirmation({ gig, currentUser, onStatusUpdate }: CompletionConfirmationProps) {
  const { toast } = useToast();
  const [isInitiating, setIsInitiating] = useState(false);
  
  const { data: completionStatus, refetch } = useQuery<CompletionStatus>({
    queryKey: ['/api/gigs', gig.id, 'completion-status'],
    queryFn: async () => {
      const response = await apiRequest(`/api/gigs/${gig.id}/completion-status`, 'GET');
      return response.json();
    },
  });

  const initiateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(`/api/gigs/${gig.id}/initiate-completion`, 'POST');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Completion Initiated",
        description: "Waiting for confirmation from the other party.",
      });
      refetch();
      onStatusUpdate?.();
      queryClient.invalidateQueries({ queryKey: ['/api/gigs'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to initiate completion",
        variant: "destructive",
      });
    }
  });

  const confirmMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(`/api/gigs/${gig.id}/confirm-completion`, 'POST');
      return response.json();
    },
    onSuccess: (data) => {
      if (data.mutuallyConfirmed) {
        toast({
          title: "Gig Completed! 🎉",
          description: "Both parties have confirmed completion. You can now submit reviews and payment will be released.",
        });
      } else {
        toast({
          title: "Completion Confirmed",
          description: "Your confirmation has been recorded. Waiting for the other party.",
        });
      }
      refetch();
      onStatusUpdate?.();
      queryClient.invalidateQueries({ queryKey: ['/api/gigs'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to confirm completion",
        variant: "destructive",
      });
    }
  });

  if (!completionStatus) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isSeeker = gig.seekerId === currentUser.id;
  const isPoster = gig.posterId === currentUser.id;
  const userRole = isSeeker ? 'seeker' : 'poster';
  
  const userHasConfirmed = completionStatus.confirmation 
    ? (isSeeker ? completionStatus.confirmation.confirmedBySeeker : completionStatus.confirmation.confirmedByPoster)
    : false;

  const otherPartyConfirmed = completionStatus.confirmation
    ? (isSeeker ? completionStatus.confirmation.confirmedByPoster : completionStatus.confirmation.confirmedBySeeker)
    : false;

  const getStatusBadge = () => {
    switch (completionStatus.gigStatus) {
      case 'assigned':
        return <Badge variant="secondary" data-testid="status-assigned">In Progress</Badge>;
      case 'pending_completion':
        return <Badge variant="default" data-testid="status-pending">Pending Completion</Badge>;
      case 'awaiting_mutual_confirmation':
        return <Badge variant="outline" data-testid="status-awaiting">Awaiting Confirmation</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200" data-testid="status-completed">
          <CheckCircle className="h-3 w-3 mr-1" />
          Completed
        </Badge>;
      default:
        return <Badge variant="secondary">{completionStatus.gigStatus}</Badge>;
    }
  };

  const handleInitiateCompletion = () => {
    setIsInitiating(true);
    initiateMutation.mutate();
  };

  const handleConfirmCompletion = () => {
    confirmMutation.mutate();
  };

  return (
    <Card className="w-full" data-testid="completion-confirmation-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Completion Status
          </CardTitle>
          {getStatusBadge()}
        </div>
        <CardDescription>
          Track completion confirmation progress between gig seeker and poster
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Status Information */}
        {completionStatus.gigStatus === 'assigned' && (
          <Alert data-testid="alert-ready-to-complete">
            <Play className="h-4 w-4" />
            <AlertDescription>
              Ready to mark as complete? Either party can initiate the completion process.
            </AlertDescription>
          </Alert>
        )}

        {completionStatus.gigStatus === 'pending_completion' && !userHasConfirmed && (
          <Alert data-testid="alert-awaiting-your-confirmation">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Someone has initiated completion. Please confirm if the work has been completed satisfactorily.
            </AlertDescription>
          </Alert>
        )}

        {completionStatus.gigStatus === 'awaiting_mutual_confirmation' && !otherPartyConfirmed && (
          <Alert data-testid="alert-waiting-other-party">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              You've confirmed completion. Waiting for the other party to confirm.
            </AlertDescription>
          </Alert>
        )}

        {completionStatus.mutuallyConfirmed && (
          <Alert className="bg-green-50 border-green-200" data-testid="alert-mutual-confirmation">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              🎉 Both parties have confirmed completion! You can now submit reviews and payment will be released.
            </AlertDescription>
          </Alert>
        )}

        {/* Confirmation Status Display */}
        {completionStatus.confirmation && (
          <div className="space-y-3">
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Confirmation Progress</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2" data-testid="seeker-confirmation-status">
                  {completionStatus.confirmation.confirmedBySeeker ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-sm">
                    Gig Seeker
                    {completionStatus.confirmation.confirmedBySeeker && (
                      <span className="text-green-600 ml-1">✓</span>
                    )}
                  </span>
                </div>
                
                <div className="flex items-center gap-2" data-testid="poster-confirmation-status">
                  {completionStatus.confirmation.confirmedByPoster ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-sm">
                    Gig Poster
                    {completionStatus.confirmation.confirmedByPoster && (
                      <span className="text-green-600 ml-1">✓</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {completionStatus.canInitiateCompletion && (
            <Button 
              onClick={handleInitiateCompletion}
              disabled={initiateMutation.isPending}
              data-testid="button-initiate-completion"
            >
              {initiateMutation.isPending ? "Initiating..." : "Mark as Complete"}
            </Button>
          )}

          {completionStatus.canConfirmCompletion && !userHasConfirmed && (
            <Button 
              onClick={handleConfirmCompletion}
              disabled={confirmMutation.isPending}
              variant={userHasConfirmed ? "outline" : "default"}
              data-testid="button-confirm-completion"
            >
              {confirmMutation.isPending ? "Confirming..." : "Confirm Completion"}
            </Button>
          )}

          {userHasConfirmed && !completionStatus.mutuallyConfirmed && (
            <Button variant="outline" disabled data-testid="button-already-confirmed">
              You've Confirmed ✓
            </Button>
          )}
        </div>

        {/* Review Status */}
        {completionStatus.canSubmitReviews && (
          <div className="pt-2">
            <Separator className="mb-3" />
            <p className="text-sm text-muted-foreground">
              💡 You can now submit reviews for this completed gig.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CompletionConfirmation;