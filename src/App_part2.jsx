function StatusTag({ status }) {
  const m = { New:["#C4956A","#FDF5ED"], "In Progress":["#C4857A","#FDF0ED"], Ready:["#4A3228","#F5E8E4"], Completed:["#8C7060","#F5EBD8"] };
  const [color, bg] = m[status] || ["#8C7060","#F5EBD8"];
  const labels = { New:"New", "In Progress":"Baking", Ready:"Ready", Completed:"Done" };
  return <span style={{ background:bg, color, padding:"3px 10px", borderRadius:"100px", fontSize:"10px", fontFamily:"var(--font-mono)", letterSpacing:"0.1em", textTransform:"uppercase" }}>{labels[status]||status}</span>;
}
function PayTag({ pay }) {
  const m = { Pending:["#C4956A","#FDF5ED"], Paid:["#4A3228","#F5E8E4"], Refunded:["#8C7060","#F5EBD8"] };
  const [color, bg] = m[pay] || ["#8C7060","#F5EBD8"];
  return <span style={{ background:bg, color, padding:"3px 10px", borderRadius:"100px", fontSize:"10px", fontFamily:"var(--font-mono)", letterSpacing:"0.1em", textTransform:"uppercase" }}>{pay}</span>;
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
        {MENU_DATA.map((cat, i) => (
          <div key={cat.id} className="bento__card" onClick={() => onCategoryClick(cat.id)}>
            <video src={cat.videoSrc} autoPlay muted loop playsInline style={{ position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover" }} />
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

function HorizontalScrollMenu({ onOrder, menuRef, targetCategory }) {
  const sectionRef = useRef();
  const trackRef = useRef();

  const assignRef = (el) => {
    sectionRef.current = el;
    if (typeof menuRef === "function") menuRef(el);
    else if (menuRef) menuRef.current = el;
  };

  useGSAP(() => {
    if (!trackRef.current) return;
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
    allCards.push({ type:"divider", id:"div-"+cat.id, name:cat.name });
    cat.items.forEach(item => allCards.push({ type:"card", ...item, category:cat.name, catId:cat.id, emoji:cat.emoji }));
  });

  return (
    <section ref={assignRef} className="hs-section">
      <div className="hs-header">
        <div>
          <p className="section-eyebrow">02 / Full Menu</p>
          <h2 className="section-headline">Browse <em>& Order</em></h2>
        </div>
        <p className="section-sub" style={{maxWidth:300}}>Scroll to explore · Click any item to pre-order</p>
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
                  <div className="menu-card__media-gradient" />
                  <span className="menu-card__cat-icon">{card.emoji}</span>
                </div>
                <div className="menu-card__body">
                  <p className="menu-card__cat">{card.category}</p>
                  <h3 className="menu-card__name">{card.name}</h3>
                  <p className="menu-card__desc">{card.desc}</p>
                  <div className="menu-card__footer">
                    <span className="menu-card__price">{card.price ? `$${card.price}` : card.note || "Quote"}</span>
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

function OrderFormInner({ form, setForm, errors }) {
  const upd = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const maxDate = new Date(Date.now() + 90*86400000).toISOString().split("T")[0];
  return (
    <div className="order-modal__fields">
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div className="order-modal__field">
          <label className="form-label">Your Name *</label>
          <input className="form-input" value={form.name} onChange={upd("name")} placeholder="Full name" style={{border:errors?.name?"1.5px solid #C4857A":undefined}} />
          {errors?.name && <span style={{fontSize:11,color:"var(--pink)"}}>Required</span>}
        </div>
        <div className="order-modal__field">
          <label className="form-label">Email *</label>
          <input className="form-input" type="email" value={form.email} onChange={upd("email")} placeholder="you@email.com" style={{border:errors?.email?"1.5px solid #C4857A":undefined}} />
          {errors?.email && <span style={{fontSize:11,color:"var(--pink)"}}>Required</span>}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div className="order-modal__field">
          <label className="form-label">Phone</label>
          <input className="form-input" value={form.phone} onChange={upd("phone")} placeholder="(404) 555-0100" />
        </div>
        <div className="order-modal__field">
          <label className="form-label">Pickup Date *</label>
          <input className="form-input" type="date" value={form.date} onChange={upd("date")} min={tomorrow} max={maxDate} style={{border:errors?.date?"1.5px solid #C4857A":undefined}} />
          {errors?.date && <span style={{fontSize:11,color:"var(--pink)"}}>Required</span>}
        </div>
      </div>
      <div className="order-modal__field">
        <label className="form-label">Special Instructions</label>
        <textarea className="form-textarea" value={form.notes} onChange={upd("notes")} placeholder="Dietary needs, custom text, allergies..." rows={3} style={{resize:"vertical",minHeight:80}} />
      </div>
    </div>
  );
}

function OrderModal({ item, onClose, onSubmit }) {
  const [qty, setQty] = useState(1);
  const [form, setForm] = useState({ name:"", email:"", phone:"", date:"", notes:"" });
  const [errors, setErrors] = useState({});
  const overlayRef = useRef();
  const boxRef = useRef();

  useGSAP(() => {
    gsap.from(boxRef.current, { y:40, opacity:0, scale:0.96, duration:0.4, ease:"power3.out" });
  });

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = true;
    if (!form.email.trim() || !form.email.includes("@")) e.email = true;
    if (!form.date) e.date = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      id: uid(),
      item: item.name,
      category: item.category,
      qty,
      price: item.price ? item.price * qty : null,
      customer: form.name,
      email: form.email,
      phone: form.phone,
      pickupDate: form.date,
      notes: form.notes,
      status: "New",
      payment: "Pending",
      createdAt: new Date().toISOString(),
    });
  };

  if (!item) return null;

  return (
    <div ref={overlayRef} className="modal-overlay" onClick={(e) => e.target === overlayRef.current && onClose()}>
      <div ref={boxRef} className="order-modal">
        <div className="order-modal__header">
          <div>
            <p className="order-modal__cat">{item.emoji} {item.category}</p>
            <h3 className="order-modal__name">{item.name}</h3>
          </div>
          <button className="order-modal__close" onClick={onClose}>✕</button>
        </div>
        <div className="order-modal__body">
          <p className="order-modal__price" style={{fontFamily:"var(--font-mono)",fontSize:22,color:"var(--mocha)",marginBottom:20}}>
            {item.price ? `$${(item.price * qty).toFixed(2)}` : "Price on Quote"}
          </p>
          {item.price && (
            <div className="order-modal__qty">
              <span style={{fontFamily:"var(--font-mono)",fontSize:11,letterSpacing:"0.15em",textTransform:"uppercase",color:"var(--warm-gray)"}}>Qty</span>
              <button className="qty-btn" onClick={() => setQty(q => Math.max(1,q-1))}>−</button>
              <span className="qty-val">{qty}</span>
              <button className="qty-btn" onClick={() => setQty(q => q+1)}>+</button>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <OrderFormInner form={form} setForm={setForm} errors={errors} />
            <button type="submit" className="order-modal__submit" style={{marginTop:20}}>
              Confirm Pre-Order →
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
