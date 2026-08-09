import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { QrCode, Calendar, Ticket, ChevronRight, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { pageTransition, successAnimation } from "../utils/motion";

const ONBOARDING_STEPS = [
  {
    title: "Welcome to Gatherum",
    description: "Your new campus event hub. Let's quickly show you how to get around.",
    icon: Calendar,
    color: "text-blue-500",
    bg: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    title: "Find & Register",
    description: "Browse the events page to find what's happening. Register with one tap, or join a waitlist if it's full.",
    icon: Ticket,
    color: "text-purple-500",
    bg: "bg-purple-100 dark:bg-purple-900/30",
  },
  {
    title: "QR Code Check-in",
    description: "Once registered, you'll get a QR ticket. Present it to the organizer at the door to check in instantly.",
    icon: QrCode,
    color: "text-primary",
    bg: "bg-primary/10",
  }
];

export default function StudentOnboarding() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!user) return;
    const key = `gatherum_onboarded_${user.email}`;
    if (localStorage.getItem(key) !== "true") {
      setIsOpen(true);
    }
  }, [user]);

  const handleClose = () => {
    if (user) {
      localStorage.setItem(`gatherum_onboarded_${user.email}`, "true");
    }
    setIsOpen(false);
  };

  const nextStep = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  if (!isOpen) return null;

  const step = ONBOARDING_STEPS[currentStep];
  const Icon = step.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-white dark:bg-surface-dark rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 relative"
            role="dialog"
            aria-modal="true"
            aria-labelledby="onboarding-title"
          >
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-full z-10"
              aria-label="Skip onboarding"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="p-8 text-center relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center"
                >
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 ${step.bg}`}>
                    <Icon className={`w-10 h-10 ${step.color}`} />
                  </div>
                  <h2 id="onboarding-title" className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {step.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="p-6 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex gap-2">
                {ONBOARDING_STEPS.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-2 rounded-full transition-all duration-300 ${i === currentStep ? 'w-6 bg-primary' : 'w-2 bg-gray-300 dark:bg-gray-600'}`}
                    aria-hidden="true"
                  />
                ))}
              </div>
              
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-bg-dark"
              >
                {currentStep === ONBOARDING_STEPS.length - 1 ? "Get Started" : "Next"}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
