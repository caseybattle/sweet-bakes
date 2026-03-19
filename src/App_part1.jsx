import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";
gsap.registerPlugin(ScrollTrigger);

// ─── DATA CONSTANTS ────────────────────────────────────────────────────────────

const MENU_DATA = [
  { id:"cakes", name:"Cakes & Layer Cakes", emoji:"🎂", videoSrc:"/videos/cakes.mp4", items:[
    { id:"c1", name:"Classic Vanilla Dream", desc:"4-layer vanilla bean with Swiss meringue buttercream", price:85, note:"Custom text free" },
    { id:"c2", name:"Chocolate Noir", desc:"Dark chocolate ganache with salted caramel layers", price:95 },
    { id:"c3", name:"Strawberry Bliss", desc:"Fresh strawberry chiffon with whipped cream frosting", price:90 },
    { id:"c4", name:"Lemon Earl Grey", desc:"Light earl grey sponge with lemon curd & lavender cream", price:88 },
  ]},
  { id:"cupcakes", name:"Cupcakes", emoji:"🧁", videoSrc:"/videos/cupcakes.mp4", items:[
    { id:"u1", name:"Rose Lychee", desc:"Floral rose buttercream on light lychee cake — dozen", price:42 },
    { id:"u2", name:"Salted Caramel", desc:"Caramel-filled with sea salt fleur — dozen", price:38 },
    { id:"u3", name:"Matcha White Choc", desc:"Ceremonial matcha with white chocolate ganache — dozen", price:44 },
    { id:"u4", name:"Lemon Blueberry", desc:"Zesty lemon cake with blueberry compote top — dozen", price:40 },
  ]},
  { id:"cookies", name:"Cookies & Bars", emoji:"🍪", videoSrc:"/videos/cookies.mp4", items:[
    { id:"k1", name:"Brown Butter Choc Chip", desc:"Crispy edge, chewy center, toasted walnut — dozen", price:28 },
    { id:"k2", name:"Lemon Bars", desc:"Silky lemon curd on shortbread — 9-piece box", price:32 },
    { id:"k3", name:"Raspberry Linzer", desc:"Almond shortbread with seedless raspberry jam — dozen", price:34 },
    { id:"k4", name:"Peanut Butter Blossoms", desc:"Soft peanut butter cookies with chocolate kiss — dozen", price:26 },
  ]},
  { id:"pies", name:"Pies & Tarts", emoji:"🥧", videoSrc:"/videos/pies.mp4", items:[
    { id:"p1", name:"Classic Butter Pie", desc:"All-butter crust with seasonal fruit filling — 9\"", price:48 },
    { id:"p2", name:"Dark Chocolate Tart", desc:"Bittersweet ganache in cocoa shell — 9\"", price:52 },
    { id:"p3", name:"Mixed Berry Galette", desc:"Rustic free-form with honeyed berry compote", price:44 },
    { id:"p4", name:"Peach Custard Tart", desc:"Vanilla pastry cream with fresh glazed peaches — 9\"", price:50 },
  ]},
  { id:"seasonal", name:"Seasonal Specials", emoji:"🌸", videoSrc:"/videos/menu.mp4", items:[
    { id:"s1", name:"Peach Cardamom Cake", desc:"Roasted peach with cardamom cream — limited run", price:88 },
    { id:"s2", name:"Strawberry Shortcake Roll", desc:"Fresh strawberry with whipped cream sponge roll", price:55 },
    { id:"s3", name:"Pumpkin Spice Bundt", desc:"Spiced pumpkin with cream cheese drizzle — seasonal", price:65 },
  ]},
  { id:"custom", name:"Custom Orders", emoji:"✨", videoSrc:"/videos/hero.mp4", items:[
    { id:"x1", name:"Wedding Tiers", desc:"Consult required — quote provided after tasting session", price:null, note:"GET QUOTE" },
    { id:"x2", name:"Birthday Masterpiece", desc:"Full custom design, flavors & décor — starting at $120", price:120 },
    { id:"x3", name:"Corporate Event Box", desc:"Curated assortment boxes for events — per box of 12", price:65 },
    { id:"x4", name:"Baby Shower Set", desc:"Themed cupcakes + cookies + mini cake — serves 20", price:95 },
  ]},
];

const DEFAULT_INVENTORY = [
  { id:"i1",  name:"All-Purpose Flour",   unit:"lbs",    qty:50, min:15 },
  { id:"i2",  name:"Butter (Unsalted)",   unit:"lbs",    qty:20, min:8  },
  { id:"i3",  name:"Granulated Sugar",    unit:"lbs",    qty:30, min:10 },
  { id:"i4",  name:"Powdered Sugar",      unit:"lbs",    qty:15, min:5  },
  { id:"i5",  name:"Heavy Cream",         unit:"quarts", qty:8,  min:4  },
  { id:"i6",  name:"Large Eggs",          unit:"dozen",  qty:12, min:4  },
  { id:"i7",  name:"Vanilla Extract",     unit:"oz",     qty:24, min:8  },
  { id:"i8",  name:"Cocoa Powder",        unit:"lbs",    qty:6,  min:2  },
  { id:"i9",  name:"Baking Powder",       unit:"oz",     qty:16, min:4  },
  { id:"i10", name:"Cream Cheese",        unit:"lbs",    qty:10, min:3  },
  { id:"i11", name:"Dark Chocolate",      unit:"lbs",    qty:8,  min:2  },
  { id:"i12", name:"Fresh Strawberries",  unit:"flats",  qty:3,  min:2  },
];

const STATUS_META = {
  New:           { label:"New",      color:"#C4956A" },
  "In Progress": { label:"Baking",   color:"#C4857A" },
  Ready:         { label:"Ready",    color:"#4A3228" },
  Completed:     { label:"Done",     color:"#8C7060" },
};

const PAY_META = {
  Pending:  { label:"Pending",  color:"#C4956A" },
  Paid:     { label:"Paid",     color:"#4A3228" },
  Refunded: { label:"Refunded", color:"#8C7060" },
};

// ─── UTILITY FUNCTIONS ─────────────────────────────────────────────────────────

const load = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
const persist = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const uid = () => Math.random().toString(36).slice(2,9).toUpperCase();
const fmtDateTime = (s) => { if (!s) return "—"; const d = new Date(s); return d.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) + " " + d.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"}); };

// ─── MAGNETIC BUTTON ───────────────────────────────────────────────────────────

function MagneticButton({ children, onClick, className="mag-btn", disabled=false, type="button" }) {
  const ref = useRef();
  const xTo = useRef(null);
  const yTo = useRef(null);
  useGSAP(() => {
    xTo.current = gsap.quickTo(ref.current, "x", { duration:0.4, ease:"power3.out" });
    yTo.current = gsap.quickTo(ref.current, "y", { duration:0.4, ease:"power3.out" });
  }, { scope: ref });
  const onMove = (e) => {
    if (disabled || !xTo.current) return;
    const r = ref.current.getBoundingClientRect();
    xTo.current((e.clientX - r.left - r.width/2) * 0.35);
    yTo.current((e.clientY - r.top - r.height/2) * 0.35);
  };
  const onLeave = () => {
    gsap.to(ref.current, { x:0, y:0, duration:0.8, ease:"elastic.out(1,0.4)" });
  };
  return (
    <button ref={ref} type={type} className={className} onClick={onClick} disabled={disabled}
      onMouseMove={onMove} onMouseLeave={onLeave} style={{ willChange:"transform" }}>
      {children}
    </button>
  );
}

// ─── CUSTOM CURSOR ─────────────────────────────────────────────────────────────

function CustomCursor() {
  const dotRef = useRef();
  const ringRef = useRef();
  useGSAP(() => {
    if (window.innerWidth < 1024) return;
    const xDot = gsap.quickTo(dotRef.current, "x", { duration:0.1, ease:"power4.out" });
    const yDot = gsap.quickTo(dotRef.current, "y", { duration:0.1, ease:"power4.out" });
    const xRing = gsap.quickTo(ringRef.current, "x", { duration:0.4, ease:"power4.out" });
    const yRing = gsap.quickTo(ringRef.current, "y", { duration:0.4, ease:"power4.out" });
    const move = (e) => { xDot(e.clientX); yDot(e.clientY); xRing(e.clientX); yRing(e.clientY); };
    const hoverIn = () => { gsap.to(ringRef.current, { scale:1.8, duration:0.3 }); gsap.to(dotRef.current, { scale:0, duration:0.2 }); };
    const hoverOut = () => { gsap.to(ringRef.current, { scale:1, duration:0.3 }); gsap.to(dotRef.current, { scale:1, duration:0.2 }); };
    const cardIn = () => { gsap.to(ringRef.current, { scale:2.5, duration:0.3 }); };
    window.addEventListener("mousemove", move);
    const addListeners = () => {
      document.querySelectorAll("button, a, .nav__link, .bento__card, .menu-card").forEach(el => {
        el.addEventListener("mouseenter", el.classList.contains("bento__card") || el.classList.contains("menu-card") ? cardIn : hoverIn);
        el.addEventListener("mouseleave", hoverOut);
      });
    };
    addListeners();
    const observer = new MutationObserver(addListeners);
    observer.observe(document.body, { childList:true, subtree:true });
    return () => {
      window.removeEventListener("mousemove", move);
      observer.disconnect();
    };
  }, { dependencies:[] });
  if (typeof window !== "undefined" && window.innerWidth < 1024) return null;
  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
}

// ─── PAGE WIPE ─────────────────────────────────────────────────────────────────

function PageWipe({ wipeRef }) {
  return <div ref={wipeRef} className="page-wipe" />;
}

// ─── PRELOADER ─────────────────────────────────────────────────────────────────

function Preloader({ onComplete }) {
  const ref = useRef();
  const counterRef = useRef();
  const brandRef = useRef();
  const barFillRef = useRef();
  const topRef = useRef();
  const botRef = useRef();

  useGSAP(() => {
    const tl = gsap.timeline();
    const count = { val: 0 };

    tl.to(count, {
      val: 100,
      duration: 2.4,
      ease: "power2.inOut",
      onUpdate() {
        if (counterRef.current) counterRef.current.textContent = String(Math.round(count.val)).padStart(2,"0");
        if (barFillRef.current) barFillRef.current.style.width = count.val + "%";
        if (Math.round(count.val) === 50 && brandRef.current) {
          gsap.to(brandRef.current, { opacity:1, duration:0.5 });
        }
      }
    });
    tl.to([topRef.current, botRef.current], {
      yPercent: (i) => i === 0 ? -100 : 100,
      duration: 0.8,
      ease: "power3.inOut",
      stagger: 0,
      onComplete() {
        if (ref.current) ref.current.style.display = "none";
        onComplete?.();
      }
    }, "+=0.3");
  }, { scope: ref });

  return (
    <div ref={ref} className="preloader">
      <div ref={topRef} className="preloader__panel-top" />
      <div ref={botRef} className="preloader__panel-bottom" />
      <span ref={counterRef} className="preloader__counter">00</span>
      <span ref={brandRef} className="preloader__brand">Sweet Bakes · by MeeMee</span>
      <div className="preloader__bar"><div ref={barFillRef} className="preloader__bar-fill" /></div>
    </div>
  );
}

// ─── NAV ───────────────────────────────────────────────────────────────────────

function Nav({ view, onSwitch, onScrollTo }) {
  const ref = useRef();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive:true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav ref={ref} className={`nav${scrolled ? " scrolled" : ""}`}>
      <div className="nav__logo" onClick={() => onSwitch("storefront")}>
        <div className="nav__logo-mark">◆</div>
        <span className="nav__logo-text">Sweet Bakes<em className="nav__logo-by"> / by MeeMee</em></span>
      </div>
      <div className="nav__links">
        <span className={`nav__link${view==="storefront"?" active":""}`} onClick={() => onSwitch("storefront")}>Menu</span>
        <span className="nav__link" onClick={() => onScrollTo?.("inquire")}>Inquire</span>
        <span className={`nav__link${view==="admin"?" active":""}`} onClick={() => onSwitch("admin")}>Admin</span>
        <MagneticButton className="nav__cta" onClick={() => onScrollTo?.("menu")}>Order Now</MagneticButton>
      </div>
    </nav>
  );
}

// ─── HERO SECTION ──────────────────────────────────────────────────────────────

function HeroSection({ onCTA }) {
  const heroRef = useRef();
  const slot1Ref = useRef();
  const slot2Ref = useRef();
  const bylineRef = useRef();
  const taglineRef = useRef();
  const ctaRef = useRef();
  const eyebrowRef = useRef();
  const videoRef = useRef();

  const slot1Words = ["CRAFTED", "BAKED", "FRESH", "SWEET"];
  const slot2Words = ["GOODS", "TREATS", "DREAMS", "BAKES"];

  useGSAP(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }

    gsap.from(eyebrowRef.current, { y:20, opacity:0, duration:0.8, delay:0.5, ease:"power2.out" });

    const wordH = slot1Ref.current?.offsetHeight || 120;

    const tl1 = gsap.timeline({ delay: 0.8 });
    for (let i = 1; i < slot1Words.length; i++) {
      tl1.to(slot1Ref.current, { y: -wordH * i, duration: i === slot1Words.length - 1 ? 0.5 : 0.18, ease: i === slot1Words.length - 1 ? "elastic.out(1.2,0.5)" : "power2.inOut" }, i === 1 ? 0 : `+=${0.12}`);
    }

    const tl2 = gsap.timeline({ delay: 1.0 });
    for (let i = 1; i < slot2Words.length; i++) {
      tl2.to(slot2Ref.current, { y: -wordH * i, duration: i === slot2Words.length - 1 ? 0.5 : 0.18, ease: i === slot2Words.length - 1 ? "elastic.out(1.2,0.5)" : "power2.inOut" }, i === 1 ? 0 : `+=${0.12}`);
    }

    gsap.from(bylineRef.current,  { y:30, opacity:0, duration:0.8, delay:2.2, ease:"power2.out" });
    gsap.from(taglineRef.current, { y:20, opacity:0, duration:0.7, delay:2.5, ease:"power2.out" });
    gsap.from(ctaRef.current,     { y:20, opacity:0, duration:0.6, delay:2.7, ease:"power2.out" });

    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "+=100%",
        scrub: 1.5,
        pin: true,
        anticipatePin: 1,
      }
    });
    scrollTl.to(heroRef.current.querySelector(".hero__content"),    { y:-80, opacity:0, ease:"power2.in" }, 0);
    scrollTl.to(heroRef.current.querySelector(".hero__video-wrap"), { scale:1.08, ease:"none" }, 0);
  }, { scope: heroRef });

  return (
    <section ref={heroRef} className="hero">
      <div className="hero__video-wrap">
        <video ref={videoRef} className="hero__video-bg" src="/videos/hero.mp4" autoPlay muted loop playsInline />
        <div className="hero__overlay" />
      </div>
      <div className="hero__content">
        <p ref={eyebrowRef} className="hero__eyebrow">Atlanta, GA · Handcrafted · Made to Order</p>
        <h1 className="hero__headline">
          <span className="hero__slot">
            <span ref={slot1Ref} className="hero__slot-track">
              {slot1Words.map((w,i) => <span key={i} className="hero__slot-word">{w}</span>)}
            </span>
          </span>
          {" "}
          <span className="hero__slot">
            <span ref={slot2Ref} className="hero__slot-track">
              {slot2Words.map((w,i) => <span key={i} className="hero__slot-word">{w}</span>)}
            </span>
          </span>
        </h1>
        <p ref={bylineRef} className="hero__byline"><em>by MeeMee</em></p>
        <p ref={taglineRef} className="hero__tagline">Premium baked goods crafted with intention.<br />Every item made fresh — pre-order for your date.</p>
        <div ref={ctaRef}>
          <MagneticButton onClick={onCTA} className="mag-btn">Explore the Menu →</MagneticButton>
        </div>
      </div>
      <div className="hero__scroll-cue">
        <span>scroll</span>
        <div className="hero__scroll-line" />
      </div>
    </section>
  );
}

// ─── MARQUEE STRIP ─────────────────────────────────────────────────────────────

function MarqueeStrip() {
  const items = ["Handcrafted in Atlanta", "Custom Cakes", "Fresh Daily", "Pre-Order Now", "Sweet Bakes by MeeMee", "Made with Love", "Cupcakes · Cookies · Pies", "Atlanta's Finest Bakery"];
  const doubled = [...items, ...items];
  return (
    <div className="marquee">
      <div className="marquee__track">
        {doubled.map((item, i) => (
          <span key={i} className="marquee__item">
            {item}<span className="marquee__dot">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
