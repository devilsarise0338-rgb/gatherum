import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useData, Registration } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import { RegistrationService } from "../services/api";
import { CheckCircle, AlertTriangle, ArrowLeft, Search, User, QrCode } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import SkeletonLoader from "./SkeletonLoader";
import ErrorState from "./ErrorState";

export default function OrganizerCheckinPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { events, checkInUser } = useData();
  const { user } = useAuth();
  
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; name?: string; duplicate?: boolean } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    if (eventId) {
      RegistrationService.getRegistrationsForOrganizer(eventId)
        .then(data => {
          setRegistrations(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setError(true);
          setLoading(false);
        });
    }
  }, [eventId]);
  // We'll search across all registrations.
  
  const handleScan = (detectedCodes: any[]) => {
    if (detectedCodes.length > 0) {
      const qrValue = detectedCodes[0].rawValue;
      if (qrValue) {
        processCheckIn(qrValue);
      }
    }
  };

  const processCheckIn = async (ticketId: string) => {
    const result = await checkInUser(ticketId);
    setScanResult({
      success: result.success,
      message: result.message,
      name: result.attendeeName,
      duplicate: result.alreadyCheckedIn
    });
    
    // Update local state to reflect attendance instantly
    if (result.success) {
      setRegistrations(prev => prev.map(r => r.ticketId === ticketId ? { ...r, attended: true } : r));
    }

    // Clear result after 3 seconds
    setTimeout(() => {
      setScanResult(null);
    }, 3000);
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    const reg = registrations.find(r => 
      r.ticketId === searchQuery || (r.studentEmail || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (reg && reg.ticketId) {
      processCheckIn(reg.ticketId);
    } else {
      setScanResult({
        success: false,
        message: "No registration found."
      });
      setTimeout(() => setScanResult(null), 3000);
    }
    setSearchQuery("");
  };

  const attendedCount = registrations.filter(r => r.attended).length;
  const totalCount = registrations.length;

  return (
    <div className="fixed inset-0 z-[100] bg-bg-light dark:bg-bg-dark text-gray-900 dark:text-white flex flex-col overflow-y-auto">
      <header className="bg-surface-light dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 p-4 sticky top-0 z-10 flex items-center justify-between">
        <Link to={user?.role === 'organizer' ? "/organizer" : "/student"} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold">Fast Check-in</h1>
        <div className="px-4 py-1.5 bg-primary/10 text-primary rounded-full font-bold">
          {attendedCount} / {totalCount}
        </div>
      </header>

      <div className="flex-1 max-w-lg w-full mx-auto p-4 flex flex-col gap-6 w-full">
        {error ? (
          <ErrorState 
            title="Failed to load check-in" 
            message="There was a problem connecting to the server. Please try refreshing."
            onRetry={() => window.location.reload()}
          />
        ) : loading ? (
          <div className="space-y-6">
            <SkeletonLoader type="card" className="aspect-[4/3] w-full" />
            <SkeletonLoader type="card" className="h-24 w-full" />
          </div>
        ) : (
          <>
        {/* Scanner View */}
        {/* Scanner View */}
        <div 
          className="bg-black rounded-3xl overflow-hidden aspect-[4/3] relative shadow-lg flex items-center justify-center"
          role="region"
          aria-label="QR Code Scanner"
        >
          {showScanner ? (
            <>
              <Scanner 
                onScan={handleScan}
                components={{
                  tracker: true as any
                }}
              />
              <div className="absolute top-4 left-4 right-4 text-center z-10">
                <span className="bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-md">
                  Point at Ticket QR
                </span>
              </div>
              <button 
                onClick={() => setShowScanner(false)}
                className="absolute bottom-4 right-4 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-md z-10"
              >
                Close Scanner
              </button>
            </>
          ) : (
            <button 
              onClick={() => setShowScanner(true)}
              className="flex flex-col items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <QrCode className="w-12 h-12" />
              <span>Tap to Open Scanner</span>
            </button>
          )}
        </div>

        {/* Scan Result Overlay/Banner */}
        <AnimatePresence>
          {scanResult && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`p-4 rounded-2xl shadow-lg border flex items-start gap-4 ${
                scanResult.success 
                  ? "bg-green-100 border-green-200 dark:bg-green-900/30 dark:border-green-800" 
                  : scanResult.duplicate
                    ? "bg-yellow-100 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800"
                    : "bg-red-100 border-red-200 dark:bg-red-900/30 dark:border-red-800"
              }`}
            >
              <div className="shrink-0 mt-1 relative">
                {scanResult.success ? (
                  <>
                    <motion.div
                      initial={{ scale: 0, opacity: 1 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="absolute inset-0 bg-green-500 rounded-full"
                    />
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 20, delay: 0.1 }}
                      className="relative z-10"
                    >
                      <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 rounded-full" />
                    </motion.div>
                  </>
                ) : (
                  <motion.div
                    initial={{ x: -10 }}
                    animate={{ x: [0, -10, 10, -10, 10, 0] }}
                    transition={{ duration: 0.4 }}
                  >
                    <AlertTriangle className={`w-8 h-8 ${scanResult.duplicate ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`} />
                  </motion.div>
                )}
              </div>
              <div className="flex-1">
                <h3 className={`font-bold text-lg ${
                  scanResult.success ? "text-green-900 dark:text-green-100" :
                  scanResult.duplicate ? "text-yellow-900 dark:text-yellow-100" : "text-red-900 dark:text-red-100"
                }`}>
                  {scanResult.message}
                </h3>
                {scanResult.name && (
                  <p className={`text-sm ${
                    scanResult.success ? "text-green-700 dark:text-green-300" :
                    scanResult.duplicate ? "text-yellow-700 dark:text-yellow-300" : "text-red-700 dark:text-red-300"
                  }`}>
                    {scanResult.name}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Manual Lookup */}
        <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm mt-auto">
          <h2 className="font-bold mb-4">Manual Search</h2>
          <form onSubmit={handleManualSearch} className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Name, email, or Ticket ID"
                className="w-full pl-10 pr-3 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-bg-dark focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>
            <button 
              type="submit"
              className="px-6 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
            >
              Find
            </button>
          </form>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
