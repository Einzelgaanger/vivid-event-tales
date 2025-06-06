
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  Clock, 
  Star, 
  Edit, 
  Trash2,
  Download,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image,
  Video
} from 'lucide-react';
import { format } from 'date-fns';
import { EditJournalEntry } from './EditJournalEntry';
import type { Database } from '@/integrations/supabase/types';

type JournalEntry = Database['public']['Tables']['journal_entries']['Row'];

interface JournalCardProps {
  entry: JournalEntry;
  onDelete: () => void;
  onUpdate: () => void;
}

export function JournalCard({ entry, onDelete, onUpdate }: JournalCardProps) {
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mediaTimer, setMediaTimer] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const mediaUrls = entry.media_urls || [];

  useEffect(() => {
    if (isPlaying && mediaUrls.length > 1) {
      const timer = setTimeout(() => {
        setCurrentMediaIndex((prev) => (prev + 1) % mediaUrls.length);
      }, 4000); // Change every 4 seconds
      setMediaTimer(timer);
    }

    return () => {
      if (mediaTimer) {
        clearTimeout(mediaTimer);
      }
    };
  }, [isPlaying, currentMediaIndex, mediaUrls.length]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this memory?')) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entry.id);

      if (error) throw error;

      toast({
        title: 'Memory Deleted',
        description: 'The memory has been successfully deleted'
      });
      onDelete();
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete memory',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditSuccess = () => {
    setShowEdit(false);
    onUpdate();
    toast({
      title: 'Memory Updated',
      description: 'Your memory has been successfully updated'
    });
  };

  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: 'Download Failed',
        description: 'Could not download the file',
        variant: 'destructive'
      });
    }
  };

  const getMoodEmoji = (mood: string | null) => {
    switch (mood?.toLowerCase()) {
      case 'happy': return '😊';
      case 'sad': return '😢';
      case 'excited': return '🤩';
      case 'peaceful': return '😌';
      case 'anxious': return '😰';
      case 'grateful': return '🙏';
      case 'tired': return '😴';
      case 'angry': return '😠';
      default: return null;
    }
  };

  const isImage = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  };

  const isVideo = (url: string) => {
    return /\.(mp4|webm|ogg|mov)$/i.test(url);
  };

  const nextMedia = () => {
    setCurrentMediaIndex((prev) => (prev + 1) % mediaUrls.length);
    setIsPlaying(false);
  };

  const prevMedia = () => {
    setCurrentMediaIndex((prev) => (prev - 1 + mediaUrls.length) % mediaUrls.length);
    setIsPlaying(false);
  };

  const toggleSlideshow = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-all duration-200 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold text-gray-800 line-clamp-2">
              {entry.title}
            </CardTitle>
            <div className="flex gap-2">
              {entry.mood && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <span>{getMoodEmoji(entry.mood)}</span>
                  <span className="capitalize">{entry.mood}</span>
                </Badge>
              )}
              {entry.rating && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current text-yellow-500" />
                  <span>{entry.rating}/5</span>
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Media Display */}
          {mediaUrls.length > 0 && (
            <div className="relative">
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                {isImage(mediaUrls[currentMediaIndex]) && (
                  <img
                    src={mediaUrls[currentMediaIndex]}
                    alt={`Memory media ${currentMediaIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}
                {isVideo(mediaUrls[currentMediaIndex]) && (
                  <video
                    src={mediaUrls[currentMediaIndex]}
                    className="w-full h-full object-cover"
                    controls
                    autoPlay
                    muted
                  />
                )}
                
                {/* Media Controls */}
                {mediaUrls.length > 1 && (
                  <div className="absolute inset-0 flex items-center justify-between p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={prevMedia}
                      className="bg-black/50 text-white hover:bg-black/70"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={nextMedia}
                      className="bg-black/50 text-white hover:bg-black/70"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                
                {/* Slideshow Controls */}
                {mediaUrls.length > 1 && (
                  <div className="absolute bottom-2 left-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleSlideshow}
                      className="bg-black/50 text-white hover:bg-black/70"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                  </div>
                )}

                {/* Media Counter */}
                {mediaUrls.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    {currentMediaIndex + 1} / {mediaUrls.length}
                  </div>
                )}
              </div>

              {/* Download All Media */}
              <div className="flex flex-wrap gap-2 mt-2">
                {mediaUrls.map((url, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => downloadFile(url, `memory-media-${index + 1}`)}
                    className="text-xs"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    {isImage(url) && <Image className="w-3 h-3 mr-1" />}
                    {isVideo(url) && <Video className="w-3 h-3 mr-1" />}
                    {!isImage(url) && !isVideo(url) && <FileText className="w-3 h-3 mr-1" />}
                    {index + 1}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {entry.description && (
            <p className="text-gray-600 text-sm line-clamp-3">{entry.description}</p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(entry.entry_date), 'MMM dd, yyyy')}</span>
            </div>
            {entry.entry_time && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{entry.entry_time}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEdit(true)}
              className="flex-1"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={loading}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {showEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <EditJournalEntry
              entry={entry}
              onSuccess={handleEditSuccess}
              onCancel={() => setShowEdit(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
