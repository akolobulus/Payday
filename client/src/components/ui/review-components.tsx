import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StarRating, StarRatingInput } from "./star-rating";
import { MessageSquare, Star, Calendar } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertReviewSchema } from "@shared/schema";
import type { Review, User, Gig } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const reviewFormSchema = insertReviewSchema;
type ReviewFormData = z.infer<typeof reviewFormSchema>;

interface ReviewFormProps {
  gig: Gig;
  revieweeId: string;
  revieweeName: string;
  onSuccess?: () => void;
}

interface ReviewDisplayProps {
  reviews: Review[];
  users: Record<string, User>;
  showGigInfo?: boolean;
}

interface UserRatingProps {
  userId: string;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
}

// Form for submitting reviews
export function ReviewForm({ gig, revieweeId, revieweeName, onSuccess }: ReviewFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      revieweeId,
      gigId: gig.id,
      rating: 0,
      comment: "",
    },
  });

  const submitReviewMutation = useMutation({
    mutationFn: (data: ReviewFormData) => apiRequest('POST', '/api/reviews', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reviews'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user', revieweeId, 'rating'] });
      setIsOpen(false);
      form.reset();
      onSuccess?.();
      toast({
        title: "Review submitted",
        description: "Your review has been posted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ReviewFormData) => {
    if (data.rating === 0) {
      toast({
        title: "Please select a rating",
        description: "You must provide a star rating for your review.",
        variant: "destructive",
      });
      return;
    }
    submitReviewMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" data-testid={`review-button-${revieweeId}`}>
          <Star className="h-4 w-4 mr-2" />
          Review {revieweeName}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review {revieweeName}</DialogTitle>
          <DialogDescription>
            Share your experience working with {revieweeName} on "{gig.title}"
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <FormControl>
                    <StarRatingInput
                      rating={field.value}
                      onRatingChange={field.onChange}
                      size="lg"
                      data-testid="rating-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Review</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your experience working with this person..."
                      className="min-h-[100px]"
                      {...field}
                      data-testid="comment-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                data-testid="cancel-review"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={submitReviewMutation.isPending}
                data-testid="submit-review"
              >
                {submitReviewMutation.isPending ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Display reviews list
export function ReviewDisplay({ reviews, users, showGigInfo = false }: ReviewDisplayProps) {
  if (reviews.length === 0) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No reviews yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4" data-testid="reviews-list">
      {reviews.map((review) => {
        const reviewer = users[review.reviewerId];
        return (
          <Card key={review.id} data-testid={`review-${review.id}`}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {reviewer?.firstName?.charAt(0)}{reviewer?.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold" data-testid={`reviewer-name-${review.id}`}>
                        {reviewer?.firstName} {reviewer?.lastName}
                      </h4>
                      <StarRating rating={review.rating} size="sm" />
                      <Badge variant="outline" className="text-xs">
                        {review.rating} star{review.rating !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-2" data-testid={`review-comment-${review.id}`}>
                      {review.comment}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span data-testid={`review-date-${review.id}`}>
                        {review.createdAt ? format(new Date(review.createdAt), 'MMM d, yyyy') : 'Unknown date'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Component to display user's average rating
export function UserRating({ userId, size = "md", showCount = true }: UserRatingProps) {
  const { data: rating, isLoading } = useQuery<{ averageRating: number; reviewCount: number }>({
    queryKey: ['/api/user', userId, 'rating']
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 animate-pulse">
        <div className="h-4 w-16 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!rating || rating.reviewCount === 0) {
    return (
      <div className="flex items-center gap-1 text-gray-500" data-testid={`user-rating-${userId}`}>
        <StarRating rating={0} size={size} />
        <span className="text-sm">No reviews</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1" data-testid={`user-rating-${userId}`}>
      <StarRating rating={rating.averageRating} size={size} showValue />
      {showCount && (
        <span className="text-sm text-gray-500 ml-1">
          ({rating.reviewCount} review{rating.reviewCount !== 1 ? 's' : ''})
        </span>
      )}
    </div>
  );
}