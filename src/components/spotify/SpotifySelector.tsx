
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Music, Search, Play, X } from 'lucide-react';

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  preview_url: string | null;
  album: {
    images: { url: string }[];
  };
}

interface SpotifySelectorProps {
  onTrackSelect: (track: SpotifyTrack) => void;
  selectedTrack?: SpotifyTrack | null;
  onRemoveTrack?: () => void;
}

export function SpotifySelector({ onTrackSelect, selectedTrack, onRemoveTrack }: SpotifySelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    getSpotifyToken();
  }, []);

  const getSpotifyToken = async () => {
    try {
      const clientId = 'ee15dd33d1b94502a240ec11171ee901';
      const clientSecret = '270d01e928784847a5f6c6bcf6e43e46';
      
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
        },
        body: 'grant_type=client_credentials'
      });

      const data = await response.json();
      setAccessToken(data.access_token);
    } catch (error) {
      console.error('Error getting Spotify token:', error);
    }
  };

  const searchTracks = async () => {
    if (!searchQuery.trim() || !accessToken) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      const data = await response.json();
      setTracks(data.tracks?.items || []);
    } catch (error) {
      console.error('Error searching tracks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchTracks();
    }
  };

  if (selectedTrack) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center gap-2">
              <Music className="w-5 h-5 text-green-600" />
              Selected Track
            </div>
            <Button onClick={onRemoveTrack} variant="ghost" size="sm">
              <X className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            {selectedTrack.album.images[0] && (
              <img 
                src={selectedTrack.album.images[0].url} 
                alt={selectedTrack.name}
                className="w-12 h-12 rounded"
              />
            )}
            <div>
              <p className="font-medium">{selectedTrack.name}</p>
              <p className="text-sm text-gray-600">
                {selectedTrack.artists.map(a => a.name).join(', ')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Music className="w-5 h-5 text-purple-600" />
          Add Background Music
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search for a song..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button onClick={searchTracks} disabled={loading}>
            <Search className="w-4 h-4" />
          </Button>
        </div>

        {tracks.length > 0 && (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="flex items-center gap-3 p-2 rounded-lg border hover:bg-gray-50 cursor-pointer"
                onClick={() => onTrackSelect(track)}
              >
                {track.album.images[0] && (
                  <img 
                    src={track.album.images[0].url} 
                    alt={track.name}
                    className="w-10 h-10 rounded"
                  />
                )}
                <div className="flex-1">
                  <p className="font-medium text-sm">{track.name}</p>
                  <p className="text-xs text-gray-600">
                    {track.artists.map(a => a.name).join(', ')}
                  </p>
                </div>
                {track.preview_url && (
                  <Badge variant="secondary">
                    <Play className="w-3 h-3 mr-1" />
                    Preview
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
