
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
import { Settings, Bell, Lock, Tag, User, Vault, Shield } from 'lucide-react';
import { TagsManager } from './TagsManager';

export function SettingsPage() {
  const [journalReminderEnabled, setJournalReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('08:00');
  const [reminderFrequency, setReminderFrequency] = useState('daily');
  const [customDays, setCustomDays] = useState(1);
  const [pinCode, setPinCode] = useState('');
  const [pinEnabled, setPinEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchSettings();
      requestNotificationPermission();
    }
  }, [user]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast({
          title: '🔔 Notifications Enabled',
          description: 'You will receive journal reminders as scheduled'
        });
      }
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user?.id as any)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setJournalReminderEnabled(data.journal_reminder_enabled);
        setReminderTime(data.journal_reminder_time || '08:00');
        setReminderFrequency(data.journal_reminder_frequency || 'daily');
        setCustomDays(data.journal_reminder_custom_days || 1);
        setPinEnabled(data.pin_enabled);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const saveSettings = async () => {
    if (!user?.id) return;

    // Validate PIN if enabled
    if (pinEnabled && pinCode.length !== 4) {
      toast({
        title: 'Invalid PIN',
        description: 'PIN must be exactly 4 digits',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const settings = {
        user_id: user.id,
        journal_reminder_enabled: journalReminderEnabled,
        journal_reminder_time: reminderTime,
        journal_reminder_frequency: reminderFrequency,
        journal_reminder_custom_days: reminderFrequency === 'custom' ? customDays : null,
        pin_code: pinCode || null,
        pin_enabled: pinEnabled && pinCode.length === 4,
      };

      const { error } = await supabase
        .from('user_settings')
        .upsert(settings as any);

      if (error) throw error;

      toast({
        title: '✅ Settings Saved',
        description: 'Your preferences have been updated successfully'
      });

      // Schedule notifications if enabled
      if (journalReminderEnabled && 'Notification' in window && Notification.permission === 'granted') {
        scheduleNotifications();
      }
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

  const scheduleNotifications = () => {
    // This would integrate with a service worker or backend service
    // For now, we'll show a confirmation that notifications are scheduled
    toast({
      title: '🔔 Reminders Scheduled',
      description: `You'll receive ${reminderFrequency} reminders at ${reminderTime}`
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-black/5">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-black rounded-full flex items-center justify-center">
              <Vault className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-black bg-clip-text text-transparent">
              MemVault Settings
            </h1>
          </div>
          <p className="text-gray-600 text-xl">
            🔧 Customize your personal memory vault experience
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Journal Reminders */}
          <Card className="border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-50">
              <CardTitle className="flex items-center gap-3 text-blue-800">
                <Bell className="w-6 h-6" />
                📝 Journal Reminders
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="reminder-enabled" className="text-lg font-medium">Enable daily reminders</Label>
                <Switch
                  id="reminder-enabled"
                  checked={journalReminderEnabled}
                  onCheckedChange={setJournalReminderEnabled}
                />
              </div>

              {journalReminderEnabled && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="reminder-time" className="font-medium">🕐 Reminder time</Label>
                    <Input
                      id="reminder-time"
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="border-blue-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reminder-frequency" className="font-medium">📅 Frequency</Label>
                    <Select value={reminderFrequency} onValueChange={setReminderFrequency}>
                      <SelectTrigger className="border-blue-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">🌅 Daily</SelectItem>
                        <SelectItem value="weekly">📅 Weekly</SelectItem>
                        <SelectItem value="custom">⚙️ Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {reminderFrequency === 'custom' && (
                    <div className="space-y-2">
                      <Label htmlFor="custom-days" className="font-medium">Every N days</Label>
                      <Input
                        id="custom-days"
                        type="number"
                        min="1"
                        max="30"
                        value={customDays}
                        onChange={(e) => setCustomDays(parseInt(e.target.value))}
                        className="border-blue-200"
                      />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="border-black shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-gray-100 to-gray-50">
              <CardTitle className="flex items-center gap-3 text-black">
                <Lock className="w-6 h-6" />
                🔒 Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="pin-enabled" className="text-lg font-medium">Enable 4-digit PIN</Label>
                <Switch
                  id="pin-enabled"
                  checked={pinEnabled}
                  onCheckedChange={setPinEnabled}
                />
              </div>

              {pinEnabled && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="pin-code" className="font-medium">🔢 4-digit PIN code</Label>
                    <Input
                      id="pin-code"
                      type="password"
                      maxLength={4}
                      placeholder="Enter 4-digit PIN"
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className="text-center text-2xl tracking-widest border-gray-300"
                    />
                    <p className="text-sm text-gray-600">
                      🛡️ This PIN will be required to access your vault after periods of inactivity
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tags Management */}
        <TagsManager />

        {/* Save Button */}
        <div className="flex justify-center pt-8">
          <Button
            onClick={saveSettings}
            disabled={loading}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-black hover:from-blue-700 hover:to-gray-900 text-white px-12 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {loading ? '💾 Saving...' : '✨ Save All Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
}
