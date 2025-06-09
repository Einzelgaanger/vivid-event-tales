
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
import { JournalViewer } from './JournalViewer';

type JournalEntry = any;

interface JournalCardProps {
  entry: JournalEntry;
  onDelete: () => void;
  onUpdate: () => void;
}

export function JournalCard({ entry, onDelete, onUpdate }: JournalCardProps) {
  const [showEdit, setShowEdit] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
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

  const openViewer = () => {
    setShowViewer(true);
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer" onClick={openViewer}>
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
                    autoPlay
                    muted
                    loop
                  />
                )}
                
                {/* Media Controls */}
                {mediaUrls.length > 1 && (
                  <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        prevMedia();
                      }}
                      className="bg-black/50 text-white hover:bg-black/70"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        nextMedia();
                      }}
                      className="bg-black/50 text-white hover:bg-black/70"
                    >
                      <ChevronRight className="w-4 h-4" />
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
            </div>
          )}

          {entry.description && (
            <p className="text-gray-600 text-sm line-clamp-3">{entry.description}</p>
          )}

          {/* Spotify Track */}
          {entry.spotify_track_name && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded">
              <span>🎵</span>
              <span className="truncate">{entry.spotify_track_name}</span>
            </div>
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

          <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
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

      {/* Edit Modal */}
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

      {/* Journal Viewer Modal */}
      {showViewer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="relative max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowViewer(false)}
              className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white text-black"
            >
              ✕
            </Button>
            <JournalViewer 
              entry={{
                title: entry.title,
                description: entry.description,
                media_urls: entry.media_urls,
                audio_urls: entry.audio_urls,
                spotify_preview_url: entry.spotify_preview_url,
                spotify_track_name: entry.spotify_track_name,
                spotify_artist: entry.spotify_artist
              }}
              autoPlayMusic={true}
            />
          </div>
        </div>
      )}
    </>
  );
}
