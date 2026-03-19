import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";

gsap.registerPlugin(ScrollTrigger);

// ─── DATA CONSTANTS ────────────────────────────────────────────────────────────

const MENU_DATA = [
  {
    id:"cakes", name:"Cakes & Layer Cakes", emoji:"🎂",
    imgSrc: "/images/cake.png", videoSrc: "/videos/cakes.mp4",
    items:[
      { id:"c1", name:"Classic Vanilla Dream", desc:"4-layer vanilla bean with Swiss meringue buttercream", price:85, note:"Custom text free", imgSrc:"/images/item-cake-vanilla.jpg" },
      { id:"c2", name:"Chocolate Noir", desc:"Dark chocolate ganache with salted caramel layers", price:95, imgSrc:"/images/item-cake-choc.jpg" },
      { id:"c3", name:"Strawberry Bliss", desc:"Fresh strawberry chiffon with whipped cream frosting", price:90, imgSrc:"/images/cake-vanilla.jpg" },
      { id:"c4", name:"Lemon Earl Grey", desc:"Light earl grey sponge with lemon curd & lavender cream", price:88, imgSrc:"/images/cake-chocolate.jpg" },
    ]
  },
  {
    id:"cupcakes", name:"Cupcakes", emoji:"🧁",
    imgSrc: "/images/cupcakes.png", videoSrc: "/videos/cupcakes.mp4",
    items:[
      { id:"u1", name:"Rose Lychee", desc:"Floral rose buttercream on light lychee cake — dozen", price:42, imgSrc:"/images/item-cupcake-rose.jpg" },
      { id:"u2", name:"Salted Caramel", desc:"Caramel-filled with sea salt fleur — dozen", price:38, imgSrc:"/images/item-cupcake-pink.jpg" },
      { id:"u3", name:"Matcha White Choc", desc:"Ceremonial matcha with white chocolate ganache — dozen", price:44, imgSrc:"/images/item-cupcake-rose.jpg" },
      { id:"u4", name:"Lemon Blueberry", desc:"Zesty lemon cake with blueberry compote top — dozen", price:40, imgSrc:"/images/item-cupcake-pink.jpg" },
    ]
  },
  {
    id:"cookies", name:"Cookies & Bars", emoji:"🍪",
    imgSrc: "/images/cookies.png", videoSrc: "/videos/cookies.mp4",
    items:[
      { id:"k1", name:"Brown Butter Choc Chip", desc:"Crispy edge, chewy center, toasted walnut — dozen", price:28, imgSrc:"/images/item-cookie-1.jpg" },
      { id:"k2", name:"Lemon Bars", desc:"Silky lemon curd on shortbread — 9-piece box", price:32, imgSrc:"/images/item-cookie-2.jpg" },
      { id:"k3", name:"Raspberry Linzer", desc:"Almond shortbread with seedless raspberry jam — dozen", price:34, imgSrc:"/images/item-cookie-1.jpg" },
      { id:"k4", name:"Peanut Butter Blossoms", desc:"Soft peanut butter cookies with chocolate kiss — dozen", price:26, imgSrc:"/images/item-cookie-2.jpg" },
    ]
  },
  {
    id:"pies", name:"Pies & Tarts", emoji:"🥧",
    imgSrc: "/images/pies.png", videoSrc: "/videos/pies.mp4",
    items:[
      { id:"p1", name:"Classic Butter Pie", desc:"All-butter crust with seasonal fruit filling — 9\"", price:48, imgSrc:"/images/item-pie-1.jpg" },
      { id:"p2", name:"Dark Chocolate Tart", desc:"Bittersweet ganache in cocoa shell — 9\"", price:52, imgSrc:"/images/item-pie-2.jpg" },
      { id:"p3", name:"Mixed Berry Galette", desc:"Rustic free-form with honeyed berry compote", price:44, imgSrc:"/images/item-pie-1.jpg" },
      { id:"p4", name:"Peach Custard Tart", desc:"Vanilla pastry cream with fresh glazed peaches — 9\"", price:50, imgSrc:"/images/item-pie-2.jpg" },
    ]
  },
  {
    id:"seasonal", name:"Seasonal Specials", emoji:"🌸",
    imgSrc: "/images/cake.png", videoSrc: "/videos/menu.mp4",
    items:[
      { id:"s1", name:"Peach Cardamom Cake", desc:"Roasted peach with cardamom cream — limited run", price:88, imgSrc:"/images/item-cake-vanilla.jpg" },
      { id:"s2", name:"Strawberry Shortcake Roll", desc:"Fresh strawberry with whipped cream sponge roll", price:55, imgSrc:"/images/cake-vanilla.jpg" },
      { id:"s3", name:"Pumpkin Spice Bundt", desc:"Spiced pumpkin with cream cheese drizzle — seasonal", price:65, imgSrc:"/images/item-cake-choc.jpg" },
    ]
  },
  {
    id:"custom", name:"Custom Orders", emoji:"✨",
    imgSrc: "/images/cake.png", videoSrc: "/videos/story.mp4",
    items:[
      { id:"x1", name:"Wedding Tiers", desc:"Consult required — quote provided after tasting session", price:null, note:"GET QUOTE", imgSrc:"/images/item-wedding-1.jpg" },
      { id:"x2", name:"Birthday Masterpiece", desc:"Full custom design, flavors & décor — starting at $120", price:120, imgSrc:"/images/item-wedding-2.jpg" },
      { id:"x3", name:"Corporate Event Box", desc:"Curated assortment boxes for events — per box of 12", price:65, imgSrc:"/images/item-cake-vanilla.jpg" },
      { id:"x4", name:"Baby Shower Set", desc:"Themed cupcakes + cookies + mini cake — serves 20", price:95, imgSrc:"/images/item-cupcake-pink.jpg" },
    ]
  },
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

// ─── UTILITY FUNCTIONS ─────────────────────────────────────────────────────────

const load = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
const persist = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const uid = () => Math.random().toString(36).slice(2,9).toUpperCase();

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

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
  const onLeave = () => { gsap.to(ref.current, { x:0, y:0, duration:0.8, ease:"elastic.out(1,0.4)" }); };
  return (
    <button ref={ref} type={type} className={className} onClick={onClick} disabled={disabled}
      onMouseMove={onMove} onMouseLeave={onLeave} style={{ willChange:"transform" }}>
      {children}
    </button>
  );
}

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
    window.addEventListener("mousemove", move);
    const addListeners = () => {
      document.querySelectorAll("button, a, .nav__link, .bento__card, .menu-card").forEach(el => {
        el.addEventListener("mouseenter", hoverIn);
        el.addEventListener("mouseleave", hoverOut);
      });
    };
    addListeners();
    const observer = new MutationObserver(addListeners);
    observer.observe(document.body, { childList:true, subtree:true });
    return () => { window.removeEventListener("mousemove", move); observer.disconnect(); };
  }, { dependencies:[] });
  if (typeof window !== "undefined" && window.innerWidth < 1024) return null;
  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
}

function PageWipe({ wipeRef }) {
  return <div ref={wipeRef} className="page-wipe" />;
}

function Nav({ view, onSwitch, onScrollTo }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive:true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <nav className={`nav${scrolled ? " scrolled" : ""}${mobileMenuOpen ? " menu-open" : ""}`}>
      <div className="nav__logo" onClick={() => { onSwitch("storefront"); setMobileMenuOpen(false); }}>
        <div className="nav__logo-mark">◆</div>
        <span className="nav__logo-text">Sweet Bakes<em className="nav__logo-by"> / by MeeMee</em></span>
      </div>
      <button className="nav__toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        <span className="nav__toggle-line"></span>
        <span className="nav__toggle-line"></span>
      </button>
      <div className={`nav__links ${mobileMenuOpen ? "active" : ""}`}>
        <span className={`nav__link${view==="storefront"?" active":""}`} onClick={() => { onSwitch("storefront"); setMobileMenuOpen(false); }}>Menu</span>
        <span className="nav__link" onClick={() => { onScrollTo?.("inquire"); setMobileMenuOpen(false); }}>Inquire</span>
        <span className={`nav__link${view==="admin"?" active":""}`} onClick={() => { onSwitch("admin"); setMobileMenuOpen(false); }}>Admin</span>
        <MagneticButton className="nav__cta" onClick={() => { onScrollTo?.("menu"); setMobileMenuOpen(false); }}>Order Now</MagneticButton>
      </div>
    </nav>
  );
}

function HeroSection({ onCTA }) {
  const heroRef    = useRef();
  const rulerRef   = useRef();
  const word1Ref   = useRef();
  const word2Ref   = useRef();
  const sigRef     = useRef();
  const taglineRef = useRef();
  const ctaRef     = useRef();
  const eyebrowRef = useRef();

  const handleVideoReady = (e) => {
    gsap.to(e.currentTarget, { opacity: 1, duration: 1.8, ease: "power2.inOut" });
  };

  useGSAP(() => {
    // Pre-hide elements whose CSS has no opacity:0 (GSAP from needs explicit start)
    gsap.set([sigRef.current, taglineRef.current, ctaRef.current, eyebrowRef.current], { opacity: 0 });
    gsap.set(rulerRef.current, { scaleX: 0, transformOrigin: "center" });

    const tl = gsap.timeline();

    // 1 — thin ruler draws across from centre out
    tl.to(rulerRef.current,
      { scaleX: 1, duration: 0.9, ease: "expo.out" },
      0.15
    );

    // 2 — eyebrow letter-space in
    tl.fromTo(eyebrowRef.current,
      { opacity: 0, letterSpacing: "0.5em" },
      { opacity: 1, letterSpacing: "0.35em", duration: 1.0, ease: "power3.out" },
      0.2
    );

    // 3 — "SWEET" letters curtain-rise
    tl.from(word1Ref.current.querySelectorAll(".hero__letter"),
      { y: "105%", duration: 1.1, stagger: 0.045, ease: "expo.out" },
      0.45
    );

    // 4 — "BAKES" letters follow
    tl.from(word2Ref.current.querySelectorAll(".hero__letter"),
      { y: "105%", duration: 1.1, stagger: 0.045, ease: "expo.out" },
      0.65
    );

    // 5 — signature "by MeeMee" blurs into focus
    tl.fromTo(sigRef.current,
      { opacity: 0, y: 28, filter: "blur(10px)" },
      { opacity: 1, y: 0,  filter: "blur(0px)", duration: 1.4, ease: "power2.out" },
      1.35
    );

    // 6 — tagline soft fade
    tl.fromTo(taglineRef.current,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" },
      1.9
    );

    // 7 — CTA
    tl.fromTo(ctaRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
      2.2
    );

    // Scroll parallax — content drifts up & fades, video scales
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
    scrollTl.to(heroRef.current.querySelector(".hero__content"),    { y: -80, opacity: 0, ease: "power2.in" }, 0);
    scrollTl.to(heroRef.current.querySelector(".hero__video-wrap"), { scale: 1.08, ease: "none" }, 0);
  }, { scope: heroRef });

  const makeLetters = (word) =>
    word.split("").map((ch, i) => (
      <span key={i} className="hero__letter-wrap">
        <span className="hero__letter">{ch}</span>
      </span>
    ));

  return (
    <section ref={heroRef} className="hero">
      <div className="hero__video-wrap">
        <div className="hero__poster-bg" style={{ backgroundImage: "url('/hero-cake.png')" }} />
        <video className="hero__video-bg" src="/videos/hero.mp4" autoPlay muted loop playsInline onCanPlay={handleVideoReady} />
        <div className="hero__overlay" />
      </div>

      <div className="hero__content">
        {/* Eyebrow */}
        <p ref={eyebrowRef} className="hero__eyebrow">Atlanta, GA · Handcrafted · Made to Order</p>

        {/* Decorative rule */}
        <div ref={rulerRef} className="hero__ruler" />

        {/* Main headline — per-letter curtain rise */}
        <h1 className="hero__headline">
          <span ref={word1Ref} className="hero__word-row">{makeLetters("SWEET")}</span>
          <span ref={word2Ref} className="hero__word-row">{makeLetters("BAKES")}</span>
        </h1>

        {/* Signature */}
        <div ref={sigRef} className="hero__sig-row">
          <span className="hero__sig-rule" />
          <p className="hero__signature"><em>by MeeMee</em></p>
          <span className="hero__sig-rule" />
        </div>

        {/* Tagline */}
        <p ref={taglineRef} className="hero__tagline">
          Premium baked goods crafted with intention.<br />Every item made fresh — pre-order for your date.
        </p>

        {/* CTA */}
        <div ref={ctaRef}>
          <MagneticButton onClick={onCTA} className="mag-btn hero__cta-btn">Explore the Menu →</MagneticButton>
        </div>
      </div>

      <div className="hero__scroll-cue">
        <span>scroll</span>
        <div className="hero__scroll-line" />
      </div>
    </section>
  );
}

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

function CategoryBentoGrid({ onCategoryClick }) {
  const sectionRef = useRef();
  useGSAP(() => {
    gsap.from(sectionRef.current.querySelectorAll(".bento__card"), {
      y: 60, opacity: 0, duration: 0.8, stagger: { amount: 0.6, from: "start" }, ease: "power3.out",
      scrollTrigger: { trigger: sectionRef.current, start: "top 75%", once: true }
    });
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="bento">
      <div className="bento__header">
        <div>
          <p className="section-eyebrow">01 / Our Menu</p>
          <h2 className="section-headline">Crafted <em>for you.</em></h2>
        </div>
        <p className="section-sub">Every item handmade fresh, pre-ordered for your date. Tap a category to browse.</p>
      </div>
      <div className="bento__grid">
        {MENU_DATA.map((cat) => (
          <div key={cat.id} className="bento__card" onClick={() => onCategoryClick(cat.id)}>
            {cat.videoSrc
              ? <video src={cat.videoSrc} autoPlay muted loop playsInline poster={cat.imgSrc} style={{ position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover" }} />
              : <img src={cat.imgSrc} alt={cat.name} style={{ position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover" }} />
            }
            <div className="bento__card__overlay" />
            <div className="bento__card__content">
              <p className="bento__card__label">{cat.emoji} {cat.items.length} items</p>
              <h3 className="bento__card__name">{cat.name}</h3>
              <p className="bento__card__cta">Browse →</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function HorizontalScrollMenu({ onOrder, menuRef }) {
  const sectionRef = useRef();
  const trackRef = useRef();
  const assignRef = (el) => {
    sectionRef.current = el;
    if (typeof menuRef === "function") menuRef(el);
    else if (menuRef) menuRef.current = el;
  };
  useGSAP(() => {
    if (!trackRef.current) return;
    if (window.innerWidth < 768) return; // Disable horizontal scroll on mobile
    const totalScroll = trackRef.current.scrollWidth - window.innerWidth;
    if (totalScroll <= 0) return;
    gsap.to(trackRef.current, {
      x: -totalScroll,
      ease: "none",
      scrollTrigger: {
        trigger: sectionRef.current,
        pin: true,
        scrub: 1,
        end: () => "+=" + totalScroll,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      }
    });
    gsap.from(trackRef.current.querySelectorAll(".menu-card"), {
      y: 40, opacity: 0, duration: 0.6, stagger: 0.04, ease: "power2.out",
      scrollTrigger: { trigger: sectionRef.current, start: "top 80%", once: true }
    });
  }, { scope: sectionRef });

  const allCards = [];
  MENU_DATA.forEach(cat => {
    allCards.push({ type:"divider", id:"div-"+cat.id, name:cat.name, emoji:cat.emoji });
    cat.items.forEach(item => allCards.push({
      type:"card", ...item,
      category:cat.name, catId:cat.id, emoji:cat.emoji,
      catVideoSrc: cat.videoSrc, catImgSrc: cat.imgSrc,
      imgSrc: item.imgSrc || cat.imgSrc,
    }));
  });

  return (
    <section ref={assignRef} className="hs-section">
      <div className="hs-header">
        <div>
          <p className="section-eyebrow">02 / Full Menu</p>
          <h2 className="section-headline">Browse <em>& Order</em></h2>
        </div>
        <p className="section-sub">Scroll to explore · Click any item to pre-order</p>
      </div>
      <div className="hs-viewport">
        <div ref={trackRef} className="hs-track">
          {allCards.map(card => {
            if (card.type === "divider") return (
              <div key={card.id} className="cat-divider">
                <span className="cat-divider__text">{card.name}</span>
              </div>
            );
            return (
              <div key={card.id} className="menu-card" onClick={() => onOrder({ ...card })}>
                <div className="menu-card__media">
                  <img src={card.imgSrc} alt={card.name} className="menu-card__video" />
                  <div className="menu-card__media-overlay" />
                  <span className="menu-card__cat-badge">{card.emoji} {card.category}</span>
                </div>
                <div className="menu-card__body">
                  <h3 className="menu-card__name">{card.name}</h3>
                  <p className="menu-card__desc">{card.desc}</p>
                  <div className="menu-card__footer">
                    <span className="menu-card__price">{card.price ? `$${card.price}` : card.note || "Get Quote"}</span>
                    <button className="menu-card__btn">Pre-Order →</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function OrderFormFields({ form, setForm, errors }) {
  const upd = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  const dataRange = {
    min: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    max: new Date(Date.now() + 90*86400000).toISOString().split("T")[0]
  };
  return (
    <div className="order-modal__fields">
      <div className="form-grid">
        <div className="order-modal__field">
          <label className="form-label">Your Name *</label>
          <input className="form-input" value={form.name} onChange={upd("name")} placeholder="Full name" style={{border:errors?.name?"1.5px solid #C4857A":undefined}} />
        </div>
        <div className="order-modal__field">
          <label className="form-label">Email *</label>
          <input className="form-input" type="email" value={form.email} onChange={upd("email")} placeholder="you@email.com" style={{border:errors?.email?"1.5px solid #C4857A":undefined}} />
        </div>
      </div>
      <div className="form-grid">
        <div className="order-modal__field">
          <label className="form-label">Phone</label>
          <input className="form-input" value={form.phone} onChange={upd("phone")} placeholder="(404) 555-0100" />
        </div>
        <div className="order-modal__field">
          <label className="form-label">Pickup Date *</label>
          <input className="form-input" type="date" value={form.date} onChange={upd("date")} min={dataRange.min} max={dataRange.max} style={{border:errors?.date?"1.5px solid #C4857A":undefined}} />
        </div>
      </div>
      <div className="order-modal__field">
        <label className="form-label">Special Instructions</label>
        <textarea className="form-textarea" value={form.notes} onChange={upd("notes")} placeholder="Dietary needs, custom text, allergies..." rows={3} />
      </div>
    </div>
  );
}

function OrderModal({ item, onClose, onSubmit }) {
  const [qty, setQty] = useState(1);
  const [form, setForm] = useState({ name:"", email:"", phone:"", date:"", notes:"" });
  const [errors, setErrors] = useState({});
  const boxRef = useRef();

  useGSAP(() => { gsap.from(boxRef.current, { y:40, opacity:0, scale:0.96, duration:0.4, ease:"power3.out" }); });

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = true;
    if (!form.email.trim() || !form.email.includes("@")) e.email = true;
    if (!form.date) e.date = true;
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      id: uid(), item: item.name, category: item.category, qty,
      price: item.price ? item.price * qty : null,
      customer: form.name, email: form.email, phone: form.phone,
      pickupDate: form.date, notes: form.notes, status: "New", payment: "Pending",
      createdAt: new Date().toISOString()
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target.classList.contains("modal-overlay") && onClose()}>
      <div ref={boxRef} className="order-modal">
        {item.imgSrc && (
          <div className="order-modal__img-wrap">
            <img src={item.imgSrc} alt={item.name} className="order-modal__img" />
            <div className="order-modal__img-overlay" />
          </div>
        )}
        <div className="order-modal__header">
          <div><p className="order-modal__cat">{item.emoji} {item.category}</p><h3 className="order-modal__name">{item.name}</h3></div>
          <button className="order-modal__close" onClick={onClose}>✕</button>
        </div>
        <div className="order-modal__body">
          <p className="order-modal__price">{item.price ? `$${(item.price * qty).toFixed(2)}` : "Price on Quote"}</p>
          <form onSubmit={handleSubmit}>
            <OrderFormFields form={form} setForm={setForm} errors={errors} />
            <button type="submit" className="order-modal__submit" style={{marginTop:20}}>Confirm Pre-Order →</button>
          </form>
        </div>
      </div>
    </div>
  );
}

function StorySection() {
  const sectionRef = useRef();
  const headlineRef = useRef();
  const statRefs = [useRef(), useRef(), useRef()];
  const statsData = [ { num:5, s:"+", l:"Years Baking" }, { num:500, s:"+", l:"Happy Clients" }, { num:100, s:"%", l:"Made Fresh" } ];

  useGSAP(() => {
    const words = headlineRef.current?.querySelectorAll(".story-word");
    if (words?.length) {
      gsap.from(words, {
        y: 60, opacity: 0, duration: 0.8, stagger: 0.08, ease: "power3.out",
        scrollTrigger: { trigger: headlineRef.current, start: "top 80%", once: true }
      });
    }
    gsap.from(sectionRef.current.querySelectorAll(".story__body, .story__eyebrow"), {
      y: 30, opacity: 0, duration: 0.7, stagger: 0.15, ease: "power2.out",
      scrollTrigger: { trigger: sectionRef.current, start: "top 60%", once: true }
    });
    statsData.forEach(({ num, s }, i) => {
      const o = { v: 0 };
      gsap.to(o, {
        v: num, duration: 2, ease: "power2.out",
        onUpdate() { if (statRefs[i].current) statRefs[i].current.textContent = Math.round(o.v) + s; },
        scrollTrigger: { trigger: sectionRef.current, start: "top 50%", once: true }
      });
    });
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="story">
      <div className="story__visual">
        <img src="/images/cake.png" alt="Baker Story" style={{width:"100%",height:"100%",objectFit:"cover"}} />
        <div className="story__visual-overlay" />
      </div>
      <div className="story__content">
        <p className="story__eyebrow">02 / Our Story</p>
        <h2 ref={headlineRef} className="story__headline">Meet <em>MeeMee</em>, the baker behind <em>every</em> bite.</h2>
        <p className="story__body">Sweet Bakes by MeeMee was born out of a love for bringing people together through handcrafted desserts. Based in Atlanta, GA, every cake, cupcake, and cookie is made to order with premium ingredients and personal care.</p>
        <div className="story__stats">
          {statsData.map((s, i) => (
            <div key={i}><p ref={statRefs[i]} className="story__stat-num">0{s.s}</p><p className="story__stat-label">{s.l}</p></div>
          ))}
        </div>
      </div>
    </section>
  );
}

function InquirySection({ inquireRef, onNewInquiry }) {
  const [form, setForm] = useState({ name:"", email:"", phone:"", type:"", date:"", guests:"", message:"" });
  const [submitted, setSubmitted] = useState(false);
  const upd = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const handleSubmit = (e) => {
    e.preventDefault();
    onNewInquiry(form);
    setSubmitted(true);
  };
  return (
    <section ref={inquireRef} className="inquiry">
      <div className="inquiry__left">
        <h2 className="inquiry__left-headline">Let's create <em>beauty.</em></h2>
        <p className="inquiry__left-body">Reach out and let's bring your vision to life.</p>
      </div>
      <div className="inquiry__right">
        {submitted ? <p>Thank you! We'll be in touch.</p> : (
          <form className="inquiry__form" onSubmit={handleSubmit}>
            <input className="inquiry__input" placeholder="Name" value={form.name} onChange={upd("name")} required />
            <input className="inquiry__input" type="email" placeholder="Email" value={form.email} onChange={upd("email")} required />
            <textarea className="inquiry__textarea" placeholder="Your Vision..." value={form.message} onChange={upd("message")} required />
            <MagneticButton type="submit">Submit Inquiry</MagneticButton>
          </form>
        )}
      </div>
    </section>
  );
}

function SiteFooter({ onSwitch }) {
  return (
    <footer className="footer">
      <div className="footer__top">
        <p className="footer__brand-name">Sweet Bakes</p>
        <nav className="footer__nav">
          <span onClick={() => onSwitch("storefront")}>Home</span>
          <span onClick={() => onSwitch("admin")}>Admin</span>
        </nav>
      </div>
      <p className="footer__copyright">© 2026 Sweet Bakes by MeeMee.</p>
    </footer>
  );
}

function Storefront({ onOrder, lenisRef, onSwitch, onNewInquiry }) {
  const menuRef = useRef();
  const inquireRef = useRef();
  const scrollTo = (t) => {
    const el = t === "menu" ? menuRef.current : inquireRef.current;
    if (el && lenisRef?.current) lenisRef.current.scrollTo(el, { offset: -80 });
  };
  return (
    <>
      <HeroSection onCTA={() => scrollTo("menu")} />
      <MarqueeStrip />
      <CategoryBentoGrid onCategoryClick={() => scrollTo("menu")} />
      <HorizontalScrollMenu onOrder={onOrder} menuRef={menuRef} />
      <StorySection />
      <InquirySection inquireRef={inquireRef} onNewInquiry={onNewInquiry} />
      <SiteFooter onSwitch={onSwitch} />
    </>
  );
}

// ─── ADMIN COMPONENTS ──────────────────────────────────────────────────────────

function AdminOrders({ orders, onDelete }) {
  return (
    <div className="admin-section">
      <h2 className="admin-title">Orders</h2>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>ID</th><th>Customer</th><th>Item</th><th>Status</th><th>Payment</th><th>Actions</th></tr></thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td>{o.id}</td><td>{o.customer}</td><td>{o.item}</td>
                <td>{o.status}</td><td>{o.payment}</td>
                <td><button onClick={() => onDelete(o.id)}>Del</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminPanel({ orders, inventory, inquiries, onDeleteOrder }) {
  const [tab, setTab] = useState("orders");
  return (
    <div className="admin-panel">
      <div className="admin-tabs">
        {["orders","stock","inquiries"].map(t => (
          <button key={t} className={`admin-tab ${tab===t?"active":""}`} onClick={()=>setTab(t)}>{t.toUpperCase()}</button>
        ))}
      </div>
      <div className="admin-body">
        {tab === "orders" && <AdminOrders orders={orders} onDelete={onDeleteOrder} />}
        {tab === "stock" && <div>Inventory Management...</div>}
        {tab === "inquiries" && <div>Inquiries...</div>}
      </div>
    </div>
  );
}

// ─── ROOT APP ──────────────────────────────────────────────────────────────────

function App() {
  const [view, setView] = useState("storefront");
  const [orders, setOrders] = useState(() => load("sb_orders", []));
  const [inventory, setInventory] = useState(() => load("sb_inventory", DEFAULT_INVENTORY));
  const [inquiries, setInquiries] = useState(() => load("sb_inquiries", []));
  const [modalItem, setModalItem] = useState(null);
  const lenisRef = useRef(null);
  const wipeRef = useRef(null);

  useEffect(() => { persist("sb_orders", orders); }, [orders]);
  useEffect(() => { persist("sb_inventory", inventory); }, [inventory]);
  useEffect(() => { persist("sb_inquiries", inquiries); }, [inquiries]);

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.4, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const onTick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    return () => { gsap.ticker.remove(onTick); lenis.destroy(); };
  }, []);

  const switchView = useCallback((v) => {
    if (v === view) return;
    const tl = gsap.timeline();
    tl.set(wipeRef.current, { scaleX:0, transformOrigin:"left center", display:"block" });
    tl.to(wipeRef.current, { scaleX:1, duration:0.4, ease:"power3.inOut" });
    tl.call(() => setView(v));
    tl.to(wipeRef.current, { scaleX:0, transformOrigin:"right center", duration:0.4, ease:"power3.inOut" });
    tl.set(wipeRef.current, { display:"none" });
  }, [view]);

  return (
    <>
      <CustomCursor />
      <PageWipe wipeRef={wipeRef} />
      <Nav view={view} onSwitch={switchView} />
      {view === "storefront" ? (
        <Storefront onOrder={setModalItem} lenisRef={lenisRef} onSwitch={switchView} onNewInquiry={(i) => setInquiries(p => [i, ...p])} />
      ) : (
        <AdminPanel orders={orders} inventory={inventory} inquiries={inquiries} onDeleteOrder={(id)=>setOrders(p=>p.filter(o=>o.id!==id))} />
      )}
      {modalItem && <OrderModal item={modalItem} onClose={()=>setModalItem(null)} onSubmit={(o)=>setOrders(p=>[o,...p])} />}
    </>
  );
}

export default App;
