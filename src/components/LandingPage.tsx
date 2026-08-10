import { Calendar, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import React, { Suspense } from "react";
import { pageTransition } from "../utils/motion";
import { useData } from "../contexts/DataContext";
import SkeletonLoader from "./SkeletonLoader";
import TiltCard from "./TiltCard";

const LandingHero3D = React.lazy(() => import("./LandingHero3D"));

export default function LandingPage() {
  const shouldReduceMotion = useReducedMotion();
  const { events, isLoading } = useData();
  
  // Get up to 3 upcoming events
  const now = new Date().getTime();
  const upcomingEvents = events
    .filter(e => !e.isUnpublished && new Date(e.endTime).getTime() > now)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 3);

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemAnim = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col min-h-[calc(100vh-4rem)] relative"
    >
      {/* Hero Section */}
      <section className="relative px-4 py-24 sm:py-32 lg:py-40 flex flex-col items-center text-center overflow-hidden min-h-[80vh] justify-center">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-bg-light to-bg-light dark:from-primary/20 dark:via-bg-dark dark:to-bg-dark"></div>
        
        {!shouldReduceMotion && (
          <Suspense fallback={null}>
            <LandingHero3D />
          </Suspense>
        )}

        <motion.div 
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" as any }}
          className="relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 text-accent-darker dark:text-accent mb-8">
            <span className="flex h-2 w-2 rounded-full bg-accent"></span>
            <span className="text-sm font-semibold tracking-wide uppercase">Your Campus, Live</span>
          </div>
          
          <h1 className="max-w-4xl text-5xl md:text-7xl font-bold tracking-tight text-gray-900 dark:text-white mb-6 drop-shadow-sm">
            Experience <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">College Events</span> Like Never Before
          </h1>
          
          <p className="max-w-2xl text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed mx-auto drop-shadow-sm bg-white/50 dark:bg-black/50 p-4 rounded-2xl backdrop-blur-sm">
            Gatherum brings all your university happenings into one vibrant platform. Discover parties, academic talks, and club meetups instantly.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
            <Link to="/signup" className="px-8 py-4 rounded-full bg-primary text-white font-semibold text-lg hover:bg-primary-hover hover:scale-105 transition-all shadow-lg shadow-primary/30">
              Join Gatherum
            </Link>
            <Link to="/login" className="px-8 py-4 rounded-full bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md text-gray-900 dark:text-white font-semibold text-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
              Sign In
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features / Upcoming Events */}
      <section id="features" className="py-24 bg-white dark:bg-surface-dark transition-colors relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Trending on Campus</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">Don't miss out on what everyone will be talking about tomorrow.</p>
          </motion.div>
          
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {isLoading ? (
              <SkeletonLoader type="card" count={3} />
            ) : upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <Link key={event.id} to={`/events/${event.id}`} className="block h-full">
                  <TiltCard className="h-full flex flex-col">
                    <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-800 relative overflow-hidden">
                      <img src={event.posterUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                      <div className="absolute bottom-4 left-4 z-20">
                        <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full tracking-wider">{event.category}</span>
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-grow bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-b-2xl shadow-sm">
                      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1">{event.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="font-medium">{new Date(event.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {new Date(event.startTime).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 line-clamp-2">{event.description}</p>
                      
                      <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                          <Users className="w-4 h-4" />
                          <span>{event.registeredCount} / {event.capacity}</span>
                        </div>
                        <span className="text-primary font-bold">View Details →</span>
                      </div>
                    </div>
                  </TiltCard>
                </Link>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 text-gray-500 dark:text-gray-400">
                Check back soon for new events!
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}
