import { useState, useEffect } from "react";

// ── Persist helpers ───────────────────────────────────────────────────
const load = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
};
const persist = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

// ── Design tokens (matched to logo: hot pink, cream, white, grey) ─────
const C = {
  hotPink:   "#EC4899",
  pink:      "#F472B6",
  pinkMid:   "#F9A8D4",
  pinkLight: "#FDE8F3",
  pinkPale:  "#FFF0F9",
  cream:     "#FFFAF5",
  white:     "#FFFFFF",
  grey50:    "#F9F6F4",
  grey100:   "#F0EBEA",
  grey200:   "#DDD5D3",
  grey300:   "#C4B8B4",
  grey400:   "#A8978F",
  grey500:   "#8A7670",
  grey600:   "#6B5A55",
  grey800:   "#3A2E2A",
  black:     "#1C1410",
  rose:      "#BE185D",
  green:     "#15803D",
  orange:    "#C2410C",
  purple:    "#6D28D9",
};

const MENU_DATA = {
  "Cakes & Layer Cakes": [
    { id:"c1",   emoji:"🎂", name:"Classic Vanilla Dream",      price:85,  desc:"4-layer vanilla bean with Swiss meringue buttercream" },
    { id:"c2",   emoji:"🍫", name:"Chocolate Noir",             price:95,  desc:"Dark chocolate ganache with salted caramel layers" },
    { id:"c3",   emoji:"🍓", name:"Strawberry Bliss",           price:90,  desc:"Fresh strawberry chiffon with whipped cream frosting" },
    { id:"c4",   emoji:"🌿", name:"Lemon Earl Grey",            price:88,  desc:"Light earl grey sponge with lemon curd & lavender cream" },
  ],
  "Cupcakes": [
    { id:"cup1", emoji:"🌸", name:"Rose Lychee",                price:42,  desc:"Floral rose buttercream on light lychee cake — dozen" },
    { id:"cup2", emoji:"🧁", name:"Salted Caramel",             price:38,  desc:"Caramel-filled with sea salt fleur — dozen" },
    { id:"cup3", emoji:"🍵", name:"Matcha White Choc",          price:44,  desc:"Ceremonial matcha with white chocolate ganache — dozen" },
    { id:"cup4", emoji:"🍋", name:"Lemon Blueberry",            price:40,  desc:"Zesty lemon cake with blueberry compote top — dozen" },
  ],
  "Cookies & Bars": [
    { id:"ck1",  emoji:"🍪", name:"Brown Butter Choc Chip",     price:28,  desc:"Crispy edge, chewy center, toasted walnut — dozen" },
    { id:"ck2",  emoji:"🍋", name:"Lemon Bars",                 price:32,  desc:"Silky lemon curd on shortbread — 9-piece box" },
    { id:"ck3",  emoji:"❤️", name:"Raspberry Linzer",           price:34,  desc:"Almond shortbread with seedless raspberry jam — dozen" },
    { id:"ck4",  emoji:"🥜", name:"Peanut Butter Blossoms",     price:26,  desc:"Soft peanut butter cookies with chocolate kiss — dozen" },
  ],
  "Pies & Tarts": [
    { id:"p1",   emoji:"🥧", name:"Classic Butter Pie",         price:48,  desc:"All-butter crust with seasonal fruit filling — 9\"" },
    { id:"p2",   emoji:"🖤", name:"Dark Chocolate Tart",        price:52,  desc:"Bittersweet ganache in cocoa shell — 9\"" },
    { id:"p3",   emoji:"🫐", name:"Mixed Berry Galette",        price:44,  desc:"Rustic free-form with honeyed berry compote" },
    { id:"p4",   emoji:"🍑", name:"Peach Custard Tart",         price:50,  desc:"Vanilla pastry cream with fresh glazed peaches — 9\"" },
  ],
  "Seasonal Specials": [
    { id:"s1",   emoji:"🍑", name:"Peach Cardamom Cake",        price:88,  desc:"Roasted peach with cardamom cream — limited run" },
    { id:"s2",   emoji:"🍰", name:"Strawberry Shortcake Roll",  price:55,  desc:"Fresh strawberry with whipped cream sponge roll" },
    { id:"s3",   emoji:"🎃", name:"Pumpkin Spice Bundt",        price:65,  desc:"Spiced pumpkin with cream cheese drizzle — seasonal" },
  ],
  "Custom Orders": [
    { id:"co1",  emoji:"💍", name:"Wedding Tiers",              price:null, desc:"Consult required — quote provided after tasting session" },
    { id:"co2",  emoji:"🎉", name:"Birthday Masterpiece",       price:120,  desc:"Full custom design, flavors & décor — starting at $120" },
    { id:"co3",  emoji:"🎁", name:"Corporate Event Box",        price:65,   desc:"Curated assortment boxes for events — per box of 12" },
    { id:"co4",  emoji:"🌸", name:"Baby Shower Set",            price:95,   desc:"Themed cupcakes + cookies + mini cake — serves 20" },
  ],
};

const DEFAULT_INVENTORY = [
  { id:"i1",  name:"All-Purpose Flour",  qty:25, unit:"lbs",     low:10 },
  { id:"i2",  name:"Unsalted Butter",    qty:8,  unit:"lbs",     low:5  },
  { id:"i3",  name:"Granulated Sugar",   qty:15, unit:"lbs",     low:8  },
  { id:"i4",  name:"Heavy Cream",        qty:4,  unit:"qts",     low:2  },
  { id:"i5",  name:"Eggs (Large)",       qty:48, unit:"ct",      low:24 },
  { id:"i6",  name:"Vanilla Extract",    qty:3,  unit:"bottles", low:1  },
  { id:"i7",  name:"Cocoa Powder",       qty:2,  unit:"lbs",     low:1  },
  { id:"i8",  name:"Powdered Sugar",     qty:10, unit:"lbs",     low:4  },
  { id:"i9",  name:"Bread Flour",        qty:12, unit:"lbs",     low:6  },
  { id:"i10", name:"Almond Flour",       qty:3,  unit:"lbs",     low:2  },
  { id:"i11", name:"Baking Powder",      qty:4,  unit:"cans",    low:2  },
  { id:"i12", name:"Dark Chocolate",     qty:5,  unit:"lbs",     low:2  },
];

const uid = () => Math.random().toString(36).slice(2, 9);
const fmtDateTime = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-US", { month:"short", day:"numeric", year:"numeric", hour:"numeric", minute:"2-digit" });
};

const STATUS_META = {
  "New":         { bg:"#EEF2FF", txt:"#4338CA", dot:"#6366F1" },
  "In Progress": { bg:"#FFF3E0", txt:"#C2410C", dot:"#FB923C" },
  "Ready":       { bg:"#DCFCE7", txt:"#15803D", dot:"#22C55E" },
  "Completed":   { bg:"#F3E8FF", txt:"#6D28D9", dot:"#A855F7" },
  "Cancelled":   { bg:"#FEE2E2", txt:"#B91C1C", dot:"#F87171" },
};
const PAY_META = {
  "Unpaid":       { bg:"#FEE2E2", txt:"#B91C1C" },
  "Deposit Paid": { bg:"#FEF9C3", txt:"#92400E" },
  "Paid in Full": { bg:"#DCFCE7", txt:"#15803D" },
};

function StatusBadge({ label }) {
  const m = STATUS_META[label] || { bg: C.grey100, txt: C.grey600, dot: C.grey300 };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px",
      borderRadius:999, background:m.bg, color:m.txt, fontSize:11, fontWeight:700 }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:m.dot }} />
      {label}
    </span>
  );
}

function PayBadge({ label }) {
  const m = PAY_META[label] || { bg: C.grey100, txt: C.grey600 };
  return (
    <span style={{ padding:"3px 10px", borderRadius:999, background:m.bg, color:m.txt, fontSize:11, fontWeight:700 }}>
      {label}
    </span>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{ background:C.white, borderRadius:18, border:`1px solid ${C.grey100}`,
      boxShadow:"0 1px 4px rgba(0,0,0,0.04)", padding:24, ...style }}>
      {children}
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", size = "md", disabled = false, style = {} }) {
  const sz = { sm:{padding:"5px 14px",fontSize:12}, md:{padding:"9px 22px",fontSize:13}, lg:{padding:"13px 30px",fontSize:15} };
  const vr = {
    primary: { background:`linear-gradient(135deg,${C.pink},${C.hotPink})`, color:"#fff", border:"none" },
    ghost:   { background:"transparent", color:C.grey600, border:`1px solid ${C.grey200}` },
    danger:  { background:"#FEE2E2", color:"#B91C1C", border:"none" },
    subtle:  { background:C.pinkLight, color:C.rose, border:"none" },
    outline: { background:"transparent", color:C.hotPink, border:`1.5px solid ${C.hotPink}` },
    green:   { background:"#DCFCE7", color:"#15803D", border:"none" },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...sz[size], ...vr[variant], borderRadius:10, fontFamily:"inherit",
      fontWeight:700, cursor:disabled?"not-allowed":"pointer",
      transition:"all 0.15s", opacity:disabled?0.5:1, ...style }}>
      {children}
    </button>
  );
}

function Field({ label, value, onChange, type="text", placeholder="", required=false, as="input", options=[], min, style={} }) {
  const base = { padding:"10px 14px", borderRadius:10, border:`1px solid ${C.grey200}`,
    background:C.white, fontFamily:"inherit", fontSize:13, color:C.black,
    outline:"none", width:"100%", boxSizing:"border-box", ...style };
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      {label && <label style={{ fontSize:12, fontWeight:700, color:C.grey500, letterSpacing:"0.04em" }}>
        {label}{required && <span style={{ color:C.hotPink }}> *</span>}
      </label>}
      {as==="select" ? (
        <select value={value} onChange={e=>onChange(e.target.value)} style={{ ...base, cursor:"pointer" }}>
          {options.map(o=><option key={o} value={o}>{o}</option>)}
        </select>
      ) : as==="textarea" ? (
        <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={3} style={{ ...base, resize:"vertical" }} />
      ) : (
        <input type={type} value={value} min={min} onChange={e=>onChange(e.target.value)} placeholder={placeholder} required={required} style={base} />
      )}
    </div>
  );
}

function Modal({ open, onClose, title, children, width=580 }) {
  useEffect(() => {
    const h = (e) => { if (e.key==="Escape") onClose(); };
    if (open) window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(28,20,16,0.55)",
      zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.white, borderRadius:22,
        width:"100%", maxWidth:width, maxHeight:"90vh", overflowY:"auto", padding:32 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
          <h2 style={{ margin:0, fontSize:19, fontWeight:800, color:C.black, fontFamily:"'Playfair Display','Georgia',serif" }}>{title}</h2>
          <button onClick={onClose} style={{ background:C.grey100, border:"none", borderRadius:8, width:32, height:32, cursor:"pointer", fontSize:16, color:C.grey500 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ConfirmModal({ open, onClose, onConfirm, message }) {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title="Confirm" width={400}>
      <p style={{ color:C.grey600, marginBottom:24, fontSize:14 }}>{message}</p>
      <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
        <Btn onClick={onClose} variant="ghost">Cancel</Btn>
        <Btn onClick={() => { onConfirm(); onClose(); }} variant="danger">Delete</Btn>
      </div>
    </Modal>
  );
}

function Logo({ size=44 }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:11 }}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ flexShrink:0 }}>
        <circle cx="50" cy="50" r="49" fill="#EC4899" />
        <circle cx="50" cy="50" r="43" fill="#FFF5F0" />
        <circle cx="50" cy="50" r="37" fill="#F9A8D4" />
        <ellipse cx="50" cy="52" rx="14" ry="10" fill="#EC4899" />
        <rect x="38" y="44" width="24" height="16" rx="4" fill="#EC4899" />
        <ellipse cx="50" cy="43" rx="12" ry="7" fill="#EC4899" />
        <rect x="39" y="38" width="22" height="8" rx="4" fill="#EC4899" />
        <ellipse cx="50" cy="63" rx="16" ry="8" fill="#C0C0C0" stroke="#A0A0A0" strokeWidth="1" />
        <path d="M34 60 Q34 72 50 72 Q66 72 66 60" fill="#D8D8D8" />
        <rect x="26" y="62" width="10" height="8" rx="2" fill="#F9A8D4" />
        <rect x="26" y="58" width="10" height="5" rx="1" fill="#fff" />
        <circle cx="29" cy="57" r="2" fill="#EC4899" />
        <circle cx="68" cy="66" r="5" fill="#D4A55A" />
        <circle cx="74" cy="64" r="5" fill="#C8963E" />
        <circle cx="69" cy="60" r="4" fill="#D4A55A" />
        <ellipse cx="44" cy="70" rx="4" ry="3" fill="#F5E6C8" />
        <ellipse cx="52" cy="71" rx="4" ry="3" fill="#EDD9AA" />
        <ellipse cx="48" cy="68" rx="3" ry="2.5" fill="#F5E6C8" />
        <path id="topArc" d="M 18,50 A 32,32 0 0,1 82,50" fill="none" />
        <text style={{ fontSize:"9px", fontWeight:"bold", fill:"#BE185D", fontFamily:"Georgia,serif" }}>
          <textPath href="#topArc" startOffset="10%">SWEET BAKES</textPath>
        </text>
        <path id="botArc" d="M 22,58 A 30,30 0 0,0 78,58" fill="none" />
        <text style={{ fontSize:"8px", fontWeight:"bold", fill:"#BE185D", fontFamily:"Georgia,serif" }}>
          <textPath href="#botArc" startOffset="12%">• BY MEEMEE •</textPath>
        </text>
      </svg>
      <div>
        <div style={{ fontFamily:"'Playfair Display','Georgia',serif", fontSize:size*0.36, fontWeight:800, color:C.black, lineHeight:1.1 }}>Sweet Bakes</div>
        <div style={{ fontSize:size*0.22, color:C.hotPink, letterSpacing:"0.14em", textTransform:"uppercase", fontWeight:700 }}>by MeeMee</div>
      </div>
    </div>
  );
}

const TABS = [
  { id:"menu",      label:"Menu",         icon:"🍰" },
  { id:"orders",    label:"Orders",       icon:"📋" },
  { id:"tracker",   label:"Bake Tracker", icon:"👩‍🍳" },
  { id:"inventory", label:"Inventory",    icon:"📦" },
];

function Nav({ active, setActive, newOrderCount }) {
  return (
    <nav style={{ background:C.white, borderBottom:`1px solid ${C.grey100}`, position:"sticky", top:0, zIndex:100, boxShadow:"0 1px 8px rgba(0,0,0,0.06)" }}>
      <div style={{ maxWidth:1160, margin:"0 auto", padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between", height:68 }}>
        <Logo size={44} />
        <div style={{ display:"flex", gap:2 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActive(t.id)} style={{
              background:active===t.id?C.pinkLight:"transparent", border:"none", borderRadius:10, padding:"8px 16px", cursor:"pointer",
              fontSize:13, fontWeight:active===t.id?800:500, color:active===t.id?C.rose:C.grey600,
              fontFamily:"inherit", display:"flex", alignItems:"center", gap:6, transition:"all 0.15s", position:"relative" }}>
              <span>{t.icon}</span>{t.label}
              {t.id==="orders" && newOrderCount>0 && (
                <span style={{ background:C.hotPink, color:"#fff", borderRadius:999, fontSize:10, fontWeight:800, padding:"1px 6px", position:"absolute", top:3, right:3 }}>
                  {newOrderCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

function MenuTab({ onStartOrder }) {
  const [cat, setCat] = useState(Object.keys(MENU_DATA)[0]);
  const [flash, setFlash] = useState(null);
  const [selected, setSelected] = useState(null);
  const [qty, setQty] = useState(1);
  const [form, setForm] = useState({ name:"", contact:"", pickup:"", notes:"", payment:"Unpaid" });
  const [errors, setErrors] = useState({});

  const openOrder = (item) => { setSelected(item); setQty(1); setForm({ name:"", contact:"", pickup:"", notes:"", payment:"Unpaid" }); setErrors({}); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.contact.trim()) e.contact = "Contact is required";
    if (!form.pickup) e.pickup = "Pickup date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submitOrder = () => {
    if (!validate()) return;
    const order = {
      id:uid(), item:selected.name, emoji:selected.emoji, category:cat, qty,
      price:selected.price?selected.price*qty:null, unitPrice:selected.price,
      name:form.name.trim(), contact:form.contact.trim(), pickup:form.pickup,
      notes:form.notes.trim(), payment:form.payment, status:"New", createdAt:new Date().toISOString(),
    };
    onStartOrder(order);
    setFlash(selected.id);
    setTimeout(() => setFlash(null), 1800);
    setSelected(null);
  };

  return (
    <div>
      <div style={{ background:`linear-gradient(135deg,${C.pinkPale} 0%,${C.pinkLight} 100%)`, borderRadius:22, padding:"40px 48px", marginBottom:32, display:"flex", alignItems:"center", justifyContent:"space-between", border:`1px solid ${C.grey100}` }}>
        <div>
          <div style={{ fontSize:11, letterSpacing:"0.18em", textTransform:"uppercase", color:C.hotPink, fontWeight:800, marginBottom:10 }}>✨ Handcrafted · Made to Order · Atlanta, GA</div>
          <h1 style={{ margin:"0 0 12px", fontSize:34, fontWeight:800, fontFamily:"'Playfair Display','Georgia',serif", color:C.black, lineHeight:1.15 }}>Our Signature<br />Baked Goods</h1>
          <p style={{ margin:0, color:C.grey600, fontSize:14, lineHeight:1.7, maxWidth:380 }}>Every item is handcrafted fresh with premium ingredients.<br />Pre-order for pickup at your preferred date and time.</p>
        </div>
        <div style={{ fontSize:96, filter:"drop-shadow(0 6px 16px rgba(236,72,153,0.25))", userSelect:"none" }}>🎂</div>
      </div>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:28 }}>
        {Object.keys(MENU_DATA).map(c => (
          <button key={c} onClick={() => setCat(c)} style={{ padding:"7px 18px", borderRadius:999, border:`1.5px solid ${cat===c?C.hotPink:C.grey200}`, background:cat===c?C.hotPink:C.white, color:cat===c?"#fff":C.grey600, fontFamily:"inherit", fontSize:12, fontWeight:700, cursor:"pointer", transition:"all 0.15s" }}>{c}</button>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 }}>
        {MENU_DATA[cat].map(item => (
          <Card key={item.id} style={{ display:"flex", flexDirection:"column", gap:14, border:flash===item.id?`2px solid ${C.hotPink}`:`1px solid ${C.grey100}`, transition:"all 0.2s" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <span style={{ fontSize:40 }}>{item.emoji}</span>
              <span style={{ fontSize:19, fontWeight:800, color:C.hotPink, fontFamily:"'Playfair Display','Georgia',serif" }}>{item.price?`$${item.price}`:"Get Quote"}</span>
            </div>
            <div>
              <div style={{ fontSize:15, fontWeight:800, color:C.black, marginBottom:5 }}>{item.name}</div>
              <div style={{ fontSize:12, color:C.grey400, lineHeight:1.6 }}>{item.desc}</div>
            </div>
            <Btn onClick={() => openOrder(item)} variant={flash===item.id?"subtle":"outline"} size="sm" style={{ alignSelf:"flex-start" }}>
              {flash===item.id?"✓ Order Placed!":"Pre-Order →"}
            </Btn>
          </Card>
        ))}
      </div>
      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Pre-Order: ${selected?.name??""}`} width={600}>
        {selected && (
          <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
            <div style={{ background:C.pinkPale, borderRadius:12, padding:"14px 18px", display:"flex", alignItems:"center", gap:14 }}>
              <span style={{ fontSize:36 }}>{selected.emoji}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:800, fontSize:14, color:C.black }}>{selected.name}</div>
                <div style={{ fontSize:12, color:C.grey400, marginTop:2 }}>{selected.desc}</div>
              </div>
              <div style={{ textAlign:"right", flexShrink:0 }}>
                {selected.price ? (
                  <><div style={{ fontSize:22, fontWeight:800, color:C.hotPink, fontFamily:"'Playfair Display','Georgia',serif" }}>${selected.price*qty}</div><div style={{ fontSize:11, color:C.grey400 }}>${selected.price} each</div></>
                ) : <div style={{ fontSize:14, fontWeight:700, color:C.grey400 }}>Quote on request</div>}
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:12, fontWeight:700, color:C.grey500 }}>QUANTITY</span>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <button onClick={() => setQty(q=>Math.max(1,q-1))} style={{ width:30, height:30, borderRadius:8, border:`1px solid ${C.grey200}`, background:C.white, cursor:"pointer", fontSize:16, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", color:C.grey600 }}>−</button>
                <span style={{ fontWeight:800, fontSize:18, minWidth:28, textAlign:"center" }}>{qty}</span>
                <button onClick={() => setQty(q=>q+1)} style={{ width:30, height:30, borderRadius:8, border:`1px solid ${C.grey200}`, background:C.white, cursor:"pointer", fontSize:16, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", color:C.grey600 }}>+</button>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <div>
                <Field label="Customer Name" value={form.name} onChange={v=>{setForm(f=>({...f,name:v}));setErrors(e=>({...e,name:""}))}} required placeholder="Full name" />
                {errors.name && <div style={{ fontSize:11, color:"#B91C1C", marginTop:3 }}>{errors.name}</div>}
              </div>
              <div>
                <Field label="Phone / Email" value={form.contact} onChange={v=>{setForm(f=>({...f,contact:v}));setErrors(e=>({...e,contact:""}))}} required placeholder="Contact info" />
                {errors.contact && <div style={{ fontSize:11, color:"#B91C1C", marginTop:3 }}>{errors.contact}</div>}
              </div>
            </div>
            <div>
              <Field label="Pickup Date & Time" type="datetime-local" value={form.pickup} onChange={v=>{setForm(f=>({...f,pickup:v}));setErrors(e=>({...e,pickup:""}))}} required min={new Date().toISOString().slice(0,16)} />
              {errors.pickup && <div style={{ fontSize:11, color:"#B91C1C", marginTop:3 }}>{errors.pickup}</div>}
            </div>
            <Field label="Special Requests / Notes" as="textarea" value={form.notes} onChange={v=>setForm(f=>({...f,notes:v}))} placeholder="Allergies, flavor preferences, design notes, occasion…" />
            <Field label="Payment Status" as="select" value={form.payment} onChange={v=>setForm(f=>({...f,payment:v}))} options={["Unpaid","Deposit Paid","Paid in Full"]} />
            <div style={{ display:"flex", gap:10, justifyContent:"flex-end", paddingTop:4, borderTop:`1px solid ${C.grey100}` }}>
              <Btn onClick={() => setSelected(null)} variant="ghost">Cancel</Btn>
              <Btn onClick={submitOrder}>🎀 Confirm Pre-Order</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

const EMPTY_ORDER_FORM = { item:"", emoji:"🎂", qty:"1", price:"", name:"", contact:"", pickup:"", notes:"", payment:"Unpaid", status:"New" };

function OrdersTab({ orders, setOrders }) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [editObj, setEditObj] = useState(null);
  const [delId, setDelId] = useState(null);
  const [form, setForm] = useState(EMPTY_ORDER_FORM);
  const [editForm, setEditForm] = useState(null);
  const [errors, setErrors] = useState({});
  const statuses = ["All","New","In Progress","Ready","Completed","Cancelled"];

  const filtered = orders.filter(o=>(filter==="All"||o.status===filter)&&(!search||o.name?.toLowerCase().includes(search.toLowerCase())||o.item?.toLowerCase().includes(search.toLowerCase())||o.contact?.toLowerCase().includes(search.toLowerCase()))).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));

  const patchOrder = (id, patch) => { const u=orders.map(o=>o.id===id?{...o,...patch}:o); setOrders(u); persist("sb_orders",u); };
  const deleteOrder = (id) => { const u=orders.filter(o=>o.id!==id); setOrders(u); persist("sb_orders",u); };

  const validateForm = (f) => {
    const e={};
    if(!f.name.trim()) e.name="Required";
    if(!f.item.trim()) e.item="Required";
    if(!f.pickup) e.pickup="Required";
    setErrors(e);
    return Object.keys(e).length===0;
  };

  const saveNew = () => {
    if(!validateForm(form)) return;
    const o={...form,id:uid(),qty:Number(form.qty)||1,price:form.price?Number(form.price):null,createdAt:new Date().toISOString()};
    const u=[o,...orders]; setOrders(u); persist("sb_orders",u);
    setShowNew(false); setForm(EMPTY_ORDER_FORM); setErrors({});
  };

  const saveEdit = () => {
    if(!validateForm(editForm)) return;
    patchOrder(editObj.id,{...editForm,qty:Number(editForm.qty)||1,price:editForm.price?Number(editForm.price):null});
    setEditObj(null); setEditForm(null); setErrors({});
  };

  const openEdit = (o) => {
    setEditObj(o);
    setEditForm({item:o.item,emoji:o.emoji||"🎂",qty:String(o.qty||1),price:o.price?String(o.price):"",name:o.name,contact:o.contact||"",pickup:o.pickup||"",notes:o.notes||"",payment:o.payment,status:o.status});
    setErrors({});
  };

  const counts = Object.fromEntries(statuses.slice(1).map(s=>[s,orders.filter(o=>o.status===s).length]));
  const revenue = orders.filter(o=>o.payment==="Paid in Full"&&o.price).reduce((a,o)=>a+(o.price||0),0);

  const OrderForm = ({ f, setF, onSave, onCancel, saveLabel }) => (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <div>
          <Field label="Customer Name" value={f.name} onChange={v=>{setF(x=>({...x,name:v}));setErrors(e=>({...e,name:""}))}} required placeholder="Full name"/>
          {errors.name&&<div style={{fontSize:11,color:"#B91C1C",marginTop:3}}>{errors.name}</div>}
        </div>
        <Field label="Phone / Email" value={f.contact} onChange={v=>setF(x=>({...x,contact:v}))} placeholder="Contact info"/>
      </div>
      <div>
        <Field label="Item / Description" value={f.item} onChange={v=>{setF(x=>({...x,item:v}));setErrors(e=>({...e,item:""}))}} required placeholder="e.g. Chocolate Noir Cake"/>
        {errors.item&&<div style={{fontSize:11,color:"#B91C1C",marginTop:3}}>{errors.item}</div>}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
        <Field label="Emoji" value={f.emoji} onChange={v=>setF(x=>({...x,emoji:v}))} placeholder="🎂"/>
        <Field label="Quantity" type="number" value={f.qty} min="1" onChange={v=>setF(x=>({...x,qty:v}))} placeholder="1"/>
        <Field label="Total Price ($)" type="number" value={f.price} onChange={v=>setF(x=>({...x,price:v}))} placeholder="0"/>
      </div>
      <div>
        <Field label="Pickup Date & Time" type="datetime-local" value={f.pickup} onChange={v=>{setF(x=>({...x,pickup:v}));setErrors(e=>({...e,pickup:""}))}} required/>
        {errors.pickup&&<div style={{fontSize:11,color:"#B91C1C",marginTop:3}}>{errors.pickup}</div>}
      </div>
      <Field label="Notes / Special Requests" as="textarea" value={f.notes} onChange={v=>setF(x=>({...x,notes:v}))} placeholder="Design details, allergies, flavors…"/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <Field label="Status" as="select" value={f.status} onChange={v=>setF(x=>({...x,status:v}))} options={Object.keys(STATUS_META)}/>
        <Field label="Payment" as="select" value={f.payment} onChange={v=>setF(x=>({...x,payment:v}))} options={Object.keys(PAY_META)}/>
      </div>
      <div style={{ display:"flex", gap:10, justifyContent:"flex-end", paddingTop:12, borderTop:`1px solid ${C.grey100}` }}>
        <Btn onClick={onCancel} variant="ghost">Cancel</Btn>
        <Btn onClick={onSave}>{saveLabel}</Btn>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:28 }}>
        {[
          {label:"Total Orders",val:orders.filter(o=>o.status!=="Cancelled").length,color:C.hotPink,emoji:"📦"},
          {label:"In Progress",val:counts["In Progress"]||0,color:C.orange,emoji:"🔥"},
          {label:"Ready Pickup",val:counts["Ready"]||0,color:C.green,emoji:"✅"},
          {label:"Revenue Collected",val:`$${revenue}`,color:C.purple,emoji:"💰"},
        ].map(s=>(
          <Card key={s.label} style={{padding:20}}>
            <div style={{fontSize:26,marginBottom:6}}>{s.emoji}</div>
            <div style={{fontSize:28,fontWeight:800,color:s.color,fontFamily:"'Playfair Display','Georgia',serif"}}>{s.val}</div>
            <div style={{fontSize:11,color:C.grey400,fontWeight:600,marginTop:2}}>{s.label}</div>
          </Card>
        ))}
      </div>
      <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:20, flexWrap:"wrap" }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍  Search by name, item, or contact…" style={{ padding:"9px 14px", borderRadius:10, border:`1px solid ${C.grey200}`, fontFamily:"inherit", fontSize:13, outline:"none", flex:1, minWidth:220 }}/>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {statuses.map(s=>(
            <button key={s} onClick={()=>setFilter(s)} style={{ padding:"7px 14px", borderRadius:999, fontFamily:"inherit", fontSize:12, fontWeight:700, border:`1.5px solid ${filter===s?C.hotPink:C.grey200}`, background:filter===s?C.hotPink:C.white, color:filter===s?"#fff":C.grey600, cursor:"pointer", transition:"all 0.15s" }}>
              {s}{s!=="All"&&counts[s]?` (${counts[s]})`:""}
            </button>
          ))}
        </div>
        <Btn onClick={()=>{setShowNew(true);setForm(EMPTY_ORDER_FORM);setErrors({})}}>+ New Order</Btn>
      </div>
      {filtered.length===0 ? (
        <Card style={{textAlign:"center",padding:60,color:C.grey400}}><div style={{fontSize:48,marginBottom:12}}>🍰</div><div style={{fontSize:14}}>No orders found</div></Card>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {filtered.map(o=>(
            <Card key={o.id} style={{padding:20}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:14}}>
                <span style={{fontSize:32,flexShrink:0}}>{o.emoji||"🎂"}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:5}}>
                    <span style={{fontWeight:800,fontSize:15,color:C.black}}>{o.name}</span>
                    <StatusBadge label={o.status}/>
                    <PayBadge label={o.payment}/>
                    {o.price&&<span style={{fontWeight:800,fontSize:13,color:C.hotPink}}>${o.price}{o.qty>1?` (×${o.qty})`:""}</span>}
                  </div>
                  <div style={{fontSize:13,color:C.grey600,marginBottom:3}}><strong>{o.item}</strong>{o.contact&&<> · <span style={{color:C.grey400}}>{o.contact}</span></>}</div>
                  <div style={{fontSize:12,color:C.grey400}}>📅 Pickup: {fmtDateTime(o.pickup)} · Ordered: {fmtDateTime(o.createdAt)}</div>
                  {o.notes&&<div style={{fontSize:12,color:C.grey400,marginTop:4,fontStyle:"italic"}}>💬 {o.notes}</div>}
                </div>
                <div style={{display:"flex",gap:6,flexShrink:0,flexWrap:"wrap",justifyContent:"flex-end"}}>
                  <select value={o.status} onChange={e=>patchOrder(o.id,{status:e.target.value})} style={{padding:"5px 10px",borderRadius:8,border:`1px solid ${C.grey200}`,fontFamily:"inherit",fontSize:12,fontWeight:700,cursor:"pointer",background:C.white}}>
                    {Object.keys(STATUS_META).map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                  <select value={o.payment} onChange={e=>patchOrder(o.id,{payment:e.target.value})} style={{padding:"5px 10px",borderRadius:8,border:`1px solid ${C.grey200}`,fontFamily:"inherit",fontSize:12,fontWeight:700,cursor:"pointer",background:C.white}}>
                    {Object.keys(PAY_META).map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                  <Btn size="sm" variant="subtle" onClick={()=>openEdit(o)}>✏️</Btn>
                  <Btn size="sm" variant="danger" onClick={()=>setDelId(o.id)}>✕</Btn>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Modal open={showNew} onClose={()=>{setShowNew(false);setErrors({})}} title="New Order">
        <OrderForm f={form} setF={setForm} onSave={saveNew} onCancel={()=>{setShowNew(false);setErrors({})}} saveLabel="🎀 Save Order"/>
      </Modal>
      <Modal open={!!editObj} onClose={()=>{setEditObj(null);setErrors({})}} title="Edit Order">
        {editForm&&<OrderForm f={editForm} setF={setEditForm} onSave={saveEdit} onCancel={()=>{setEditObj(null);setErrors({})}} saveLabel="💾 Save Changes"/>}
      </Modal>
      <ConfirmModal open={!!delId} onClose={()=>setDelId(null)} onConfirm={()=>deleteOrder(delId)} message="Are you sure you want to delete this order? This cannot be undone."/>
    </div>
  );
}

function TrackerTab({ orders, setOrders }) {
  const queue = orders.filter(o=>o.status==="New"||o.status==="In Progress"||o.status==="Ready").sort((a,b)=>new Date(a.pickup||"9999")-new Date(b.pickup||"9999"));
  const completed = orders.filter(o=>o.status==="Completed").sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));

  const advance = (id) => {
    const o=orders.find(x=>x.id===id);
    const next={"New":"In Progress","In Progress":"Ready","Ready":"Completed"};
    if(!o||!next[o.status]) return;
    const u=orders.map(x=>x.id===id?{...x,status:next[o.status]}:x);
    setOrders(u); persist("sb_orders",u);
  };

  const revertStatus = (id, status) => { const u=orders.map(o=>o.id===id?{...o,status}:o); setOrders(u); persist("sb_orders",u); };
  const isUrgent = (pickup) => { if(!pickup) return false; const diff=new Date(pickup)-Date.now(); return diff>0&&diff<24*60*60*1000; };
  const nextLabel={"New":"▶ Start Baking","In Progress":"✓ Mark Ready","Ready":"🎉 Mark Complete"};
  const nextVariant={"New":"primary","In Progress":"green","Ready":"subtle"};

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:28 }}>
        {[
          {label:"In Queue",val:queue.filter(o=>o.status==="New").length,color:C.hotPink,emoji:"🆕"},
          {label:"Baking Now",val:queue.filter(o=>o.status==="In Progress").length,color:C.orange,emoji:"🔥"},
          {label:"Ready",val:queue.filter(o=>o.status==="Ready").length,color:C.green,emoji:"📦"},
          {label:"Completed",val:completed.length,color:C.purple,emoji:"✅"},
        ].map(s=>(
          <Card key={s.label} style={{padding:20}}>
            <div style={{fontSize:24,marginBottom:4}}>{s.emoji}</div>
            <div style={{fontSize:28,fontWeight:800,color:s.color,fontFamily:"'Playfair Display','Georgia',serif"}}>{s.val}</div>
            <div style={{fontSize:11,color:C.grey400,fontWeight:600}}>{s.label}</div>
          </Card>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"3fr 2fr", gap:24, alignItems:"start" }}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
            <span style={{fontSize:20}}>🔥</span>
            <h2 style={{margin:0,fontSize:17,fontWeight:800,color:C.black}}>Active Bake Queue</h2>
            <span style={{background:C.pinkLight,color:C.rose,borderRadius:999,padding:"2px 10px",fontSize:12,fontWeight:800}}>{queue.length}</span>
          </div>
          {queue.length===0 ? (
            <Card style={{textAlign:"center",padding:48,color:C.grey400}}><div style={{fontSize:40,marginBottom:8}}>☕</div><div style={{fontSize:14}}>All caught up! Nothing in queue.</div></Card>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {queue.map(o=>{
                const urgent=isUrgent(o.pickup);
                return (
                  <Card key={o.id} style={{padding:18,borderLeft:`4px solid ${o.status==="In Progress"?C.hotPink:o.status==="Ready"?"#22C55E":C.grey200}`,background:urgent?`linear-gradient(135deg,#FFF0F9,${C.white})`:C.white}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <span style={{fontSize:26}}>{o.emoji||"🎂"}</span>
                        <div>
                          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                            <span style={{fontWeight:800,fontSize:14,color:C.black}}>{o.item}</span>
                            {o.qty>1&&<span style={{fontSize:11,background:C.grey100,borderRadius:6,padding:"1px 7px",fontWeight:700,color:C.grey600}}>×{o.qty}</span>}
                          </div>
                          <div style={{fontSize:12,color:C.grey500,fontWeight:600}}>{o.name}</div>
                        </div>
                      </div>
                      <StatusBadge label={o.status}/>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                      <div style={{fontSize:12,color:urgent?C.rose:C.grey400,fontWeight:urgent?700:400}}>{urgent?"⚠️ ":"📅 "}Pickup: {fmtDateTime(o.pickup)}</div>
                      <div style={{display:"flex",gap:6}}>
                        {o.status!=="New"&&<Btn size="sm" variant="ghost" onClick={()=>revertStatus(o.id,o.status==="In Progress"?"New":"In Progress")}>← Back</Btn>}
                        {nextLabel[o.status]&&<Btn size="sm" variant={nextVariant[o.status]} onClick={()=>advance(o.id)}>{nextLabel[o.status]}</Btn>}
                      </div>
                    </div>
                    {o.notes&&<div style={{fontSize:11,color:C.grey400,marginTop:10,fontStyle:"italic",borderTop:`1px solid ${C.grey100}`,paddingTop:8}}>💬 {o.notes}</div>}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
            <span style={{fontSize:20}}>✅</span>
            <h2 style={{margin:0,fontSize:17,fontWeight:800,color:C.black}}>Completed</h2>
            <span style={{background:"#DCFCE7",color:C.green,borderRadius:999,padding:"2px 10px",fontSize:12,fontWeight:800}}>{completed.length}</span>
          </div>
          {completed.length===0 ? (
            <Card style={{textAlign:"center",padding:40,color:C.grey400}}><div style={{fontSize:36,marginBottom:8}}>📭</div><div style={{fontSize:13}}>No completed orders yet</div></Card>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:560,overflowY:"auto"}}>
              {completed.map(o=>(
                <Card key={o.id} style={{padding:14}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:22}}>{o.emoji||"🎂"}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:700,fontSize:13,color:C.black,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{o.item}</div>
                      <div style={{fontSize:11,color:C.grey400}}>{o.name} · {fmtDateTime(o.createdAt)}</div>
                    </div>
                    {o.price&&<span style={{fontWeight:800,fontSize:13,color:C.green,flexShrink:0}}>${o.price}</span>}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InventoryTab({ inventory, setInventory }) {
  const [editId, setEditId] = useState(null);
  const [editBuf, setEditBuf] = useState({});
  const [adding, setAdding] = useState(false);
  const [newForm, setNewForm] = useState({name:"",qty:"",unit:"",low:""});
  const [errors, setErrors] = useState({});
  const [delId, setDelId] = useState(null);
  const [search, setSearch] = useState("");

  const updateInventory = (next) => { setInventory(next); persist("sb_inventory",next); };
  const patchItem = (id,patch) => updateInventory(inventory.map(i=>i.id===id?{...i,...patch}:i));
  const deleteItem = (id) => updateInventory(inventory.filter(i=>i.id!==id));
  const adjustQty = (id,delta) => { const item=inventory.find(i=>i.id===id); if(!item) return; patchItem(id,{qty:Math.max(0,item.qty+delta)}); };
  const startEdit = (item) => { setEditId(item.id); setEditBuf({name:item.name,qty:String(item.qty),unit:item.unit,low:String(item.low)}); setErrors({}); };

  const saveEdit = () => {
    const e={};
    if(!editBuf.name.trim()) e.name="Required";
    if(!editBuf.unit.trim()) e.unit="Required";
    if(editBuf.qty==="") e.qty="Required";
    setErrors(e);
    if(Object.keys(e).length) return;
    patchItem(editId,{name:editBuf.name.trim(),qty:Number(editBuf.qty),unit:editBuf.unit.trim(),low:Number(editBuf.low)||0});
    setEditId(null);
  };

  const saveNew = () => {
    const e={};
    if(!newForm.name.trim()) e.name="Required";
    if(!newForm.unit.trim()) e.unit="Required";
    if(newForm.qty==="") e.qty="Required";
    setErrors(e);
    if(Object.keys(e).length) return;
    updateInventory([...inventory,{id:uid(),name:newForm.name.trim(),qty:Number(newForm.qty),unit:newForm.unit.trim(),low:Number(newForm.low)||0}]);
    setAdding(false); setNewForm({name:"",qty:"",unit:"",low:""}); setErrors({});
  };

  const visible = inventory.filter(i=>!search||i.name.toLowerCase().includes(search.toLowerCase()));
  const lowItems = inventory.filter(i=>i.qty<=i.low);

  return (
    <div>
      {lowItems.length>0&&(
        <div style={{background:"#FFF7ED",border:`1.5px solid #FED7AA`,borderRadius:14,padding:"14px 20px",marginBottom:24,display:"flex",alignItems:"flex-start",gap:12}}>
          <span style={{fontSize:22,flexShrink:0}}>⚠️</span>
          <div>
            <div style={{fontWeight:800,fontSize:14,color:"#C2410C",marginBottom:3}}>{lowItems.length} ingredient{lowItems.length>1?"s":""} running low — reorder soon</div>
            <div style={{fontSize:12,color:"#9A3412"}}>{lowItems.map(i=>`${i.name} (${i.qty} ${i.unit} remaining)`).join(" · ")}</div>
          </div>
        </div>
      )}
      <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:20,flexWrap:"wrap"}}>
        <div>
          <h2 style={{margin:"0 0 2px",fontSize:17,fontWeight:800,color:C.black}}>Ingredients & Stock</h2>
          <div style={{fontSize:12,color:C.grey400}}>{inventory.length} items · {lowItems.length} low stock</div>
        </div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search ingredients…" style={{padding:"9px 14px",borderRadius:10,border:`1px solid ${C.grey200}`,fontFamily:"inherit",fontSize:13,outline:"none",flex:1,minWidth:180}}/>
        <Btn onClick={()=>{setAdding(true);setNewForm({name:"",qty:"",unit:"",low:""});setErrors({})}}>+ Add Item</Btn>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:12}}>
        {visible.map(item=>{
          const isLow=item.qty<=item.low;
          const isWarning=!isLow&&item.low>0&&item.qty<=item.low*1.5;
          const maxBar=Math.max(item.qty,item.low*2,1);
          const pct=Math.round((item.qty/maxBar)*100);
          const barColor=isLow?"#EF4444":isWarning?"#F97316":C.hotPink;
          if(editId===item.id) {
            return (
              <Card key={item.id} style={{border:`2px solid ${C.hotPink}`,padding:18}}>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <div>
                    <Field label="Name" value={editBuf.name} onChange={v=>{setEditBuf(b=>({...b,name:v}));setErrors(e=>({...e,name:""}))}}/>
                    {errors.name&&<div style={{fontSize:11,color:"#B91C1C",marginTop:2}}>{errors.name}</div>}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                    <div>
                      <Field label="Qty" type="number" value={editBuf.qty} min="0" onChange={v=>{setEditBuf(b=>({...b,qty:v}));setErrors(e=>({...e,qty:""}))}}/>
                      {errors.qty&&<div style={{fontSize:11,color:"#B91C1C",marginTop:2}}>{errors.qty}</div>}
                    </div>
                    <div>
                      <Field label="Unit" value={editBuf.unit} onChange={v=>{setEditBuf(b=>({...b,unit:v}));setErrors(e=>({...e,unit:""}))}}/>
                      {errors.unit&&<div style={{fontSize:11,color:"#B91C1C",marginTop:2}}>{errors.unit}</div>}
                    </div>
                    <Field label="Low Alert" type="number" value={editBuf.low} min="0" onChange={v=>setEditBuf(b=>({...b,low:v}))}/>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <Btn size="sm" onClick={saveEdit}>Save</Btn>
                    <Btn size="sm" variant="ghost" onClick={()=>setEditId(null)}>Cancel</Btn>
                  </div>
                </div>
              </Card>
            );
          }
          return (
            <Card key={item.id} style={{padding:18,border:isLow?`1.5px solid #FCA5A5`:isWarning?`1.5px solid #FED7AA`:`1px solid ${C.grey100}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div style={{flex:1}}>
                  <div style={{fontWeight:800,fontSize:14,color:C.black,marginBottom:4}}>{item.name}</div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <button onClick={()=>adjustQty(item.id,-1)} style={{width:24,height:24,borderRadius:6,border:`1px solid ${C.grey200}`,background:C.white,cursor:"pointer",fontSize:14,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",color:C.grey600,flexShrink:0}}>−</button>
                    <span style={{fontSize:22,fontWeight:800,color:isLow?"#DC2626":isWarning?"#EA580C":C.black,fontFamily:"'Playfair Display','Georgia',serif",minWidth:32,textAlign:"center"}}>{item.qty}</span>
                    <button onClick={()=>adjustQty(item.id,1)} style={{width:24,height:24,borderRadius:6,border:`1px solid ${C.grey200}`,background:C.white,cursor:"pointer",fontSize:14,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",color:C.grey600,flexShrink:0}}>+</button>
                    <span style={{fontSize:13,color:C.grey400,fontWeight:600}}>{item.unit}</span>
                  </div>
                </div>
                {(isLow||isWarning)&&<span style={{fontSize:18}}>{isLow?"🔴":"🟡"}</span>}
              </div>
              <div style={{height:5,background:C.grey100,borderRadius:999,marginBottom:10}}>
                <div style={{height:"100%",borderRadius:999,background:barColor,width:`${pct}%`,transition:"width 0.35s"}}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontSize:11,color:isLow?"#DC2626":isWarning?"#EA580C":C.grey400,fontWeight:isLow||isWarning?700:400}}>
                  {isLow?"🚨 Reorder now":isWarning?"⚠️ Getting low":""}
                  {!isLow&&!isWarning&&item.low>0&&`Alert at ${item.low} ${item.unit}`}
                  {item.low===0&&"No low alert set"}
                </div>
                <div style={{display:"flex",gap:6}}>
                  <Btn size="sm" variant="subtle" onClick={()=>startEdit(item)}>Edit</Btn>
                  <Btn size="sm" variant="danger" onClick={()=>setDelId(item.id)}>✕</Btn>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      <Modal open={adding} onClose={()=>{setAdding(false);setErrors({})}} title="Add Ingredient" width={440}>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div>
            <Field label="Ingredient Name" value={newForm.name} required placeholder="e.g. Almond Flour" onChange={v=>{setNewForm(f=>({...f,name:v}));setErrors(e=>({...e,name:""}))}}/>
            {errors.name&&<div style={{fontSize:11,color:"#B91C1C",marginTop:2}}>{errors.name}</div>}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
            <div>
              <Field label="Quantity" type="number" value={newForm.qty} min="0" required placeholder="0" onChange={v=>{setNewForm(f=>({...f,qty:v}));setErrors(e=>({...e,qty:""}))}}/>
              {errors.qty&&<div style={{fontSize:11,color:"#B91C1C",marginTop:2}}>{errors.qty}</div>}
            </div>
            <div>
              <Field label="Unit" value={newForm.unit} required placeholder="lbs" onChange={v=>{setNewForm(f=>({...f,unit:v}));setErrors(e=>({...e,unit:""}))}}/>
              {errors.unit&&<div style={{fontSize:11,color:"#B91C1C",marginTop:2}}>{errors.unit}</div>}
            </div>
            <Field label="Low Alert" type="number" value={newForm.low} min="0" placeholder="0" onChange={v=>setNewForm(f=>({...f,low:v}))}/>
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end",paddingTop:12,borderTop:`1px solid ${C.grey100}`}}>
            <Btn onClick={()=>{setAdding(false);setErrors({})}} variant="ghost">Cancel</Btn>
            <Btn onClick={saveNew}>Add Ingredient</Btn>
          </div>
        </div>
      </Modal>
      <ConfirmModal open={!!delId} onClose={()=>setDelId(null)} onConfirm={()=>deleteItem(delId)} message="Remove this ingredient from inventory? This cannot be undone."/>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("menu");
  const [orders, setOrders] = useState(()=>load("sb_orders",[]));
  const [inventory, setInventory] = useState(()=>load("sb_inventory",DEFAULT_INVENTORY));

  useEffect(()=>persist("sb_orders",orders),[orders]);
  useEffect(()=>persist("sb_inventory",inventory),[inventory]);

  const newCount = orders.filter(o=>o.status==="New").length;
  const handleMenuOrder = (order) => { const u=[order,...orders]; setOrders(u); setTimeout(()=>setTab("orders"),350); };

  const PAGE_TITLES = {
    menu:      {title:"🍰 Menu",             sub:"Browse & pre-order handcrafted baked goods"},
    orders:    {title:"📋 Order Management", sub:"Track every order from placement to pickup"},
    tracker:   {title:"👩‍🍳 Bake Tracker",     sub:"Manage your bake queue and production pipeline"},
    inventory: {title:"📦 Inventory",        sub:"Monitor ingredients and low-stock alerts"},
  };

  return (
    <div style={{minHeight:"100vh",background:C.grey50,fontFamily:"'Segoe UI',system-ui,-apple-system,sans-serif",color:C.black}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box}
        input,select,textarea,button{font-family:inherit}
        ::-webkit-scrollbar{width:6px;height:6px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${C.grey200};border-radius:99px}
        button:hover:not(:disabled){opacity:0.88}
        input[type="number"]::-webkit-inner-spin-button{opacity:1}
      `}</style>
      <Nav active={tab} setActive={setTab} newOrderCount={newCount}/>
      <main style={{maxWidth:1160,margin:"0 auto",padding:"32px 24px"}}>
        <div style={{marginBottom:28}}>
          <h1 style={{margin:"0 0 4px",fontSize:22,fontWeight:800,fontFamily:"'Playfair Display','Georgia',serif",color:C.black}}>{PAGE_TITLES[tab].title}</h1>
          <div style={{fontSize:13,color:C.grey400}}>{PAGE_TITLES[tab].sub}</div>
        </div>
        {tab==="menu"      && <MenuTab      onStartOrder={handleMenuOrder}/>}
        {tab==="orders"    && <OrdersTab    orders={orders}    setOrders={setOrders}/>}
        {tab==="tracker"   && <TrackerTab   orders={orders}    setOrders={setOrders}/>}
        {tab==="inventory" && <InventoryTab inventory={inventory} setInventory={setInventory}/>}
      </main>
    </div>
  );
}