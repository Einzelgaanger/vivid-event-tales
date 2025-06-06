
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
import { Settings, Bell, Lock, Tag, User } from 'lucide-react';

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
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user?.id)
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
        .upsert(settings);

      if (error) throw error;

      toast({
        title: 'Settings Saved',
        description: 'Your preferences have been updated successfully'
      });

      // Request notification permission if reminders are enabled
      if (journalReminderEnabled && 'Notification' in window) {
        await Notification.requestPermission();
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

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-black bg-clip-text text-transparent">
          MemVault Settings
        </h1>
        <p className="text-gray-600 text-lg">
          Customize your experience and security preferences
        </p>
      </div>

      {/* Journal Reminders */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Bell className="w-5 h-5" />
            Journal Reminders
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="reminder-enabled">Enable journal reminders</Label>
            <Switch
              id="reminder-enabled"
              checked={journalReminderEnabled}
              onCheckedChange={setJournalReminderEnabled}
            />
          </div>

          {journalReminderEnabled && (
            <>
              <div className="space-y-2">
                <Label htmlFor="reminder-time">Reminder time</Label>
                <Input
                  id="reminder-time"
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reminder-frequency">Frequency</Label>
                <Select value={reminderFrequency} onValueChange={setReminderFrequency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {reminderFrequency === 'custom' && (
                <div className="space-y-2">
                  <Label htmlFor="custom-days">Every N days</Label>
                  <Input
                    id="custom-days"
                    type="number"
                    min="1"
                    max="30"
                    value={customDays}
                    onChange={(e) => setCustomDays(parseInt(e.target.value))}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="border-black">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black">
            <Lock className="w-5 h-5" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="pin-enabled">Enable 4-digit PIN</Label>
            <Switch
              id="pin-enabled"
              checked={pinEnabled}
              onCheckedChange={setPinEnabled}
            />
          </div>

          {pinEnabled && (
            <div className="space-y-2">
              <Label htmlFor="pin-code">4-digit PIN code</Label>
              <Input
                id="pin-code"
                type="password"
                maxLength={4}
                placeholder="Enter 4-digit PIN"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
              />
              <p className="text-sm text-gray-500">
                This PIN will be required to access your vault after periods of inactivity
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={saveSettings}
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-black hover:from-blue-700 hover:to-gray-900"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
