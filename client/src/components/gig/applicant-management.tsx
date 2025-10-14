import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Check, X } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { GigApplication } from "@shared/schema";

interface ApplicantManagementProps {
  gigId: string;
  gigTitle: string;
}

export default function ApplicantManagement({ gigId, gigTitle }: ApplicantManagementProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const { data: applications, isLoading } = useQuery<GigApplication[]>({
    queryKey: ["/api/gigs", gigId, "applications"],
    enabled: open,
  });

  const { data: applicantCount } = useQuery<{ count: number }>({
    queryKey: [`/api/gigs/${gigId}/applications/count`],
  });

  const updateStatus = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: string; status: string }) => {
      return await apiRequest(`/api/gigs/${gigId}/applications/${applicationId}`, "PATCH", { status });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/gigs", gigId, "applications"] });
      queryClient.invalidateQueries({ queryKey: [`/api/gigs/${gigId}/applications/count`] });
      queryClient.invalidateQueries({ queryKey: ["/api/gigs/posted"] });
      
      toast({
        title: variables.status === "accepted" ? "Application Accepted" : "Application Rejected",
        description: variables.status === "accepted" 
          ? "The applicant has been assigned to this gig."
          : "The application has been rejected.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
    },
  });

  const count = applicantCount?.count || 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2" data-testid={`button-view-applicants-${gigId}`}>
          <Users className="h-4 w-4" />
          View Applicants ({count})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle data-testid="dialog-title-applicants">Applicants for {gigTitle}</DialogTitle>
          <DialogDescription>
            {count} {count === 1 ? 'person has' : 'people have'} applied for this gig
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[500px] pr-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : applications && applications.length > 0 ? (
            <div className="space-y-3">
              {applications.map((application) => (
                <Card key={application.id} data-testid={`card-application-${application.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold" data-testid={`text-applicant-id-${application.id}`}>
                          Applicant ID: {application.seekerId.substring(0, 8)}
                        </h4>
                        <CardDescription className="mt-1">
                          Applied {application.createdAt ? new Date(application.createdAt).toLocaleDateString() : 'Recently'}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant={
                          application.status === "accepted" ? "default" : 
                          application.status === "rejected" ? "destructive" : 
                          "secondary"
                        }
                        data-testid={`badge-status-${application.id}`}
                      >
                        {application.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cover Letter:</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400" data-testid={`text-cover-letter-${application.id}`}>
                        {application.coverLetter}
                      </p>
                    </div>
                    
                    {application.status === "pending" && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => updateStatus.mutate({ applicationId: application.id, status: "accepted" })}
                          disabled={updateStatus.isPending}
                          className="flex-1"
                          data-testid={`button-accept-${application.id}`}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateStatus.mutate({ applicationId: application.id, status: "rejected" })}
                          disabled={updateStatus.isPending}
                          className="flex-1"
                          data-testid={`button-reject-${application.id}`}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No applications yet
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
