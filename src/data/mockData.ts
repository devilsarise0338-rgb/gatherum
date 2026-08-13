import { EventItem, Host, UserProfile } from '../types';

export const CURRENT_USER: UserProfile = {
  id: 'usr_curated_01',
  name: 'Elena Rostova',
  email: 'elena.rostova@designworks.co',
  handle: '@elenarostova',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
  bio: 'Design strategist & salon host exploring typography, spatial design, and human-computer symbiosis.',
  joinedDate: 'March 2024',
  googleLinked: true,
};

export const MOCK_HOSTS: Record<string, Host> = {
  host_01: {
    id: 'host_01',
    name: 'Julian Vance',
    handle: '@julianvance',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    bio: 'Founder at KIN Studio. Hosting monthly design salons, generative art showcases, and architectural walks in SoHo.',
    verified: true,
    totalEventsHosted: 24,
    totalAttendees: 1840,
    location: 'New York, NY',
    website: 'https://julianvance.design',
    twitter: '@julianvance',
    instagram: '@julian.kin',
  },
  host_02: {
    id: 'host_02',
    name: 'Seraphina Lin',
    handle: '@seraphina_lin',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
    bio: 'Sommelier & culinary curator. Crafting intimate hearth dinners, natural wine pairings, and seasonal table rituals.',
    verified: true,
    totalEventsHosted: 18,
    totalAttendees: 620,
    location: 'San Francisco, CA',
    website: 'https://seraphina.table',
    instagram: '@seraphina_table',
  },
  host_03: {
    id: 'host_03',
    name: 'Arcadia Collective',
    handle: '@arcadia_arts',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400',
    bio: 'An independent arts & electronic acoustic collective organizing ambient listening sessions and spatial audio installations.',
    verified: true,
    totalEventsHosted: 32,
    totalAttendees: 3400,
    location: 'Berlin & Brooklyn',
    website: 'https://arcadia.audio',
    twitter: '@arcadia_sound',
  },
  host_04: {
    id: 'host_04',
    name: 'Dr. Marcus Vance',
    handle: '@marcus_vance',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    bio: 'Neuroscientist & breathwork practitioner. Facilitating cold immersion, sauna protocols, and circadian rhythm optimization.',
    verified: false,
    totalEventsHosted: 11,
    totalAttendees: 480,
    location: 'Austin, TX',
  },
};

export const MOCK_EVENTS: EventItem[] = [
  {
    id: 'evt_01',
    slug: 'aesthetic-systems-design-salon',
    title: 'Aesthetic Systems: Design Leaders Salon & Print Exhibition',
    tagline: 'An intimate evening examining editorial typography, physical print objects, and tactile user interface crafts.',
    description: `Join 40 design directors, typographers, and product architects for an off-the-record conversation on the resurgence of tactile design aesthetics in digital software. 

We will begin with a curated cocktail reception featuring natural amber wines, followed by a live panel discussion and an exclusive preview of KIN Studio's upcoming monograph on modern editorial layouts.

Key Topics:
• Moving beyond monochrome SaaS templates toward expressive typography.
• The physics of spatial UI, light diffusion, and material depth.
• Print craftsmanship techniques applied to high-scale web apps.`,
    category: 'Design & Tech',
    coverImage: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=1200',
    themeColor: 'amber',
    date: '2026-08-28',
    startTime: '18:30',
    endTime: '21:30',
    timezone: 'EST',
    locationName: 'The Atrium at KIN Studio',
    address: '452 Broome Street, Floor 4, SoHo, New York, NY 10013',
    isVirtual: false,
    host: MOCK_HOSTS.host_01,
    featured: true,
    tags: ['Design', 'Typography', 'Networking', 'Print', 'Cocktails'],
    totalCapacity: 50,
    tickets: [
      { id: 't_01', name: 'General Admission', price: 45, capacity: 40, sold: 34, description: 'Includes access to panel, exhibition, drinks & artisanal bites.' },
      { id: 't_02', name: 'Patron Pass + Monograph', price: 120, capacity: 10, sold: 8, description: 'Includes VIP seating, signed hardcover monograph, and after-hours drinks.' },
    ],
    guests: [
      { id: 'g_101', name: 'Sora Takahashi', email: 'sora@framer.io', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200', ticketType: 'General Admission', checkedIn: true, rsvpDate: '2026-08-10', status: 'confirmed' },
      { id: 'g_102', name: 'Mateo Rossi', email: 'mateo@design.co', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', ticketType: 'General Admission', checkedIn: false, rsvpDate: '2026-08-11', status: 'confirmed' },
      { id: 'g_103', name: 'Anya Petrov', email: 'anya@vogue.com', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200', ticketType: 'Patron Pass + Monograph', checkedIn: true, rsvpDate: '2026-08-09', status: 'confirmed' },
      { id: 'g_104', name: 'David Chen', email: 'david@stripe.com', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200', ticketType: 'General Admission', checkedIn: false, rsvpDate: '2026-08-12', status: 'confirmed' },
    ],
    requirements: ['Bring photo ID for door check-in', 'Dress code: Smart Casual / Minimalist'],
  },
  {
    id: 'evt_02',
    slug: 'terra-fire-natural-wine-hearth',
    title: 'Terra & Fire: Natural Wine & Woodfired Hearth Gathering',
    tagline: 'An intimate 5-course woodfired supper paired with biodynamic skin-contact wines in a private greenhouse garden.',
    description: `Experience an unhurried evening of wood-fired culinary art led by Chef Seraphina Lin. Hosted in a historic glasshouse in Presidio Heights, this seasonal supper celebrates heirloom stone fruit, wild mushrooms, line-caught halibut, and rare terracotta-aged amber wines from Georgia and Slovenia.

Each course is paired with stories from independent vigneron families who practice regenerative viticulture.

Menu Highlights:
• Charred figs, house-made ricotta, wildflower honey & thyme oil.
• Ember-roasted wild chanterelles with brown butter ash.
• Cedar-planked halibut over fermented plum glaze.
• Burnt Basque cheesecake with smoked sea salt.`,
    category: 'Culinary & Wine',
    coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1200',
    themeColor: 'terracotta',
    date: '2026-09-04',
    startTime: '19:00',
    endTime: '22:30',
    timezone: 'PST',
    locationName: 'Presidio Glasshouse Conservatory',
    address: '382 Washington Blvd, San Francisco, CA 94129',
    isVirtual: false,
    host: MOCK_HOSTS.host_02,
    featured: true,
    tags: ['Culinary', 'Natural Wine', 'Supper Club', 'Farm-to-Table'],
    totalCapacity: 24,
    tickets: [
      { id: 't_03', name: 'Supper & Wine Pairing Seat', price: 185, capacity: 24, sold: 20, description: '5-course woodfired menu with full biodynamic wine pairings.' },
    ],
    guests: [
      { id: 'g_201', name: 'Chloe Dubois', email: 'chloe@atelier.fr', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200', ticketType: 'Supper & Wine Pairing Seat', checkedIn: false, rsvpDate: '2026-08-01', status: 'confirmed' },
      { id: 'g_202', name: 'Oliver Wright', email: 'oliver@sfeats.org', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', ticketType: 'Supper & Wine Pairing Seat', checkedIn: false, rsvpDate: '2026-08-02', status: 'confirmed' },
    ],
    requirements: ['Dietary preferences collected after RSVP', '21+ only'],
  },
  {
    id: 'evt_03',
    slug: 'night-architecture-ambient-soundscapes',
    title: 'Night Architecture & Spatial Audio Performance in 4DSOUND',
    tagline: 'An immersive nocturnal sound bath and generative light installation in a subterranean brutalist gallery.',
    description: `Step into a 32-channel spatial audio sphere inside Williamsburg’s former grain silo vault. Arcadia Collective brings together modular synthesizer improvisers and visual projection artists for a 3-hour continuous sound environment.

Guests are provided floor pillows, weighted linen blankets, and botanical herbal infusions. Listening in total darkness except for subtle laser diffraction light fields.

Artist Lineup:
• Hiroshi Watanabe (Live Modular Synthesis)
• Elena Kogan (Continuous Cello & Grain Processing)
• Spatial audio design by Arcadia Sound Lab.`,
    category: 'Music & Night',
    coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1200',
    themeColor: 'burgundy',
    date: '2026-09-12',
    startTime: '21:00',
    endTime: '01:00',
    timezone: 'EST',
    locationName: 'The Silo Subterranean Vault',
    address: '88 North 11th Street, Brooklyn, NY 11249',
    isVirtual: false,
    host: MOCK_HOSTS.host_03,
    featured: true,
    tags: ['Ambient', 'Spatial Audio', 'Subterranean', 'Nightlife', 'Live Sound'],
    totalCapacity: 80,
    tickets: [
      { id: 't_04', name: 'General Floor Cushion', price: 35, capacity: 60, sold: 58, description: 'Access to main listening sphere & tea service.' },
      { id: 't_05', name: 'VIP Mezzanine Lounge', price: 65, capacity: 20, sold: 18, description: 'Elevated view, dedicated acoustic pod, elixir tasting.' },
    ],
    guests: [
      { id: 'g_301', name: 'Liam O’Connor', email: 'liam@pitchfork.com', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200', ticketType: 'General Floor Cushion', checkedIn: false, rsvpDate: '2026-08-05', status: 'confirmed' },
    ],
    requirements: ['Shoes removed at door', 'Silent space protocol during performances'],
  },
  {
    id: 'evt_04',
    slug: 'dawn-run-ice-bath-sauna-protocol',
    title: 'Dawn Run, Cold Immersion & Circadian Sauna Protocol',
    tagline: 'A sunrise 5K trail jog through Barton Springs followed by guided breathwork, 3°C ice plunges, and eucalyptus sauna.',
    description: `Reset your autonomic nervous system with Dr. Marcus Vance. We begin at 6:30 AM with a gentle 5K jog along the Ann and Roy Butler Hike-and-Bike Trail at Lady Bird Lake.

After the run, we transition into a structured 90-minute cold & heat contrast therapy session using custom cedar ice tubs and continuous wood-burning saunas.

Included:
• Electrolyte elixir bar & cold-pressed morning juices.
• Guided box breathing and HRV recovery monitoring.
• Artisan coffee by Onyx Coffee Lab.`,
    category: 'Wellness & Rituals',
    coverImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1200',
    themeColor: 'emerald',
    date: '2026-09-02',
    startTime: '06:30',
    endTime: '09:30',
    timezone: 'CST',
    locationName: 'Barton Springs Sauna Club',
    address: '2201 Barton Springs Rd, Austin, TX 78704',
    isVirtual: false,
    host: MOCK_HOSTS.host_04,
    featured: false,
    tags: ['Wellness', 'Ice Bath', 'Sauna', 'Running', 'Circadian'],
    totalCapacity: 30,
    tickets: [
      { id: 't_06', name: 'Morning Pass', price: 50, capacity: 30, sold: 22, description: 'Full access to run, ice tubs, saunas, and juice bar.' },
    ],
    guests: [],
  },
  {
    id: 'evt_05',
    slug: 'founders-breakfast-ai-agents',
    title: 'Founders & VC Roundtable: Autonomous AI Agents & Hardware',
    tagline: 'A private breakfast salon discussing next-generation agentic workflows, custom silicon, and vertical AI apps.',
    description: `An off-the-record gathering for 20 founder-CEOs and primary venture partners investing in autonomous agent architecture. Enjoy fresh pastries, single-origin pour-overs, and candid exchanges on product distribution, safety guardrails, and enterprise adoption.`,
    category: 'Founders & VC',
    coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200',
    themeColor: 'cobalt',
    date: '2026-09-18',
    startTime: '08:00',
    endTime: '10:30',
    timezone: 'PST',
    locationName: 'Battery Club Penthouse',
    address: '717 Battery St, San Francisco, CA 94111',
    isVirtual: false,
    host: MOCK_HOSTS.host_01,
    featured: false,
    tags: ['Founders', 'AI', 'Venture Capital', 'Networking', 'Breakfast'],
    totalCapacity: 20,
    tickets: [
      { id: 't_07', name: 'Invited Founder / Investor', price: 0, capacity: 20, sold: 16, description: 'Complimentary pass by invitation or approval.' },
    ],
    guests: [],
  },
  {
    id: 'evt_06',
    slug: 'generative-art-kinetics-exhibition',
    title: 'Generative Art & Kinetic Sculptures: Private Gallery Opening',
    tagline: 'An evening celebrating algorithmic drawings, plotter art, and responsive light kinetic installations.',
    description: `Exhibition featuring 12 contemporary artists working at the intersection of creative code, physical plotters, and light refraction art. Includes live pen plotter demonstrations and wine reception.`,
    category: 'Art & Culture',
    coverImage: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=1200',
    themeColor: 'amber',
    date: '2026-09-25',
    startTime: '18:00',
    endTime: '21:00',
    timezone: 'EST',
    locationName: 'Lumina Contemporary',
    address: '520 W 24th St, New York, NY 10011',
    isVirtual: false,
    host: MOCK_HOSTS.host_03,
    featured: false,
    tags: ['Generative Art', 'Gallery', 'Exhibition', 'Code Art'],
    totalCapacity: 100,
    tickets: [
      { id: 't_08', name: 'Free RSVP', price: 0, capacity: 100, sold: 74, description: 'Entry to gallery opening and live plotter demos.' },
    ],
    guests: [],
  }
];

export const CATEGORIES = [
  'All',
  'Design & Tech',
  'Art & Culture',
  'Culinary & Wine',
  'Wellness & Rituals',
  'Music & Night',
  'Founders & VC',
] as const;
