import { useReducedMotion } from "motion/react";

interface SkeletonProps {
  type?: "card" | "text" | "header" | "avatar" | "list";
  count?: number;
  className?: string;
}

export default function SkeletonLoader({ type = "text", count = 1, className = "" }: SkeletonProps) {
  const shouldReduceMotion = useReducedMotion();
  const animationClass = shouldReduceMotion ? "" : "animate-pulse";

  const renderSkeleton = () => {
    switch (type) {
      case "card":
        return (
          <div className={`bg-white dark:bg-surface-dark rounded-3xl border border-gray-100 dark:border-gray-800 p-4 ${className}`}>
            <div className={`w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-4 ${animationClass}`} />
            <div className={`w-3/4 h-6 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2 ${animationClass}`} />
            <div className={`w-1/2 h-4 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4 ${animationClass}`} />
            <div className="flex justify-between items-center mt-4">
              <div className={`w-1/3 h-4 bg-gray-100 dark:bg-gray-800 rounded-lg ${animationClass}`} />
              <div className={`w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full ${animationClass}`} />
            </div>
          </div>
        );
      
      case "header":
        return (
          <div className={`space-y-3 ${className}`}>
            <div className={`w-1/2 md:w-1/3 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl ${animationClass}`} />
            <div className={`w-3/4 md:w-1/2 h-5 bg-gray-100 dark:bg-gray-800 rounded-lg ${animationClass}`} />
          </div>
        );
        
      case "avatar":
        return <div className={`w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0 ${animationClass} ${className}`} />;
        
      case "list":
        return (
          <div className={`flex items-center gap-4 p-4 border border-gray-100 dark:border-gray-800 rounded-2xl ${className}`}>
            <div className={`w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl flex-shrink-0 ${animationClass}`} />
            <div className="flex-1 space-y-2">
              <div className={`w-3/4 h-5 bg-gray-200 dark:bg-gray-700 rounded-lg ${animationClass}`} />
              <div className={`w-1/2 h-4 bg-gray-100 dark:bg-gray-800 rounded-lg ${animationClass}`} />
            </div>
          </div>
        );

      case "text":
      default:
        return <div className={`w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-lg ${animationClass} ${className}`} />;
    }
  };

  if (count === 1) return renderSkeleton();

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </>
  );
}
