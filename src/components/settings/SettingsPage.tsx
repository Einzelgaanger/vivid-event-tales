
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Settings, Shield, Bell, Tag } from 'lucide-react';
import { NotificationManager } from '@/components/notifications/NotificationManager';
import { NotificationService } from '@/components/notifications/NotificationService';
import { TagsManager } from './TagsManager';

export function SettingsPage() {
  const [pinEnabled, setPinEnabled] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [reminderFrequency, setReminderFrequency] = useState('daily');
  const [notificationsGranted, setNotificationsGranted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user?.id as string)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setPinEnabled(data.pin_enabled || false);
        setPinCode(data.pin_code || '');
        setReminderEnabled(data.notification_enabled || false);
        setReminderTime(data.notification_time || '09:00');
        setReminderFrequency(data.notification_frequency || 'daily');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    if (pinEnabled && (!pinCode || pinCode.length !== 4)) {
      toast({
        title: 'Invalid PIN',
        description: 'PIN must be exactly 4 digits',
        variant: 'destructive'
      });
      return;
    }

    if (reminderEnabled && !notificationsGranted) {
      toast({
        title: 'Notifications Required',
        description: 'Please enable browser notifications first',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user?.id as string,
          pin_enabled: pinEnabled,
          pin_code: pinEnabled ? pinCode : null,
          notification_enabled: reminderEnabled,
          notification_time: reminderTime,
          notification_frequency: reminderFrequency,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Schedule notifications if enabled
      if (reminderEnabled && notificationsGranted) {
        NotificationService.scheduleJournalReminder(reminderTime, reminderFrequency);
      }

      toast({
        title: '✅ Settings Saved',
        description: 'Your preferences have been updated successfully'
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePinChange = (value: string) => {
    // Only allow digits and limit to 4 characters
    const digits = value.replace(/\D/g, '').slice(0, 4);
    setPinCode(digits);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-black bg-clip-text text-transparent">
          Settings ⚙️
        </h1>
        <p className="text-gray-600 text-lg">
          Customize your MemVault experience
        </p>
      </div>

      {/* Browser Notifications */}
      <NotificationManager onPermissionChange={setNotificationsGranted} />

      {/* Journal Reminders */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="w-5 h-5 text-blue-600" />
            Journal Reminders
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="reminder-toggle">Enable journal reminders</Label>
            <Switch
              id="reminder-toggle"
              checked={reminderEnabled}
              onCheckedChange={setReminderEnabled}
            />
          </div>

          {reminderEnabled && (
            <div className="space-y-4 p-4 border rounded-lg bg-blue-50/50">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reminder-time">Reminder Time</Label>
                  <Input
                    id="reminder-time"
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="reminder-frequency">Frequency</Label>
                  <Select value={reminderFrequency} onValueChange={setReminderFrequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="every3days">Every 3 days</SelectItem>
                      <SelectItem value="every7days">Every 7 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {!notificationsGranted && (
                <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded">
                  ⚠️ Enable browser notifications above to receive reminders
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="w-5 h-5 text-red-600" />
            Security & Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="pin-toggle">Enable 4-digit PIN lock</Label>
            <Switch
              id="pin-toggle"
              checked={pinEnabled}
              onCheckedChange={setPinEnabled}
            />
          </div>

          {pinEnabled && (
            <div className="space-y-3 p-4 border rounded-lg bg-red-50/50">
              <Label htmlFor="pin-code">4-Digit PIN</Label>
              <Input
                id="pin-code"
                type="password"
                value={pinCode}
                onChange={(e) => handlePinChange(e.target.value)}
                placeholder="Enter 4-digit PIN"
                maxLength={4}
                className="w-32"
              />
              <p className="text-sm text-gray-600">
                You'll be asked for this PIN when returning to the app
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tags Management */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Tag className="w-5 h-5 text-green-600" />
            Tags Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TagsManager />
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={saveSettings}
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-black hover:from-blue-700 hover:to-gray-900 px-8"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
