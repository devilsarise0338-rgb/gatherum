import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AuthService } from '../services/api';
import { Check, ArrowRight, User } from 'lucide-react';

export const ProfileCompletionPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [fullName, setFullName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [branch, setBranch] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await AuthService.completeProfile({
        fullName,
        rollNumber,
        branch,
        yearOfStudy: parseInt(yearOfStudy),
        phoneNumber: phoneNumber || null,
      });
      await refreshUser();
      
      const from = location.state?.from?.pathname || '/my-events';
      navigate(from, { replace: true });
    } catch (error) {
      console.error(error);
      alert('Failed to complete profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4 py-12 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-10 right-10 w-48 h-48 bg-neon-blue border-sharpie rounded-full transform translate-x-1/4 -translate-y-1/4 -z-10"></div>
      
      <div className="max-w-xl w-full bg-white border-sharpie shadow-sharpie p-8 space-y-8 relative">
        <div className="absolute -top-4 -left-4 bg-neon-yellow text-ink px-4 py-2 font-black uppercase text-sm border-sharpie transform -rotate-3">
          MANDATORY STEP
        </div>

        <div className="space-y-4">
          <h1 className="font-display text-4xl sm:text-5xl font-black text-ink uppercase leading-none">
            COMPLETE YOUR PROFILE
          </h1>
          <p className="text-ink font-bold bg-paper border-sharpie px-3 py-2 inline-block shadow-sharpie-sm">
            WE NEED A FEW DETAILS TO SECURE YOUR ACCESS.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="block font-black uppercase text-ink text-sm">FULL NAME *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-paper px-4 py-3 font-bold border-sharpie focus:outline-none focus:bg-neon-yellow focus:text-ink transition-colors uppercase placeholder-ink/30"
              placeholder="e.g. ADA LOVELACE"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block font-black uppercase text-ink text-sm">ROLL NUMBER *</label>
              <input
                type="text"
                required
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="w-full bg-paper px-4 py-3 font-bold border-sharpie focus:outline-none focus:bg-neon-blue focus:text-white transition-colors uppercase placeholder-ink/30"
                placeholder="e.g. 21CS001"
              />
            </div>
            
            <div className="space-y-1">
              <label className="block font-black uppercase text-ink text-sm">BRANCH *</label>
              <select
                required
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full bg-paper px-4 py-3 font-bold border-sharpie focus:outline-none focus:bg-neon-pink focus:text-white transition-colors uppercase"
              >
                <option value="" disabled>SELECT BRANCH</option>
                <option value="CSE">COMPUTER SCIENCE</option>
                <option value="IT">IT</option>
                <option value="ECE">ELECTRONICS</option>
                <option value="EE">ELECTRICAL</option>
                <option value="ME">MECHANICAL</option>
                <option value="CE">CIVIL</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block font-black uppercase text-ink text-sm">YEAR OF STUDY *</label>
              <select
                required
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(e.target.value)}
                className="w-full bg-paper px-4 py-3 font-bold border-sharpie focus:outline-none focus:bg-neon-yellow focus:text-ink transition-colors uppercase"
              >
                <option value="1">1ST YEAR</option>
                <option value="2">2ND YEAR</option>
                <option value="3">3RD YEAR</option>
                <option value="4">4TH YEAR</option>
                <option value="5">ALUMNI / OTHER</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="block font-black uppercase text-ink text-sm">PHONE NUMBER</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-paper px-4 py-3 font-bold border-sharpie focus:outline-none focus:bg-neon-blue focus:text-white transition-colors uppercase placeholder-ink/30"
                placeholder="OPTIONAL"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-ink text-white font-black uppercase text-xl border-sharpie shadow-sharpie hover-sharpie-lift transition-all flex items-center justify-center gap-3 hover:bg-neon-pink hover:text-white disabled:opacity-50"
          >
            {isSubmitting ? 'SAVING...' : 'FINISH PROFILE'} <ArrowRight className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
};
