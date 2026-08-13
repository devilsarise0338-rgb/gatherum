import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AuthService } from '../services/api';
import { Settings, User, Shield, LogOut, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { ImageUpload } from '../components/common/ImageUpload';

export const ProfileSettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [publicRsvp, setPublicRsvp] = useState(false);

  useEffect(() => {
    if (user) {
      AuthService.getProfile(user.id).then(data => {
        setProfile(data);
        setPublicRsvp(data.public_rsvp ?? false);
      });
    }
  }, [user]);

  const handleTogglePrivacy = async () => {
    setIsUpdating(true);
    try {
      await AuthService.updateProfilePrivacy(!publicRsvp);
      setPublicRsvp(!publicRsvp);
    } catch (e) {
      console.error(e);
      alert('Failed to update privacy settings.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarUpload = async (file: File | null) => {
    if (!file || !user) return;
    setIsUpdating(true);
    try {
      const newUrl = await StorageService.uploadImage(file, 'avatars', user.id, profile.avatar_url);
      await AuthService.updateProfileAvatar(newUrl);
      setProfile({ ...profile, avatar_url: newUrl });
    } catch (err) {
      console.error("Avatar upload failed:", err);
      alert("Failed to upload avatar.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <h2 className="font-display text-2xl font-black uppercase tracking-widest text-ink animate-pulse">LOADING PROFILE...</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      <div className="space-y-4 border-b-sharpie pb-6">
        <div className="flex items-center gap-3 text-neon-pink">
          <Settings className="w-8 h-8" />
          <h1 className="font-display text-4xl sm:text-5xl font-black text-ink uppercase leading-none">
            ACCOUNT SETTINGS
          </h1>
        </div>
        <p className="text-ink font-bold uppercase tracking-widest text-sm">
          MANAGE YOUR IDENTITY AND PREFERENCES.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Profile Info Block */}
        <div className="bg-white border-sharpie shadow-sharpie p-6 space-y-6">
          <div className="flex items-center gap-2 border-b-sharpie pb-4">
            <User className="w-6 h-6 text-neon-blue" />
            <h2 className="font-display text-2xl font-black uppercase text-ink">PERSONAL LOG</h2>
            {isUpdating && <span className="ml-auto text-xs font-black bg-neon-yellow px-2 py-1 uppercase animate-pulse">UPDATING...</span>}
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <div className="w-32 h-32 shrink-0">
                <ImageUpload
                  label="AVATAR"
                  defaultImage={profile.avatar_url || 'https://images.unsplash.com/photo-1555431189-0af56b2ac1bb?auto=format&fit=crop&q=80&w=200'}
                  maxSizeMB={5}
                  onFileSelect={(file) => {
                    if (file) handleAvatarUpload(file);
                  }}
                  className="w-full h-full"
                />
              </div>
              <div className="space-y-4 flex-1">
                <div>
                  <p className="text-xs font-black uppercase text-ink/60">FULL NAME</p>
                  <p className="text-lg font-bold text-ink uppercase">{profile.full_name}</p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase text-ink/60">EMAIL (RESTRICTED)</p>
                  <p className="text-lg font-bold text-ink uppercase">{profile.email}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-black uppercase text-ink/60">ROLL NUMBER</p>
                <p className="text-lg font-bold text-ink uppercase">{profile.roll_number}</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase text-ink/60">BRANCH / YEAR</p>
                <p className="text-lg font-bold text-ink uppercase">{profile.branch} • Y{profile.year_of_study}</p>
              </div>
            </div>
          </div>
          
          <div className="pt-4 mt-4 border-t-sharpie">
            <p className="text-xs font-bold text-ink/60 uppercase">PROFILE DATA IS READ-ONLY TO MAINTAIN INTEGRITY. CONTACT ARCHIVIST FOR CHANGES.</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Privacy & Role Block */}
          <div className="bg-paper border-sharpie shadow-sharpie-sm p-6 space-y-6">
            <div className="flex items-center justify-between border-b-sharpie pb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-neon-yellow" />
                <h2 className="font-display text-2xl font-black uppercase text-ink">SECURITY & ACCESS</h2>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-black uppercase text-ink text-sm">CURRENT CLEARANCE</p>
                  <p className="text-xs font-bold text-ink/70 uppercase">YOUR SYSTEM ROLE</p>
                </div>
                <span className={`px-3 py-1 font-black text-xs uppercase border-sharpie ${
                  user?.role === 'admin' ? 'bg-neon-pink text-white' : 
                  user?.role === 'organizer' ? 'bg-neon-blue text-white' : 'bg-white text-ink'
                }`}>
                  {user?.role} LEVEL
                </span>
              </div>

              <div className="border-t-sharpie pt-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-black uppercase text-ink text-sm">PUBLIC RSVP LOG</p>
                  <p className="text-xs font-bold text-ink/70 uppercase max-w-[200px]">ALLOW OTHER GUESTS TO SEE YOUR ATTENDANCE AT EVENTS.</p>
                </div>
                <button
                  onClick={handleTogglePrivacy}
                  disabled={isUpdating}
                  className={`w-14 h-8 border-sharpie flex items-center p-1 transition-colors ${
                    publicRsvp ? 'bg-neon-blue justify-end' : 'bg-white justify-start'
                  }`}
                >
                  <div className={`w-5 h-5 border-sharpie bg-ink ${publicRsvp ? 'bg-white' : 'bg-ink'}`}></div>
                </button>
              </div>
            </div>
          </div>

          {/* Action Block */}
          <button 
            onClick={handleLogout}
            className="w-full bg-ink text-white p-4 font-black uppercase text-lg border-sharpie shadow-sharpie hover-sharpie-lift hover:bg-neon-pink transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" /> TERMINATE SESSION
          </button>
        </div>
      </div>
    </div>
  );
};
