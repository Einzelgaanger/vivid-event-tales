
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Settings, Shield, Bell, Tag, User, Mail, Calendar, LogOut, Camera } from 'lucide-react';
import { NotificationManager } from '@/components/notifications/NotificationManager';
import { NotificationService } from '@/components/notifications/NotificationService';
import { TagsManager } from './TagsManager';

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

export function ProfileSettingsPage() {
  // Profile state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);

  // Settings state
  const [pinEnabled, setPinEnabled] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [reminderFrequency, setReminderFrequency] = useState('daily');
  const [notificationsGranted, setNotificationsGranted] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadProfile();
      loadSettings();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id!)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setProfile(data);
        setUsername(data.username || '');
        setFullName(data.full_name || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user?.id!)
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

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id!,
          username: username.trim() || null,
          full_name: fullName.trim() || null,
        });

      if (error) throw error;

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated'
      });
      
      loadProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive'
      });
    } finally {
      setProfileSaving(false);
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

    setSettingsLoading(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user?.id!,
          pin_enabled: pinEnabled,
          pin_code: pinEnabled ? pinCode : null,
          notification_enabled: reminderEnabled,
          notification_time: reminderTime,
          notification_frequency: reminderFrequency,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      if (reminderEnabled && notificationsGranted) {
        NotificationService.scheduleJournalReminder(reminderTime, reminderFrequency);
      }

      toast({
        title: 'Settings Saved',
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
      setSettingsLoading(false);
    }
  };

  const handlePinChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    setPinCode(digits);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out'
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Error',
        description: 'Failed to sign out',
        variant: 'destructive'
      });
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center py-4 md:py-8">
        <h1 className="text-2xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Profile & Settings
        </h1>
        <p className="text-gray-600 text-sm md:text-lg">
          Manage your account and customize your experience
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-16 md:w-20 h-16 md:h-20">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg md:text-xl">
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {profile?.full_name || 'Welcome to MemoryVault!'}
                </h3>
                <p className="text-gray-600 text-sm md:text-base">{user?.email}</p>
                <p className="text-xs md:text-sm text-gray-500">
                  Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recently'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a unique username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                value={user?.email || ''}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">
                Email cannot be changed here. Contact support if needed.
              </p>
            </div>

            <Button
              onClick={handleSaveProfile}
              disabled={profileSaving}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {profileSaving ? 'Saving...' : 'Save Profile'}
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Account Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Account Status</span>
                <span className="text-green-600 font-medium text-sm">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Email Verified</span>
                <span className="text-green-600 font-medium text-sm">Yes</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start text-sm">
                <Mail className="w-4 h-4 mr-2" />
                Update Email
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm">
                <Calendar className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Button
                variant="destructive"
                className="w-full justify-start text-sm"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator className="my-8" />

      {/* Settings Section */}
      <div className="space-y-6">
        <h2 className="text-xl md:text-2xl font-bold">Settings</h2>

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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    Enable browser notifications above to receive reminders
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

        {/* Save Settings Button */}
        <div className="flex justify-end">
          <Button
            onClick={saveSettings}
            disabled={settingsLoading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8"
          >
            {settingsLoading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
}
