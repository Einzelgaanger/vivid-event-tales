
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Vault, Lock } from 'lucide-react';

interface PinVerificationProps {
  onVerified: () => void;
}

export function PinVerification({ onVerified }: PinVerificationProps) {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasPinEnabled, setHasPinEnabled] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    checkPinStatus();
  }, [user]);

  const checkPinStatus = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('pin_enabled, pin_code')
        .eq('user_id', user.id as string)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data && 'pin_enabled' in data && data.pin_enabled) {
        setHasPinEnabled(true);
      } else {
        onVerified();
      }
    } catch (error) {
      console.error('Error checking PIN status:', error);
      onVerified();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      toast({
        title: 'Invalid PIN',
        description: 'Please enter a 4-digit PIN',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('pin_code')
        .eq('user_id', user?.id as string)
        .maybeSingle();

      if (error) throw error;

      if (data && 'pin_code' in data && data.pin_code === pin) {
        localStorage.setItem('lastActivity', Date.now().toString());
        onVerified();
      } else {
        toast({
          title: 'Incorrect PIN',
          description: 'Please try again',
          variant: 'destructive'
        });
        setPin('');
      }
    } catch (error) {
      console.error('Error verifying PIN:', error);
      toast({
        title: 'Error',
        description: 'Failed to verify PIN',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!hasPinEnabled) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Vault className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            <div className="flex items-center justify-center gap-2">
              <Lock className="w-6 h-6" />
              Enter PIN
            </div>
          </CardTitle>
          <p className="text-gray-600">
            Enter your 4-digit PIN to access your MemVault
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Input
                type="password"
                maxLength={4}
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="text-center text-2xl tracking-widest"
                autoFocus
              />
            </div>

            <Button
              type="submit"
              disabled={loading || pin.length !== 4}
              className="w-full bg-gradient-to-r from-blue-600 to-black hover:from-blue-700 hover:to-gray-900"
            >
              {loading ? 'Verifying...' : 'Unlock Vault'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
