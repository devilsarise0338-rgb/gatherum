import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { AuthService } from "../services/api";
import {
  UserCheck, GraduationCap, Phone, Hash, BookOpen, ChevronRight, Loader2
} from "lucide-react";
import toast from "react-hot-toast";

const BRANCHES = [
  "Computer Science Engineering",
  "Information Technology",
  "Electronics & Communication Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Artificial Intelligence & Data Science",
  "Other",
];

const YEARS = [
  { value: 1, label: "1st Year" },
  { value: 2, label: "2nd Year" },
  { value: 3, label: "3rd Year" },
  { value: 4, label: "4th Year" },
];

interface FormState {
  fullName: string;
  rollNumber: string;
  branch: string;
  yearOfStudy: string;
  phoneNumber: string;
}

const FIELD_CONFIG = [
  {
    id: "fullName",
    label: "Full Name",
    placeholder: "e.g. Priya Sharma",
    type: "text",
    icon: UserCheck,
    description: "Your full legal name as on your ID card",
  },
  {
    id: "rollNumber",
    label: "Roll Number",
    placeholder: "e.g. 21ECEB001",
    type: "text",
    icon: Hash,
    description: "Your official university roll number",
  },
];

export default function ProfileCompletionForm() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    fullName: "",
    rollNumber: "",
    branch: "",
    yearOfStudy: "",
    phoneNumber: "",
  });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [saving, setSaving] = useState(false);

  // Pre-fill with any existing partial data
  useEffect(() => {
    if (!user) return;
    AuthService.getProfile(user.id).then((profile: any) => {
      setForm((prev) => ({
        ...prev,
        fullName: profile.full_name ?? "",
        rollNumber: profile.roll_number ?? "",
        branch: profile.branch ?? "",
        yearOfStudy: profile.year_of_study ? String(profile.year_of_study) : "",
        phoneNumber: profile.phone_number ?? "",
      }));
    });
  }, [user]);

  const validate = (): boolean => {
    const newErrors: Partial<FormState> = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!form.rollNumber.trim()) newErrors.rollNumber = "Roll number is required";
    if (!form.branch) newErrors.branch = "Please select your branch";
    if (!form.yearOfStudy) newErrors.yearOfStudy = "Please select your year";
    if (form.phoneNumber && !/^\+?[\d\s\-()]{7,15}$/.test(form.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!user) return;

    setSaving(true);
    try {
      await AuthService.completeProfile({
        fullName: form.fullName.trim(),
        rollNumber: form.rollNumber.trim(),
        branch: form.branch,
        yearOfStudy: Number(form.yearOfStudy),
        phoneNumber: form.phoneNumber.trim() || null,
      });
      await refreshUser();
      toast.success("Profile complete! Welcome to Gatherum 🎉");
      navigate(`/${user.role}`, { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Complete Your Profile
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            One-time setup so organizers can identify you at events.
          </p>
        </div>

        <div className="bg-white dark:bg-surface-dark rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <form onSubmit={handleSubmit} noValidate>
            <div className="p-8 space-y-5">
              {/* Full Name & Roll Number */}
              {FIELD_CONFIG.map(({ id, label, placeholder, type, icon: Icon, description }) => (
                <div key={id}>
                  <label
                    htmlFor={`profile-${id}`}
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    {label} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      id={`profile-${id}`}
                      type={type}
                      value={form[id as keyof FormState]}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, [id]: e.target.value }))
                      }
                      placeholder={placeholder}
                      className={`w-full pl-9 pr-4 py-3 rounded-xl border text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors[id as keyof FormState]
                          ? "border-red-400 focus:ring-red-400"
                          : "border-gray-200 dark:border-gray-700"
                      }`}
                    />
                  </div>
                  {errors[id as keyof FormState] && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors[id as keyof FormState]}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">{description}</p>
                </div>
              ))}

              {/* Branch */}
              <div>
                <label
                  htmlFor="profile-branch"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Branch <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <select
                    id="profile-branch"
                    value={form.branch}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, branch: e.target.value }))
                    }
                    className={`w-full pl-9 pr-4 py-3 rounded-xl border text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary appearance-none ${
                      errors.branch
                        ? "border-red-400 focus:ring-red-400"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <option value="">Select your branch…</option>
                    {BRANCHES.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.branch && (
                  <p className="mt-1 text-xs text-red-500">{errors.branch}</p>
                )}
              </div>

              {/* Year of Study */}
              <div>
                <label
                  htmlFor="profile-year"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Year of Study <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {YEARS.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          yearOfStudy: String(value),
                        }))
                      }
                      className={`py-2.5 rounded-xl text-sm font-bold border transition-all ${
                        form.yearOfStudy === String(value)
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary/50"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {errors.yearOfStudy && (
                  <p className="mt-1 text-xs text-red-500">{errors.yearOfStudy}</p>
                )}
              </div>

              {/* Phone (optional) */}
              <div>
                <label
                  htmlFor="profile-phone"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Phone Number{" "}
                  <span className="text-gray-400 font-normal text-xs">(optional)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    id="profile-phone"
                    type="tel"
                    value={form.phoneNumber}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, phoneNumber: e.target.value }))
                    }
                    placeholder="e.g. 9876543210"
                    className={`w-full pl-9 pr-4 py-3 rounded-xl border text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.phoneNumber
                        ? "border-red-400 focus:ring-red-400"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="mt-1 text-xs text-red-500">{errors.phoneNumber}</p>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  Used only by organizers for event coordination.
                </p>
              </div>
            </div>

            {/* Submit */}
            <div className="px-8 py-5 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800">
              <motion.button
                type="submit"
                disabled={saving}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    Continue to Gatherum
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          This information is only visible to event organizers and admins.
        </p>
      </motion.div>
    </div>
  );
}
