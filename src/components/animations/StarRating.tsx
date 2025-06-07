
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number | null;
  onRatingChange: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function StarRating({ rating, onRatingChange, size = 'md' }: StarRatingProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const buttonSizes = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-3'
  };

  return (
    <div className="space-y-3">
      <label className="text-lg font-medium">⭐ Rate this moment</label>
      <div className="flex gap-2 items-center">
        {[1, 2, 3, 4, 5].map((star) => {
          const isActive = (hoveredRating || rating || 0) >= star;
          const isHovered = hoveredRating === star;
          
          return (
            <Button
              key={star}
              type="button"
              variant="ghost"
              onClick={() => onRatingChange(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(null)}
              className={`
                ${buttonSizes[size]} transition-all duration-200 transform hover:scale-110
                ${isActive ? 'text-yellow-500' : 'text-gray-300'}
                ${isHovered ? 'scale-125 animate-pulse' : ''}
              `}
            >
              <Star 
                className={`
                  ${sizeClasses[size]} transition-all duration-200
                  ${isActive ? 'fill-current drop-shadow-lg' : ''}
                  ${isHovered ? 'animate-spin' : ''}
                `} 
              />
            </Button>
          );
        })}
        
        {rating && (
          <div className="ml-3 flex items-center gap-2 animate-fadeIn">
            <span className="text-lg font-medium text-yellow-600">
              {rating}/5
            </span>
            <div className="flex items-center gap-1">
              {rating >= 4 && <span className="text-xl animate-bounce">🎉</span>}
              {rating === 3 && <span className="text-xl">👍</span>}
              {rating <= 2 && <span className="text-xl">💭</span>}
            </div>
          </div>
        )}
      </div>
      
      {rating && (
        <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200 animate-fadeIn">
          <p className="text-yellow-700 font-medium">
            {rating === 5 && "Perfect moment! ✨"}
            {rating === 4 && "Great memory! 🌟"}
            {rating === 3 && "Good times! 😊"}
            {rating === 2 && "It was okay 🤔"}
            {rating === 1 && "Room for improvement 💪"}
          </p>
        </div>
      )}
    </div>
  );
}
