// ============================================================
// Part 3 of 4 — StorySection, ProcessSection, InquirySection,
//               SiteFooter, Storefront
// Do NOT import or re-define anything — see Part 1.
// ============================================================

function StorySection() {
  const sectionRef = useRef();
  const headlineRef = useRef();
  const statRefs = [useRef(), useRef(), useRef()];
  const statsData = [
    { num:5, suffix:"+", label:"Years Baking" },
    { num:500, suffix:"+", label:"Happy Clients" },
    { num:100, suffix:"%", label:"Made Fresh" },
  ];

  useGSAP(() => {
    // Headline words slide up
    const words = headlineRef.current?.querySelectorAll(".story-word");
    if (words?.length) {
      gsap.from(words, {
        y: 60, opacity: 0, duration: 0.8, stagger: 0.08, ease: "power3.out",
        scrollTrigger: { trigger: headlineRef.current, start: "top 80%", once: true }
      });
    }

    // Body text fade in
    gsap.from(sectionRef.current.querySelectorAll(".story__body, .story__eyebrow"), {
      y: 30, opacity: 0, duration: 0.7, stagger: 0.15, ease: "power2.out",
      scrollTrigger: { trigger: sectionRef.current, start: "top 60%", once: true }
    });

    // Counter animations
    statsData.forEach(({ num, suffix }, i) => {
      const obj = { val: 0 };
      gsap.to(obj, {
        val: num, duration: 2, ease: "power2.out",
        onUpdate() { if (statRefs[i].current) statRefs[i].current.textContent = Math.round(obj.val) + suffix; },
        scrollTrigger: { trigger: sectionRef.current, start: "top 50%", once: true }
      });
    });
  }, { scope: sectionRef });

  const headlineWords = ["Meet", "MeeMee,", "the baker behind", "every", "bite."];

  return (
    <section ref={sectionRef} className="story">
      <div className="story__visual" style={{position:"relative"}}>
        <video src="/videos/story.mp4" autoPlay muted loop playsInline style={{width:"100%",height:"100%",objectFit:"cover"}} />
        <div className="story__visual-overlay" />
      </div>
      <div className="story__content">
        <p className="story__eyebrow">02 / Our Story</p>
        <h2 ref={headlineRef} className="story__headline">
          {headlineWords.map((w,i) => (
            <span key={i} className="story-word" style={{display:"inline-block",overflow:"hidden",marginRight:"0.25em"}}>
              {w === "every" ? <em>{w}</em> : w}
            </span>
          ))}
        </h2>
        <p className="story__body">
          Sweet Bakes by MeeMee was born out of a love for bringing people together through handcrafted desserts. Based in Atlanta, GA, every cake, cupcake, and cookie is made to order with premium ingredients and personal care.
        </p>
        <p className="story__body" style={{marginTop:16}}>
          No shortcuts. No freezers. No compromises. Just real baking, real flavor, and real love baked into every order — whether it's a birthday cupcake or a five-tier wedding cake.
        </p>
        <div className="story__stats">
          {statsData.map((s, i) => (
            <div key={i}>
              <p ref={statRefs[i]} className="story__stat-num">0{s.suffix}</p>
              <p className="story__stat-label">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------

function ProcessSection() {
  const sectionRef = useRef();

  useGSAP(() => {
    gsap.from(sectionRef.current.querySelectorAll(".process__step"), {
      y: 60, opacity: 0, duration: 0.8, stagger: 0.15, ease: "power3.out",
      scrollTrigger: { trigger: sectionRef.current, start: "top 70%", once: true }
    });
    gsap.from(sectionRef.current.querySelector(".process__header"), {
      y: 40, opacity: 0, duration: 0.8, ease: "power2.out",
      scrollTrigger: { trigger: sectionRef.current, start: "top 80%", once: true }
    });
  }, { scope: sectionRef });

  const steps = [
    { num:"01", icon:"🧁", title:"Browse the Menu", body:"Explore our full menu of cakes, cupcakes, cookies, pies, and seasonal specials. Each item is handcrafted to order." },
    { num:"02", icon:"📝", title:"Pre-Order Online", body:"Click 'Pre-Order' on any item, fill in your details and preferred pickup date. We'll confirm within 24 hours." },
    { num:"03", icon:"✨", title:"Pick Up Fresh", body:"Your order is baked fresh on the day of pickup. Come in, pick up, and enjoy — guaranteed satisfaction every time." },
  ];

  return (
    <section ref={sectionRef} className="process">
      <div className="process__header">
        <p className="section-eyebrow" style={{textAlign:"center"}}>03 / How It Works</p>
        <h2 className="section-headline" style={{textAlign:"center"}}>Simple as <em>pie.</em></h2>
        <p className="section-sub" style={{textAlign:"center",margin:"16px auto 0"}}>Three easy steps to get your handcrafted order.</p>
      </div>
      <div className="process__grid">
        {steps.map((step, i) => (
          <div key={i} className="process__step" data-step={step.num}>
            <div className="process__icon">{step.icon}</div>
            <h3 className="process__title">{step.title}</h3>
            <p className="process__body">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ------------------------------------------------------------

function InquirySection({ inquireRef }) {
  const sectionRef = useRef();
  const formRef = useRef();
  const [form, setForm] = useState({ name:"", email:"", phone:"", type:"", date:"", guests:"", message:"" });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const assignRef = (el) => {
    sectionRef.current = el;
    if (typeof inquireRef === "function") inquireRef(el);
    else if (inquireRef) inquireRef.current = el;
  };

  useGSAP(() => {
    gsap.from(sectionRef.current?.querySelector(".inquiry__left"), {
      x: -60, opacity: 0, duration: 0.9, ease: "power3.out",
      scrollTrigger: { trigger: sectionRef.current, start: "top 70%", once: true }
    });
    gsap.from(sectionRef.current?.querySelector(".inquiry__right"), {
      x: 60, opacity: 0, duration: 0.9, ease: "power3.out",
      scrollTrigger: { trigger: sectionRef.current, start: "top 70%", once: true }
    });
  }, { scope: sectionRef });

  const upd = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = true;
    if (!form.email.includes("@")) e.email = true;
    if (!form.type) e.type = true;
    if (!form.message.trim()) e.message = true;
    setErrors(e);
    return !Object.keys(e).length;
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const existing = JSON.parse(localStorage.getItem("sb_inquiries") || "[]");
    localStorage.setItem("sb_inquiries", JSON.stringify([...existing, { ...form, id: uid(), createdAt: new Date().toISOString() }]));
    setSubmitted(true);
  };
  const err = k => errors[k] ? { border:"1.5px solid var(--pink)" } : {};

  return (
    <section ref={assignRef} className="inquiry">
      <div className="inquiry__left">
        <p className="inquiry__left-eyebrow">04 / Get in Touch</p>
        <h2 className="inquiry__left-headline">Let's create something <em>beautiful.</em></h2>
        <p className="inquiry__left-body">Whether it's an intimate birthday cake or a grand wedding centrepiece — every order receives the same level of care and artistry. Reach out and let's bring your vision to life.</p>
        <div>
          {[
            { label:"Location", value:"Atlanta, Georgia" },
            { label:"Lead Time", value:"2–3 weeks for custom orders" },
            { label:"Events", value:"Weddings · Birthdays · Corporate · Showers" },
            { label:"Email", value:"hello@sweetbakesbymeemee.com" },
          ].map(({ label, value }) => (
            <div key={label} className="inquiry__contact-item">
              <span className="inquiry__contact-label">{label}</span>
              <span className="inquiry__contact-value">{value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="inquiry__right">
        {submitted ? (
          <div style={{textAlign:"center",padding:"60px 40px",display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
            <div style={{fontSize:48}}>🌸</div>
            <h3 style={{fontFamily:"var(--font-display)",fontSize:28,fontWeight:300,color:"var(--mocha)"}}>Inquiry Received!</h3>
            <p style={{fontFamily:"var(--font-body)",fontSize:14,fontWeight:300,color:"var(--warm-gray)",lineHeight:1.8,maxWidth:320}}>Thank you {form.name}! We'll be in touch within 24 hours to discuss your order.</p>
            <button onClick={() => { setSubmitted(false); setForm({ name:"",email:"",phone:"",type:"",date:"",guests:"",message:"" }); }} style={{marginTop:16,background:"none",border:"1.5px solid var(--border)",color:"var(--warm-gray)",fontFamily:"var(--font-mono)",fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",padding:"10px 24px",borderRadius:"100px",cursor:"pointer"}}>Send Another</button>
          </div>
        ) : (
          <form ref={formRef} className="inquiry__form" onSubmit={handleSubmit}>
            <h3 style={{fontFamily:"var(--font-serif)",fontSize:22,color:"var(--mocha)",marginBottom:24}}>Send an Inquiry</h3>
            <div className="inquiry__row">
              <div className="inquiry__field">
                <label className="inquiry__label">Full Name *</label>
                <input className="inquiry__input" value={form.name} onChange={upd("name")} placeholder="Your name" style={err("name")} />
              </div>
              <div className="inquiry__field">
                <label className="inquiry__label">Email *</label>
                <input className="inquiry__input" type="email" value={form.email} onChange={upd("email")} placeholder="you@email.com" style={err("email")} />
              </div>
            </div>
            <div className="inquiry__row">
              <div className="inquiry__field">
                <label className="inquiry__label">Phone</label>
                <input className="inquiry__input" value={form.phone} onChange={upd("phone")} placeholder="(404) 555-0100" />
              </div>
              <div className="inquiry__field">
                <label className="inquiry__label">Event Type *</label>
                <select className="inquiry__select" value={form.type} onChange={upd("type")} style={err("type")}>
                  <option value="">Select type…</option>
                  {["Wedding","Birthday","Baby Shower","Corporate Event","Custom Cake","Other"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div className="inquiry__row">
              <div className="inquiry__field">
                <label className="inquiry__label">Event Date</label>
                <input className="inquiry__input" type="date" value={form.date} onChange={upd("date")} />
              </div>
              <div className="inquiry__field">
                <label className="inquiry__label">Est. Guests</label>
                <input className="inquiry__input" type="number" value={form.guests} onChange={upd("guests")} placeholder="50" min="1" />
              </div>
            </div>
            <div className="inquiry__field">
              <label className="inquiry__label">Tell us your vision *</label>
              <textarea className="inquiry__textarea" value={form.message} onChange={upd("message")} placeholder="Describe your vision, flavor preferences, dietary needs…" style={err("message")} />
            </div>
            <MagneticButton type="submit" className="inquiry__submit">Submit Inquiry →</MagneticButton>
          </form>
        )}
      </div>
    </section>
  );
}

// ------------------------------------------------------------

function SiteFooter({ onSwitch }) {
  return (
    <footer className="footer">
      <div className="footer__top">
        <div>
          <p className="footer__brand-name">Sweet Bakes</p>
          <p className="footer__brand-by">by MeeMee</p>
          <p className="footer__brand-desc">Handcrafted premium baked goods made with love and fresh ingredients. Custom orders welcome — every occasion deserves something special.</p>
        </div>
        <div className="footer__col">
          <p className="footer__col-title">Navigate</p>
          <ul>
            {[["Home","storefront"],["Our Menu","storefront"],["Inquire","storefront"],["Admin","admin"]].map(([label, view]) => (
              <li key={label} onClick={() => onSwitch(view)} style={{cursor:"pointer"}}>{label}</li>
            ))}
          </ul>
        </div>
        <div className="footer__col">
          <p className="footer__col-title">Contact</p>
          <ul>
            <li>Atlanta, Georgia</li>
            <li><a href="mailto:hello@sweetbakesbymeemee.com">Email Us</a></li>
            <li><a href="tel:+14045550123">Call Us</a></li>
            <li>@sweetbakesbymeemee</li>
          </ul>
        </div>
        <div className="footer__col">
          <p className="footer__col-title">Hours</p>
          <ul>
            <li>Mon–Fri: 9am–6pm</li>
            <li>Sat: 10am–4pm</li>
            <li>Sun: By Appt.</li>
            <li>Pre-orders always open</li>
          </ul>
        </div>
      </div>
      <div className="footer__bottom">
        <p className="footer__copyright">© 2026 Sweet Bakes by MeeMee. All rights reserved.</p>
        <p className="footer__copyright">Made with <span className="footer__heart">♥</span> in Atlanta</p>
      </div>
    </footer>
  );
}

// ------------------------------------------------------------

function Storefront({ onOrder, lenisRef, onSwitch }) {
  const menuRef = useRef();
  const inquireRef = useRef();

  const scrollTo = useCallback((target) => {
    const el = target === "menu" ? menuRef.current : inquireRef.current;
    if (!el) return;
    if (lenisRef?.current) {
      lenisRef.current.scrollTo(el, { offset: -80, duration: 1.4, easing: (t) => t < 0.5 ? 2*t*t : -1+(4-2*t)*t });
    } else {
      el.scrollIntoView({ behavior:"smooth" });
    }
  }, [lenisRef]);

  return (
    <>
      <HeroSection onCTA={() => scrollTo("menu")} />
      <MarqueeStrip />
      <CategoryBentoGrid onCategoryClick={() => scrollTo("menu")} />
      <HorizontalScrollMenu onOrder={onOrder} menuRef={menuRef} />
      <StorySection />
      <ProcessSection />
      <InquirySection inquireRef={inquireRef} />
      <SiteFooter onSwitch={onSwitch} />
    </>
  );
}

// End of Part 3 — export default is in Part 4
