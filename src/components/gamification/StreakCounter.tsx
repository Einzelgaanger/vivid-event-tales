
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Flame, Trophy, Star } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Streak = Database['public']['Tables']['streaks']['Row'];

export function StreakCounter() {
  const [streak, setStreak] = useState<Streak | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchStreak();
    }
  }, [user]);

  const fetchStreak = async () => {
    if (!user?.id) return;
    
    try {
      const { data } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', user.id as any)
        .maybeSingle();
      
      if (data) {
        setStreak(data as unknown as Streak);
      }
    } catch (error) {
      console.error('Error fetching streak:', error);
    }
  };

  if (!streak) return null;

  return (
    <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Flame className="w-5 h-5 text-orange-300" />
          Journal Streak
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="text-center">
            <div className="text-2xl font-bold">{streak.current_streak || 0}</div>
            <div className="text-sm opacity-90">Current</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{streak.longest_streak || 0}</div>
            <div className="text-sm opacity-90">Best</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{streak.total_points || 0}</div>
            <div className="text-sm opacity-90">Points</div>
          </div>
        </div>
        
        {(streak.current_streak || 0) > 0 && (
          <Badge variant="secondary" className="w-full justify-center">
            <Star className="w-4 h-4 mr-1" />
            Keep it up!
          </Badge>
        )}
        
        {(streak.current_streak || 0) >= 7 && (
          <Badge variant="secondary" className="w-full justify-center bg-yellow-500">
            <Trophy className="w-4 h-4 mr-1" />
            Week Warrior!
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
