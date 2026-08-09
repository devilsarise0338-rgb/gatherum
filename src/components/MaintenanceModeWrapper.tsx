import { ReactNode } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Wrench } from "lucide-react";

export default function MaintenanceModeWrapper({ children }: { children: ReactNode }) {
  const { settings, user } = useAuth();

  if (settings.maintenanceMode && user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
          <Wrench className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">We'll be right back</h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
          Gatherum is currently undergoing scheduled maintenance. Please check back later!
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
