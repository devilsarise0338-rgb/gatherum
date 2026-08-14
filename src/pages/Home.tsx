import React, { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { useData } from '../contexts/DataContext';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { events } = useData();
  
  const publishedEvents = useMemo(() => events.filter(e => !e.isUnpublished).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()), [events]);

  return (
    <>
      <Navbar />
      
      {/* Main Content Canvas */}
      <main className="flex-grow pt-[120px] pb-section-gap flex flex-col relative z-10">
        
        {/* Hero Section */}
        <section className="w-full min-h-[80vh] flex flex-col justify-end px-margin-mobile md:px-margin-desktop pb-24 relative mb-section-gap">
          <div className="absolute inset-0 z-0">
            <img 
              alt="Architecture of Night"
              className="w-full h-full object-cover opacity-60 mix-blend-luminosity" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZjsIKYRWHfCf59Gd2O2JRxHXhLSf0hKWEv61YimwDrzcl4JuJy2f1r0JyBfEVf6UVG91WjDUQ-RSgUYnSf82gO_UrJK5hYuoYGRhgpMKrKcC1A8vhSwrlvgrLru1wXYaP3CTNuyVil9v2MF7VkoB3jobFj3Ep_6MH8m_pxhspF75DI1NAHIpMxGcWUKbyBp1H8zX39hKxdDvdqSqI4x4yV6G3iTJMgviIW3nYasqjjyy01ZhoQDOG"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
          </div>
          
          <div className="relative z-10 max-w-7xl">
            <h1 className="font-display-xl text-display-xl tracking-tighter uppercase leading-none mb-8 text-on-surface md:w-3/4">
              The <br/> Architecture <br/> of Night
            </h1>
            <div className="flex flex-col md:flex-row gap-8 md:items-end">
              <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                A curated exploration of avant-garde spaces and brutalist intersections. Where absence speaks louder than form.
              </p>
              <Link 
                to="/events"
                className="inline-flex items-center justify-center bg-white text-black rounded-full px-8 py-3 font-label-sm text-label-sm uppercase tracking-widest hover:bg-primary-container hover:text-white transition-colors self-start md:self-auto interactive hover-target"
              >
                ENTER THE VOID
              </Link>
            </div>
          </div>
        </section>

        {/* Asymmetrical Editorial Grid */}
        <section className="px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-12 gap-gutter mb-section-gap">
          <div className="md:col-span-5 md:col-start-2 flex flex-col justify-center">
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg uppercase mb-6">Manifesto</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              We reject the superfluous. In the stark light of the modern era, true luxury is found in essential geometry and unforgiving contrasts. This is not merely design; it is a declaration of structural purity.
            </p>
          </div>
          <div className="md:col-span-4 md:col-start-9 relative h-[60vh] mt-12 md:mt-0 border border-outline-variant/30 group">
            <img 
              alt="Structural Purity"
              className="w-full h-full object-cover grayscale opacity-50 group-hover:opacity-100 transition-opacity duration-700" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDV3H6OraRHphf0tJt9T9gzXVi6bUa2T-BaXV5n08Cz9qhUwn5Z4vT8Af9B6_266jPZ4oP8DX7s5HJ2eUGATjtKOEH8Iswk0W7MWS7q9WHYOYN00jJcjZ89K9U_RFypKjo97HghSHbRN5QOrGGPhIEq0R3rDZUbfaEn_d8BJa6LokQ-ezMRIXXEWjW4pRwbNKE1AZOtsOruqz1oVKoBpU0qhhbbQWLrUtlyn-_oGF_C2AF2OwqiRtrG"
            />
            <div className="absolute bottom-0 left-0 p-4 font-metadata text-metadata uppercase bg-background/80 backdrop-blur-md">01 / STRUCTURAL PURITY</div>
          </div>
        </section>

        {/* Typographic Cards / Events List */}
        <section className="px-margin-mobile md:px-margin-desktop mb-section-gap">
          <div className="border-t border-outline-variant/20 pt-8 mb-16">
            <h2 className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">UPCOMING CONGREGATIONS</h2>
          </div>
          <div className="flex flex-col">
            {publishedEvents.slice(0, 3).map((event, index) => (
              <Link 
                key={event.id}
                to={`/events/${event.id}`}
                className="group relative py-12 border-b border-outline-variant/10 flex flex-col md:flex-row md:items-center justify-between interactive hover-target hover:bg-surface-container-low transition-colors px-4 -mx-4 md:px-8 md:-mx-8"
              >
                <div className="flex items-start gap-8 z-10 relative pointer-events-none">
                  <span className="font-display-xl text-4xl md:text-6xl text-outline/30 group-hover:text-primary transition-colors">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg uppercase group-hover:pl-4 transition-all duration-300">
                      {event.title}
                    </h3>
                    <p className="font-metadata text-metadata text-on-surface-variant mt-2">
                      {event.category}
                    </p>
                  </div>
                </div>
                <div className="font-metadata text-metadata uppercase mt-6 md:mt-0 z-10 relative text-right pointer-events-none">
                  {new Date(event.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} <br/>
                  {new Date(event.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} - LATE
                </div>
                <div className="absolute inset-y-0 right-1/4 w-1/3 hover-reveal-img pointer-events-none z-0 mix-blend-lighten hidden md:block">
                  <img 
                    alt={event.title}
                    className="w-full h-full object-cover" 
                    src={event.posterUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuBnrmzkr6KRJT2iHSpngDmF5Ry1Wqlz6S6AK1OxcTFlHkI5gZfTwViAR_oYXzvw9jltE9ZOnktMV3MBVQ1BXKDaSMdcsOfBQ1UtsliJbs0-QwdtUmu3AcCdjokrhydE0DLC6AZ2JDdTjh2ABDqpbWS0XxexNnwcCTNHw8uP_AZ0xuLeMoLZ0LR4eQ7i4sQObuS2PK1iIxFgE6W69pXVPe18LEopaezd_jwHWifLfcJB809-7vbYz0C1"}
                  />
                </div>
              </Link>
            ))}
            
            {publishedEvents.length === 0 && (
              <div className="py-12 text-center font-metadata text-metadata text-on-surface-variant">
                NO UPCOMING CONGREGATIONS.
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Home;
