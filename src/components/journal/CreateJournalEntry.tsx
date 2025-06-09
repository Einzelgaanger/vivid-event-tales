
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { X, Upload, Star, BookOpen } from 'lucide-react';
import { AudioRecorder } from '@/components/audio/AudioRecorder';
import { SpotifySelector } from '@/components/spotify/SpotifySelector';

interface CreateJournalEntryProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  preview_url: string | null;
  album: { name: string; images: { url: string }[] };
}

export function CreateJournalEntry({ onSuccess, onCancel }: CreateJournalEntryProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mood, setMood] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [entryTime, setEntryTime] = useState(new Date().toTimeString().slice(0, 5));
  const [uploading, setUploading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [audioFiles, setAudioFiles] = useState<File[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const moodOptions = [
    { value: 'happy', label: 'Happy', emoji: '😊' },
    { value: 'sad', label: 'Sad', emoji: '😢' },
    { value: 'excited', label: 'Excited', emoji: '🤩' },
    { value: 'peaceful', label: 'Peaceful', emoji: '😌' },
    { value: 'anxious', label: 'Anxious', emoji: '😰' },
    { value: 'grateful', label: 'Grateful', emoji: '🙏' },
    { value: 'tired', label: 'Tired', emoji: '😴' },
    { value: 'angry', label: 'Angry', emoji: '😠' },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setMediaFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAudioReady = (audioBlob: Blob) => {
    const audioFile = new File([audioBlob], `recording-${Date.now()}.wav`, { type: 'audio/wav' });
    setAudioFiles(prev => [...prev, audioFile]);
  };

  const removeAudioFile = (index: number) => {
    setAudioFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (files: File[]): Promise<string[]> => {
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('media')
        .upload(fileName, file);

      if (error) throw error;

      const { data } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);

      return data.publicUrl;
    });

    return Promise.all(uploadPromises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && audioFiles.length === 0) {
      toast({
        title: 'Error',
        description: 'Please enter a title or record an audio entry',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      let mediaUrls: string[] = [];
      let audioUrls: string[] = [];
      
      if (mediaFiles.length > 0) {
        setUploading(true);
        mediaUrls = await uploadFiles(mediaFiles);
      }

      if (audioFiles.length > 0) {
        audioUrls = await uploadFiles(audioFiles);
      }
      
      setUploading(false);

      const journalData = {
        user_id: user?.id!,
        title: title.trim() || 'Audio Entry',
        description: description.trim() || null,
        mood: mood || null,
        rating: rating,
        entry_date: entryDate,
        entry_time: entryTime || null,
        media_urls: mediaUrls.length > 0 ? mediaUrls : null,
        audio_urls: audioUrls.length > 0 ? audioUrls : null,
        spotify_track_id: selectedTrack?.id || null,
        spotify_track_name: selectedTrack?.name || null,
        spotify_artist: selectedTrack?.artists.map(a => a.name).join(', ') || null,
        spotify_preview_url: selectedTrack?.preview_url || null
      };

      const { error } = await supabase
        .from('journal_entries')
        .insert([journalData]);

      if (error) throw error;

      toast({
        title: 'Memory Created!',
        description: 'Your precious moment has been saved to your vault',
      });

      onSuccess();
    } catch (error) {
      console.error('Error creating journal entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to create journal entry',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const handleTrackSelect = (track: SpotifyTrack) => {
    setSelectedTrack(track);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl shadow-2xl border-0 bg-white/95 backdrop-blur">
        <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex justify-between items-center">
            <div></div>
            <CardTitle className="text-3xl flex items-center gap-3">
              <BookOpen className="w-8 h-8" />
              Create New Memory
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel} className="text-white hover:bg-white/20">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-8 space-y-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="title" className="text-lg font-medium">Memory Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What made this moment special?"
                  className="border-blue-200 focus:border-blue-500"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="mood" className="text-lg font-medium">How are you feeling?</Label>
                <Select value={mood} onValueChange={setMood}>
                  <SelectTrigger className="border-purple-200 focus:border-purple-500">
                    <SelectValue placeholder="Select your mood" />
                  </SelectTrigger>
                  <SelectContent>
                    {moodOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="description" className="text-lg font-medium">Tell your story</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe this precious moment in detail..."
                rows={5}
                className="border-blue-200 focus:border-blue-500"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-lg font-medium">Record Your Thoughts</Label>
              <AudioRecorder 
                onAudioReady={handleAudioReady}
                onRemove={() => setAudioFiles([])}
              />
              {audioFiles.length > 0 && (
                <div className="text-sm text-green-600 font-medium">
                  {audioFiles.length} audio recording(s) ready
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label className="text-lg font-medium">Add Background Music</Label>
              <SpotifySelector
                onTrackSelect={handleTrackSelect}
                selectedTrack={selectedTrack}
                onRemoveTrack={() => setSelectedTrack(null)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <Label htmlFor="date" className="text-lg font-medium">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="border-green-200 focus:border-green-500"
                  required
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="time" className="text-lg font-medium">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={entryTime}
                  onChange={(e) => setEntryTime(e.target.value)}
                  className="border-green-200 focus:border-green-500"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-lg font-medium">Rate this moment</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Button
                      key={star}
                      type="button"
                      variant={rating && rating >= star ? "default" : "outline"}
                      size="sm"
                      onClick={() => setRating(star)}
                      className={`p-3 transition-all duration-200 ${
                        rating && rating >= star 
                          ? 'bg-yellow-500 hover:bg-yellow-600 scale-110' 
                          : 'hover:scale-105'
                      }`}
                    >
                      <Star className={`w-5 h-5 ${rating && rating >= star ? 'fill-current text-white' : 'text-yellow-500'}`} />
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-lg font-medium">Add Photos & Videos</Label>
              <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 text-center bg-blue-50/50 hover:bg-blue-100/50 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="media-upload"
                />
                <label htmlFor="media-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-blue-500" />
                  <p className="text-blue-700 font-medium">Click to upload memories</p>
                  <p className="text-sm text-blue-500">Photos, videos, and more</p>
                </label>
              </div>
              
              {mediaFiles.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  {mediaFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg p-3 text-center">
                        <p className="text-xs truncate font-medium">{file.name}</p>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || uploading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {uploading ? 'Uploading...' : loading ? 'Saving...' : 'Save Memory'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
