
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { X, Upload, Star } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type JournalEntry = Database['public']['Tables']['journal_entries']['Row'];

interface EditJournalEntryProps {
  entry: JournalEntry;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditJournalEntry({ entry, onSuccess, onCancel }: EditJournalEntryProps) {
  const [title, setTitle] = useState(entry.title);
  const [description, setDescription] = useState(entry.description || '');
  const [mood, setMood] = useState(entry.mood || '');
  const [rating, setRating] = useState<number | null>(entry.rating);
  const [entryDate, setEntryDate] = useState(entry.entry_date);
  const [entryTime, setEntryTime] = useState(entry.entry_time || '');
  const [uploading, setUploading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [existingMediaUrls, setExistingMediaUrls] = useState<string[]>(entry.media_urls || []);
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();

  const moodOptions = [
    { value: 'happy', label: 'Happy' },
    { value: 'sad', label: 'Sad' },
    { value: 'excited', label: 'Excited' },
    { value: 'peaceful', label: 'Peaceful' },
    { value: 'anxious', label: 'Anxious' },
    { value: 'grateful', label: 'Grateful' },
    { value: 'tired', label: 'Tired' },
    { value: 'angry', label: 'Angry' },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setMediaFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingMedia = (index: number) => {
    setExistingMediaUrls(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (files: File[]): Promise<string[]> => {
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${entry.user_id}/${Date.now()}.${fileExt}`;
      
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
    if (!title.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a title for your memory',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      let newMediaUrls: string[] = [];
      
      if (mediaFiles.length > 0) {
        setUploading(true);
        newMediaUrls = await uploadFiles(mediaFiles);
        setUploading(false);
      }

      const allMediaUrls = [...existingMediaUrls, ...newMediaUrls];

      const { error } = await supabase
        .from('journal_entries')
        .update({
          title: title.trim(),
          description: description.trim() || null,
          mood: mood || null,
          rating: rating,
          entry_date: entryDate,
          entry_time: entryTime || null,
          media_urls: allMediaUrls.length > 0 ? allMediaUrls : null
        } as any)
        .eq('id', entry.id as any);

      if (error) throw error;

      onSuccess();
    } catch (error) {
      console.error('Error updating journal entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to update journal entry',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-t-lg">
        <div className="flex justify-between items-center">
          <div></div>
          <CardTitle className="text-2xl">Edit Memory</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel} className="text-white hover:bg-white/20">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Memory Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your memory a title..."
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mood">Mood</Label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger>
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

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this moment in detail..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time">Time (optional)</Label>
              <Input
                id="time"
                type="time"
                value={entryTime}
                onChange={(e) => setEntryTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    type="button"
                    variant={rating && rating >= star ? "default" : "outline"}
                    size="sm"
                    onClick={() => setRating(star)}
                    className="p-2"
                  >
                    <Star className={`w-4 h-4 ${rating && rating >= star ? 'fill-current' : ''}`} />
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Existing media display */}
          {existingMediaUrls.length > 0 && (
            <div className="space-y-2">
              <Label>Current Photos & Videos</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {existingMediaUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <div className="bg-gray-100 rounded-lg p-2 text-center">
                      <p className="text-xs truncate">Media {index + 1}</p>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeExistingMedia(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Add New Photos & Videos</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
                id="media-upload"
              />
              <label htmlFor="media-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-600">Click to upload photos or videos</p>
                <p className="text-sm text-gray-400">Support for images and videos</p>
              </label>
            </div>
            
            {mediaFiles.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                {mediaFiles.map((file, index) => (
                  <div key={index} className="relative">
                    <div className="bg-gray-100 rounded-lg p-2 text-center">
                      <p className="text-xs truncate">{file.name}</p>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || uploading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              {uploading ? 'Uploading...' : loading ? 'Updating...' : 'Update Memory'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
