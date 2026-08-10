import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import { useData, EventCategory } from "../contexts/DataContext";
import { ArrowRight, ArrowLeft, Check, Save } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import toast from "react-hot-toast";
import SkeletonLoader from "./SkeletonLoader";
import ErrorState from "./ErrorState";
import { useAccessibleMotion } from "../hooks/useAccessibleMotion";

// Framer motion variants for step transitions
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 50 : -50,
    opacity: 0
  })
};

const ValidCheck = ({ isValid }: { isValid: boolean }) => (
  <AnimatePresence>
    {isValid && (
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500"
      >
        <Check className="w-5 h-5" />
      </motion.div>
    )}
  </AnimatePresence>
);

export default function OrganizerEventWizard() {
  const prefersReducedMotion = useAccessibleMotion();
  const { createEvent, saveTemplate, templates, isLoading, error } = useData();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0); // 1 for forward, -1 for backward

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    location: "",
    department: "",
    category: "Social" as EventCategory,
    capacity: 0,
    posterUrl: ""
  });
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "capacity" ? parseInt(value) || 0 : value
    }));
  };

  const loadTemplate = (templateId: string) => {
    const t = templates.find(t => t.id === templateId);
    if (t) {
      setFormData({
        title: t.title,
        description: t.description,
        startTime: "",
        endTime: "",
        location: t.location,
        department: t.department,
        category: t.category,
        capacity: t.capacity,
        posterUrl: t.posterUrl
      });
      toast.success(`Loaded template: ${t.name}`);
    }
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setStep(step + newDirection);
  };

  const isTitleValid = formData.title.trim().length > 0;
  const isDescValid = formData.description.trim().length > 0;
  const isStep1Valid = isTitleValid && isDescValid;

  const isDateValid = formData.startTime !== "";
  const isEndTimeValid = formData.endTime !== "";
  const isLocValid = formData.location.trim().length > 0;
  const isDeptValid = formData.department.trim().length > 0;
  const isStep2Valid = isDateValid && isEndTimeValid && isLocValid && isDeptValid;

  const isCapValid = formData.capacity > 0;
  const isPosterValid = formData.posterUrl.trim().length > 0;
  const isStep3Valid = isCapValid && isPosterValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isStep1Valid && isStep2Valid && isStep3Valid) {
      try {
        const eventId = await createEvent(formData);
        
        if (saveAsTemplate && templateName.trim() !== "") {
          await saveTemplate({
            name: templateName,
            title: formData.title,
            description: formData.description,
            location: formData.location,
            department: formData.department,
            category: formData.category,
            capacity: formData.capacity,
            posterUrl: formData.posterUrl
          });
          toast.success("Template saved!");
        }
        
        toast.success("Event created successfully!");
        navigate(`/organizer/events/${eventId}`);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Failed to create event.");
      }
    } else {
      toast.error("Please fill in all required fields.");
    }
  };

  const handleQuickCreate = async () => {
    if (!isStep1Valid) {
      toast.error("Please provide at least a title and description.");
      return;
    }
    
    // Auto-fill remaining fields with default values
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    const quickData = {
      ...formData,
      startTime: formData.startTime || tomorrowStr,
      endTime: formData.endTime || tomorrowStr + "T14:00",
      location: formData.location || "TBA",
      department: formData.department || "General",
      capacity: formData.capacity || 100,
      posterUrl: formData.posterUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    };
    
    try {
      const eventId = await createEvent(quickData);
      toast.success("Quick Event created successfully!");
      navigate(`/organizer/events/${eventId}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to create event.");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto py-8">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create New Event</h1>
            <p className="text-gray-500 dark:text-gray-400">Step {step} of 3</p>
          </div>
          {templates.length > 0 && step === 1 && (
            <select 
              className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-surface-dark focus:ring-2 focus:ring-primary outline-none"
              onChange={(e) => loadTemplate(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>Load from Template...</option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          )}
        </header>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <motion.div 
              key={s} 
              layout
              className={`h-2 flex-1 rounded-full ${step >= s ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`} 
            />
          ))}
        </div>

        {error ? (
          <ErrorState 
            title="Failed to load wizard" 
            message="There was a problem connecting to the server. Please try refreshing."
            onRetry={() => window.location.reload()}
          />
        ) : isLoading ? (
          <div className="bg-white dark:bg-surface-dark p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden min-h-[400px] flex flex-col space-y-6">
            <SkeletonLoader type="card" className="h-16" count={4} />
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-surface-dark p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden min-h-[400px]">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            
            {/* ── STEP 1 ── */}
            {step === 1 && (
              <motion.div 
                key="step1"
                custom={direction}
                variants={prefersReducedMotion ? {} : slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="space-y-6"
              >
                <div className="relative">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Event Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark focus:ring-2 focus:ring-primary outline-none pr-10"
                    placeholder="e.g., Spring Music Festival"
                  />
                  <ValidCheck isValid={isTitleValid} />
                  {!isTitleValid && formData.title !== "" && <p className="text-sm text-red-500 mt-1">Title is required.</p>}
                </div>
                
                <div className="relative">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={5}
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark focus:ring-2 focus:ring-primary outline-none pr-10"
                    placeholder="Describe your event..."
                  />
                  <ValidCheck isValid={isDescValid} />
                </div>

                <div className="flex justify-between items-center pt-8 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={handleQuickCreate}
                    disabled={!isStep1Valid}
                    className="px-4 py-2 font-bold text-sm text-primary hover:text-primary-hover disabled:opacity-50 transition-colors flex items-center gap-1"
                  >
                    🚀 Quick Create (Skip details)
                  </button>
                  <button 
                    type="button"
                    onClick={() => paginate(1)} 
                    disabled={!isStep1Valid}
                    className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    Next <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <motion.div
                key={step}
                custom={direction}
                variants={prefersReducedMotion ? {} : slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm"
              >    
                <div className="grid grid-cols-2 gap-6">
                  <div className="relative">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Start Time</label>
                    <input
                      type="datetime-local"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark focus:ring-2 focus:ring-primary outline-none pr-10"
                    />
                    <ValidCheck isValid={isDateValid} />
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">End Time</label>
                    <input
                      type="datetime-local"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark focus:ring-2 focus:ring-primary outline-none pr-10"
                    />
                    <ValidCheck isValid={isEndTimeValid} />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark focus:ring-2 focus:ring-primary outline-none pr-10"
                    placeholder="e.g., Main Quad"
                  />
                  <ValidCheck isValid={isLocValid} />
                </div>

                <div className="relative">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Department/Organization</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark focus:ring-2 focus:ring-primary outline-none pr-10"
                    placeholder="e.g., Student Union"
                  />
                  <ValidCheck isValid={isDeptValid} />
                </div>

                <div className="flex justify-between pt-4">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => paginate(-1)}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </motion.button>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => paginate(1)}
                    disabled={!isStep2Valid}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next Step <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3 ── */}
            {step === 3 && (
              <motion.div 
                key="step3"
                custom={direction}
                variants={prefersReducedMotion ? {} : slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark focus:ring-2 focus:ring-primary outline-none"
                    >
                      <option value="Social">Social</option>
                      <option value="Academic">Academic</option>
                      <option value="Sports">Sports</option>
                      <option value="Arts">Arts</option>
                      <option value="Club">Club</option>
                    </select>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Capacity</label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark focus:ring-2 focus:ring-primary outline-none pr-10"
                    />
                    <ValidCheck isValid={isCapValid} />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Poster Image URL</label>
                  <input
                    type="url"
                    name="posterUrl"
                    value={formData.posterUrl}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark focus:ring-2 focus:ring-primary outline-none pr-10"
                    placeholder="https://..."
                  />
                  <ValidCheck isValid={isPosterValid} />
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveAsTemplate}
                      onChange={(e) => setSaveAsTemplate(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"><Save className="w-4 h-4" /> Save as Template</span>
                  </label>
                  
                  <AnimatePresence>
                    {saveAsTemplate && (
                      <motion.input
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        type="text"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        placeholder="Template Name (e.g., Weekly Seminar)"
                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark focus:ring-2 focus:ring-primary outline-none"
                      />
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex justify-between pt-4">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => paginate(-1)}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.95 }}
                    disabled={!isStep3Valid || (saveAsTemplate && !templateName.trim())}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                  >
                    Create Event <Check className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
        )}
      </div>
    </DashboardLayout>
  );
}
