
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface Mood {
  value: string;
  label: string;
  emoji: string;
  color: string;
}

interface MoodSelectorProps {
  selectedMood: string;
  onMoodChange: (mood: string) => void;
}

const moods: Mood[] = [
  { value: 'happy', label: 'Happy', emoji: '😊', color: 'hover:bg-yellow-100 hover:border-yellow-300' },
  { value: 'sad', label: 'Sad', emoji: '😢', color: 'hover:bg-blue-100 hover:border-blue-300' },
  { value: 'excited', label: 'Excited', emoji: '🤩', color: 'hover:bg-orange-100 hover:border-orange-300' },
  { value: 'peaceful', label: 'Peaceful', emoji: '😌', color: 'hover:bg-green-100 hover:border-green-300' },
  { value: 'anxious', label: 'Anxious', emoji: '😰', color: 'hover:bg-red-100 hover:border-red-300' },
  { value: 'grateful', label: 'Grateful', emoji: '🙏', color: 'hover:bg-purple-100 hover:border-purple-300' },
  { value: 'tired', label: 'Tired', emoji: '😴', color: 'hover:bg-gray-100 hover:border-gray-300' },
  { value: 'angry', label: 'Angry', emoji: '😠', color: 'hover:bg-red-100 hover:border-red-300' },
];

export function MoodSelector({ selectedMood, onMoodChange }: MoodSelectorProps) {
  const [hoveredMood, setHoveredMood] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <label className="text-lg font-medium">How are you feeling? 💭</label>
      <div className="grid grid-cols-4 gap-3">
        {moods.map((mood) => (
          <Button
            key={mood.value}
            type="button"
            variant={selectedMood === mood.value ? "default" : "outline"}
            onClick={() => onMoodChange(mood.value)}
            onMouseEnter={() => setHoveredMood(mood.value)}
            onMouseLeave={() => setHoveredMood(null)}
            className={`
              relative h-16 flex flex-col items-center gap-1 transition-all duration-300 transform
              ${selectedMood === mood.value ? 'scale-105 shadow-lg' : ''}
              ${hoveredMood === mood.value ? 'scale-110 ' + mood.color : ''}
              ${mood.color}
            `}
          >
            <span className={`text-2xl transition-transform duration-300 ${
              hoveredMood === mood.value || selectedMood === mood.value ? 'animate-bounce' : ''
            }`}>
              {mood.emoji}
            </span>
            <span className="text-xs font-medium">{mood.label}</span>
            
            {selectedMood === mood.value && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            )}
          </Button>
        ))}
      </div>
      
      {selectedMood && (
        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200 animate-fadeIn">
          <p className="text-blue-700 font-medium">
            Feeling {moods.find(m => m.value === selectedMood)?.label.toLowerCase()} today! 
            {moods.find(m => m.value === selectedMood)?.emoji}
          </p>
        </div>
      )}
    </div>
  );
}
