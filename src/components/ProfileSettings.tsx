import React, { useState, useEffect } from "react";
import DashboardLayout from "./DashboardLayout";
import { useAuth } from "../contexts/AuthContext";
import { AuthService } from "../services/api";
import { Settings, Shield, User, Save } from "lucide-react";
import toast from "react-hot-toast";
import SkeletonLoader from "./SkeletonLoader";
import ErrorState from "./ErrorState";

export default function ProfileSettings() {
  const { user } = useAuth();
  const [publicRsvp, setPublicRsvp] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      AuthService.getProfile(user.id).then((profile: any) => {
        setPublicRsvp(profile.public_rsvp ?? true);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setError(true);
        setLoading(false);
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await AuthService.updateProfilePrivacy(publicRsvp);
      toast.success("Privacy settings updated");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto py-8 space-y-8">
          <SkeletonLoader type="header" />
          <SkeletonLoader type="card" className="h-[300px]" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto py-8">
          <ErrorState 
            title="Failed to load profile settings" 
            message="There was a problem connecting to the server. Please try refreshing."
            onRetry={() => window.location.reload()}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto py-8">
        <header className="mb-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
            <p className="text-gray-500">Manage your account preferences and privacy</p>
          </div>
        </header>

        <div className="bg-white dark:bg-surface-dark rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-8">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h2 className="font-bold text-xl text-gray-900 dark:text-white">{user?.email}</h2>
              <p className="text-gray-500 capitalize">{user?.role} Account</p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" /> Privacy Settings
            </h3>
            
            <label className="flex items-start gap-4 cursor-pointer group p-4 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-primary/50 transition-colors">
              <div className="relative flex items-center mt-1">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={publicRsvp}
                  onChange={(e) => setPublicRsvp(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/80 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
              </div>
              <div>
                <span className="font-bold text-gray-900 dark:text-white block mb-1">Make RSVPs Public</span>
                <span className="text-sm text-gray-500">
                  When enabled, your profile picture will be shown in the "Who's going" section of events you register for.
                </span>
              </div>
            </label>
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" /> {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
