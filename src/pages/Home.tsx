import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useData } from '../contexts/DataContext';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { events } = useData();
  
  const publishedEvents = useMemo(() => events.filter(e => !e.isUnpublished), [events]);
  const featuredEvent = publishedEvents.length > 0 ? publishedEvents[0] : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-6 md:px-16 border-b-2 border-grid-line overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div 
            className="w-full h-full bg-cover bg-center object-cover transform scale-105" 
            style={{ backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuADMi6aj7AWVzMNy1jgLZ84_0LyTBau9mlTjm98-iFpYMORVUN8ATustVxDxQS97COzDwbAT5b0gmmZePCLLVTBEhqf6qWEfa9KKRIg68z7auFe_8tsf7-TrWOe-e94OWBW6JW6S64FeOQdsYDgQcSuQm44zuiKHGhhI6a1lNYNWMqS6NMKJyizqyAkxZV_JsYhWmfjSEDxSTtvX0zmek-2Ml3DOh-5LqaLvCz4NsisAUnATTYB9ain)' }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal-base/20 to-charcoal-base/90"></div>
          <div className="hero-grain"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center text-center mt-12 md:mt-0">
          <span className="font-label-caps text-label-caps text-primary tracking-widest mb-6 uppercase border border-primary px-4 py-1">
            Exclusive Access
          </span>
          <h1 className="font-display-hero text-[56px] md:text-[100px] text-on-surface mb-8 leading-[0.9] max-w-5xl uppercase">
            Discover the<br />
            <span className="italic font-light text-primary/90">Extraordinary.</span>
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-12 border-l-4 border-primary pl-4 text-left md:text-center md:border-l-0 md:pl-0">
            Curated experiences for the modern community. Step into a world where every detail is designed for the discerning individual.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/events')}
            className="shadow-[8px_8px_0px_0px_rgba(212,175,55,0.3)] hover:shadow-none hover:translate-y-1 hover:translate-x-1"
          >
            Explore Events
          </Button>
        </div>
      </section>

      {/* Bento Discovery Section */}
      <section className="py-24 px-6 md:px-16 bg-surface-dim border-b-2 border-grid-line">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6 border-b-2 border-grid-line pb-8">
            <div>
              <span className="font-label-caps text-label-caps text-primary mb-2 block uppercase">Curations</span>
              <h2 className="font-headline-lg text-headline-lg-mobile md:text-[56px] text-on-surface uppercase">The Collection</h2>
            </div>
            <button 
              onClick={() => navigate('/events')}
              className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 border border-grid-line px-4 py-2 uppercase tracking-widest text-xs"
            >
              View All <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(180px,auto)]">
            {/* Featured Event */}
            {featuredEvent ? (
              <Card 
                interactive 
                className="md:col-span-8 md:row-span-2 group relative cursor-pointer min-h-[400px]"
                onClick={() => navigate(`/events/${featuredEvent.id}`)}
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-700"
                  style={{ backgroundImage: `url(${featuredEvent.posterUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmh7vw1WaniamATAljBayfOwdAnOZu_JkQOxRwV0gu9bLFudErEiC95GtSVE12reVfMCAsjccwBQ6EQPTezim9Os0CydCC_0eY5d85OEFlY4qVOv2LQ7VRSh59jSs_oQUzdbfnPj2rX_fnnljeIYRJ6bzzj-sUyR8vLI1UJFKOUHDDWIZYo6Nlk2dMOXJRKU04sanG7gQEeRq2epzWrx0IMDF9ILVm2w_JkwSiVg0zyIh7QESR6Grc'})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/80 to-transparent"></div>
                <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                  <div className="flex justify-between items-start">
                    <Badge className="bg-surface text-on-surface border-2 border-grid-line shadow-[4px_4px_0px_0px_rgba(212,175,55,1)]">Featured</Badge>
                  </div>
                  <div className="border-l-4 border-primary pl-4 bg-surface/80 p-4 backdrop-blur-sm border-2 border-grid-line border-l-primary">
                    <span className="font-label-caps text-label-caps text-primary mb-2 block uppercase">{featuredEvent.category}</span>
                    <h3 className="font-subheadline-bold text-[32px] text-on-surface mb-2 uppercase">{featuredEvent.title}</h3>
                    <div className="flex items-center gap-4 text-on-surface-variant font-body-md text-sm uppercase">
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">calendar_today</span> {new Date(featuredEvent.startTime).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">location_on</span> {featuredEvent.location}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="md:col-span-8 md:row-span-2 min-h-[400px] flex items-center justify-center border-2 border-grid-line">
                <p className="text-on-surface-variant font-body-md uppercase tracking-widest">No featured events</p>
              </Card>
            )}

            {/* Trending Categories */}
            <Card className="md:col-span-4 flex flex-col p-6 hover:bg-surface-bright transition-colors border-2 border-grid-line">
              <div className="flex justify-between items-center mb-6 border-b-2 border-grid-line pb-4">
                <h4 className="font-subheadline-bold text-subheadline-bold text-on-surface uppercase">Trending</h4>
                <span className="material-symbols-outlined text-primary text-3xl">trending_up</span>
              </div>
              <ul className="space-y-4 flex-grow flex flex-col justify-center">
                {['Social', 'Academic', 'Arts'].map((cat, idx) => {
                  const count = publishedEvents.filter(e => e.category === cat).length;
                  return (
                    <li key={idx} className="flex items-center justify-between group border-b-2 border-grid-line pb-2">
                      <span className="font-body-md text-body-md text-on-surface group-hover:text-primary transition-colors uppercase font-bold">{cat}</span>
                      <span className="text-primary font-label-caps text-sm border border-primary px-2 py-0.5">{count}</span>
                    </li>
                  )
                })}
              </ul>
            </Card>

            {/* Upcoming Event */}
            {publishedEvents[1] && (
              <Card 
                interactive 
                className="md:col-span-4 relative cursor-pointer min-h-[300px] border-2 border-grid-line group"
                onClick={() => navigate(`/events/${publishedEvents[1].id}`)}
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-700" 
                  style={{ backgroundImage: `url(${publishedEvents[1].posterUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTzPOhnkpr0G9lAERUmlWKMuXPUSM2sL2CS8czEKTakI_sy0thVOYy8nPMb3tneK14lAkuYyKqNTZGRgINpamwrNHWtbfTBGkuqELZRBxP322VwQXNNGeDHQISbqH2KYSEm6tn67WlPZkpgkYSdD_qQVZmrSftH6q0Ch03toNp-6dAisiI15vxYeBwEqObRUkFF8zy37wBIQwPNtPQZKG4N-MLdjk-8IsCD_1zVrc76aWLnr2PZ5Mm'})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-base via-charcoal-base/50 to-transparent"></div>
                <div className="absolute inset-0 p-6 flex flex-col justify-end z-10 border-t-[8px] border-primary mt-auto bg-surface/90 backdrop-blur-md h-[45%]">
                  <span className="font-label-caps text-label-caps text-primary mb-1 uppercase">{publishedEvents[1].category}</span>
                  <h4 className="font-subheadline-bold text-subheadline-bold text-on-surface leading-tight mb-2 uppercase">{publishedEvents[1].title}</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant text-sm border-l-2 border-grid-line pl-2">{new Date(publishedEvents[1].startTime).toLocaleDateString()}</p>
                </div>
              </Card>
            )}

            {/* Community Stats */}
            <Card className="md:col-span-8 md:col-start-5 p-8 flex flex-col justify-center relative overflow-hidden border-2 border-grid-line bg-surface">
              <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transform translate-x-1/4 translate-y-1/4">
                <span className="material-symbols-outlined text-[200px]">group</span>
              </div>
              <span className="font-label-caps text-label-caps text-primary mb-6 block uppercase border-b-2 border-grid-line pb-4 tracking-widest">Community Pulse</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y-2 md:divide-y-0 md:divide-x-2 divide-grid-line">
                <div className="pt-4 md:pt-0 md:px-4 flex flex-col items-start">
                  <div className="font-display-hero text-[48px] text-on-surface mb-1 text-primary">12k+</div>
                  <div className="font-label-caps text-on-surface-variant uppercase border border-grid-line px-2 py-1 bg-surface-dim">Active Members</div>
                </div>
                <div className="pt-4 md:pt-0 md:px-4 flex flex-col items-start">
                  <div className="font-display-hero text-[48px] text-on-surface mb-1 text-primary">{publishedEvents.length}</div>
                  <div className="font-label-caps text-on-surface-variant uppercase border border-grid-line px-2 py-1 bg-surface-dim">Curated Events</div>
                </div>
                <div className="pt-4 md:pt-0 md:px-4 flex flex-col items-start">
                  <div className="font-display-hero text-[48px] text-on-surface mb-1 text-primary">50+</div>
                  <div className="font-label-caps text-on-surface-variant uppercase border border-grid-line px-2 py-1 bg-surface-dim">Cities Worldwide</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
