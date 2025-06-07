
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { X, Share2, Mail, User } from 'lucide-react';

interface SharedInviteModalProps {
  itemId: string;
  itemType: 'journal' | 'event' | 'note';
  itemTitle: string;
  onClose: () => void;
}

export function SharedInviteModal({ itemId, itemType, itemTitle, onClose }: SharedInviteModalProps) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() && !username.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter either an email or username',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // Find user by email or username
      let inviteeId = null;
      if (email.trim()) {
        const { data: userData } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email.trim())
          .single();
        inviteeId = userData?.id;
      } else if (username.trim()) {
        const { data: userData } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username.trim())
          .single();
        inviteeId = userData?.id;
      }

      if (!inviteeId) {
        toast({
          title: 'User not found',
          description: 'No user found with that email or username',
          variant: 'destructive'
        });
        return;
      }

      // Create invitation
      const { error } = await supabase
        .from('shared_invites')
        .insert({
          sender_id: user?.id,
          recipient_id: inviteeId,
          item_id: itemId,
          item_type: itemType,
          item_title: itemTitle,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: '🎉 Invitation Sent!',
        description: `Invitation to share "${itemTitle}" has been sent`,
      });

      onClose();
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: 'Error',
        description: 'Failed to send invitation',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-600" />
            Share Memory
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Share "{itemTitle}" with someone special
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="friend@example.com"
              />
            </div>

            <div className="text-center text-sm text-gray-500">or</div>

            <div className="space-y-3">
              <Label htmlFor="username" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Username
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="@username"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Sending...' : 'Send Invite'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
