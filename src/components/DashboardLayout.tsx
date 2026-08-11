import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { 
  Home, 
  Calendar, 
  Ticket, 
  Settings, 
  Users, 
  BarChart,
  LogOut
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const navItems = {
    student: [
      { name: "Discover", path: "/student", icon: Home },
      { name: "My Tickets", path: "/student/tickets", icon: Ticket },
      { name: "Settings", path: "/settings", icon: Settings },
    ],
    organizer: [
      { name: "Overview", path: "/organizer", icon: BarChart },
      { name: "Settings", path: "/settings", icon: Settings },
    ],
    admin: [
      { name: "Dashboard", path: "/admin", icon: BarChart },
      { name: "System Settings", path: "/settings", icon: Settings },
    ]
  };

  const currentNav = navItems[user.role] || [];

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-bg-light dark:bg-bg-dark transition-colors relative z-0">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
      {/* Sidebar */}
      <aside className="w-64 hidden md:flex flex-col bg-surface-light dark:bg-surface-dark border-r border-gray-200 dark:border-gray-800 p-6" aria-label="Sidebar navigation">
        <div className="mb-8 px-4" aria-live="polite">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            Logged in as
          </p>
          <p className="font-bold text-gray-900 dark:text-white capitalize truncate" aria-label={`Role: ${user.role}`}>
            {user.role}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1" aria-label={`Email: ${user.email}`}>
            {user.email}
          </p>
        </div>

        <nav className="flex-1 space-y-2" aria-label="Main Navigation">
          {currentNav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-bg-dark ${
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="pt-8 mt-8 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={logout}
            aria-label="Sign Out"
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-bg-dark"
          >
            <LogOut className="w-5 h-5" aria-hidden="true" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-10" id="main-content" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
