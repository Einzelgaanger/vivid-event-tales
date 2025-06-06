
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar } from 'lucide-react';

interface EventCountdownProps {
  eventDate: string;
  eventTime?: string;
}

export function EventCountdown({ eventDate, eventTime }: EventCountdownProps) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const eventDateTime = new Date(`${eventDate}${eventTime ? `T${eventTime}` : 'T00:00'}`);
      const now = new Date();
      const difference = eventDateTime.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h ${minutes}m`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeLeft(`${minutes}m ${seconds}s`);
        }
        setIsOverdue(false);
      } else {
        const overdueHours = Math.abs(difference) / (1000 * 60 * 60);
        if (overdueHours > 30) {
          setTimeLeft('Overdue');
          setIsOverdue(true);
        } else {
          setTimeLeft('Grace Period');
          setIsOverdue(false);
        }
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [eventDate, eventTime]);

  const getBadgeVariant = () => {
    if (isOverdue) return 'destructive';
    if (timeLeft === 'Grace Period') return 'secondary';
    if (timeLeft.includes('d')) return 'default';
    return 'outline';
  };

  const getIcon = () => {
    if (isOverdue || timeLeft === 'Grace Period') {
      return <Calendar className="w-3 h-3 mr-1" />;
    }
    return <Clock className="w-3 h-3 mr-1" />;
  };

  return (
    <Badge variant={getBadgeVariant()} className="text-xs">
      {getIcon()}
      {timeLeft}
    </Badge>
  );
}
