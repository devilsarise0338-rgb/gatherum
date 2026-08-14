import React, { useState } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { useAuth, Role } from '../../contexts/AuthContext';

const AdminUserManagement: React.FC = () => {
  const { users, updateUserRole, toggleUserBan } = useAuth();
  
  const handleRoleChange = (id: string, newRole: Role) => {
    updateUserRole(id, newRole);
  };

  const handleToggleBan = (id: string, currentBanStatus: boolean) => {
    if (window.confirm(`Are you sure you want to ${currentBanStatus ? 'unban' : 'ban'} this user?`)) {
      toggleUserBan(id, currentBanStatus);
    }
  };

  const tableData = users.map(u => ({
    id: u.id,
    name: u.email,
    role: (
      <select 
        value={u.role}
        onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
        className="bg-surface border-2 border-grid-line px-2 py-1 uppercase text-sm font-label-caps focus:outline-none focus:border-primary"
      >
        <option value="student">Student</option>
        <option value="organizer">Organizer</option>
        <option value="admin">Admin</option>
      </select>
    ),
    status: (
      <div className="flex gap-2 items-center">
        {u.isBanned ? (
          <span className="text-error font-label-caps uppercase border border-error px-2 py-1 text-xs">Banned</span>
        ) : (
          <span className="text-primary font-label-caps uppercase border border-primary px-2 py-1 text-xs">Active</span>
        )}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleToggleBan(u.id, u.isBanned)}
        >
          {u.isBanned ? 'Unban' : 'Ban'}
        </Button>
      </div>
    )
  }));

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary selection:text-on-primary">
      <Navbar />

      <main className="flex-grow pt-32 pb-32 px-6 md:px-16 relative">
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#2A2A2A_1px,transparent_1px),linear-gradient(to_bottom,#2A2A2A_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
        
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <header className="mb-12 flex flex-col md:flex-row justify-between items-end gap-4 border-b-4 border-grid-line pb-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-error text-on-error font-label-caps px-4 py-2 border-2 border-grid-line shadow-[4px_4px_0_0_#2A2A2A] mb-4">
                <span className="w-2 h-2 bg-on-error animate-pulse border border-on-error"></span>
                ADMINISTRATION
              </div>
              <h1 className="font-display-hero text-5xl md:text-7xl text-on-surface uppercase tracking-tight">
                User Management
              </h1>
            </div>
          </header>

          <div className="space-y-8">
            <h2 className="font-subheadline-bold text-3xl uppercase border-l-8 border-error pl-4">All Users</h2>
            {users.length > 0 ? (
              <Table 
                columns={[
                  { key: 'name', header: 'Email' },
                  { key: 'role', header: 'Role' },
                  { key: 'status', header: 'Status' }
                ]}
                data={tableData}
              />
            ) : (
              <div className="text-center p-8 border-2 border-grid-line border-dashed">
                <p className="text-on-surface-variant uppercase font-label-caps tracking-widest">No users found.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminUserManagement;
