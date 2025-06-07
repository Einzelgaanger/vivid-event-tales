
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface JournalViewerProps {
  entry: {
    title: string;
    description: string;
    media_urls?: string[];
    audio_urls?: string[];
    spotify_preview_url?: string;
    spotify_track_name?: string;
    spotify_artist?: string;
  };
  autoPlayMusic?: boolean;
}

export function JournalViewer({ entry, autoPlayMusic = false }: JournalViewerProps) {
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [mediaPlaying, setMediaPlaying] = useState(false);
  const musicRef = useRef<HTMLAudioElement>(null);
  const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement>(null);

  useEffect(() => {
    if (autoPlayMusic && entry.spotify_preview_url && musicRef.current) {
      musicRef.current.play();
      setMusicPlaying(true);
    }
  }, [autoPlayMusic, entry.spotify_preview_url]);

  useEffect(() => {
    // Adjust volumes based on content type
    if (musicRef.current && mediaRef.current) {
      if (mediaPlaying) {
        // 30% music, 70% media
        musicRef.current.volume = 0.3;
        mediaRef.current.volume = 0.7;
      } else {
        // Full volume music
        musicRef.current.volume = 1.0;
      }
    }
  }, [mediaPlaying, musicPlaying]);

  const toggleMusic = () => {
    if (musicRef.current) {
      if (musicPlaying) {
        musicRef.current.pause();
      } else {
        musicRef.current.play();
      }
      setMusicPlaying(!musicPlaying);
    }
  };

  const handleMediaPlay = () => {
    setMediaPlaying(true);
  };

  const handleMediaPause = () => {
    setMediaPlaying(false);
  };

  const hasVideo = entry.media_urls?.some(url => /\.(mp4|webm|ogg|mov)$/i.test(url));
  const hasAudio = entry.audio_urls && entry.audio_urls.length > 0;
  const hasImage = entry.media_urls?.some(url => /\.(jpg|jpeg|png|gif|webp)$/i.test(url));

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-4">{entry.title}</h2>
        
        {entry.description && (
          <p className="text-gray-700 mb-6">{entry.description}</p>
        )}

        {/* Media Display */}
        <div className="space-y-4">
          {entry.media_urls?.map((url, index) => (
            <div key={index} className="relative">
              {/\.(mp4|webm|ogg|mov)$/i.test(url) && (
                <video
                  ref={mediaRef as React.RefObject<HTMLVideoElement>}
                  src={url}
                  controls
                  className="w-full rounded-lg"
                  onPlay={handleMediaPlay}
                  onPause={handleMediaPause}
                />
              )}
              {/\.(jpg|jpeg|png|gif|webp)$/i.test(url) && (
                <img
                  src={url}
                  alt={`Memory ${index + 1}`}
                  className="w-full rounded-lg"
                />
              )}
            </div>
          ))}

          {/* Audio Files */}
          {entry.audio_urls?.map((url, index) => (
            <audio
              key={index}
              ref={mediaRef as React.RefObject<HTMLAudioElement>}
              src={url}
              controls
              className="w-full"
              onPlay={handleMediaPlay}
              onPause={handleMediaPause}
            />
          ))}
        </div>

        {/* Spotify Music Controls */}
        {entry.spotify_preview_url && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-green-800">🎵 {entry.spotify_track_name}</p>
                <p className="text-sm text-green-600">{entry.spotify_artist}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleMusic}
                className="text-green-700 border-green-300 hover:bg-green-100"
              >
                {musicPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
            </div>
            
            <audio
              ref={musicRef}
              src={entry.spotify_preview_url}
              loop
              onPlay={() => setMusicPlaying(true)}
              onPause={() => setMusicPlaying(false)}
              className="hidden"
            />
          </div>
        )}

        {/* Volume Indicator */}
        {musicPlaying && (hasVideo || hasAudio) && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <Volume2 className="w-4 h-4" />
              <span>Smart volume mixing: Music 30% • Media 70%</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
