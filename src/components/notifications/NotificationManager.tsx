
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotificationManagerProps {
  onPermissionChange: (granted: boolean) => void;
}

export function NotificationManager({ onPermissionChange }: NotificationManagerProps) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const { toast } = useToast();

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      onPermissionChange(Notification.permission === 'granted');
    }
  }, [onPermissionChange]);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: 'Not Supported',
        description: 'This browser does not support notifications',
        variant: 'destructive'
      });
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      onPermissionChange(permission === 'granted');
      
      if (permission === 'granted') {
        toast({
          title: '✅ Notifications Enabled',
          description: 'You will now receive journal reminders'
        });
        
        // Send a test notification
        new Notification('MemVault Notifications', {
          body: 'Great! You\'ll now receive journal reminders.',
          icon: '/favicon.ico'
        });
      } else {
        toast({
          title: 'Permission Denied',
          description: 'You can enable notifications in your browser settings',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        title: 'Error',
        description: 'Failed to request notification permission',
        variant: 'destructive'
      });
    }
  };

  const getPermissionIcon = () => {
    switch (permission) {
      case 'granted':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'denied':
        return <BellOff className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getPermissionText = () => {
    switch (permission) {
      case 'granted':
        return 'Notifications are enabled';
      case 'denied':
        return 'Notifications are blocked';
      default:
        return 'Click to enable notifications';
    }
  };

  return (
    <Card className="border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="w-5 h-5 text-orange-600" />
          Browser Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getPermissionIcon()}
            <span className="text-sm">{getPermissionText()}</span>
          </div>
          {permission !== 'granted' && (
            <Button 
              onClick={requestPermission}
              size="sm"
              className="bg-orange-600 hover:bg-orange-700"
            >
              Enable
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
