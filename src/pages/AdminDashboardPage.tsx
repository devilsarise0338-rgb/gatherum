import React, { useState } from 'react';
import { useAuth, User, Role } from '../contexts/AuthContext';
import { ShieldAlert, Users, Settings, UserX, UserCheck, Shield, Key } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { user: currentUser, users, toggleUserBan, updateUserRole, settings, updateSettings } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'settings'>('users');
  const [search, setSearch] = useState('');

  // Safeguard: Current admin cannot ban themselves or change their own role
  const isSelf = (userId: string) => currentUser?.id === userId;

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleRoleChange = async (userId: string, newRole: Role) => {
    if (isSelf(userId)) return alert("You cannot change your own role.");
    if (window.confirm(`Are you sure you want to promote/demote this user to ${newRole.toUpperCase()}?`)) {
      await updateUserRole(userId, newRole);
    }
  };

  const handleBanToggle = async (userId: string, currentBanStatus: boolean) => {
    if (isSelf(userId)) return alert("You cannot ban yourself.");
    const action = currentBanStatus ? 'unban' : 'ban';
    if (window.confirm(`Are you sure you want to ${action} this user?`)) {
      await toggleUserBan(userId, currentBanStatus);
    }
  };

  const handleToggleSignups = async () => {
    await updateSettings({ ...settings, allowGlobalSignups: !settings.allowGlobalSignups });
  };

  const handleToggleMaintenance = async () => {
    if (!settings.maintenanceMode) {
      if (!window.confirm("WARNING: Activating maintenance mode will block all non-admin users. Proceed?")) return;
    }
    await updateSettings({ ...settings, maintenanceMode: !settings.maintenanceMode });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      <div className="space-y-4 border-b-sharpie pb-6">
        <div className="flex items-center gap-3 text-neon-yellow bg-ink inline-flex px-4 py-2 border-sharpie shadow-sharpie">
          <ShieldAlert className="w-8 h-8" />
          <h1 className="font-display text-3xl font-black text-white uppercase leading-none">
            OVERSEER TERMINAL
          </h1>
        </div>
        <p className="text-ink font-bold uppercase tracking-widest text-sm">
          RESTRICTED ACCESS. SYSTEM ADMINISTRATION ONLY.
        </p>
      </div>

      <div className="flex gap-4 border-b-sharpie pb-4">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-2 font-black uppercase text-sm border-sharpie transition-all ${
            activeTab === 'users' ? 'bg-ink text-neon-yellow shadow-sharpie-sm' : 'bg-white hover:bg-paper'
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" /> CITIZEN REGISTRY
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-6 py-2 font-black uppercase text-sm border-sharpie transition-all ${
            activeTab === 'settings' ? 'bg-ink text-neon-yellow shadow-sharpie-sm' : 'bg-white hover:bg-paper'
          }`}
        >
          <Settings className="w-4 h-4 inline mr-2" /> PROTOCOL SETTINGS
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="space-y-6">
          <input
            type="text"
            placeholder="SEARCH BY EMAIL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md bg-white px-4 py-3 font-bold border-sharpie focus:outline-none focus:ring-2 focus:ring-neon-blue shadow-sharpie-sm uppercase"
          />

          <div className="bg-white border-sharpie shadow-sharpie overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-ink text-white font-black uppercase tracking-wider text-xs">
                <tr>
                  <th className="p-4 border-b-sharpie">IDENTIFIER</th>
                  <th className="p-4 border-b-sharpie">CLEARANCE LEVEL</th>
                  <th className="p-4 border-b-sharpie">STATUS</th>
                  <th className="p-4 border-b-sharpie text-right">DIRECTIVES</th>
                </tr>
              </thead>
              <tbody className="divide-y-sharpie">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-neon-yellow/20 transition-colors">
                    <td className="p-4 font-bold text-ink">{u.email} {isSelf(u.id) && '(YOU)'}</td>
                    <td className="p-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                        disabled={isSelf(u.id)}
                        className={`bg-white border-sharpie font-black text-xs px-2 py-1 uppercase outline-none focus:ring-2 focus:ring-neon-blue ${isSelf(u.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <option value="student">STUDENT</option>
                        <option value="organizer">ORGANIZER</option>
                        <option value="admin">ADMIN</option>
                      </select>
                    </td>
                    <td className="p-4">
                      {u.isBanned ? (
                        <span className="bg-neon-pink text-white px-2 py-1 text-xs font-black uppercase border-sharpie inline-flex items-center gap-1">
                          <UserX className="w-3 h-3" /> BANNED
                        </span>
                      ) : (
                        <span className="bg-neon-blue text-white px-2 py-1 text-xs font-black uppercase border-sharpie inline-flex items-center gap-1">
                          <UserCheck className="w-3 h-3" /> ACTIVE
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleBanToggle(u.id, u.isBanned)}
                        disabled={isSelf(u.id)}
                        className={`px-3 py-1 text-xs font-black uppercase border-sharpie transition-colors ${
                          isSelf(u.id) ? 'opacity-50 cursor-not-allowed bg-paper text-ink/50' :
                          u.isBanned ? 'bg-white text-ink hover:bg-neon-blue hover:text-white' : 'bg-white text-ink hover:bg-neon-pink hover:text-white'
                        }`}
                      >
                        {u.isBanned ? 'RESTORE ACCESS' : 'REVOKE ACCESS'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="bg-white border-sharpie shadow-sharpie-sm p-6 space-y-4 hover:bg-neon-yellow transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-black text-ink uppercase text-xl">GLOBAL REGISTRATION</h3>
                <p className="text-xs font-bold text-ink/70 uppercase mt-1">ALLOW NEW USERS TO JOIN THE PLATFORM.</p>
              </div>
              <button
                onClick={handleToggleSignups}
                className={`w-14 h-8 border-sharpie flex items-center p-1 transition-colors ${
                  settings.allowGlobalSignups ? 'bg-neon-blue justify-end' : 'bg-ink justify-start'
                }`}
              >
                <div className="w-5 h-5 border-sharpie bg-white"></div>
              </button>
            </div>
            <div className="pt-4 border-t-sharpie">
              <span className={`px-2 py-1 text-xs font-black uppercase border-sharpie text-white ${settings.allowGlobalSignups ? 'bg-neon-blue' : 'bg-neon-pink'}`}>
                {settings.allowGlobalSignups ? 'ENABLED' : 'DISABLED'}
              </span>
            </div>
          </div>

          <div className="bg-white border-sharpie shadow-sharpie-sm p-6 space-y-4 hover:bg-neon-pink group transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-black text-ink uppercase text-xl group-hover:text-white">MAINTENANCE MODE</h3>
                <p className="text-xs font-bold text-ink/70 uppercase mt-1 group-hover:text-white/80">LOCK DOWN PLATFORM TO ADMINS ONLY.</p>
              </div>
              <button
                onClick={handleToggleMaintenance}
                className={`w-14 h-8 border-sharpie flex items-center p-1 transition-colors ${
                  settings.maintenanceMode ? 'bg-ink justify-end' : 'bg-paper justify-start'
                }`}
              >
                <div className={`w-5 h-5 border-sharpie ${settings.maintenanceMode ? 'bg-neon-yellow' : 'bg-ink'}`}></div>
              </button>
            </div>
            <div className="pt-4 border-t-sharpie group-hover:border-white">
              <span className={`px-2 py-1 text-xs font-black uppercase border-sharpie ${settings.maintenanceMode ? 'bg-ink text-neon-yellow' : 'bg-white text-ink'}`}>
                {settings.maintenanceMode ? 'ACTIVE - LOCKED DOWN' : 'INACTIVE'}
              </span>
            </div>
          </div>
          
          <div className="bg-paper border-sharpie shadow-sharpie-sm p-6 space-y-4 col-span-1 sm:col-span-2">
             <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-ink" />
                <h3 className="font-black text-ink uppercase text-xl">ALLOWED DOMAIN</h3>
             </div>
             <p className="text-xs font-bold text-ink/70 uppercase">CURRENTLY ENFORCED DOMAIN FOR OAUTH AND MAGIC LINKS.</p>
             <input 
               type="text" 
               disabled 
               value={settings.allowedEmailDomain} 
               className="w-full bg-white px-4 py-3 font-bold border-sharpie text-ink opacity-70 cursor-not-allowed"
             />
             <p className="text-xs font-black text-neon-pink uppercase">HARDCODED FOR SECURITY PURPOSES.</p>
          </div>
        </div>
      )}

    </div>
  );
};
