
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, Star, Trash2, Edit, Heart, ChevronLeft, ChevronRight, Download, Play, Pause } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { EditJournalEntry } from './EditJournalEntry';

interface JournalEntry {
  id: string;
  title: string;
  description: string | null;
  mood: string | null;
  rating: number | null;
  entry_date: string;
  entry_time: string | null;
  media_urls: string[] | null;
  created_at: string;
}

interface JournalCardProps {
  entry: JournalEntry;
  onDelete: () => void;
  onUpdate: () => void;
}

export function JournalCard({ entry, onDelete, onUpdate }: JournalCardProps) {
  const [showFullView, setShowFullView] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const { toast } = useToast();

  // Auto-slideshow functionality
  useEffect(() => {
    if (showFullView && entry.media_urls && entry.media_urls.length > 1 && isAutoPlaying) {
      const interval = setInterval(() => {
        setCurrentMediaIndex((prev) => 
          prev === entry.media_urls!.length - 1 ? 0 : prev + 1
        );
      }, 4000); // Change every 4 seconds

      return () => clearInterval(interval);
    }
  }, [showFullView, entry.media_urls, isAutoPlaying]);

  const getMoodIcon = (mood: string | null) => {
    const moodMap: { [key: string]: string } = {
      'happy': '😊',
      'sad': '😢',
      'excited': '🤩',
      'peaceful': '😌',
      'anxious': '😰',
      'grateful': '🙏',
      'tired': '😴',
      'angry': '😠',
    };
    return mood ? moodMap[mood] || '😐' : '😐';
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this memory? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      // Delete media files from storage first
      if (entry.media_urls && entry.media_urls.length > 0) {
        const deletePromises = entry.media_urls.map(url => {
          const path = url.split('/').pop();
          return supabase.storage.from('media').remove([`${entry.id}/${path}`]);
        });
        await Promise.all(deletePromises);
      }

      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entry.id);

      if (error) throw error;

      toast({
        title: 'Memory Deleted',
        description: 'Your memory has been permanently deleted.',
      });
      onDelete();
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete memory',
        variant: 'destructive'
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = () => {
    setShowEditForm(true);
    setShowFullView(false);
  };

  const handleEditSuccess = () => {
    setShowEditForm(false);
    onUpdate();
    toast({
      title: 'Memory Updated',
      description: 'Your memory has been successfully updated.',
    });
  };

  const nextMedia = () => {
    setIsAutoPlaying(false); // Pause auto-play when user manually navigates
    if (entry.media_urls && entry.media_urls.length > 1) {
      setCurrentMediaIndex((prev) => 
        prev === entry.media_urls!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevMedia = () => {
    setIsAutoPlaying(false); // Pause auto-play when user manually navigates
    if (entry.media_urls && entry.media_urls.length > 1) {
      setCurrentMediaIndex((prev) => 
        prev === 0 ? entry.media_urls!.length - 1 : prev - 1
      );
    }
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  if (showEditForm) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <EditJournalEntry
            entry={entry}
            onSuccess={handleEditSuccess}
            onCancel={() => setShowEditForm(false)}
          />
        </div>
      </div>
    );
  }

  if (showFullView) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <Card className="border-0 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl mb-2">{entry.title}</CardTitle>
                  <div className="flex items-center gap-4 text-white/90 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(entry.entry_date)}
                    </div>
                    {entry.entry_time && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {entry.entry_time}
                      </div>
                    )}
                    {entry.mood && (
                      <div className="flex items-center gap-1">
                        <span className="text-lg">{getMoodIcon(entry.mood)}</span>
                        <span className="capitalize">{entry.mood}</span>
                      </div>
                    )}
                    {entry.rating && (
                      <div className="flex items-center gap-1">
                        {Array.from({ length: entry.rating }, (_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFullView(false)}
                  className="text-white hover:bg-white/20"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              {/* Media Display with Auto-slideshow */}
              {entry.media_urls && entry.media_urls.length > 0 && (
                <div className="mb-6">
                  <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                    {entry.media_urls[currentMediaIndex].includes('.mp4') || 
                     entry.media_urls[currentMediaIndex].includes('.mov') || 
                     entry.media_urls[currentMediaIndex].includes('.avi') ? (
                      <video
                        src={entry.media_urls[currentMediaIndex]}
                        controls
                        className="w-full h-64 md:h-96 object-cover"
                        autoPlay
                        muted
                      />
                    ) : (
                      <img
                        src={entry.media_urls[currentMediaIndex]}
                        alt="Memory"
                        className="w-full h-64 md:h-96 object-cover"
                      />
                    )}
                    
                    {entry.media_urls.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={prevMedia}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={nextMedia}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
                          <Badge variant="secondary">
                            {currentMediaIndex + 1} / {entry.media_urls.length}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                            className="bg-black/50 text-white hover:bg-black/70 p-1 h-8 w-8"
                          >
                            {isAutoPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                          </Button>
                        </div>
                      </>
                    )}
                    
                    {/* Download Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => downloadFile(entry.media_urls![currentMediaIndex], `memory-${currentMediaIndex + 1}`)}
                      className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Download All Media */}
              {entry.media_urls && entry.media_urls.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {entry.media_urls.map((url, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => downloadFile(url, `memory-${index + 1}`)}
                        className="flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        File {index + 1}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {entry.description && (
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {entry.description}
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center mt-6 pt-4 border-t">
                <Badge variant="outline" className="text-gray-500">
                  Created {format(parseISO(entry.created_at), 'MMM dd, yyyy')}
                </Badge>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleEdit}>
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    {deleting ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] bg-white/80 backdrop-blur-sm border-0 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1" onClick={() => setShowFullView(true)}>
            <CardTitle className="text-lg mb-2 text-gray-800 line-clamp-2">
              {entry.title}
            </CardTitle>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(entry.entry_date)}
              </div>
              {entry.mood && (
                <div className="flex items-center gap-1">
                  <span className="text-base">{getMoodIcon(entry.mood)}</span>
                </div>
              )}
              {entry.rating && (
                <div className="flex items-center">
                  {Array.from({ length: entry.rating }, (_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current text-yellow-500" />
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="text-gray-400 hover:text-blue-500"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="text-gray-400 hover:text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0" onClick={() => setShowFullView(true)}>
        {/* Media Preview */}
        {entry.media_urls && entry.media_urls.length > 0 && (
          <div className="mb-3">
            <div className="relative bg-gray-100 rounded-lg overflow-hidden h-32">
              {entry.media_urls[0].includes('.mp4') || 
               entry.media_urls[0].includes('.mov') || 
               entry.media_urls[0].includes('.avi') ? (
                <video
                  src={entry.media_urls[0]}
                  className="w-full h-full object-cover"
                  muted
                />
              ) : (
                <img
                  src={entry.media_urls[0]}
                  alt="Memory preview"
                  className="w-full h-full object-cover"
                />
              )}
              {entry.media_urls.length > 1 && (
                <Badge className="absolute top-2 right-2 bg-black/70 text-white">
                  +{entry.media_urls.length - 1} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Description Preview */}
        {entry.description && (
          <p className="text-gray-600 text-sm line-clamp-3 mb-3">
            {entry.description}
          </p>
        )}

        <div className="flex justify-between items-center text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            Memory
          </div>
          {entry.entry_time && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {entry.entry_time}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
