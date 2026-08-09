import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import { useData, EventTemplate } from "../contexts/DataContext";
import { PlusCircle, BarChart, Users, Settings, GripVertical, FileText } from "lucide-react";
import CountUp from "react-countup";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import toast from "react-hot-toast";
import SkeletonLoader from "./SkeletonLoader";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";

export default function OrganizerDashboard() {
  const { events, registrations, templates, isLoading, error } = useData();
  const [orderedTemplates, setOrderedTemplates] = useState<EventTemplate[]>([]);

  // Initialize ordered templates from context
  useEffect(() => {
    setOrderedTemplates(templates);
  }, [templates]);

  // For this demo, let's assume all events belong to this organizer.
  const activeEventsCount = events.length;
  const totalAttendees = registrations.filter(r => r.status === "registered").length;

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(orderedTemplates);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setOrderedTemplates(items);
    toast.success("Templates reordered");
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Organizer Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage your events and track attendance.</p>
          </div>
          <div className="flex gap-2">
            <Link to="/organizer/checkin" className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:opacity-90 transition-opacity">
              Fast Check-in
            </Link>
            <Link to="/organizer/events/new" className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20">
              <PlusCircle className="w-5 h-5" />
              Create Event
            </Link>
          </div>
        </header>

        {error ? (
          <ErrorState 
            title="Failed to load dashboard" 
            message="There was a problem connecting to the server. Please try refreshing."
            onRetry={() => window.location.reload()}
          />
        ) : isLoading ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SkeletonLoader type="card" className="h-40" count={2} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <SkeletonLoader type="card" className="h-[400px]" count={2} />
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-center h-40">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Total Attendees
                </h3>
                <p className="text-4xl font-bold text-gray-900 dark:text-white"><CountUp end={totalAttendees} duration={1.5} /></p>
              </div>

              <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-center h-40">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Active Events</h3>
                <p className="text-4xl font-bold text-primary"><CountUp end={activeEventsCount} duration={1.5} /></p>
              </div>
            </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-white dark:bg-surface-dark p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h2 className="text-xl font-bold mb-6">Recent Events</h2>
            {events.length === 0 ? (
              <EmptyState 
                icon={<BarChart className="w-8 h-8" />}
                title="You haven't created any events yet."
                description="Get started by clicking below."
                actionText="Create Your First Event"
                actionHref="/organizer/events/new"
              />
            ) : (
              <div className="grid gap-4">
                {events.slice(0, 5).map(event => (
                  <div key={event.id} className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-800 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <img src={event.posterUrl} alt={event.title} className="w-16 h-16 object-cover rounded-xl" />
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">{event.title}</h3>
                        <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Link to={`/organizer/events/${event.id}`} className="p-2 text-gray-400 hover:text-primary transition-colors bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-primary/10">
                      <Settings className="w-5 h-5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="bg-white dark:bg-surface-dark p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5" /> Saved Templates
            </h2>
            
            {orderedTemplates.length === 0 ? (
              <EmptyState 
                icon={<FileText className="w-8 h-8" />}
                title="No templates saved yet."
                description="Save a template during event creation."
              />
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="templates-list">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                      {orderedTemplates.map((template, index) => (
                        <Draggable key={template.id} draggableId={template.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`flex items-center p-4 border rounded-2xl transition-all ${
                                snapshot.isDragging 
                                  ? "bg-white shadow-xl border-primary/50 z-50 scale-[1.02]" 
                                  : "bg-white dark:bg-surface-dark border-gray-100 dark:border-gray-800 hover:border-gray-300"
                              }`}
                            >
                              <div {...provided.dragHandleProps} className="p-2 mr-2 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
                                <GripVertical className="w-5 h-5" />
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">{template.name}</h3>
                                <p className="text-sm text-gray-500 truncate max-w-[200px]">{template.title}</p>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </section>
        </div>
      </>
      )}
      </div>
    </DashboardLayout>
  );
}
