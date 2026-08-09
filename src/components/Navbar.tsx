import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Ticket } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 text-primary">
            <Ticket className="w-8 h-8" />
            <span className="font-heading font-bold text-2xl tracking-tight">Gatherum</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link 
                  to={`/${user.role}`}
                  className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
                <button 
                  onClick={logout}
                  className="px-4 py-2 text-sm font-semibold rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link 
                to="/login"
                className="px-5 py-2 text-sm font-semibold rounded-full bg-primary text-white hover:bg-primary-hover transition-colors shadow-sm"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
