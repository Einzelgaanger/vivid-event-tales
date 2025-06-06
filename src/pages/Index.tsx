
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { 
  Vault, 
  BookOpen, 
  Calendar, 
  FileText, 
  Lock, 
  Bell, 
  Music, 
  Share2, 
  Mic, 
  Tag, 
  Trophy,
  Shield,
  Smartphone,
  Star,
  Heart,
  Target
} from "lucide-react";

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-black flex items-center justify-center">
        <div className="text-center text-white">
          <Vault className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    {
      icon: BookOpen,
      title: "Digital Journal",
      description: "Capture life's precious moments with our intuitive journaling system. Add photos, videos, audio recordings, and rate your memories."
    },
    {
      icon: Calendar,
      title: "Event Management",
      description: "Plan and track important events with smart reminders, countdown timers, and collaboration features."
    },
    {
      icon: FileText,
      title: "Quick Notes",
      description: "Store ideas, thoughts, and important information in organized, searchable notes."
    },
    {
      icon: Lock,
      title: "PIN Security",
      description: "Add an extra layer of security with 4-digit PIN protection for your private memories."
    },
    {
      icon: Bell,
      title: "Smart Reminders",
      description: "Never forget to journal with customizable reminder notifications and scheduling."
    },
    {
      icon: Music,
      title: "Spotify Integration",
      description: "Attach 30-second song previews to your memories for an immersive experience."
    },
    {
      icon: Mic,
      title: "Voice Recording",
      description: "Record audio directly in the app or upload audio files for voice journaling."
    },
    {
      icon: Trophy,
      title: "Gamified Streaks",
      description: "Build journaling habits with streak tracking and earn points for consistency."
    },
    {
      icon: Share2,
      title: "Memory Sharing",
      description: "Share special moments and events with friends and family securely."
    },
    {
      icon: Tag,
      title: "Smart Tags",
      description: "Organize your content with customizable tags for easy categorization and searching."
    },
    {
      icon: Shield,
      title: "High-Level Encryption",
      description: "Your data is protected with enterprise-grade encryption and security measures."
    },
    {
      icon: Smartphone,
      title: "Mobile Optimized",
      description: "Seamless experience across all devices with responsive design and mobile-first approach."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-black text-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-6xl mx-auto">
          <div className="mb-8">
            <Vault className="w-24 h-24 mx-auto mb-6 text-blue-200 animate-pulse" />
            <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              MemVault
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Your personal digital vault for memories, events, and notes. 
              Capture life's moments with advanced features and uncompromising security.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-4 rounded-full font-semibold transform transition hover:scale-105"
              onClick={() => window.location.href = '/auth'}
            >
              Start Your Journey
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4 rounded-full font-semibold transform transition hover:scale-105"
              onClick={() => window.location.href = '/auth'}
            >
              Learn More
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <Heart className="w-12 h-12 mx-auto mb-4 text-red-400" />
              <h3 className="text-3xl font-bold mb-2">Memories</h3>
              <p className="text-blue-200">Preserve your precious moments</p>
            </div>
            <div className="text-center">
              <Target className="w-12 h-12 mx-auto mb-4 text-green-400" />
              <h3 className="text-3xl font-bold mb-2">Events</h3>
              <p className="text-blue-200">Never miss important dates</p>
            </div>
            <div className="text-center">
              <Star className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
              <h3 className="text-3xl font-bold mb-2">Secure</h3>
              <p className="text-blue-200">Enterprise-grade protection</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white text-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-black bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to capture, organize, and protect your digital life
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-blue-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <feature.icon className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                  <h3 className="text-xl font-semibold mb-3 text-blue-800">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-50 to-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-16 bg-gradient-to-r from-blue-600 to-black bg-clip-text text-transparent">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto text-2xl font-bold">1</div>
              <h3 className="text-2xl font-semibold text-blue-800">Sign Up</h3>
              <p className="text-gray-600">Create your secure MemVault account in seconds with OAuth authentication</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto text-2xl font-bold">2</div>
              <h3 className="text-2xl font-semibold text-blue-800">Capture</h3>
              <p className="text-gray-600">Start journaling, planning events, and storing notes with our intuitive interface</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto text-2xl font-bold">3</div>
              <h3 className="text-2xl font-semibold text-blue-800">Enjoy</h3>
              <p className="text-gray-600">Build streaks, share memories, and keep your digital life organized and secure</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <Vault className="w-20 h-20 mx-auto mb-8 text-blue-200" />
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Your Digital Journey?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of users who trust MemVault with their precious memories and important moments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-12 py-4 rounded-full font-semibold transform transition hover:scale-105"
              onClick={() => window.location.href = '/auth'}
            >
              Get Started Free
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-black text-gray-400">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <Vault className="w-8 h-8 mr-2 text-blue-400" />
            <span className="text-xl font-semibold text-white">MemVault</span>
          </div>
          <p className="mb-4">Your secure digital vault for life's precious moments</p>
          <p className="text-sm">© 2024 MemVault. All rights reserved. Built with security and privacy in mind.</p>
        </div>
      </footer>
    </div>
  );
}
