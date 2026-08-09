import { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon, title, description, actionText, actionHref, onAction }: EmptyStateProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div 
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16 px-4 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl w-full"
      role="region" 
      aria-label="Empty state"
    >
      <div className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-full" aria-hidden="true">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 font-medium mb-6 max-w-md mx-auto">{description}</p>
      
      {actionText && (
        actionHref ? (
          <Link to={actionHref} className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary-hover transition-colors shadow-md shadow-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-bg-dark">
            {actionText}
          </Link>
        ) : (
          <button onClick={onAction} className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary-hover transition-colors shadow-md shadow-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-bg-dark">
            {actionText}
          </button>
        )
      )}
    </motion.div>
  );
}
