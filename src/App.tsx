import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import * as THREE from 'three'
import {
  Magnet, MousePointerClick, Sprout, Workflow,
  Send, MailCheck, MessageSquare, Database,
  ArrowUpRight,
  type LucideIcon,
} from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

/* =========================================================================
   CUSTOM CURSOR — lerp-interpolated dot + ring, hide on touch devices
   ========================================================================= */
const CustomCursor = () => {
  useEffect(() => {
    const isTouch = !window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (isTouch) return
    const dot = document.getElementById('custom-cursor')
    const ring = document.getElementById('custom-cursor-ring')
    if (!dot || !ring) return

    let mx = 0, my = 0   // raw mouse
    let rx = 0, ry = 0   // ring lerp
    let raf = 0

    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY
      dot.style.transform = `translate(${mx - 6}px, ${my - 6}px)`
    }
    const tick = () => {
      rx += (mx - rx) * 0.12
      ry += (my - ry) * 0.12
      ring.style.transform = `translate(${rx - 19}px, ${ry - 19}px)`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    window.addEventListener('mousemove', onMove, { passive: true })

    // cursor states
    const addHover = (e: Event) => { (e.currentTarget as Element)?.closest('body')?.classList.add('cursor-hover') }
    const removeHover = (e: Event) => { (e.currentTarget as Element)?.closest('body')?.classList.remove('cursor-hover') }
    const interactives = document.querySelectorAll('a,button,[role="button"],.hover-lift,.eng-node,.wl-shot,.mag-btn')
    interactives.forEach(el => { el.addEventListener('mouseenter', addHover); el.addEventListener('mouseleave', removeHover) })

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      interactives.forEach(el => { el.removeEventListener('mouseenter', addHover); el.removeEventListener('mouseleave', removeHover) })
    }
  }, [])
  return (
    <>
      <div id="custom-cursor" aria-hidden />
      <div id="custom-cursor-ring" aria-hidden />
    </>
  )
}

/* =========================================================================
   MAGNETIC BUTTON — wraps any element, pulls it toward the cursor
   ========================================================================= */
const MagBtn = ({ children, strength = 0.38, className, style }: {
  children: ReactNode; strength?: number; className?: string; style?: CSSProperties
}) => {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const isTouch = !window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (isTouch) return
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      const dx = (e.clientX - cx) * strength
      const dy = (e.clientY - cy) * strength
      el.style.transform = `translate(${dx}px, ${dy}px)`
    }
    const onLeave = () => { el.style.transform = '' }
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave) }
  }, [strength])
  return <div ref={ref} className={`mag-btn${className ? ' ' + className : ''}`} style={{ display: 'inline-block', transition: 'transform 0.5s cubic-bezier(0.22,1,0.36,1)', ...style }}>{children}</div>
}

/* =========================================================================
   TILT CARD — 3-D perspective tilt on mousemove (pointer: fine only)
   ========================================================================= */
const TiltCard = ({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) => {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const isTouch = !window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (isTouch) return
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      const nx = ((e.clientX - r.left) / r.width - 0.5) * 2
      const ny = ((e.clientY - r.top) / r.height - 0.5) * 2
      el.style.transform = `perspective(900px) rotateY(${nx * 7}deg) rotateX(${-ny * 5}deg) scale(1.018)`
    }
    const onLeave = () => { el.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg) scale(1)' }
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave) }
  }, [])
  return <div ref={ref} className={`tilt-card${className ? ' ' + className : ''}`} style={style}>{children}</div>
}

/* =========================================================================
   IMAGE ASSETS — portal / world / curtains (per spec)
   ========================================================================= */
const PORTAL_BG =
  '/portal/portal-frame.webp'
const CURTAIN_LEFT =
  '/portal/curtain-left.webp'
const CURTAIN_RIGHT =
  '/portal/curtain-right.webp'
const WORLD_BG =
  '/portal/world-bg.webp'
const BOTTOM_CLOUDS =
  '/portal/bottom-clouds.webp'

/* =========================================================================
   FEATURED MOTIONSITES.AI SHOWCASES — arc slider flashcards
   ========================================================================= */
interface FeatureCard {
  title: string
  desc: string
  color: string
  img: string
  poster: string
  tag: string
}

const FEATURE_CARDS: FeatureCard[] = [
  { title: 'SkyElite Jets',      desc: 'Private-jet charter, cinematic motion',          color: '#f3cdd6', img: 'https://motionsites.ai/assets/hero-skyelite-preview-DHaZIgUv.gif',                poster: '/showcase/skyelite-poster.webp',      tag: 'Landing' },
  { title: 'Aetheris Voyage',    desc: 'Dreamlike drift through weightless calm',         color: '#dcedc2', img: 'https://motionsites.ai/assets/hero-aetheris-voyage-preview-BGJn1z4t.gif',          poster: '/showcase/aetheris-poster.webp',      tag: 'Hero' },
  { title: 'Velorah',            desc: 'Dark agency presence carved in motion',            color: '#c3e3f4', img: 'https://motionsites.ai/assets/hero-velorah-preview-CJNTtbpd.gif',                  poster: '/showcase/velorah-poster.webp',       tag: 'Agency' },
  { title: 'Liquid Glass',       desc: 'Glassmorphic surfaces, liquid light',              color: '#f0e4c0', img: 'https://motionsites.ai/assets/hero-liquid-glass-agency-preview-Cr5Q9-lc.gif',     poster: '/showcase/liquidglass-poster.webp',   tag: 'Landing' },
  { title: 'Organic Odyssey',    desc: 'Living organic shapes that breathe on scroll',     color: '#dcd2f2', img: 'https://image.mux.com/sgQrsXCnAqJBdTR1fwBPswK01vStFM8p00EtrhVrByCuY/animated.webp?width=640&fps=15', poster: '/showcase/organic-poster.webp',  tag: 'Hero' },
  { title: 'Dreamcore',          desc: 'Soft surreal landscapes from another dream',       color: '#f3cdd6', img: 'https://image.mux.com/XG9nlYYapGLVCNhOUW015BeaSWZe1atIOtYJSfroBB8g/animated.webp?width=640&fps=15', poster: '/showcase/dreamcore-poster.webp', tag: 'Landing' },
  { title: 'Urban Jungle',       desc: 'Bold city energy in print-grade type',             color: '#f0e4c0', img: 'https://motionsites.ai/assets/hero-urban-jungle-preview-DUD-6bVK.gif',            poster: '/showcase/urbanjungle-poster.webp',   tag: 'Landing' },
  { title: 'Prisma Studio',      desc: 'Creative studio through prismatic light',           color: '#dcedc2', img: 'https://motionsites.ai/assets/hero-prisma-preview-D4QeI0Bn.gif',                  poster: '/showcase/prisma-poster.webp',       tag: 'Agency' },
  { title: 'Aethera Studio',     desc: 'Atmospheric hero of starlit depth',                color: '#c3e3f4', img: 'https://motionsites.ai/assets/hero-aethera-preview-DknSlcTa.gif',                  poster: '/showcase/aethera-poster.webp',       tag: 'Hero' },
]

const SHOWCASE_SITES: FeatureCard[] = [
  ...FEATURE_CARDS,
  { title: 'Apex Pulse',         desc: 'Pulsing dark hero with kinetic type',              color: '#d8e4f0', img: 'https://image.mux.com/xKzY81Q7aYTP4DvBWsG501UrkzSbfpBSqSoXhL1vM1fo/animated.webp?width=640&fps=15', poster: '/showcase/apex-poster.webp',     tag: 'Landing' },
  { title: 'Bold Studio',        desc: 'Agency hero with bold modular grids',             color: '#e8d4c0', img: 'https://image.mux.com/xXODVswlwrbuab005fgkLYqGNg9qxMZS92802jhmegjhE/animated.webp?width=640&fps=15', poster: '/showcase/bold-poster.webp',     tag: 'Hero' },
  { title: 'Cosmic',             desc: 'Stellar nebula particles in motion',                color: '#c3d4f4', img: 'https://image.mux.com/ogtDSxKsLPBNVy61iAl8vl01GEFEftER2r7wu9t5olrU/animated.webp?width=640&fps=15', poster: '/showcase/cosmic-poster.webp',   tag: 'Hero' },
  { title: 'Wellness Hero',      desc: 'Spa-grade calm with breathing motion',              color: '#dce4d0', img: 'https://image.mux.com/wkvojrtJ1OO6UFGIMBllQ9y02sGJ6hXGbpx00DUf2f8xs/animated.webp?width=640&fps=15', poster: '/showcase/wellness-poster.webp', tag: 'Hero' },
  { title: 'Mythic Naturecore', desc: 'Mossy, mythic terrain in soft motion',               color: '#c0e0c8', img: 'https://image.mux.com/p2rqdIt93bi02G2aajLN9eOWifvK6xrBWDWy01yyypR5Q/animated.webp?width=640&fps=15', poster: '/showcase/mythic-poster.webp',   tag: 'Landing' },
  { title: 'Cinematic Brand',    desc: 'Cinema-grade grain and pacing',                      color: '#dcd6f2', img: 'https://image.mux.com/Cof4v02cIwHUsB39bW4QTmhTzjnaZ4xXzWMvhAX01yqQs/animated.webp?width=640&fps=15', poster: '/showcase/cinematic-poster.webp', tag: 'Hero' },
]

/* =========================================================================
   WEBSTUDIO BUSINESS CONTENT — reframed: "infrastructure we sell"
   Frontend = smart website. Backend = dmclosed (inbound AI sales agent) +
   alygent (outbound LinkedIn/email). We deliver the service end-to-end.
   ========================================================================= */
const CAPS = [
  { t: 'AI smart website design & build', d: 'Bespoke, fast, conversion-shaped — with the animation system baked in.' },
  { t: 'AI chatbot & AI voice agent',     d: 'Qualify, answer, and route visitors the moment they land.' },
  { t: 'LinkedIn outreach automation',   d: 'Outbound campaigns that start real conversations at scale.' },
  { t: 'Inbound + outbound outreach',     d: 'Multi-channel sequences, delivered white-label under your brand.' },
  { t: 'CRM & follow-up automation',     d: 'No lead slips — captured, scored, and nurtured automatically.' },
  { t: 'Conversion-focused copy & structure', d: 'Every section earns its place and points to the booking.' },
]

const STEPS = [
  { n: '01', t: 'Audit',   d: 'We map your funnel, ICP, and where qualified clients leak out today.' },
  { n: '02', t: 'Build',   d: 'We design and ship the smart website, the AI agents and the CRM wiring.' },
  { n: '03', t: 'Connect', d: 'We run inbound (dmclosed) + outbound (alygent) under your brand for you.' },
  { n: '04', t: 'Scale',   d: 'We tune the engine on real data until booked demos compound.' },
]

const QA = [
  { q: 'What does webstudio actually sell?', a: 'Infrastructure you can resell or have us run for you. The frontend is a smart AI website; the backend is the inbound + outbound engine — dmclosed (an AI sales agent on WhatsApp, Instagram, Messenger, Telegram, Email, web chat and SMS) and alygent (LinkedIn + email outreach with AI personalisation). We bolt them together under your brand and run the service.' },
  { q: 'What is an AI smart website?', a: 'A website with AI built in — a chatbot and voice agent that qualify and convert visitors in real time, wrapped in a fast, conversion-shaped design and animation system.' },
  { q: 'Do I run it, or do you run it for me?', a: 'Either. White-label the dashboards with your logo, domain and pricing and operate it yourself — or hand the running to us and we deliver the service end-to-end for your clients.' },
  { q: 'How does outbound (alygent) generate leads?', a: 'We run automated, AI-personalised LinkedIn and email campaigns to your ideal clients, with safe human-like timing, then sync every touchpoint to HubSpot, Salesforce, Pipedrive or GoHighLevel.' },
  { q: 'Which countries do you work with?', a: 'US, UK, Canada, Australia and New Zealand.' },
]

/* dmclosed — white-labeled AI sales agent (inbound backend) */
const DMCLOSED = {
  name: 'dmclosed',
  url: 'www.dmclosed.com',
  href: 'https://www.dmclosed.com',
  shot: '/shots/dmclosed.webp',
  tag: 'Inbound · AI sales agent',
  blurb:
    "The white-label AI sales agent. Your logo, your domain, your colours — it books calls and closes deals across WhatsApp, Instagram, Messenger, Telegram, Email, web chat and SMS. We run it for you (or hand you the keys).",
  features: [
    { t: 'It sells.',          d: 'Qualifies leads, handles objections, books. From $27 products to $50,000+ services.' },
    { t: 'It remembers.',      d: 'Every prior conversation and preference. Up to a 100k-token memory per contact.' },
    { t: 'It understands.',    d: 'Voice notes, photos, video, PDFs — parsed in real-time context.' },
    { t: 'It books.',          d: 'Spots buying signals and books prospects right inside the chat.' },
    { t: 'It improves.',       d: 'One-click optimisation tunes the agent on top conversations.' },
    { t: 'It campaigns.',      d: 'Outbound DMs, follow-ups, comment-to-DM on Instagram and Facebook.' },
  ],
  stats: [
    { v: '$50K+', l: 'deal sizes in DMs' },
    { v: '+312%', l: 'qualified leads' },
    { v: '×3.4',  l: 'calls booked' },
    { v: '8 ch.', l: 'one inbox' },
  ],
  channels: ['WhatsApp', 'Instagram', 'Messenger', 'Telegram', 'Email', 'Web Chat', 'SMS', 'iMessage'],
}

/* alygent — white-labeled LinkedIn + Email outreach (outbound backend) */
const ALYGENT = {
  name: 'alygent',
  url: 'www.alygent.com',
  href: 'https://www.alygent.com',
  shot: '/shots/alygent.webp',
  tag: 'Outbound · LinkedIn + Email',
  blurb:
    "Automate LinkedIn and email outreach with built-in AI personalisation. Smart limits, human-like timing and reply-aware sequences keep accounts safe while reply rates climb. White-label under your brand.",
  features: [
    { t: 'Data enrichment',     d: 'Verified emails and direct dials from LinkedIn, real-time verification, GDPR-aligned.' },
    { t: 'Sales AI agents',     d: 'Automate lead research, qualification and per-contact personalisation with AI.' },
    { t: 'LinkedIn automation', d: 'Connection requests, profile visits, follow-ups, auto-pause on replies.' },
    { t: 'Multichannel',        d: 'LinkedIn + email in one sequence; unified inbox for DMs, InMails and replies.' },
    { t: 'CRM sync',            d: 'Auto-sync touchpoints to HubSpot, Salesforce, Pipedrive and GoHighLevel.' },
    { t: 'Pipeline analytics',  d: 'Acceptance, reply rates, meetings and rep performance — A/B tested.' },
  ],
  stats: [
    { v: '+35%', l: 'reply rates' },
    { v: '10h',  l: 'saved / rep / week' },
    { v: '+45%', l: 'pipeline' },
    { v: '94%',  l: 'agency retention' },
  ],
  crms: ['Salesforce', 'Pipedrive', 'HubSpot', 'GoHighLevel'],
}

/* combined headline outcomes + channels for the engines intro stat panel */
const ENGINE_STATS = [
  { v: '+312%', l: 'Qualified leads' },
  { v: '×3.4',  l: 'Calls booked' },
  { v: '+35%',  l: 'Reply rates' },
  { v: '10h',   l: 'Saved / rep / week' },
]
const ALL_CHANNELS = ['WhatsApp', 'Instagram', 'Messenger', 'Telegram', 'LinkedIn', 'Email', 'Web Chat', 'SMS']

/* Booking calendar + top navigation */
const CAL_URL = 'https://lunacal.ai/amj/1-1-consultation'
const NAV_LINKS = [
  { label: 'Work', href: '#work' },
  { label: 'Engine', href: '#engine' },
  { label: 'Engines', href: '#engines' },
  { label: 'Proof', href: '#proof' },
  { label: 'Process', href: '#process' },
  { label: 'FAQ', href: '#faq' },
]

/* Real testimonials — paired face avatars via pravatar.cc */
const TESTIMONIALS = [
  { name: 'MRBEAR',            role: 'AppSumo Plus · 88 deals',          avatar: 'https://i.pravatar.cc/120?img=12', quote: 'One day I had weeks without clients. The next day, 6 discovery calls booked. Then 12, and within 72 hours 24 discovery calls have been booked.' },
  { name: 'Dr. Munib Ahmad',   role: 'FueGenix · €50K+ treatments',     avatar: 'https://i.pravatar.cc/120?img=33', quote: 'Our services start from €50k. Since we implemented the inbound agent we do zero effort to qualify leads. Selling is easier than selling a bottle of water to someone in a desert.' },
  { name: 'Luis Miguel Morro', role: 'Elitte Agencia · Tier 6',         avatar: 'https://i.pravatar.cc/120?img=15', quote: 'First tool that can deliver a 10x ROI within the first year. With 3 clients the investment is recovered. With 50, it is a strong revenue engine.' },
  { name: 'nherweck',          role: 'AppSumo Plus · 34 deals',         avatar: 'https://i.pravatar.cc/120?img=51', quote: 'One conversion landed me a recurring client worth $185/month. I set it up, walked away, and it handled the DM conversation without me touching it.' },
  { name: 'Muhammad Talha',    role: 'Google Ads · Rehab CEOs',         avatar: 'https://i.pravatar.cc/120?img=68', quote: 'This looks super human. You honestly can’t tell it’s AI. Handles rapid messages naturally and smart follow-ups based on where the customer is.' },
  { name: 'Antonio D.',        role: 'Digital Strategist & Coach',      avatar: 'https://i.pravatar.cc/120?img=60', quote: 'A powerful tool for sales engagement. User-friendly and easy to navigate, making it accessible even for those who are not tech-savvy.' },
]

const BRANDS = [
  'FUEGENIX', 'DPG Media', 'Horeca DM', 'BikeFixr', 'Thinking Minds',
  'CATALYS', 'RAYON', 'LinkAssist', 'Sean Dexter', 'Alpha Media',
  'SoundaTech', 'Shake Agency',
]

/* =========================================================================
   DESIGN TOKENS
   ========================================================================= */
const C = {
  sand: '#e9e1d4', sand2: '#dccfbb', cream: '#f7f1e6',
  espresso: '#2b2620', taupe: '#6e5f4b',
  bronze: '#b08a5a', bronzeLt: '#d8be97', gold: '#e8b45c', goldDeep: '#8a6a2f',
  blue: '#4f6f9c', blueLt: '#8fa8cb',
  hairline: 'rgba(43,38,32,0.12)',
}
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

/* =========================================================================
   HELPERS
   ========================================================================= */
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max)
const MAG = { world: 6, clouds: 9, portal: 7, curtainL: 14, curtainR: 14 }

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const onChange = () => setIsMobile(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return isMobile
}

/* =========================================================================
   GsapReveal — registers once, animates an element on scroll-in
   ========================================================================= */
const GsapReveal = ({
  children,
  y = 30,
  delay = 0,
  className,
  style,
}: {
  children: ReactNode
  y?: number
  delay?: number
  className?: string
  style?: CSSProperties
}) => {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const ctx = gsap.context(() => {
      // Apple-style reveal: scrubbed rise + scale + de-blur as the block enters the viewport.
      gsap.fromTo(
        el,
        { opacity: 0, y: y * 2, scale: 0.94, filter: 'blur(14px)' },
        {
          opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', ease: 'power2.out', delay,
          scrollTrigger: {
            trigger: el,
            start: 'top 92%',
            end: 'top 58%',
            scrub: 0.6,
          },
        },
      )
    }, el)
    return () => ctx.revert()
  }, [y, delay])
  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  )
}

/* =========================================================================
   useTypewriter — text, speed=38ms, startDelay=600ms, {displayed, done}.
   Only starts once visible (IntersectionObserver).
   ========================================================================= */
function useTypewriter(text: string, speed = 38, startDelay = 600) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const [started, setStarted] = useState(false)
  const hostRef = useRef<HTMLParagraphElement>(null)
  useEffect(() => {
    const el = hostRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setStarted(true)
            io.disconnect()
          }
        })
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  useEffect(() => {
    if (!started) return
    let i = 0
    let interval: ReturnType<typeof setInterval>
    const startT = setTimeout(() => {
      interval = setInterval(() => {
        i += 1
        setDisplayed(text.slice(0, i))
        if (i >= text.length) {
          clearInterval(interval)
          setDone(true)
        }
      }, speed)
    }, startDelay)
    return () => {
      clearTimeout(startT)
      if (interval) clearInterval(interval)
    }
  }, [started, text, speed, startDelay])
  return { displayed, done, hostRef }
}

/* Scroll-gated typewriter: types once `active` flips true (used inside the portal). */
const ScrollTypewriter = ({
  text,
  active,
  speed = 42,
  style,
  cursorColor = '#fff',
}: {
  text: string
  active: boolean
  speed?: number
  style?: CSSProperties
  cursorColor?: string
}) => {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const startedRef = useRef(false)
  useEffect(() => {
    if (!active || startedRef.current) return
    startedRef.current = true
    let i = 0
    const interval = setInterval(() => {
      i += 1
      setDisplayed(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(interval)
        setDone(true)
      }
    }, speed)
    return () => clearInterval(interval)
  }, [active, text, speed])
  return (
    <span style={{ position: 'relative', ...style }}>
      {displayed}
      {!done && (
        <span
          aria-hidden
          style={{
            display: 'inline-block',
            width: 3,
            height: '0.92em',
            background: cursorColor,
            verticalAlign: 'text-bottom',
            marginLeft: 4,
            animation: 'blink 1s step-end infinite',
          }}
        />
      )}
    </span>
  )
}

const TypewriterLine = ({
  text,
  color = C.espresso,
  cursorColor = C.espresso,
  style,
}: {
  text: string
  color?: string
  cursorColor?: string
  style?: CSSProperties
}) => {
  const { displayed, done, hostRef } = useTypewriter(text)
  return (
    <p
      ref={hostRef}
      style={{
        color,
        fontFamily: "'Imprima', sans-serif",
        fontSize: 'clamp(18px, 4vw, 26px)',
        lineHeight: 1.35,
        fontWeight: 400,
        minHeight: 54,
        margin: 0,
        position: 'relative',
        ...style,
      }}
    >
      {displayed}
      {!done && (
        <span
          aria-hidden
          style={{
            display: 'inline-block',
            width: 2,
            height: '1.1em',
            background: cursorColor,
            verticalAlign: 'middle',
            marginLeft: 2,
            animation: 'blink 1s step-end infinite',
          }}
        />
      )}
    </p>
  )
}

/* =========================================================================
   SMALL UI
   ========================================================================= */
const ScrollChevron = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden style={{ animation: 'bobUp 1.8s ease-in-out infinite' }}>
    <path d="M6 9l6 6 6-6" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/* =========================================================================
   ARC SLIDER — flashcards inside the portal (slow)
   ========================================================================= */
const ArcCardSlider = ({ cards, rotationOffset, isMobile }: { cards: FeatureCard[]; rotationOffset: number; isMobile: boolean }) => {
  const cardSpacingDeg = isMobile ? 12 : 9
  const centerIndex = Math.floor(cards.length / 2)
  const arcRadius = isMobile ? 700 : 1100
  const cardW = isMobile ? 170 : 240
  const cardH = isMobile ? 190 : 250
  const sliderH = isMobile ? 280 : 380
  const radius = isMobile ? 150 : 210
  return (
    <div style={{ position: 'relative', width: '100%', height: sliderH }}>
      {cards.map((c, i) => {
        const baseDeg = (i - centerIndex) * cardSpacingDeg
        const deg = baseDeg - rotationOffset + centerIndex * cardSpacingDeg
        const rad = (deg * Math.PI) / 180
        const x = Math.sin(rad) * arcRadius
        const y = arcRadius - Math.cos(rad) * arcRadius
        const bottom = -y + radius
        const halfW = cardW / 2
        return (
          <div key={c.title} style={{
            position: 'absolute', left: `calc(50% + ${x}px - ${halfW}px)`, bottom,
            width: cardW, height: cardH,
            transform: `rotate(${deg}deg)`,
            transformOrigin: `${halfW}px ${arcRadius}px`,
            borderRadius: isMobile ? 18 : 26, overflow: 'hidden',
            boxShadow: '0 12px 44px rgba(80,40,60,0.32), 0 2px 10px rgba(0,0,0,0.45)',
            background: c.color,
          }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("${c.poster}")`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: c.color }} />
            <div style={{ position: 'absolute', top: isMobile ? 8 : 10, left: isMobile ? 8 : 10, padding: '2px 7px', borderRadius: 999, background: 'rgba(255,255,255,0.9)', color: '#2a1410', fontFamily: "'Imprima', sans-serif", fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{c.tag}</div>
            <div style={{ position: 'absolute', top: isMobile ? 8 : 10, right: isMobile ? 8 : 10, width: 22, height: 22, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.7)', color: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Imprima', sans-serif", fontSize: 9 }}>{String(i + 1).padStart(2, '0')}</div>
            {/* slim scrim only at the bottom — leaves ~80% of the website reveal visible */}
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '32%', background: 'linear-gradient(to top, rgba(6,3,5,0.92) 0%, rgba(6,3,5,0.5) 55%, rgba(6,3,5,0) 100%)' }} />
            <div style={{ position: 'absolute', left: isMobile ? 12 : 14, right: isMobile ? 12 : 14, bottom: isMobile ? 10 : 12 }}>
              <div style={{ fontFamily: "'Viaoda Libre', serif", fontSize: isMobile ? 15 : 19, lineHeight: 1.05, color: '#fff', textShadow: '0 1px 8px rgba(0,0,0,0.85)' }}>{c.title}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* =========================================================================
   LINE-MASK reveal — staggered slide-up text
   ========================================================================= */
const LineMask = ({ children, show, delay, style }: { children: ReactNode; show: boolean; delay: number; style?: CSSProperties }) => (
  <span style={{ display: 'block', overflow: 'hidden', paddingBottom: '0.12em', ...style }}>
    <span style={{
      display: 'block',
      transform: show ? 'translateY(0)' : 'translateY(115%)',
      transition: `transform 0.9s ${EASE}`,
      transitionDelay: `${delay}s`,
    }}>{children}</span>
  </span>
)

/* =========================================================================
   MARQUEE — track of items animated L→R or R→L, seamless loop.
   ========================================================================= */
const Marquee = ({ direction = 'L', speed = 36, gap = 18, children, fade = true }: { direction?: 'L' | 'R'; speed?: number; gap?: number; children: ReactNode; fade?: boolean }) => {
  const animation = direction === 'L' ? 'marqueeL' : 'marqueeR'
  return (
    <div style={{
      position: 'relative', overflow: 'hidden', width: '100%',
      ...(fade ? {
        maskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
      } : {}),
    }}>
      <div style={{ display: 'flex', gap, width: 'max-content', animation: `${animation} ${speed}s linear infinite`, willChange: 'transform' }}>
        <div style={{ display: 'flex', gap }}>{children}</div>
        <div style={{ display: 'flex', gap }} aria-hidden>{children}</div>
      </div>
    </div>
  )
}

/* =========================================================================
   STRATEGIC INFOGRAPHIC — inbound → AI brain (smart website) → outbound
   ========================================================================= */
type EngNode = { label: string; sub: string; cy: number; icon: LucideIcon }
const INBOUND: EngNode[] = [
  { label: 'Lead Generation', sub: 'Capture demand at scale',  cy: 130, icon: Magnet },
  { label: 'Lead Capture',    sub: 'Forms, chat & funnels',     cy: 270, icon: MousePointerClick },
  { label: 'Lead Nurturing',  sub: 'AI follow-up sequences',    cy: 410, icon: Sprout },
  { label: 'Lead Automation', sub: 'Hands-off pipelines',       cy: 550, icon: Workflow },
]
const OUTBOUND: EngNode[] = [
  { label: 'Outbound Campaigns', sub: 'Targeted multi-channel', cy: 130, icon: Send },
  { label: 'Email Automation',   sub: 'Personalised at scale',  cy: 270, icon: MailCheck },
  { label: 'SMS / WhatsApp',     sub: 'Instant conversations',  cy: 410, icon: MessageSquare },
  { label: 'CRM Integration',    sub: 'Everything in sync',      cy: 550, icon: Database },
]
// services that orbit the brain — the work we do, popping around it
const ORBIT_CHIPS = ['AI Chat', 'Smart Forms', 'Booking', 'Analytics', 'SEO', 'Payments']
const VB_W = 1320, VB_H = 700
const BROWSER = { x: 470, w: 380, y: 110, h: 480 }
const IN_X = 300, OUT_X = 1020
const TARGET_Y = [230, 300, 400, 470]
const inPath = (i: number) =>
  `M ${IN_X} ${INBOUND[i].cy} C ${IN_X + 80} ${INBOUND[i].cy} ${BROWSER.x - 70} ${TARGET_Y[i]} ${BROWSER.x} ${TARGET_Y[i]}`
const outPath = (i: number) =>
  `M ${OUT_X} ${OUTBOUND[i].cy} C ${OUT_X - 80} ${OUTBOUND[i].cy} ${BROWSER.x + BROWSER.w + 70} ${TARGET_Y[i]} ${BROWSER.x + BROWSER.w} ${TARGET_Y[i]}`
const pctL = (x: number) => `${(x / VB_W) * 100}%`
const pctT = (y: number) => `${(y / VB_H) * 100}%`

/* =========================================================================
   Brain3D — the real Three.js brain (ported from components/Brain3D.tsx).
   Animated gold cerebrum + cerebellum + stem, glowing synapses, neural
   pulses. Rotates slowly and reacts to the cursor. No outward scatter.
   ========================================================================= */
function hash(x: number, y: number, z: number) {
  const n = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453
  return n - Math.floor(n)
}
const smooth3 = (t: number) => t * t * (3 - 2 * t)
function noise3(x: number, y: number, z: number) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z)
  const xf = x - xi, yf = y - yi, zf = z - zi
  const u = smooth3(xf), v = smooth3(yf), w = smooth3(zf)
  const lp = (a: number, b: number, t: number) => a + (b - a) * t
  const c000 = hash(xi, yi, zi), c100 = hash(xi + 1, yi, zi)
  const c010 = hash(xi, yi + 1, zi), c110 = hash(xi + 1, yi + 1, zi)
  const c001 = hash(xi, yi, zi + 1), c101 = hash(xi + 1, yi, zi + 1)
  const c011 = hash(xi, yi + 1, zi + 1), c111 = hash(xi + 1, yi + 1, zi + 1)
  const x00 = lp(c000, c100, u), x10 = lp(c010, c110, u)
  const x01 = lp(c001, c101, u), x11 = lp(c011, c111, u)
  return lp(lp(x00, x10, v), lp(x01, x11, v), w)
}
function ridged(x: number, y: number, z: number) {
  let sum = 0, amp = 0.55, freq = 1
  for (let o = 0; o < 4; o++) {
    const n = 1 - Math.abs(2 * noise3(x * freq, y * freq, z * freq) - 1)
    sum += n * n * amp
    freq *= 2.05
    amp *= 0.5
  }
  return sum
}
function cerebrum(dir: THREE.Vector3, out: THREE.Vector3) {
  const W = 0.94, Hh = 0.82, L = 1.2
  const f = ridged(dir.x * 3.0 + 11, dir.y * 3.0 + 5, dir.z * 3.0 + 2)
  const r = 0.86 + 0.18 * f
  let x = dir.x * r * W
  let y = dir.y * r * Hh
  const z = dir.z * r * L
  const g = Math.exp(-(x * x) / (2 * 0.13 * 0.13))
  const top = Math.max(0, y)
  y -= g * 0.26 * smooth3(Math.min(1, top * 1.6))
  x += Math.sign(x || 1) * g * 0.06
  if (y < 0) y *= 0.82
  out.set(x, y - 0.04, z)
}

interface Brain3DProps {
  size?: number
}
const Brain3D = ({ size = 220 }: Brain3DProps) => {
  const mount = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const small = window.innerWidth < 760
    const el = mount.current
    if (!el) return
    const W = () => el.clientWidth || 1
    const H = () => el.clientHeight || 1

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, W() / H(), 0.1, 100)
    camera.position.set(0, 0, 4.7)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(W(), H())
    el.appendChild(renderer.domElement)

    const group = new THREE.Group()
    group.rotation.x = -0.32
    group.rotation.y = 0.35
    scene.add(group)

    const SCALE = 1.35
    const GOLD = new THREE.Color('#e8b45c')
    const GOLD_BRIGHT = new THREE.Color('#ffd884')

    const geo = new THREE.IcosahedronGeometry(1, small ? 4 : 5)
    const p = geo.attributes.position as THREE.BufferAttribute
    const dir = new THREE.Vector3()
    const out = new THREE.Vector3()
    for (let i = 0; i < p.count; i++) {
      dir.set(p.getX(i), p.getY(i), p.getZ(i)).normalize()
      cerebrum(dir, out)
      p.setXYZ(i, out.x * SCALE, out.y * SCALE, out.z * SCALE)
    }
    geo.computeVertexNormals()

    // luminous translucent amber crystal — glows from within, glossy rim
    const surfMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#7a4f1f'),
      emissive: new THREE.Color('#c77f2a'),
      emissiveIntensity: 0.55,
      metalness: 0.25, roughness: 0.18,
      transmission: 0.55, thickness: 1.4, ior: 1.45,
      clearcoat: 1, clearcoatRoughness: 0.25,
      transparent: true, opacity: 0.94,
    })
    group.add(new THREE.Mesh(geo, surfMat))

    // inner glow shell — additive amber halo just under the surface for a lit-from-within look
    const glowMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#ffb44d'),
      transparent: true, opacity: 0.16,
      blending: THREE.AdditiveBlending, side: THREE.BackSide, depthWrite: false,
    })
    const glowMesh = new THREE.Mesh(geo, glowMat)
    glowMesh.scale.setScalar(1.04)
    group.add(glowMesh)

    // bright gold neural lacing across the cortex
    const wire = new THREE.LineSegments(
      new THREE.WireframeGeometry(geo),
      new THREE.LineBasicMaterial({
        color: GOLD_BRIGHT, transparent: true, opacity: small ? 0.22 : 0.3,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }),
    )
    group.add(wire)

    const cebGeo = new THREE.IcosahedronGeometry(1, small ? 3 : 4)
    const cp = cebGeo.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < cp.count; i++) {
      dir.set(cp.getX(i), cp.getY(i), cp.getZ(i)).normalize()
      const fold = 0.12 * Math.sin(dir.y * 26) + 0.06 * ridged(dir.x * 6, dir.y * 6, dir.z * 6)
      const r = 1 + fold
      cp.setXYZ(i, dir.x * r * 0.5 * SCALE, dir.y * r * 0.36 * SCALE, dir.z * r * 0.46 * SCALE)
    }
    cebGeo.computeVertexNormals()
    group.add(new THREE.Mesh(cebGeo, surfMat))

    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12 * SCALE, 0.07 * SCALE, 0.6 * SCALE, 10, 1, true),
      surfMat,
    )
    stem.position.set(0, -0.62 * SCALE - 0.34 * SCALE, -0.92 * SCALE)
    group.add(stem)

    scene.add(new THREE.AmbientLight(0x8a6a3a, 0.85))
    const key = new THREE.DirectionalLight(0xfff0cf, 3.0)
    key.position.set(-2, 3, 4)
    scene.add(key)
    const rim = new THREE.DirectionalLight(0x9fb6da, 2.4)
    rim.position.set(3.2, -0.5, -2.5)
    scene.add(rim)
    const fill = new THREE.DirectionalLight(0xe8b45c, 1.0)
    fill.position.set(0, -3, 2)
    scene.add(fill)
    // warm core point light — makes the crystal glow from inside
    const core = new THREE.PointLight(0xffc36a, 4.2, 6, 2)
    core.position.set(0, 0, 0)
    group.add(core)

    const hubs: THREE.Vector3[] = []
    const step = small ? 23 : 47
    for (let i = 0; i < p.count; i += step) {
      hubs.push(new THREE.Vector3(p.getX(i), p.getY(i), p.getZ(i)))
    }
    const nodePos = new Float32Array(hubs.length * 3)
    const nodePhase = new Float32Array(hubs.length)
    hubs.forEach((v, i) => {
      nodePos[i * 3] = v.x; nodePos[i * 3 + 1] = v.y; nodePos[i * 3 + 2] = v.z
      nodePhase[i] = Math.random() * Math.PI * 2
    })
    const nodeGeo = new THREE.BufferGeometry()
    nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePos, 3))
    nodeGeo.setAttribute('aPhase', new THREE.BufferAttribute(nodePhase, 1))
    const nodeMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 }, uSize: { value: small ? 38 : 50 },
        uPR: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader: `
        attribute float aPhase; uniform float uTime; uniform float uSize; uniform float uPR;
        varying float vTw;
        void main(){
          float tw = 0.5 + 0.5*sin(uTime*0.9 + aPhase);
          vTw = tw;
          vec4 mv = modelViewMatrix * vec4(position,1.0);
          gl_PointSize = uSize * uPR * (0.35 + 0.9*tw) * (1.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        varying float vTw;
        void main(){
          float d = length(gl_PointCoord - 0.5);
          if(d > 0.5) discard;
          // soft glowing core + halo
          float core = smoothstep(0.5, 0.0, d);
          float halo = smoothstep(0.5, 0.12, d);
          vec3 col = mix(vec3(0.95,0.72,0.32), vec3(1.0,0.98,0.88), vTw);
          float a = core * (0.45 + 0.55*vTw) + halo * 0.25;
          gl_FragColor = vec4(col, a);
        }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    })
    group.add(new THREE.Points(nodeGeo, nodeMat))

    const edges: number[][] = []
    const linePts: number[] = []
    for (let a = 0; a < hubs.length; a++) {
      const dists: [number, number][] = []
      for (let b = 0; b < hubs.length; b++) {
        if (a === b) continue
        dists.push([hubs[a].distanceToSquared(hubs[b]), b])
      }
      dists.sort((m, n) => m[0] - n[0])
      const k = 2
      for (let j = 0; j < k; j++) {
        const b = dists[j][1]
        if (a < b) {
          edges.push([a, b])
          linePts.push(hubs[a].x, hubs[a].y, hubs[a].z, hubs[b].x, hubs[b].y, hubs[b].z)
        }
      }
    }
    const connGeo = new THREE.BufferGeometry()
    connGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePts, 3))
    group.add(new THREE.LineSegments(
      connGeo,
      new THREE.LineBasicMaterial({
        color: GOLD, transparent: true, opacity: 0.5,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }),
    ))

    const N_PULSE = small ? 18 : 34
    const pulsePos = new Float32Array(N_PULSE * 3)
    const pulse = Array.from({ length: N_PULSE }, () => ({
      e: (Math.random() * edges.length) | 0, t: Math.random(),
      sp: 0.0018 + Math.random() * 0.0028,
    }))
    const pulseGeo = new THREE.BufferGeometry()
    pulseGeo.setAttribute('position', new THREE.BufferAttribute(pulsePos, 3))
    group.add(new THREE.Points(
      pulseGeo,
      new THREE.PointsMaterial({
        color: new THREE.Color('#fff6d8'), size: small ? 0.15 : 0.2,
        transparent: true, opacity: 1, depthWrite: false, blending: THREE.AdditiveBlending,
      }),
    ))

    let mx = 0, my = 0, tx = 0, ty = 0
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2
    }
    window.addEventListener('mousemove', onMove)

    let raf = 0
    let t = 0
    const ease = (x: number) => x * x * (3 - 2 * x)
    const frame = () => {
      t += 0.016
      nodeMat.uniforms.uTime.value = t
      // breathing inner glow
      core.intensity = 3.4 + Math.sin(t * 1.6) * 1.3
      surfMat.emissiveIntensity = 0.5 + Math.sin(t * 1.6) * 0.18
      mx += (tx - mx) * 0.03
      my += (ty - my) * 0.03
      group.rotation.y = 0.35 + t * 0.12 + mx * 0.5
      group.rotation.x = -0.32 + my * 0.25

      for (let k = 0; k < N_PULSE; k++) {
        const pu = pulse[k]
        pu.t += pu.sp
        if (pu.t >= 1) { pu.e = (Math.random() * edges.length) | 0; pu.t = 0 }
        const [ia, ib] = edges[pu.e]
        const a = hubs[ia], b = hubs[ib]
        const e2 = ease(pu.t)
        pulsePos[k * 3] = a.x + (b.x - a.x) * e2
        pulsePos[k * 3 + 1] = a.y + (b.y - a.y) * e2
        pulsePos[k * 3 + 2] = a.z + (b.z - a.z) * e2
      }
      pulseGeo.attributes.position.needsUpdate = true

      renderer.render(scene, camera)
      if (!reduce) raf = requestAnimationFrame(frame)
    }
    frame()

    const onResize = () => {
      camera.aspect = W() / H()
      camera.updateProjectionMatrix()
      renderer.setSize(W(), H())
    }
    window.addEventListener('resize', onResize)
    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(raf)
      else if (!reduce) frame()
    }
    document.addEventListener('visibilitychange', onVis)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVis)
      geo.dispose(); surfMat.dispose(); glowMat.dispose()
      ;(wire.geometry as THREE.BufferGeometry).dispose()
      ;(wire.material as THREE.Material).dispose()
      cebGeo.dispose(); stem.geometry.dispose()
      nodeGeo.dispose(); nodeMat.dispose()
      connGeo.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div
      ref={mount}
      aria-label="AI core"
      role="img"
      style={{ width: size, height: size, position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
    />
  )
}

const StrategicInfographic = () => {
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = root.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = gsap.context(() => {
      el.querySelectorAll<SVGPathElement>('.sig-line').forEach((p) => {
        const len = p.getTotalLength()
        p.style.strokeDasharray = `${len}`
        p.style.strokeDashoffset = reduce ? '0' : `${len}`
      })
      if (reduce) {
        gsap.set('.info-node, .brain-grp, .info-col-label, .info-browser, .info-depth', { opacity: 1, scale: 1 })
        return
      }
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: { trigger: el, start: 'top 75%', once: true },
      })
      tl.from('.info-depth', { opacity: 0, scale: 1.06, duration: 1.1 }, 0)
        .from('.info-browser', { opacity: 0, scale: 0.86, duration: 1 }, 0.1)
        .from('.brain-grp', { opacity: 0, scale: 0.7, duration: 1.1 }, 0.25)
        .from('.info-col-label', { opacity: 0, y: -10, duration: 0.55, stagger: 0.1 }, 0.55)
      for (let i = 0; i < 4; i++) {
        const tIn = 0.75 + i * 0.32
        const tOut = 0.9 + i * 0.32
        // pop-in: fade + slight blur clear only (keep the -50% Y centering intact via yPercent)
        tl.fromTo(`.node-in-${i}`, { opacity: 0, scale: 0.7, filter: 'blur(8px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.6, ease: 'back.out(1.6)' }, tIn)
          .to(`.line-in-${i}`, { strokeDashoffset: 0, duration: 0.55 }, tIn)
          .fromTo(`.node-out-${i}`, { opacity: 0, scale: 0.7, filter: 'blur(8px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.6, ease: 'back.out(1.6)' }, tOut)
          .to(`.line-out-${i}`, { strokeDashoffset: 0, duration: 0.55 }, tOut)
      }
      tl.add(() => el.classList.add('flowing'), '>-0.2')
    }, el)
    return () => ctx.revert()
  }, [])

  const nodeStyle = (i: number, side: 'in' | 'out'): CSSProperties => ({
    position: 'absolute',
    // IN_X = right edge of inbound cards; OUT_X = left edge of outbound. Symmetric gaps to the browser.
    right: side === 'in' ? `calc(${100 - (IN_X / VB_W) * 100}% )` : 'auto',
    left: side === 'out' ? `${(OUT_X / VB_W) * 100}%` : 'auto',
    top: pctT(side === 'in' ? INBOUND[i].cy : OUTBOUND[i].cy),
    transform: 'translateY(-50%)',
    width: 'clamp(200px, 21vw, 290px)',
    padding: 'clamp(14px, 1.6vw, 20px) clamp(16px, 1.8vw, 22px)',
    borderRadius: 18,
    background: 'linear-gradient(160deg, rgba(255,253,248,0.96), rgba(247,241,230,0.9))',
    border: `1px solid ${side === 'in' ? 'rgba(176,138,90,0.32)' : 'rgba(79,111,156,0.3)'}`,
    boxShadow: '0 14px 36px -18px rgba(43,38,32,0.4)',
    fontFamily: "'Imprima', sans-serif", color: C.espresso,
    display: 'flex', alignItems: 'center', gap: 14,
    flexDirection: side === 'in' ? 'row-reverse' : 'row',
    textAlign: side === 'in' ? 'right' : 'left',
    animation: `nodeBreathe ${3.4 + i * 0.3}s ease-in-out ${i * 0.2}s infinite`,
  })

  const renderNode = (n: EngNode, i: number, side: 'in' | 'out') => {
    const Icon = n.icon
    const accent = side === 'in' ? C.bronze : C.blue
    return (
      <div key={`${side}${i}`} className={`info-node eng-node node-${side}-${i}`} style={nodeStyle(i, side)}>
        <span style={{
          flexShrink: 0, width: 44, height: 44, borderRadius: 12,
          display: 'grid', placeItems: 'center',
          background: side === 'in' ? 'rgba(176,138,90,0.14)' : 'rgba(79,111,156,0.14)',
          border: `1px solid ${side === 'in' ? 'rgba(176,138,90,0.3)' : 'rgba(79,111,156,0.28)'}`,
          color: accent,
        }}>
          <Icon size={22} strokeWidth={1.8} />
        </span>
        <span style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
          <span style={{ fontSize: 'clamp(0.92rem, 1.5vw, 1.05rem)', fontWeight: 400, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>{n.label}</span>
          <span style={{ fontSize: 'clamp(0.72rem, 1.1vw, 0.8rem)', color: C.taupe, lineHeight: 1.3 }}>{n.sub}</span>
        </span>
      </div>
    )
  }

  return (
    <div ref={root} style={{ position: 'relative', width: '100%', aspectRatio: '1320 / 700', maxHeight: '74vh', margin: '0 auto' }} aria-hidden>
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} fill="none" preserveAspectRatio="xMidYMid meet" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <defs>
          <filter id="lineGlow2" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <linearGradient id="warmLine2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#c7ac83" /><stop offset="1" stopColor="#8a6a2f" />
          </linearGradient>
          <linearGradient id="coolLine2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#8fa8cb" /><stop offset="1" stopColor="#4f6f9c" />
          </linearGradient>
        </defs>
        <g filter="url(#lineGlow2)">
          {INBOUND.map((_, i) => (
            <path key={`in${i}`} className={`sig-line line-in-${i}`} d={inPath(i)} stroke="url(#warmLine2)" strokeWidth="2" strokeLinecap="round" />
          ))}
          {OUTBOUND.map((_, i) => (
            <path key={`out${i}`} className={`sig-line line-out-${i}`} d={outPath(i)} stroke="url(#coolLine2)" strokeWidth="2" strokeLinecap="round" />
          ))}
        </g>
        <g className="flow-group">
          {INBOUND.map((_, i) => (
            <path key={`fin${i}`} className="flow-line" style={{ animationDelay: `${i * 0.5}s` }} d={inPath(i)} stroke="#d8a85a" strokeWidth="2.4" strokeLinecap="round" />
          ))}
          {OUTBOUND.map((_, i) => (
            <path key={`fout${i}`} className="flow-line cool" style={{ animationDelay: `${0.25 + i * 0.5}s` }} d={outPath(i)} stroke="#6f93c4" strokeWidth="2.4" strokeLinecap="round" />
          ))}
        </g>
        {/* continuous marching dots — signals flowing toward / from the brain */}
        <g>
          {INBOUND.map((_, i) => (
            <path key={`min${i}`} className="eng-flow" style={{ animationDelay: `${i * 0.35}s` }} d={inPath(i)} stroke="#e8b45c" strokeWidth="3.4" fill="none" />
          ))}
          {OUTBOUND.map((_, i) => (
            <path key={`mout${i}`} className="eng-flow" style={{ animationDelay: `${0.2 + i * 0.35}s` }} d={outPath(i)} stroke="#7fa0cf" strokeWidth="3.4" fill="none" />
          ))}
        </g>
      </svg>

      {/* depth text behind brain */}
      <div className="info-depth" style={{ position: 'absolute', left: pctL(BROWSER.x + BROWSER.w / 2), top: pctT(BROWSER.y + BROWSER.h / 2), transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none', opacity: 0.12 }}>
        <div style={{ fontFamily: "'Viaoda Libre', serif", fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', color: C.espresso, letterSpacing: '0.1em' }}>SMART</div>
        <div style={{ fontFamily: "'Viaoda Libre', serif", fontStyle: 'italic', fontSize: 'clamp(1.2rem, 2.4vw, 1.8rem)', color: C.bronze }}>website</div>
        <div style={{ fontFamily: "'Viaoda Libre', serif", fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', color: C.espresso, letterSpacing: '0.1em' }}>BRAIN</div>
      </div>

      {/* browser frame (smart website) */}
      <div className="info-browser" style={{ position: 'absolute', left: pctL(BROWSER.x), top: pctT(BROWSER.y), width: `${(BROWSER.w / VB_W) * 100}%`, height: `${(BROWSER.h / VB_H) * 100}%`, borderRadius: 18, border: `1px solid ${C.hairline}`, background: 'rgba(255,253,248,0.55)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', boxShadow: '0 30px 80px -30px rgba(43,38,32,0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', borderBottom: `1px solid ${C.hairline}` }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#e0857a' }} />
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#e8b45c' }} />
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#8aa97f' }} />
          <span style={{ marginLeft: 'auto', fontFamily: "'Imprima', sans-serif", fontSize: 11, color: C.taupe }}>yourbrand.com</span>
        </div>
        {/* layered glow + pulsing rings behind the brain */}
        <div aria-hidden style={{
          position: 'absolute', left: '50%', top: '52%',
          width: 260, height: 260, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232,180,92,0.28) 0%, rgba(232,180,92,0.08) 45%, transparent 70%)',
          transform: 'translate(-50%,-50%)',
          animation: 'auraDrift 4.5s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
        <div aria-hidden style={{
          position: 'absolute', left: '50%', top: '52%',
          width: 150, height: 150, borderRadius: '50%',
          border: '2px solid rgba(232,180,92,0.5)',
          transform: 'translate(-50%,-50%)',
          animation: 'ringPulse 2.8s ease-out infinite',
          pointerEvents: 'none',
        }} />
        <div aria-hidden style={{
          position: 'absolute', left: '50%', top: '52%',
          width: 150, height: 150, borderRadius: '50%',
          border: '2px solid rgba(79,111,156,0.4)',
          transform: 'translate(-50%,-50%)',
          animation: 'ringPulse 2.8s ease-out 1.4s infinite',
          pointerEvents: 'none',
        }} />

        {/* the brain */}
        <div className="brain-grp" style={{ position: 'absolute', left: '50%', top: '52%', width: 300, height: 300, transform: 'translate(-50%,-50%)', zIndex: 2 }}>
          <Brain3D size={300} />
        </div>

        {/* orbiting service chips — the work we do, popping around the brain */}
        <div aria-hidden style={{ position: 'absolute', left: '50%', top: '52%', width: 0, height: 0, transform: 'translate(-50%,-50%)', animation: 'orbitSpin 26s linear infinite', zIndex: 3 }}>
          {ORBIT_CHIPS.map((label, i) => {
            const ang = (i / ORBIT_CHIPS.length) * Math.PI * 2
            const r = 168
            return (
              <span key={label} style={{
                position: 'absolute',
                left: Math.cos(ang) * r, top: Math.sin(ang) * r,
                transform: 'translate(-50%,-50%)',
              }}>
                {/* counter-rotate so text stays upright */}
                <span style={{ display: 'inline-block', animation: 'orbitSpinRev 26s linear infinite' }}>
                  <span style={{
                    display: 'inline-block', whiteSpace: 'nowrap',
                    fontFamily: "'Imprima', sans-serif", fontSize: 12, letterSpacing: '0.02em',
                    padding: '7px 13px', borderRadius: 999,
                    background: 'rgba(255,253,248,0.95)', color: C.espresso,
                    border: `1px solid ${C.hairline}`,
                    boxShadow: '0 8px 22px -12px rgba(43,38,32,0.4)',
                    animation: `chipFloat ${3 + (i % 3) * 0.5}s ease-in-out ${i * 0.25}s infinite`,
                  }}>{label}</span>
                </span>
              </span>
            )
          })}
        </div>
      </div>

      {/* column labels */}
      <div className="info-col-label" style={{ position: 'absolute', left: 0, top: pctT(36), fontFamily: "'Imprima', sans-serif", fontSize: 'clamp(0.7rem, 1.2vw, 0.9rem)', letterSpacing: '0.26em', textTransform: 'uppercase', color: C.bronze, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 'clamp(24px, 4vw, 60px)', height: 1, background: C.bronze, opacity: 0.5 }} /> Inbound · dmclosed
      </div>
      <div className="info-col-label" style={{ position: 'absolute', right: 0, top: pctT(36), fontFamily: "'Imprima', sans-serif", fontSize: 'clamp(0.7rem, 1.2vw, 0.9rem)', letterSpacing: '0.26em', textTransform: 'uppercase', color: C.blue, display: 'flex', alignItems: 'center', gap: 10 }}>
        Outbound · alygent <span style={{ width: 'clamp(24px, 4vw, 60px)', height: 1, background: C.blue, opacity: 0.5 }} />
      </div>

      {/* nodes — only on tablets+ (>=768) to avoid mobile clutter */}
      {INBOUND.map((n, i) => renderNode(n, i, 'in'))}
      {OUTBOUND.map((n, i) => renderNode(n, i, 'out'))}
    </div>
  )
}

/* =========================================================================
   APP
   ========================================================================= */
export default function App() {
  const isMobile = useIsMobile()

  const containerRef = useRef<HTMLDivElement>(null)
  const worldRef = useRef<HTMLDivElement>(null)
  const cloudsRef = useRef<HTMLDivElement>(null)
  const portalRef = useRef<HTMLDivElement>(null)
  const curtainLRef = useRef<HTMLDivElement>(null)
  const curtainRRef = useRef<HTMLDivElement>(null)

  const [scrollProgress, setScrollProgress] = useState(0)
  const [curtainsOpen, setCurtainsOpen] = useState(false)
  const [uiVisible, setUiVisible] = useState(false)
  const [entranceDone, setEntranceDone] = useState(false)
  const [sm, setSm] = useState({ x: 0, y: 0 })


  // Lenis — buttery smooth scroll (with portal sync)
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true, lerp: 0.1 })
    let raf = 0
    const loop = (time: number) => {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
    }
  }, [])

  // scroll progress — synced with Lenis via window scroll
  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const el = containerRef.current
        if (el) {
          const max = el.scrollHeight - window.innerHeight
          setScrollProgress(max > 0 ? clamp(window.scrollY / max, 0, 1) : 0)
        }
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  // entrance sequence
  useEffect(() => {
    const t1 = window.setTimeout(() => setCurtainsOpen(true), 100)
    const t2 = window.setTimeout(() => setUiVisible(true), 600)
    const t3 = window.setTimeout(() => setEntranceDone(true), 2200)
    return () => {
      window.clearTimeout(t1); window.clearTimeout(t2); window.clearTimeout(t3)
    }
  }, [])

  // mouse parallax (desktop)
  useEffect(() => {
    if (isMobile) { setSm({ x: 0, y: 0 }); return }
    let targetX = 0, targetY = 0, curX = 0, curY = 0, raf = 0
    const speed = 0.07
    const onMove = (e: MouseEvent) => {
      targetX = e.clientX / window.innerWidth - 0.5
      targetY = e.clientY / window.innerHeight - 0.5
    }
    const loop = () => {
      curX = lerp(curX, targetX, speed); curY = lerp(curY, targetY, speed)
      setSm({ x: curX, y: curY })
      raf = requestAnimationFrame(loop)
    }
    window.addEventListener('mousemove', onMove)
    raf = requestAnimationFrame(loop)
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf) }
  }, [isMobile])

  const sp = scrollProgress
  const ep = easeInOut(sp)
  const scene1Opacity = clamp(1 - sp / 0.22, 0, 1)
  const scene2Opacity = clamp((sp - 0.6) / 0.14, 0, 1)
  const cloudsOpacity = clamp(sp / 0.05, 0, 1)
  const cloudsVisible = lerp(0.7, 1, cloudsOpacity)
  let portalOpacity = 1
  if (sp > 0.65) portalOpacity = clamp(1 - (sp - 0.65) / 0.2, 0, 1)
  const totalCards = FEATURE_CARDS.length
  const arcSweepDeg = (totalCards - 1) * 5
  const rotationOffset = lerp(0, arcSweepDeg, clamp((sp - 0.78) / 0.2, 0, 1))

  const mx = sm.x, my = sm.y
  const worldScale = lerp(1, 1.18, ep)
  const worldTransform = `translate3d(${(-mx * MAG.world).toFixed(2)}px, ${(-my * MAG.world).toFixed(2)}px, 0) scale(${worldScale})`
  const cloudsScale = lerp(1, 1.4, ep)
  const cloudsTransform = `translate3d(${(-mx * MAG.clouds).toFixed(2)}px, ${(-my * MAG.clouds * 0.4).toFixed(2)}px, 0) scale(${cloudsScale})`
  const portalScale = lerp(1, 7.5, ep)
  const portalTransform = `translate3d(${(-mx * MAG.portal).toFixed(2)}px, ${(-my * MAG.portal).toFixed(2)}px, 0) scale(${portalScale})`
  const curtainShift = lerp(0, 150, ep)
  const curtainScale = lerp(1, 1.3, ep)
  const curtainTransition = entranceDone ? 'none' : 'transform 1.8s cubic-bezier(0.16, 1, 0.3, 1)'
  const leftCurtainTransform = curtainsOpen
    ? `translate3d(${(-mx * MAG.curtainL).toFixed(2)}px, ${(-my * MAG.curtainL * 0.3).toFixed(2)}px, 0) translateX(${(-62 - curtainShift).toFixed(2)}%) scale(${curtainScale})`
    : `translateX(0%) scale(1)`
  const rightCurtainTransform = curtainsOpen
    ? `translate3d(${(-mx * MAG.curtainR).toFixed(2)}px, ${(-my * MAG.curtainR * 0.3).toFixed(2)}px, 0) translateX(${(62 + curtainShift).toFixed(2)}%) scale(${curtainScale})`
    : `translateX(0%) scale(1)`

  const hashFor: Record<string, string> = {
    Work: '#work', Engine: '#engine', Proof: '#proof',
    Process: '#process', FAQ: '#faq', 'Book a demo': '#book',
  }

  return (
    <>
      <CustomCursor />

      {/* =================================================================
          PORTAL SEQUENCE
      ================================================================= */}
      <div ref={containerRef} style={{ height: '480vh', position: 'relative' }}>
        {/* NAV — absolute at page top; scrolls away naturally (never sticky/fixed) */}
        <header className="site-nav" style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 60, opacity: scene1Opacity }}>
          <nav style={{ maxWidth: 1560, margin: '0 auto', padding: isMobile ? '12px 20px' : '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
            <a href="#top" aria-label="Web Studio — home" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <img src="/logo.webp" alt="Web Studio" width="180" height="98" loading="eager" fetchPriority="high" style={{ height: isMobile ? 60 : 80, width: 'auto', filter: 'drop-shadow(0 2px 14px rgba(232,180,92,0.35))' }} />
            </a>
            {!isMobile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 34 }}>
                {NAV_LINKS.map((l) => (
                  <a key={l.label} href={l.href} style={{ fontFamily: "'Imprima', sans-serif", fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.82)', textDecoration: 'none', transition: 'color 0.3s ease' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')} onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.82)')}>{l.label}</a>
                ))}
              </div>
            )}
            <MagBtn>
              <a href={CAL_URL} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Imprima', sans-serif", fontSize: isMobile ? 11 : 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0a0608', textDecoration: 'none', padding: isMobile ? '9px 16px' : '11px 22px', borderRadius: 999, background: 'linear-gradient(180deg, #f4d99a, #e8b45c)', border: '1px solid rgba(255,255,255,0.4)', whiteSpace: 'nowrap', boxShadow: '0 6px 18px -8px rgba(232,180,92,0.7)', display: 'block' }}>Book a call</a>
            </MagBtn>
          </nav>
        </header>

        <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', background: '#0a0608' }}>
          {/* L1 world */}
          <div ref={worldRef} style={{ position: 'absolute', inset: 0, backgroundImage: `url("${WORLD_BG}")`, backgroundSize: 'cover', backgroundPosition: 'center', transformOrigin: '50% 50%', transform: worldTransform, willChange: 'transform' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(8,4,6,0.62) 0%, rgba(8,4,6,0.22) 35%, rgba(8,4,6,0.55) 100%)', pointerEvents: 'none' }} />
          {/* L2 clouds */}
          <div ref={cloudsRef} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', backgroundImage: `url("${BOTTOM_CLOUDS}")`, backgroundSize: 'cover', backgroundPosition: 'bottom center', backgroundRepeat: 'no-repeat', transformOrigin: '50% 100%', transform: cloudsTransform, opacity: cloudsVisible, willChange: 'transform, opacity', zIndex: 10 }} />
          {/* L2.5 arc slider */}
          <div style={{ position: 'absolute', bottom: isMobile ? 60 : 80, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: scene2Opacity, pointerEvents: 'none', zIndex: 9 }}>
            <ArcCardSlider cards={FEATURE_CARDS} rotationOffset={rotationOffset} isMobile={isMobile} />
          </div>
          {/* L3 portal frame */}
          <div ref={portalRef} style={{ position: 'absolute', inset: 0, backgroundImage: `url("${PORTAL_BG}")`, backgroundSize: 'cover', backgroundPosition: 'center', transformOrigin: '52% 38%', transform: portalTransform, opacity: portalOpacity, willChange: 'transform, opacity', zIndex: 15 }} />
          {/* L3.5 bottom fade */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)', pointerEvents: 'none', zIndex: 16 }} />
          {/* L4L curtain left */}
          <div ref={curtainLRef} style={{ position: 'absolute', inset: 0, backgroundImage: `url("${CURTAIN_LEFT}")`, backgroundSize: 'cover', backgroundPosition: 'right center', transformOrigin: 'left center', transform: leftCurtainTransform, transition: curtainTransition, willChange: 'transform', zIndex: 16 }} />
          {/* L4R curtain right */}
          <div ref={curtainRRef} style={{ position: 'absolute', inset: 0, backgroundImage: `url("${CURTAIN_RIGHT}")`, backgroundSize: 'cover', backgroundPosition: 'left center', transformOrigin: 'right center', transform: rightCurtainTransform, transition: curtainTransition, willChange: 'transform', zIndex: 16 }} />
          {/* top fade */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '42vh', background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)', pointerEvents: 'none', zIndex: 45 }} />

          {/* ============== SCENE 1 HERO — open, veil-backed (no boxed card) ============== */}
          {/* soft radial veil behind the headline — guarantees legibility without a box */}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(74% 64% at 50% 46%, rgba(6,3,5,0.7) 0%, rgba(6,3,5,0.3) 55%, transparent 80%)', opacity: scene1Opacity, zIndex: 18, pointerEvents: 'none' }} />

          <div style={{ position: 'absolute', inset: 0, zIndex: 20, opacity: scene1Opacity, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 20px 100px', transform: 'translateX(3vw)' }}>
            <p style={{ fontFamily: "'Imprima', sans-serif", fontSize: 'clamp(10px,1.5vw,12px)', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(255,220,180,0.85)', marginBottom: 18, textShadow: '0 1px 8px rgba(0,0,0,0.7)', opacity: uiVisible ? 1 : 0, transition: `opacity 0.9s ${EASE} 0.2s` }}>
              AI Smart Websites · Lead-Gen Infrastructure
            </p>
            <h1 style={{ color: '#fff', textShadow: '0 4px 30px rgba(0,0,0,0.85), 0 1px 6px rgba(0,0,0,0.95)' }}>
              <LineMask show={uiVisible} delay={0.3}>
                <span style={{ fontFamily: "'Viaoda Libre', serif", fontSize: 'clamp(30px, 6vw, 60px)', lineHeight: 1.05, letterSpacing: '0.04em' }}>Smart Sites</span>
              </LineMask>
              <LineMask show={uiVisible} delay={0.42}>
                <span style={{ fontFamily: "'Viaoda Libre', serif", fontSize: 'clamp(30px, 6vw, 60px)', lineHeight: 1.05, letterSpacing: '0.04em', fontStyle: 'italic', color: 'rgba(255,220,180,0.9)' }}>› That Win</span>
              </LineMask>
              <LineMask show={uiVisible} delay={0.54}>
                <span style={{ fontFamily: "'Viaoda Libre', serif", fontSize: 'clamp(52px,10vw,92px)', lineHeight: 0.95, letterSpacing: '-0.02em' }}>Clients</span>
              </LineMask>
            </h1>

            {/* HERO TYPEWRITER (per spec): blinking cursor until done */}
            <div style={{ marginTop: 22, display: 'flex', justifyContent: 'center' }}>
              <TypewriterLine
                text="We don't just build you a website — we build the system that fills it with clients."
                color="rgba(255,245,235,0.95)"
                cursorColor="#f0d9a0"
                style={{ textAlign: 'center', maxWidth: 'min(52ch, 88vw)' }}
              />
            </div>

            <div style={{ marginTop: 24, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 'min(560px, 92vw)', opacity: uiVisible ? 1 : 0, transition: `opacity 0.9s ${EASE} 1s` }}>
              {CAPS.slice(0, 4).map((c) => (
                <span key={c.t} style={{
                  fontFamily: "'Imprima', sans-serif", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: 'rgba(255,245,235,0.92)', padding: '5px 11px', borderRadius: 999,
                  border: '1px solid rgba(255,220,180,0.34)', background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)',
                }}>{c.t}</span>
              ))}
            </div>

            <div style={{ position: 'absolute', bottom: isMobile ? 22 : 36, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, opacity: uiVisible ? 1 : 0, transition: `opacity 0.9s ${EASE} 1.1s` }}>
              <span style={{ fontFamily: "'Imprima', sans-serif", fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)' }}>Descend into the work</span>
              <span style={{ width: 34, height: 34, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ScrollChevron /></span>
            </div>
          </div>

          {/* ============== SCENE 2 — inside the portal ============== */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: isMobile ? '7vh' : '9vh', opacity: scene2Opacity, zIndex: 46, padding: '0 24px', pointerEvents: 'none' }}>
            <h2 style={{ fontFamily: "'Viaoda Libre', serif", fontSize: isMobile ? 'clamp(20px,5.6vw,30px)' : 'clamp(30px,4.4vw,52px)', color: '#fff', letterSpacing: '0.03em', lineHeight: 1.08, textShadow: '0 2px 20px rgba(0,0,0,0.45)', whiteSpace: 'nowrap', margin: 0 }}>
              <ScrollTypewriter text="Forged Beyond the Ordinary" active={scene2Opacity > 0.25} cursorColor="rgba(255,220,180,0.95)" />
            </h2>
          </div>
          <div style={{ position: 'absolute', bottom: isMobile ? 16 : 22, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: Math.max(scene2Opacity - 0.2, 0), zIndex: 46 }}>
            <a href={CAL_URL} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Viaoda Libre', serif", fontSize: isMobile ? 14 : 18, letterSpacing: '0.06em', color: '#fff', textDecoration: 'none', padding: '11px 26px', borderRadius: 999, border: '1px solid rgba(255,220,180,0.5)', background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}>Book a call →</a>
          </div>
        </div>
      </div>

      {/* =================================================================
          FULL WEBSITE — GSAP-revealed sections
      ================================================================= */}
      <main id="top" style={{
        background: 'radial-gradient(48% 42% at 18% 26%, rgba(255,251,241,0.95) 0%, rgba(255,251,241,0) 60%), radial-gradient(40% 38% at 82% 30%, rgba(143,168,203,0.22) 0%, rgba(143,168,203,0) 62%), radial-gradient(46% 44% at 70% 82%, rgba(216,190,151,0.4) 0%, rgba(216,190,151,0) 62%), radial-gradient(50% 46% at 24% 88%, rgba(175,203,240,0.18) 0%, rgba(175,203,240,0) 60%), linear-gradient(165deg, #e9e1d4 0%, #dccfbb 60%, #d3cdc2 100%)',
        color: C.espresso, fontFamily: "'Imprima', sans-serif",
      }}>

        {/* ---------------- SHOWCASE (#work) — clean responsive grid (reverted) ---------------- */}
        <section id="work" style={{ padding: 'clamp(56px, 9vh, 110px) 24px', maxWidth: 1200, margin: '0 auto' }}>
          <GsapReveal>
            <p style={{ fontFamily: "'Imprima', sans-serif", textTransform: 'uppercase', letterSpacing: '0.24em', fontSize: '0.74rem', color: C.bronze }}>Selected work</p>
            <h2 style={{ fontFamily: "'Viaoda Libre', serif", fontSize: 'clamp(2rem, 5vw, 3.4rem)', lineHeight: 1.05, maxWidth: '18ch', marginTop: 14 }}>
              Sites engineered to <span style={{ color: C.goldDeep }}>win clients</span>.
            </h2>
            <p style={{ fontSize: '1.02rem', lineHeight: 1.6, maxWidth: '44ch', marginTop: 12, color: C.taupe }}>
              The frontend half. Animated, conversion-first sites — this is the motion we deliver. Pulled from the top of motionsites.ai.
            </p>
          </GsapReveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 22, marginTop: 44 }}>
            {SHOWCASE_SITES.map((s, i) => (
              <GsapReveal key={s.title} delay={(i % 3) * 0.06}>
                <SiteCard site={s} />
              </GsapReveal>
            ))}
          </div>
        </section>

        {/* ---------------- ENGINE (#engine) — inbound→brain→outbound visual, AFTER showcase ---------------- */}
        <section id="engine" style={{ padding: 'clamp(72px, 12vh, 150px) clamp(16px, 3vw, 56px) clamp(36px, 5vh, 64px)', maxWidth: 1560, margin: '0 auto', textAlign: 'center' }}>
          {/* section intro — GSAP-split stagger reveal for a more animated feel */}
          <GsapReveal y={40}>
            <p style={{ fontFamily: "'Imprima', sans-serif", textTransform: 'uppercase', letterSpacing: '0.26em', fontSize: 'clamp(0.74rem, 1.1vw, 0.9rem)', color: C.bronze }}>How the system fits</p>
            <h2 style={{ fontFamily: "'Viaoda Libre', serif", fontSize: 'clamp(2.6rem, 6.5vw, 5rem)', maxWidth: '18ch', margin: '18px auto 16px', lineHeight: 1.02 }}>
              Frontend + backend, <span style={{ color: C.goldDeep }}>one engine</span>.
            </h2>
            <p style={{ fontSize: 'clamp(1.04rem, 1.5vw, 1.3rem)', lineHeight: 1.65, maxWidth: '64ch', margin: '0 auto', color: C.taupe }}>
              The frontend is a smart AI website. The backend is the inbound + outbound engine — <b>dmclosed</b> (AI sales agent) and <b>alygent</b> (LinkedIn + email outreach). We connect them under your brand and run the service.
            </p>
          </GsapReveal>

          {/* SVG infographic — visible on tablet/desktop. On mobile, simpler list. */}
          <GsapReveal y={50} delay={0.1}>
            <div className="hidden md:block" style={{ marginTop: 'clamp(28px, 4vw, 56px)' }}>
              <StrategicInfographic />
            </div>
          </GsapReveal>

          {/* mobile fallback list */}
          <GsapReveal y={30} delay={0.1}>
            <div className="md:hidden" style={{ marginTop: 36, textAlign: 'left' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                <div>
                  <p style={{ fontFamily: "'Imprima', sans-serif", fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.bronze }}>Inbound · dmclosed</p>
                  {INBOUND.map((n) => (<p key={n.label} style={{ fontSize: '0.95rem', marginTop: 6 }}>· {n.label}</p>))}
                </div>
                <div>
                  <p style={{ fontFamily: "'Viaoda Libre', serif", fontSize: '1.3rem', color: C.espresso }}>Smart Website (the brain)</p>
                </div>
                <div>
                  <p style={{ fontFamily: "'Imprima', sans-serif", fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.blue }}>Outbound · alygent</p>
                  {OUTBOUND.map((n) => (<p key={n.label} style={{ fontSize: '0.95rem', marginTop: 6 }}>· {n.label}</p>))}
                </div>
              </div>
            </div>
          </GsapReveal>
        </section>

        {/* ---------------- FOUND FOOTER CAPTION for showcase ---------------- */}

        {/* ---------------- WHITE-LABEL ENGINES (#engines) ---------------- */}
        <section id="engines" style={{ padding: 'clamp(72px, 12vh, 140px) clamp(16px, 3vw, 56px)', maxWidth: 1560, margin: '0 auto' }}>
          {/* two-column intro — copy left, live stat/marquee panel right (fills the dead space) */}
          <GsapReveal>
            <div className="engines-intro" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'clamp(36px, 5vw, 72px)', alignItems: 'center' }}>
              <div>
                <p style={{ fontFamily: "'Imprima', sans-serif", textTransform: 'uppercase', letterSpacing: '0.26em', fontSize: 'clamp(0.74rem, 1.1vw, 0.9rem)', color: C.bronze }}>The backend · infrastructure we sell</p>
                <h2 style={{ fontFamily: "'Viaoda Libre', serif", fontSize: 'clamp(2.4rem, 5.4vw, 4.2rem)', maxWidth: '20ch', marginTop: 14, marginBottom: 16, lineHeight: 1.03 }}>
                  Two engines we bolt on — and run for you.
                </h2>
                <p style={{ fontSize: 'clamp(1.02rem, 1.4vw, 1.22rem)', lineHeight: 1.6, maxWidth: '54ch', color: C.taupe }}>
                  Plug them in yourself, or hand the running to us. White-labelled with your logo, your domain, your pricing — we deliver the service end-to-end so your clients book and your team never touches a console.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 26 }}>
                  {['Your logo', 'Your domain', 'Your pricing', 'We run it 24/7'].map((t) => (
                    <span key={t} style={{ fontFamily: "'Imprima', sans-serif", fontSize: '0.86rem', color: C.espresso, padding: '9px 16px', borderRadius: 999, background: 'rgba(255,253,248,0.85)', border: `1px solid ${C.hairline}` }}>{t}</span>
                  ))}
                </div>
              </div>

              {/* right visual: combined headline stats + channel chips */}
              <div className="engines-statpanel" style={{ position: 'relative', borderRadius: 24, padding: 'clamp(24px, 2.4vw, 34px)', background: 'linear-gradient(160deg, rgba(43,38,32,0.96), rgba(43,38,32,0.86))', boxShadow: '0 40px 90px -40px rgba(43,38,32,0.6)', overflow: 'hidden' }}>
                <div aria-hidden style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,180,92,0.35), transparent 70%)' }} />
                <p style={{ fontFamily: "'Imprima', sans-serif", textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.72rem', color: C.gold, position: 'relative' }}>Outcomes across both engines</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(14px, 1.6vw, 22px)', marginTop: 20, position: 'relative' }}>
                  {ENGINE_STATS.map((s) => (
                    <div key={s.l} style={{ borderTop: '1px solid rgba(255,255,255,0.14)', paddingTop: 12 }}>
                      <div style={{ fontFamily: "'Viaoda Libre', serif", fontSize: 'clamp(1.8rem, 3vw, 2.7rem)', color: C.gold, lineHeight: 1 }}>{s.v}</div>
                      <div style={{ fontFamily: "'Imprima', sans-serif", fontSize: '0.84rem', color: 'rgba(247,241,230,0.72)', marginTop: 6 }}>{s.l}</div>
                    </div>
                  ))}
                </div>
                <p style={{ fontFamily: "'Imprima', sans-serif", fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(247,241,230,0.5)', marginTop: 24, position: 'relative' }}>One inbox · every channel</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12, position: 'relative' }}>
                  {ALL_CHANNELS.map((c) => (
                    <span key={c} style={{ fontFamily: "'Imprima', sans-serif", fontSize: '0.78rem', color: 'rgba(247,241,230,0.9)', padding: '6px 12px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.16)', background: 'rgba(255,255,255,0.04)' }}>{c}</span>
                  ))}
                </div>
              </div>
            </div>
          </GsapReveal>

          {/* lead-in so the two engines don't appear straight after the intro */}
          <GsapReveal y={30}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, margin: 'clamp(56px, 8vw, 96px) 0 clamp(34px, 4vw, 50px)' }}>
              <span style={{ flex: 1, height: 1, background: C.hairline }} />
              <span style={{ fontFamily: "'Imprima', sans-serif", fontSize: 'clamp(0.78rem, 1.2vw, 0.92rem)', letterSpacing: '0.18em', textTransform: 'uppercase', color: C.bronze, whiteSpace: 'nowrap' }}>The two engines, live today</span>
              <span style={{ flex: 1, height: 1, background: C.hairline }} />
            </div>
            <p style={{ textAlign: 'center', fontFamily: "'Imprima', sans-serif", fontSize: 'clamp(1rem, 1.4vw, 1.18rem)', color: C.taupe, lineHeight: 1.6, maxWidth: '60ch', margin: '0 auto clamp(40px, 5vw, 60px)' }}>
              These are real, running products — visit them below. When you work with us, this is the infrastructure you get under <b>your</b> brand: a smart website on the front, and these two engines closing on the back.
            </p>
          </GsapReveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'clamp(28px, 3vw, 44px)' }}>
            <TiltCard><WhitelabelCard data={DMCLOSED} /></TiltCard>
            <TiltCard><WhitelabelCard data={ALYGENT} /></TiltCard>
          </div>
        </section>

        {/* ---------------- PROOF (#proof): testimonials L→R + brand logos R→L ---------------- */}
        <section id="proof" style={{ padding: 'clamp(64px, 10vh, 110px) 0 0' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
            <GsapReveal>
              <p style={{ fontFamily: "'Imprima', sans-serif", textTransform: 'uppercase', letterSpacing: '0.24em', fontSize: '0.74rem', color: C.bronze }}>Proof</p>
              <h2 style={{ fontFamily: "'Viaoda Libre', serif", fontSize: 'clamp(2rem, 5vw, 3.2rem)', maxWidth: '18ch', marginTop: 14, marginBottom: 40 }}>
                Real businesses. Real numbers.
              </h2>
            </GsapReveal>
          </div>

          {/* Testimonials L→R — now with face avatars */}
          <Marquee direction="L" speed={58} gap={20}>
            {TESTIMONIALS.map((t, i) => (<TestimonialCard key={i} t={t} />))}
          </Marquee>

          <div style={{ height: 28 }} />

          {/* Brands R→L — styled logo lockups (mark + wordmark) */}
          <Marquee direction="R" speed={40} gap={36}>
            {BRANDS.map((b, i) => (<BrandLockup key={i} name={b} index={i} />))}
          </Marquee>

          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
            <p style={{ marginTop: 22, fontFamily: "'Imprima', sans-serif", fontSize: '0.86rem', color: C.taupe, letterSpacing: '0.06em' }}>
              Powering DMs for agencies and brands worldwide — on the same engine we hand to you.
            </p>
          </div>
        </section>

        {/* ---------------- CAPABILITIES (#capabilities) ---------------- */}
        <section id="capabilities" style={{ padding: 'clamp(64px, 10vh, 110px) 24px', maxWidth: 1200, margin: '0 auto' }}>
          <GsapReveal>
            <p style={{ fontFamily: "'Imprima', sans-serif", textTransform: 'uppercase', letterSpacing: '0.24em', fontSize: '0.74rem', color: C.bronze }}>What we build</p>
            <h2 style={{ fontFamily: "'Viaoda Libre', serif", fontSize: 'clamp(2rem, 5vw, 3.2rem)', maxWidth: '20ch', marginTop: 14, marginBottom: 40 }}>
              One studio for the website and the pipeline.
            </h2>
          </GsapReveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
            {CAPS.map((c, i) => (
              <GsapReveal key={c.t} delay={(i % 3) * 0.06}>
                <article className="hover-lift" style={{ padding: 26, height: '100%', borderRadius: 18, background: 'rgba(247,241,230,0.7)', border: `1px solid ${C.hairline}`, backdropFilter: 'blur(4px)' }}>
                  <span style={{ fontFamily: "'Imprima', sans-serif", color: C.bronze, fontSize: '0.72rem', letterSpacing: '0.18em' }}>0{i + 1}</span>
                  <h3 style={{ fontFamily: "'Viaoda Libre', serif", fontSize: '1.35rem', margin: '12px 0 8px' }}>{c.t}</h3>
                  <p style={{ color: C.taupe, fontSize: '0.94rem', lineHeight: 1.5, margin: 0 }}>{c.d}</p>
                </article>
              </GsapReveal>
            ))}
          </div>
        </section>

        {/* ---------------- PROCESS (#process) ---------------- */}
        <section id="process" style={{ padding: 'clamp(64px, 10vh, 110px) 24px', maxWidth: 1200, margin: '0 auto', background: 'linear-gradient(180deg, transparent, rgba(220,207,187,0.45), transparent)' }}>
          <GsapReveal>
            <p style={{ fontFamily: "'Imprima', sans-serif", textTransform: 'uppercase', letterSpacing: '0.24em', fontSize: '0.74rem', color: C.bronze }}>How it works</p>
            <h2 style={{ fontFamily: "'Viaoda Libre', serif", fontSize: 'clamp(2rem, 5vw, 3.2rem)', maxWidth: '16ch', marginTop: 14, marginBottom: 44 }}>
              A real sequence, not a pitch.
            </h2>
          </GsapReveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {STEPS.map((s, i) => (
              <GsapReveal key={s.n} delay={i * 0.06}>
                <div className="hover-lift" style={{ position: 'relative', padding: '8px 0' }}>
                  <span style={{ fontFamily: "'Imprima', sans-serif", color: C.bronze, fontSize: '0.8rem', letterSpacing: '0.2em' }}>{s.n}</span>
                  <h3 style={{ fontFamily: "'Viaoda Libre', serif", fontSize: '1.7rem', margin: '10px 0' }}>{s.t}</h3>
                  <p style={{ color: C.taupe, fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>{s.d}</p>
                </div>
              </GsapReveal>
            ))}
          </div>
        </section>

        {/* ---------------- FAQ (#faq) ---------------- */}
        <section id="faq" style={{ padding: 'clamp(64px, 10vh, 110px) 24px', maxWidth: 860, margin: '0 auto' }}>
          <GsapReveal>
            <p style={{ fontFamily: "'Imprima', sans-serif", textTransform: 'uppercase', letterSpacing: '0.24em', fontSize: '0.74rem', color: C.bronze }}>Questions</p>
            <h2 style={{ fontFamily: "'Viaoda Libre', serif", fontSize: 'clamp(2rem, 5vw, 3rem)', marginTop: 14, marginBottom: 36 }}>Good to know.</h2>
          </GsapReveal>
          <FaqList items={QA} />
        </section>

        {/* ---------------- FINAL CTA (#book) ---------------- */}
        <section id="book" style={{ padding: 'clamp(36px, 8vh, 80px) 24px', maxWidth: 1200, margin: '0 auto' }}>
          <GsapReveal>
            <div style={{
              borderRadius: 32, padding: 'clamp(46px, 7vw, 100px) clamp(28px, 6vw, 80px)',
              textAlign: 'center', position: 'relative', overflow: 'hidden',
              background: 'linear-gradient(135deg, #2b2620 0%, #3a322a 60%, #4a3d2e 100%)', color: '#fffdf8',
              boxShadow: '0 80px 160px -60px rgba(74,58,42,0.7)',
            }}>
              <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(60% 70% at 50% 0%, rgba(255,244,214,0.5), transparent 60%)', pointerEvents: 'none' }} />
              <p style={{ position: 'relative', fontFamily: "'Imprima', sans-serif", textTransform: 'uppercase', letterSpacing: '0.24em', fontSize: '0.74rem', color: 'rgba(255,244,214,0.9)' }}>The whole system, one studio</p>
              <h2 style={{ position: 'relative', fontFamily: "'Viaoda Libre', serif", fontSize: 'clamp(1.8rem, 4vw, 3rem)', maxWidth: '20ch', margin: '16px auto 8px', color: '#fffdf8' }}>
                Ready to turn your website into a client machine?
              </h2>
              <p style={{ position: 'relative', maxWidth: '46ch', margin: '0 auto 32px', lineHeight: 1.6, color: 'rgba(255,253,248,0.85)' }}>
                We build the site, we wire the engine, we run it under your brand. You book the demos.
              </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
                <MagBtn><a href={CAL_URL} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Imprima', sans-serif", fontSize: '1rem', letterSpacing: '0.04em', cursor: 'pointer', padding: '1em 2.2em', borderRadius: 999, border: 'none', background: 'linear-gradient(180deg, #f4d99a, #e8b45c)', color: C.espresso, fontWeight: 600, textDecoration: 'none', boxShadow: '0 14px 34px -14px rgba(232,180,92,0.8)', display: 'block' }}>Book a call →</a></MagBtn>
                <MagBtn><a href={CAL_URL} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Imprima', sans-serif", fontSize: '1rem', letterSpacing: '0.04em', cursor: 'pointer', padding: '1em 2.2em', borderRadius: 999, border: '1px solid rgba(255,246,230,0.5)', background: 'rgba(255,253,248,0.1)', color: '#fffdf8', textDecoration: 'none', backdropFilter: 'blur(8px)', display: 'block' }}>See availability</a></MagBtn>
              </div>
            </div>
          </GsapReveal>
        </section>

        {/* ---------------- FOOTER ---------------- */}
        <footer style={{ paddingBottom: 44, maxWidth: 1200, margin: '0 auto', paddingInline: 24 }}>
          <hr style={{ border: 'none', borderTop: `1px solid ${C.hairline}`, marginBottom: 36 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div style={{ maxWidth: 340 }}>
              <img src="/logo.webp" alt="Web Studio" width="270" height="147" loading="lazy" style={{ height: 120, width: 'auto' }} />
              <p style={{ color: C.taupe, fontSize: '0.92rem', marginTop: 16, lineHeight: 1.5 }}>
                The smart website + the inbound/outbound engine — sold as one infrastructure system, run under your brand.
              </p>
            </div>
            <nav aria-label="Footer" style={{ display: 'flex', gap: 56, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span style={{ fontFamily: "'Imprima', sans-serif", textTransform: 'uppercase', letterSpacing: '0.24em', fontSize: '0.72rem', color: C.bronze }}>Site</span>
                {['Work', 'Engine', 'Capabilities', 'Process', 'FAQ'].map((l) => (<a key={l} href={hashFor[l] || '#'} style={{ fontSize: '0.92rem', color: C.espresso, textDecoration: 'none' }}>{l}</a>))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span style={{ fontFamily: "'Imprima', sans-serif", textTransform: 'uppercase', letterSpacing: '0.24em', fontSize: '0.72rem', color: C.bronze }}>Engines</span>
                <a href="#engines" style={{ fontSize: '0.92rem', color: C.espresso, textDecoration: 'none' }}>dmclosed</a>
                <a href="#engines" style={{ fontSize: '0.92rem', color: C.espresso, textDecoration: 'none' }}>alygent</a>
                <a href={CAL_URL} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.92rem', color: C.espresso, textDecoration: 'none' }}>Book a call</a>
              </div>
            </nav>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40, fontFamily: "'Imprima', sans-serif", fontSize: '0.72rem', color: C.taupe, letterSpacing: '0.1em', flexWrap: 'wrap', gap: 12 }}>
            <span>© webstudio.tech</span>
            <span style={{ color: C.bronze }}>US · UK · CA · AU · NZ</span>
          </div>
        </footer>
      </main>
    </>
  )
}

/* =========================================================================
   SITE CARD — framed browser chrome, hover-to-animate, lazy loading
   ========================================================================= */
const SiteCard = ({ site }: { site: FeatureCard }) => {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        borderRadius: 18, overflow: 'hidden', background: 'rgba(247,241,230,0.85)',
        border: `1px solid ${C.hairline}`,
        boxShadow: hovered ? '0 28px 60px -22px rgba(43,38,32,0.45)' : '0 10px 30px -16px rgba(43,38,32,0.22)',
        transition: `box-shadow 0.45s ${EASE}, transform 0.45s ${EASE}`,
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
      }}>
      {/* browser chrome bar — the URL only, no text over the image */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 12px', borderBottom: `1px solid ${C.hairline}`, background: 'rgba(233,225,212,0.7)' }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#e0857a' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#e8b45c' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#8aa97f' }} />
        <span style={{ marginLeft: 10, fontFamily: "'Imprima', sans-serif", fontSize: 11, color: C.taupe, letterSpacing: '0.05em' }}>
          {site.title.toLowerCase().replace(/\s+/g, '')}.webstudio.tech
        </span>
      </div>
      {/* image — static poster loads instantly; animated version swaps in on hover */}
      <div style={{ position: 'relative', aspectRatio: '16 / 10', overflow: 'hidden', background: site.color }}>
        <img src={site.poster} alt={`${site.title} — a smart website built by webstudio.tech`} loading="lazy" decoding="async" style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
          transition: `transform 0.6s ${EASE}, filter 0.6s ${EASE}, opacity 0.4s ease`,
          transform: hovered ? 'scale(1.06)' : 'scale(1)',
          filter: hovered ? 'saturate(1.1)' : 'saturate(0.92)',
          opacity: hovered ? 0 : 1,
        }} />
        {hovered && (
          <img src={site.img} alt="" loading="eager" decoding="async" style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
            transform: 'scale(1.06)', filter: 'saturate(1.1)',
          }} />
        )}
      </div>
      {/* content row BELOW the image — title / tag / desc all live here, never on top of the picture */}
      <div style={{ padding: '16px 18px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ fontFamily: "'Viaoda Libre', serif", fontSize: '1.25rem', color: C.espresso, lineHeight: 1.1 }}>{site.title}</div>
          <span style={{ fontFamily: "'Imprima', sans-serif", fontSize: '0.66rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: C.bronze, whiteSpace: 'nowrap' }}>{site.tag}</span>
        </div>
        <p style={{ fontFamily: "'Imprima', sans-serif", fontSize: '0.86rem', color: C.taupe, lineHeight: 1.5, marginTop: 8, marginBottom: 0 }}>
          {site.desc}
        </p>
      </div>
    </div>
  )
}

/* =========================================================================
   WHITE-LABEL ENGINE CARD — dmclosed / alygent
   ========================================================================= */
const WhitelabelCard = ({ data }: { data: {
  name: string; tag: string; blurb: string
  url?: string; href?: string; shot?: string
  features: { t: string; d: string }[]
  stats: { v: string; l: string }[]
  channels?: string[]; crms?: string[]
} }) => (
  <article className="hover-lift" style={{ borderRadius: 24, padding: 'clamp(26px, 4vw, 42px)', background: 'linear-gradient(170deg, rgba(247,241,230,0.92), rgba(233,225,212,0.66))', border: `1px solid ${C.hairline}`, boxShadow: '0 18px 40px -28px rgba(43,38,32,0.35)', display: 'flex', flexDirection: 'column' }}>
    {/* live website preview — browser frame with the real hero screenshot */}
    {data.shot && (
      <a href={data.href} target="_blank" rel="noopener noreferrer" className="wl-shot" style={{ display: 'block', textDecoration: 'none', borderRadius: 16, overflow: 'hidden', border: `1px solid ${C.hairline}`, background: '#fff', boxShadow: '0 20px 44px -26px rgba(43,38,32,0.45)', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderBottom: `1px solid ${C.hairline}`, background: 'rgba(255,253,248,0.9)' }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#e0857a' }} />
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#e8b45c' }} />
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#8aa97f' }} />
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Imprima', sans-serif", fontSize: 12, color: C.taupe }}>
            {data.url} <ArrowUpRight size={13} strokeWidth={2} />
          </span>
        </div>
        <div style={{ position: 'relative', aspectRatio: '16 / 10', overflow: 'hidden', background: C.sand }}>
          <img src={data.shot} alt={`${data.name} — ${data.url}`} loading="lazy" decoding="async" className="wl-shot-img" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
        </div>
      </a>
    )}
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <span style={{ fontFamily: "'Viaoda Libre', serif", fontSize: 'clamp(1.6rem, 3vw, 2.3rem)', color: C.espresso }}>{data.name}</span>
      <span style={{ fontFamily: "'Imprima', sans-serif", fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', padding: '5px 10px', borderRadius: 999, border: `1px solid ${C.hairline}`, color: C.bronze, whiteSpace: 'nowrap' }}>{data.tag}</span>
      {data.url && (
        <a href={data.href} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: "'Imprima', sans-serif", fontSize: '0.82rem', color: C.goldDeep, textDecoration: 'none', whiteSpace: 'nowrap' }}>
          {data.url} <ArrowUpRight size={14} strokeWidth={2} />
        </a>
      )}
    </div>
    <p style={{ color: C.taupe, fontSize: '0.97rem', lineHeight: 1.6, maxWidth: '54ch', margin: '14px 0 0' }}>{data.blurb}</p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 22 }}>
      {data.stats.map((s) => (
        <div key={s.l} style={{ textAlign: 'center', padding: '10px 4px', borderRadius: 12, background: 'rgba(255,253,248,0.6)' }}>
          <div style={{ fontFamily: "'Viaoda Libre', serif", fontSize: 'clamp(1.05rem, 2vw, 1.4rem)', color: C.goldDeep }}>{s.v}</div>
          <div style={{ fontFamily: "'Imprima', sans-serif", fontSize: '0.66rem', color: C.taupe, letterSpacing: '0.06em', marginTop: 2, lineHeight: 1.25 }}>{s.l}</div>
        </div>
      ))}
    </div>
    <ul style={{ listStyle: 'none', margin: '22px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {data.features.map((f) => (
        <li key={f.t} style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
          <span style={{ color: C.bronze, fontFamily: "'Imprima', sans-serif", fontSize: '0.8rem' }}>▸</span>
          <div>
            <div style={{ fontFamily: "'Viaoda Libre', serif", fontSize: '1.02rem', color: C.espresso }}>{f.t}</div>
            <div style={{ fontSize: '0.88rem', color: C.taupe, lineHeight: 1.5, marginTop: 2 }}>{f.d}</div>
          </div>
        </li>
      ))}
    </ul>
    {data.channels && (
      <div style={{ marginTop: 20 }}>
        <span style={{ fontFamily: "'Imprima', sans-serif", fontSize: '0.66rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: C.bronze }}>Every channel, one inbox</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
          {data.channels.map((c) => (<span key={c} style={{ fontFamily: "'Imprima', sans-serif", fontSize: '0.71rem', padding: '5px 10px', borderRadius: 999, background: 'rgba(43,38,32,0.08)', color: C.espresso }}>{c}</span>))}
        </div>
      </div>
    )}
    {data.crms && (
      <div style={{ marginTop: 20 }}>
        <span style={{ fontFamily: "'Imprima', sans-serif", fontSize: '0.66rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: C.bronze }}>Deep CRM sync</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
          {data.crms.map((c) => (<span key={c} style={{ fontFamily: "'Imprima', sans-serif", fontSize: '0.71rem', padding: '5px 10px', borderRadius: 999, background: 'rgba(43,38,32,0.08)', color: C.espresso }}>{c}</span>))}
        </div>
      </div>
    )}
    <div style={{ marginTop: 24, paddingTop: 16, borderTop: `1px solid ${C.hairline}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
      <span style={{ fontFamily: "'Imprima', sans-serif", fontSize: '0.78rem', color: C.taupe }}>Your logo · your domain · your pricing</span>
      <a href={CAL_URL} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Imprima', sans-serif", fontSize: 13, color: '#fff', textDecoration: 'none', padding: '10px 20px', borderRadius: 999, background: C.espresso }}>We run it for you →</a>
    </div>
  </article>
)

/* =========================================================================
   TESTIMONIAL CARD — now with portrait photo (pravatar face)
   ========================================================================= */
const TestimonialCard = ({ t }: { t: { name: string; role: string; avatar: string; quote: string } }) => (
  <article className="hover-lift" style={{
    width: 'min(380px, 84vw)', flex: '0 0 auto',
    padding: 26, borderRadius: 20,
    background: 'rgba(247,241,230,0.88)', border: `1px solid ${C.hairline}`,
    boxShadow: '0 18px 40px -28px rgba(43,38,32,0.35)',
    display: 'flex', flexDirection: 'column',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
      {/* photo avatar (face) — not blank */}
      <img
        src={t.avatar}
        alt={t.name}
        loading="lazy" decoding="async"
        width="48" height="48"
        style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${C.bronzeLt}`, background: 'rgba(43,38,32,0.08)' }}
      />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontFamily: "'Viaoda Libre', serif", fontSize: '1.04rem', color: C.espresso, lineHeight: 1.1 }}>{t.name}</span>
        <span style={{ fontFamily: "'Imprima', sans-serif", fontSize: '0.72rem', color: C.taupe, letterSpacing: '0.04em', marginTop: 2 }}>{t.role}</span>
      </div>
    </div>
    <p style={{ fontFamily: "'Imprima', sans-serif", fontSize: '0.92rem', lineHeight: 1.55, color: C.espresso, margin: 0 }}>
      "{t.quote}"
    </p>
  </article>
)

/* =========================================================================
   BRAND LOCKUP — small geometric mark + wordmark (looks like a logo)
   ========================================================================= */
const BRAND_MARKS = ['circle', 'square', 'triangle', 'hex', 'diamond', 'wave', 'dot', 'ring', 'slash', 'arc', 'leaf', 'spark']
const BrandLockup = ({ name, index }: { name: string; index: number }) => {
  const mark = BRAND_MARKS[index % BRAND_MARKS.length]
  const accent = index % 2 === 0 ? C.bronze : C.blue
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12, whiteSpace: 'nowrap' }}>
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
        {mark === 'circle'   && <circle cx="13" cy="13" r="8" stroke={accent} strokeWidth="2" />}
        {mark === 'square'   && <rect x="6" y="6" width="14" height="14" rx="3" stroke={accent} strokeWidth="2" />}
        {mark === 'triangle' && <path d="M13 6 L20 19 L6 19 Z" stroke={accent} strokeWidth="2" strokeLinejoin="round" />}
        {mark === 'hex'      && <path d="M13 5 L20 9 L20 17 L13 21 L6 17 L6 9 Z" stroke={accent} strokeWidth="2" strokeLinejoin="round" />}
        {mark === 'diamond'  && <path d="M13 5 L21 13 L13 21 L5 13 Z" stroke={accent} strokeWidth="2" strokeLinejoin="round" />}
        {mark === 'wave'     && <path d="M5 13 Q8 7 13 13 Q18 19 21 13" stroke={accent} strokeWidth="2" strokeLinecap="round" fill="none" />}
        {mark === 'dot'      && <circle cx="13" cy="13" r="4" fill={accent} />}
        {mark === 'ring'     && (<><circle cx="13" cy="13" r="7" stroke={accent} strokeWidth="2" /><circle cx="13" cy="13" r="2.5" fill={accent} /></>)}
        {mark === 'slash'    && <path d="M7 18 L18 7" stroke={accent} strokeWidth="2" strokeLinecap="round" />}
        {mark === 'arc'      && <path d="M6 16 A8 8 0 0 1 20 14" stroke={accent} strokeWidth="2" strokeLinecap="round" fill="none" />}
        {mark === 'leaf'     && <path d="M7 19 C7 11 13 7 19 7 C19 15 13 19 7 19 Z" stroke={accent} strokeWidth="2" strokeLinejoin="round" fill="none" />}
        {mark === 'spark'   && <path d="M13 5 L14.6 11 L21 13 L14.6 15 L13 21 L11.4 15 L5 13 L11.4 11 Z" fill={accent} />}
      </svg>
      <span style={{ fontFamily: "'Viaoda Libre', serif", fontSize: 'clamp(1.15rem, 2.2vw, 1.7rem)', color: C.espresso, opacity: 0.7, letterSpacing: '0.04em' }}>{name}</span>
    </span>
  )
}

/* =========================================================================
   FAQ accordion
   ========================================================================= */
const FaqList = ({ items }: { items: { q: string; a: string }[] }) => {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div>
      {items.map((item, i) => {
        const isOpen = open === i
        return (
          <GsapReveal key={item.q} delay={i * 0.04}>
            <div className="faq-row" style={{ borderTop: `1px solid ${C.hairline}` }}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                style={{
                  width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20,
                  background: 'none', border: 'none', cursor: 'pointer', padding: '22px 0', textAlign: 'left', color: C.espresso,
                }}>
                <span style={{ fontFamily: "'Viaoda Libre', serif", fontSize: 'clamp(1.05rem, 2.2vw, 1.45rem)' }}>{item.q}</span>
                <span style={{ fontFamily: "'Imprima', sans-serif", color: C.bronze, fontSize: '1.4rem', transform: isOpen ? 'rotate(45deg)' : 'none', transition: `transform 0.4s ${EASE}`, flexShrink: 0 }}>+</span>
              </button>
              <div style={{ overflow: 'hidden', maxHeight: isOpen ? 400 : 0, opacity: isOpen ? 1 : 0, transition: `max-height 0.4s ${EASE}, opacity 0.4s ${EASE}` }}>
                <p style={{ color: C.taupe, lineHeight: 1.6, maxWidth: '62ch', margin: '0 0 22px' }}>{item.a}</p>
              </div>
            </div>
          </GsapReveal>
        )
      })}
      <div style={{ borderTop: `1px solid ${C.hairline}` }} />
    </div>
  )
}