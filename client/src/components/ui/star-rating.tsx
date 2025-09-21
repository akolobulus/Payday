import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}

interface StarRatingInputProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
}

const sizeClasses = {
  sm: "h-3 w-3",
  md: "h-4 w-4", 
  lg: "h-5 w-5"
};

const textSizeClasses = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base"
};

// Display-only star rating
export function StarRating({ 
  rating, 
  maxRating = 5, 
  size = "md", 
  showValue = false,
  className 
}: StarRatingProps) {
  const stars = [];
  
  for (let i = 1; i <= maxRating; i++) {
    const isFilled = i <= rating;
    const isHalfFilled = rating > i - 1 && rating < i;
    
    stars.push(
      <Star
        key={i}
        className={cn(
          sizeClasses[size],
          isFilled ? "fill-yellow-400 text-yellow-400" : 
          isHalfFilled ? "fill-yellow-200 text-yellow-400" : "text-gray-300"
        )}
        data-testid={`star-${i}`}
      />
    );
  }

  return (
    <div className={cn("flex items-center gap-1", className)} data-testid="star-rating">
      <div className="flex">
        {stars}
      </div>
      {showValue && (
        <span className={cn("ml-1 font-medium text-gray-700 dark:text-gray-300", textSizeClasses[size])}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

// Interactive star rating input
export function StarRatingInput({
  rating,
  onRatingChange,
  maxRating = 5,
  size = "md",
  className,
  disabled = false
}: StarRatingInputProps) {
  const stars = [];

  for (let i = 1; i <= maxRating; i++) {
    const isFilled = i <= rating;
    
    stars.push(
      <button
        key={i}
        type="button"
        onClick={() => !disabled && onRatingChange(i)}
        onMouseEnter={(e) => {
          if (!disabled) {
            // Highlight stars on hover
            const allStars = e.currentTarget.parentElement?.querySelectorAll('button');
            allStars?.forEach((star, index) => {
              const starIcon = star.querySelector('svg');
              if (starIcon) {
                if (index < i) {
                  starIcon.classList.add('fill-yellow-400', 'text-yellow-400');
                  starIcon.classList.remove('text-gray-300');
                } else {
                  starIcon.classList.remove('fill-yellow-400', 'text-yellow-400');
                  starIcon.classList.add('text-gray-300');
                }
              }
            });
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            // Reset to actual rating
            const allStars = e.currentTarget.parentElement?.querySelectorAll('button');
            allStars?.forEach((star, index) => {
              const starIcon = star.querySelector('svg');
              if (starIcon) {
                if (index < rating) {
                  starIcon.classList.add('fill-yellow-400', 'text-yellow-400');
                  starIcon.classList.remove('text-gray-300');
                } else {
                  starIcon.classList.remove('fill-yellow-400', 'text-yellow-400');
                  starIcon.classList.add('text-gray-300');
                }
              }
            });
          }
        }}
        disabled={disabled}
        className={cn(
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded",
          disabled ? "cursor-not-allowed" : "cursor-pointer hover:scale-110 transition-transform"
        )}
        data-testid={`star-input-${i}`}
      >
        <Star
          className={cn(
            sizeClasses[size],
            isFilled ? "fill-yellow-400 text-yellow-400" : "text-gray-300",
            disabled ? "opacity-50" : ""
          )}
        />
      </button>
    );
  }

  return (
    <div className={cn("flex items-center gap-1", className)} data-testid="star-rating-input">
      <div className="flex">
        {stars}
      </div>
      <span className={cn("ml-2 font-medium text-gray-700 dark:text-gray-300", textSizeClasses[size])}>
        {rating > 0 ? `${rating} star${rating !== 1 ? 's' : ''}` : 'No rating'}
      </span>
    </div>
  );
}