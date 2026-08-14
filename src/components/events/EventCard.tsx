import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface EventCardProps {
  id: string;
  title: string;
  category: string;
  date: string;
  location: string;
  imageUrl?: string;
  isFeatured?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({
  id,
  title,
  category,
  date,
  location,
  imageUrl,
  isFeatured,
}) => {
  const navigate = useNavigate();

  return (
    <Card 
      interactive 
      className="group relative cursor-pointer min-h-[350px] border-2 border-grid-line overflow-hidden flex flex-col"
      onClick={() => navigate(`/events/${id}`)}
    >
      {imageUrl && (
        <div 
          className="absolute inset-0 bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-700" 
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/80 to-transparent"></div>
      
      <div className="relative z-10 flex flex-col justify-between h-full p-6 mt-auto border-t-4 border-primary">
        <div className="flex justify-between items-start mb-12">
          <Badge className="bg-surface text-on-surface border-2 border-grid-line">{category}</Badge>
          {isFeatured && (
            <Badge className="bg-primary text-on-primary border-2 border-transparent">Featured</Badge>
          )}
        </div>
        
        <div className="bg-surface/90 p-4 border-2 border-grid-line border-l-4 border-l-primary backdrop-blur-md">
          <h4 className="font-subheadline-bold text-xl text-on-surface mb-2 uppercase line-clamp-2" title={title}>
            {title}
          </h4>
          <div className="flex flex-col gap-1 text-on-surface-variant font-body-md text-sm uppercase">
            <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">calendar_today</span> {date}</span>
            <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">location_on</span> {location}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
