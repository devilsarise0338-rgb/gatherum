import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  motion, useScroll, useTransform, useSpring,
  useInView, useMotionValue, useAnimationFrame,
  AnimatePresence,
} from 'motion/react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Event } from '../types';
import EventCard from '../components/EventCard';
import {
  ArrowRight, Sparkles, Calendar, Users, Zap,
  ChevronDown, Star, Trophy, Ticket,
} from 'lucide-react';

function FloatingImage({
  src,
  size,
  top,
  left,
  right,
  bottom,
  delay = 0,
  duration = 4,
  rotate = 0,
  blur = 0,
  opacity = 1,
}: {
  src: string;
  size: number;
  top?: string | number;
  left?: string | number;
  right?: string | number;
  bottom?: string | number;
  delay?: number;
  duration?: number;
  rotate?: number;
  blur?: number;
  opacity?: number;
}) {
  return (
    <motion.img
      src={src}
      initial={{ rotate }}
      style={{
        position: 'absolute',
        top, left, right, bottom,
        width: size,
        height: size,
        objectFit: 'contain',
        filter: `drop-shadow(0px 15px 25px rgba(0,0,0,0.15)) blur(${blur}px)`,
        opacity,
        zIndex: blur > 2 ? 0 : 1,
      }}
      animate={{
        y: ['-15px', '15px', '-15px'],
        rotate: [rotate - 8, rotate + 8, rotate - 8],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════
   Magnetic Button
═══════════════════════════════════════════════════════ */
function MagneticBtn({
  children, className, onClick, style,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 18 });
  const springY = useSpring(y, { stiffness: 200, damping: 18 });

  function onMouseMove(e: React.MouseEvent) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.25);
    y.set((e.clientY - cy) * 0.25);
  }
  function onMouseLeave() { x.set(0); y.set(0); }

  return (
    <motion.button
      ref={ref}
      className={className}
      onClick={onClick}
      style={{ ...style, x: springX, y: springY }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════════
   Reveal on scroll
═══════════════════════════════════════════════════════ */
function Reveal({
  children, delay = 0, y = 40, className, style,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   Animated counter
═══════════════════════════════════════════════════════ */
function Counter({ to, label, color = 'var(--red)' }: { to: number; label: string; color?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const dur = 1800;
    const step = to / (dur / 16);
    const timer = setInterval(() => {
      start = Math.min(start + step, to);
      setCount(Math.floor(start));
      if (start >= to) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, to]);

  return (
    <motion.div
      ref={ref}
      className="stat-block"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, ease: 'backOut' }}
      whileHover={{ y: -4, boxShadow: 'var(--shadow-xl)' }}
    >
      <div className="stat-number" style={{ color }}>{count}</div>
      <div className="stat-label">{label}</div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   Marquee ticker
═══════════════════════════════════════════════════════ */
const TICKER_ITEMS = [
  '🎭 Cultural Fest', '💻 Tech Talks', '⚽ Sports Meet',
  '🏆 Hackathon', '🎵 Music Night', '🔧 Workshop Series',
  '🎨 Art Exhibition', '🎤 Open Mic', '📚 Book Fair',
  '🚀 Startup Summit',
];

function Marquee() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div style={{
      overflow: 'hidden', background: 'var(--yellow)', border: '2px solid var(--border)',
      borderLeft: 'none', borderRight: 'none', padding: '0.625rem 0', whiteSpace: 'nowrap',
    }}>
      <motion.div
        style={{ display: 'inline-flex', gap: '3rem' }}
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        {items.map((item, i) => (
          <span key={i} style={{
            fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.8125rem',
            letterSpacing: '0.05em', color: 'var(--ink)', textTransform: 'uppercase',
          }}>
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Scroll progress bar
═══════════════════════════════════════════════════════ */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });

  return (
    <motion.div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 4,
        background: 'var(--red)', transformOrigin: '0%', scaleX,
        zIndex: 9999,
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════
   Cursor follower
═══════════════════════════════════════════════════════ */
function CursorGlow() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 80, damping: 15 });
  const springY = useSpring(y, { stiffness: 80, damping: 15 });

  useEffect(() => {
    function move(e: MouseEvent) { x.set(e.clientX); y.set(e.clientY); }
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  return (
    <motion.div
      style={{
        position: 'fixed', pointerEvents: 'none', zIndex: 9998,
        width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(220,20,60,0.08) 0%, transparent 70%)',
        translateX: '-50%', translateY: '-50%',
        left: springX, top: springY,
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════
   Parallax image / decorative block
═══════════════════════════════════════════════════════ */
function ParallaxBlock({ speed = 0.3, style, children }: {
  speed?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-30%', '30%']);

  return (
    <div ref={ref} style={{ overflow: 'hidden', ...style }}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Main HomePage
═══════════════════════════════════════════════════════ */
export default function HomePage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState({ events: 0, students: 0, orgs: 0 });

  // Hero parallax
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(heroScroll, [0, 1], ['0%', '40%']);
  const heroOpacity = useTransform(heroScroll, [0, 0.7], [1, 0]);
  const heroScale = useTransform(heroScroll, [0, 1], [1, 1.1]);

  useEffect(() => {
    supabase.from('events').select('*, registrations(count)')
      .eq('is_unpublished', false).neq('registrations.status', 'cancelled')
      .order('start_time', { ascending: true }).limit(6)
      .then(({ data }) => {
        if (data) {
          setFeaturedEvents(data.map((e: any) => ({ ...e, registration_count: e.registrations?.[0]?.count ?? 0 })));
          setStats(s => ({ ...s, events: data.length }));
        }
      });
    supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'student')
      .then(({ count }) => setStats(s => ({ ...s, students: count ?? 0 })));
    supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'organizer')
      .then(({ count }) => setStats(s => ({ ...s, orgs: count ?? 0 })));
  }, []);

  return (
    <div style={{ overflowX: 'hidden' }}>
      <ScrollProgress />
      <CursorGlow />

      {/* ══════════════════════════════════════════════
          SECTION 1 — WELCOME / HERO
      ══════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        style={{
          minHeight: '100vh', position: 'relative',
          display: 'flex', alignItems: 'center',
          background: 'var(--off-white)', overflow: 'hidden',
        }}
      >
        {/* 3D Emoji Floating Elements */}
        <motion.div
          className="hide-on-mobile"
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            y: heroY, scale: heroScale,
          }}
        >
          {/* BACKGROUND LAYER (Blurred) */}
          <FloatingImage src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Calendar/3D/calendar_3d.png" size={140} top="12%" left="18%" delay={0} duration={6} rotate={-15} blur={4} opacity={0.6} />
          <FloatingImage src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Admission%20tickets/3D/admission_tickets_3d.png" size={110} top="20%" right="5%" delay={0.8} duration={4} rotate={25} blur={3} opacity={0.7} />
          <FloatingImage src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Basketball/3D/basketball_3d.png" size={90} bottom="15%" left="38%" delay={1.1} duration={5} rotate={10} blur={5} opacity={0.5} />
          
          {/* MIDGROUND LAYER */}
          <FloatingImage src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Microphone/3D/microphone_3d.png" size={120} top="8%" right="42%" delay={1.5} duration={5.5} rotate={-20} blur={1} />
          <FloatingImage src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Laptop/3D/laptop_3d.png" size={150} top="40%" right="18%" delay={0.3} duration={6} rotate={12} blur={1} />
          <FloatingImage src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Artist%20palette/3D/artist_palette_3d.png" size={130} bottom="8%" left="52%" delay={0.7} duration={5.2} rotate={-10} blur={0.5} />
          
          {/* FOREGROUND LAYER */}
          <FloatingImage src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Trophy/3D/trophy_3d.png" size={200} top="5%" right="15%" delay={0.2} duration={5} rotate={5} />
          <FloatingImage src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Party%20popper/3D/party_popper_3d.png" size={160} bottom="35%" left="48%" delay={1.2} duration={4.5} rotate={-25} />
          <FloatingImage src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Guitar/3D/guitar_3d.png" size={190} bottom="8%" right="10%" delay={0.9} duration={5.8} rotate={35} />
          <FloatingImage src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Pizza/3D/pizza_3d.png" size={100} top="3%" right="28%" delay={1.8} duration={4.2} rotate={15} />
        </motion.div>

        {/* Red wedge */}
        <div className="hide-on-mobile" style={{
          position: 'absolute', top: 0, right: 0, bottom: 0, width: '45%',
          background: 'var(--red)', clipPath: 'polygon(18% 0, 100% 0, 100% 100%, 0% 100%)',
          opacity: 0.055, pointerEvents: 'none',
        }} />

        {/* Yellow circle decor */}
        <motion.div
          className="hide-on-mobile"
          style={{
            position: 'absolute', bottom: '-8%', right: '5%',
            width: 320, height: 320, borderRadius: '50%',
            background: 'var(--yellow)', border: '2px solid var(--border)',
            opacity: 0.18, pointerEvents: 'none',
          }}
          animate={{ scale: [1, 1.08, 1], rotate: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Dot grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, rgba(26,18,9,0.06) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />

        {/* Content */}
        <motion.div
          className="container"
          style={{ position: 'relative', zIndex: 2, opacity: heroOpacity, width: '100%' }}
        >
          <div style={{ maxWidth: 660 }}>
            {/* Pill label */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'var(--yellow)', border: '2px solid var(--border)',
                borderRadius: '4px', padding: '0.3rem 0.875rem',
                fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.75rem',
                letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}>
                <Sparkles size={12} />
              </motion.span>
              Campus Events Platform
            </motion.div>

            {/* Headline — letters animate in */}
            <div style={{ overflow: 'hidden', marginBottom: '1.25rem' }}>
              <motion.h1
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  fontSize: 'clamp(2rem, 7vw, 5rem)',
                  fontWeight: 700, lineHeight: 1.0,
                  letterSpacing: '-0.03em',
                }}
              >
                Where Campus
              </motion.h1>
            </div>

            <div style={{ overflow: 'hidden', marginBottom: '1.75rem' }}>
              <motion.h1
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  fontSize: 'clamp(2rem, 7vw, 5rem)',
                  fontWeight: 700, lineHeight: 1.0,
                  letterSpacing: '-0.03em',
                  color: 'var(--red)',
                  WebkitTextStroke: '2px var(--ink)',
                  textShadow: '5px 5px 0 var(--ink)',
                  display: 'inline-block',
                }}
              >
                Life Happens.
              </motion.h1>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              style={{
                fontSize: '1.125rem', color: 'var(--ink-muted)',
                maxWidth: 460, marginBottom: '2.5rem', lineHeight: 1.75,
              }}
            >
              Discover events, register instantly, track your tickets — all in one
              brutally fast platform built for <strong>Poornima University</strong>.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.75 }}
              style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}
            >
              <MagneticBtn className="btn btn-primary btn-lg" onClick={() => navigate('/events')}>
                Explore Events <ArrowRight size={18} />
              </MagneticBtn>
              {!profile && (
                <MagneticBtn className="btn btn-secondary btn-lg" onClick={() => navigate('/auth')}>
                  Join Free
                </MagneticBtn>
              )}
              {profile?.role === 'organizer' && (
                <MagneticBtn className="btn btn-dark btn-lg" onClick={() => navigate('/organizer')}>
                  Dashboard
                </MagneticBtn>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          style={{
            position: 'absolute', bottom: '2.5rem', left: '50%', translateX: '-50%',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
            fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase',
            letterSpacing: '0.15em', color: 'var(--ink-muted)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
        >
          <span>Scroll</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
          >
            <ChevronDown size={20} color="var(--red)" />
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════
          MARQUEE TICKER
      ══════════════════════════════════════════════ */}
      <Marquee />

      {/* ══════════════════════════════════════════════
          SECTION 2 — STATS
      ══════════════════════════════════════════════ */}
      <section style={{
        background: 'var(--ink)', borderTop: '2px solid var(--border)',
        borderBottom: '2px solid var(--border)', padding: '4rem 0', position: 'relative', overflow: 'hidden',
      }}>
        {/* Stripes decor */}
        <div className="stripes" style={{ position: 'absolute', inset: 0, opacity: 0.08 }} />

        <div className="container" style={{ position: 'relative' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div className="tag" style={{ background: 'var(--yellow)', marginBottom: '0.75rem' }}>By the Numbers</div>
              <h2 style={{ color: 'var(--white)', fontSize: '2rem', fontWeight: 700 }}>Platform Stats</h2>
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
            <Counter to={stats.events} label="Live Events" color="var(--yellow)" />
            <Counter to={stats.students} label="Students" color="var(--red)" />
            <Counter to={stats.orgs} label="Organizers" color="#22C55E" />
            <Counter to={stats.events * 12 || 0} label="Registrations" color="var(--yellow)" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 3 — FEATURED EVENTS
      ══════════════════════════════════════════════ */}
      <section className="section" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Parallax background blob */}
        <ParallaxBlock
          style={{
            position: 'absolute', top: '-10%', right: '-10%',
            width: 500, height: 500, borderRadius: '50%',
            background: 'var(--red)', opacity: 0.04,
            pointerEvents: 'none', zIndex: 0,
          }}
          speed={0.2}
        >
          <div style={{ width: '100%', height: '100%' }} />
        </ParallaxBlock>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <Reveal>
            <div style={{
              display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem',
            }}>
              <div>
                <div className="tag" style={{ marginBottom: '0.5rem' }}>Upcoming</div>
                <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>Featured Events</h2>
              </div>
              <motion.button
                className="btn btn-ghost"
                onClick={() => navigate('/events')}
                whileHover={{ x: 4 }}
              >
                View All <ArrowRight size={16} />
              </motion.button>
            </div>
          </Reveal>

          {featuredEvents.length === 0 ? (
            <Reveal>
              <div style={{
                textAlign: 'center', padding: '5rem 2rem',
                background: 'var(--white)', border: '2px solid var(--border)',
                borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)',
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎭</div>
                <p style={{ fontWeight: 600, color: 'var(--ink-muted)' }}>No events yet. Check back soon!</p>
              </div>
            </Reveal>
          ) : (
            <div className="grid-3">
              {featuredEvents.map((ev, i) => (
                <Reveal key={ev.id} delay={i * 0.1}>
                  <EventCard event={ev} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 4 — HOW IT WORKS (sticky scroll)
      ══════════════════════════════════════════════ */}
      <section style={{
        background: 'var(--ink)', padding: '6rem 0',
        borderTop: '2px solid var(--border)', borderBottom: '2px solid var(--border)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div className="container">
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <div className="tag" style={{ background: 'var(--yellow)', marginBottom: '0.75rem' }}>Simple</div>
              <h2 style={{ color: 'var(--white)', fontSize: '2rem', fontWeight: 700 }}>How It Works</h2>
              <p style={{ color: 'rgba(255,255,255,0.55)', marginTop: '0.5rem', fontSize: '1rem' }}>
                Four steps from zero to the front row.
              </p>
            </div>
          </Reveal>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 720, margin: '0 auto' }}>
            {[
              { icon: <Users size={28} />, num: '01', title: 'Sign Up', desc: 'Create your account with your @poornima.org email. No waiting, no approvals.' },
              { icon: <Calendar size={28} />, num: '02', title: 'Discover', desc: 'Browse all upcoming campus events — filtered by category, date, or interest.' },
              { icon: <Zap size={28} />, num: '03', title: 'Register', desc: 'One click, instant confirmation. Waitlist automatically if the event is full.' },
              { icon: <Ticket size={28} />, num: '04', title: 'Attend', desc: 'Show your QR ticket at the door and walk in. Done.' },
            ].map((step, i) => (
              <Reveal key={i} delay={i * 0.12} y={30}>
                <motion.div
                  whileHover={{ x: 8, boxShadow: 'var(--shadow-xl)' }}
                  className="card card-red noise resp-flex-wrap" 
                  style={{
                    background: i % 2 === 0 ? 'var(--red)' : 'var(--yellow)',
                    color: i % 2 === 0 ? 'var(--white)' : 'var(--ink)',
                    border: '2px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.75rem',
                    display: 'flex', alignItems: 'center', gap: '1.5rem',
                    boxShadow: 'var(--shadow-md)',
                    cursor: 'default',
                  }}
                >
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '2.5rem', fontWeight: 700,
                    opacity: 0.25, flexShrink: 0, lineHeight: 1,
                  }}>
                    {step.num}
                  </div>
                  <div style={{ color: 'inherit', opacity: 0.85, flexShrink: 0 }}>{step.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.375rem' }}>{step.title}</div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.8, lineHeight: 1.6 }}>{step.desc}</div>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 5 — FEATURES BENTO
      ══════════════════════════════════════════════ */}
      <section className="section">
        <div className="container">
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div className="tag" style={{ marginBottom: '0.75rem' }}>Features</div>
              <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>Everything You Need</h2>
            </div>
          </Reveal>

          <div className="bento-grid">
            {/* Big card */}
            <Reveal delay={0} className="bento-span-2">
              <motion.div
                whileHover={{ y: -4, boxShadow: 'var(--shadow-xl)' }}
                className="card card-red noise"
                style={{ padding: '2rem', minHeight: 200, position: 'relative', overflow: 'hidden' }}
              >
                <Trophy size={40} style={{ marginBottom: '1rem', opacity: 0.8 }} />
                <h3 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.5rem' }}>Smart Registration</h3>
                <p style={{ opacity: 0.85, fontSize: '0.9375rem', maxWidth: 380, lineHeight: 1.65 }}>
                  Automatic waitlisting, one-click cancellations, and real-time seat availability — all powered by rock-solid Postgres logic.
                </p>
                <motion.div
                  style={{ position: 'absolute', right: '-20px', bottom: '-20px', fontSize: '7rem', opacity: 0.1 }}
                  animate={{ rotate: [0, 10, 0] }}
                  transition={{ duration: 6, repeat: Infinity }}
                >
                  🎟️
                </motion.div>
              </motion.div>
            </Reveal>

            <Reveal delay={0.1}>
              <motion.div
                whileHover={{ y: -4, boxShadow: 'var(--shadow-xl)' }}
                className="card card-yellow"
                style={{ padding: '2rem', minHeight: 200 }}
              >
                <Star size={32} style={{ marginBottom: '1rem', opacity: 0.75 }} />
                <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>QR Check-in</h3>
                <p style={{ opacity: 0.8, fontSize: '0.9rem', lineHeight: 1.6 }}>
                  Organisers scan QR codes directly from their phone — zero hardware required.
                </p>
              </motion.div>
            </Reveal>

            <Reveal delay={0.15}>
              <motion.div
                whileHover={{ y: -4, boxShadow: 'var(--shadow-xl)' }}
                className="card"
                style={{ padding: '2rem', minHeight: 200, background: 'var(--cream)' }}
              >
                <Sparkles size={32} style={{ marginBottom: '1rem', color: 'var(--red)', opacity: 0.85 }} />
                <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Role-Based Access</h3>
                <p style={{ opacity: 0.8, fontSize: '0.9rem', lineHeight: 1.6 }}>
                  Students, Organizers, Admins — each with the right tools and nothing more.
                </p>
              </motion.div>
            </Reveal>

            <Reveal delay={0.3} className="bento-span-2">
              <motion.div
                whileHover={{ y: -4, boxShadow: 'var(--shadow-xl)' }}
                className="card card-ink resp-flex-wrap"
                style={{ padding: '2rem', minHeight: 180, display: 'flex', alignItems: 'center', gap: '2rem' }}
              >
                <div>
                  <Zap size={36} color="var(--yellow)" style={{ marginBottom: '0.75rem' }} />
                  <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--white)' }}>Instant Notifications</h3>
                  <p style={{ opacity: 0.7, fontSize: '0.9rem', color: 'var(--white)', lineHeight: 1.6 }}>
                    Waitlist promotions happen automatically — no manual intervention from organisers.
                  </p>
                </div>
                <motion.div
                  style={{ fontSize: '5rem', opacity: 0.15, flexShrink: 0 }}
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  ⚡
                </motion.div>
              </motion.div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 6 — CTA BANNER
      ══════════════════════════════════════════════ */}
      {!profile && (
        <section style={{
          background: 'var(--red)', borderTop: '2px solid var(--border)',
          borderBottom: '2px solid var(--border)', padding: '6rem 0',
          position: 'relative', overflow: 'hidden',
        }}>
          <div className="stripes" style={{ position: 'absolute', inset: 0, opacity: 0.12 }} />

          {/* Floating emojis */}
          {['🎭', '🏆', '🎵', '💻', '⚽'].map((e, i) => (
            <motion.div
              key={i}
              style={{
                position: 'absolute', fontSize: '3rem', opacity: 0.12,
                top: `${10 + i * 16}%`,
                left: `${5 + i * 18}%`,
              }}
              animate={{ y: [-15, 15, -15], rotate: [-8, 8, -8] }}
              transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5, ease: 'easeInOut' }}
            >
              {e}
            </motion.div>
          ))}

          <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
            <Reveal>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
              <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 700, color: 'var(--white)', marginBottom: '1rem', lineHeight: 1.2 }}>
                Ready to join the action?
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: '2.5rem', fontSize: '1.0625rem', maxWidth: 480, margin: '0 auto 2.5rem' }}>
                Sign up in seconds and never miss a campus event again.
              </p>
              <MagneticBtn className="btn btn-secondary btn-lg" onClick={() => navigate('/auth')}>
                Get Started — It's Free <ArrowRight size={18} />
              </MagneticBtn>
            </Reveal>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════ */}
      <footer style={{
        background: 'var(--ink)', color: 'rgba(255,255,255,0.55)',
        borderTop: '2px solid var(--border)', padding: '3rem 0',
      }}>
        <div className="container">
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem',
          }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.5rem', color: 'var(--red)', marginBottom: '0.25rem' }}>
                Gatherum
              </div>
              <div style={{ fontSize: '0.8125rem' }}>Campus Events Platform · Poornima University</div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {[
                { label: 'Events', path: '/events' },
                { label: 'Sign In', path: '/auth' },
              ].map(l => (
                <motion.button
                  key={l.path}
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'rgba(255,255,255,0.65)', border: '2px solid rgba(255,255,255,0.15)' }}
                  onClick={() => navigate(l.path)}
                  whileHover={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}
                >
                  {l.label}
                </motion.button>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem' }}>
            © {new Date().getFullYear()} Gatherum. Built with ❤️ for campus life.
          </div>
        </div>
      </footer>
    </div>
  );
}
