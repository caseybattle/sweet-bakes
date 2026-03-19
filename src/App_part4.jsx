// ============================================================
// Part 4 of 4 — AdminOrders, TermRow, AdminTracker,
//               AdminInventory, AdminInquiries, AdminPanel,
//               root App component, export default App
// Do NOT import or re-define anything — see Part 1.
// ============================================================

// ─── ADMIN ORDERS ──────────────────────────────────────────────────────────────

function AdminOrders({ orders, onStatusChange, onPayChange, onDelete }) {
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter || o.payment === filter);
  const totals = {
    total: orders.length,
    baking: orders.filter(o => o.status === "In Progress").length,
    ready: orders.filter(o => o.status === "Ready").length,
    revenue: orders.filter(o => o.payment === "Paid").reduce((s,o) => s + (o.totalPrice||0), 0),
  };

  const startEdit = (order) => { setEditId(order.id); setEditForm({ name:order.name, email:order.email, phone:order.phone, notes:order.notes||"" }); };
  const cancelEdit = () => { setEditId(null); setEditForm({}); };

  return (
    <div className="admin-section">
      {/* Stats */}
      <div className="admin-stats">
        {[["Total Orders", totals.total],["In Progress", totals.baking],["Ready", totals.ready],["Revenue", `$${totals.revenue}`]].map(([l,v]) => (
          <div key={l} className="admin-stat-card">
            <span className="admin-stat-val">{v}</span>
            <span className="admin-stat-label">{l}</span>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="admin-filters">
        {["all","New","In Progress","Ready","Completed","Paid","Pending"].map(f => (
          <button key={f} className={`admin-filter-btn ${filter===f?"active":""}`} onClick={()=>setFilter(f)}>
            {f === "all" ? "All" : f}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="admin-empty">No orders found. Orders placed from the menu will appear here.</div>
      )}

      {filtered.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th><th>Customer</th><th>Item</th><th>Qty</th><th>Total</th>
                <th>Pickup</th><th>Status</th><th>Payment</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <tr key={order.id} className="admin-table-row">
                  <td className="mono-sm">{order.id}</td>
                  <td>
                    {editId === order.id ? (
                      <div style={{display:"flex",flexDirection:"column",gap:4}}>
                        <input value={editForm.name||""} onChange={e=>setEditForm(p=>({...p,name:e.target.value}))}
                          style={{padding:"4px 8px",border:"1px solid var(--border)",borderRadius:4,fontSize:12,width:120}} placeholder="Name" />
                        <input value={editForm.email||""} onChange={e=>setEditForm(p=>({...p,email:e.target.value}))}
                          style={{padding:"4px 8px",border:"1px solid var(--border)",borderRadius:4,fontSize:12,width:120}} placeholder="Email" />
                        <input value={editForm.phone||""} onChange={e=>setEditForm(p=>({...p,phone:e.target.value}))}
                          style={{padding:"4px 8px",border:"1px solid var(--border)",borderRadius:4,fontSize:12,width:120}} placeholder="Phone" />
                      </div>
                    ) : (
                      <div>
                        <div style={{fontWeight:600,fontSize:13}}>{order.name}</div>
                        <div style={{fontSize:11,color:"var(--warm-gray)"}}>{order.email}</div>
                        <div style={{fontSize:11,color:"var(--warm-gray)"}}>{order.phone}</div>
                      </div>
                    )}
                  </td>
                  <td style={{fontSize:13,maxWidth:160}}><strong>{order.itemName}</strong>{order.notes && <div style={{fontSize:11,color:"var(--warm-gray)",marginTop:2}}>{order.notes}</div>}</td>
                  <td className="mono-sm">{order.qty || 1}</td>
                  <td className="mono-sm">{order.totalPrice ? `$${order.totalPrice}` : "Quote"}</td>
                  <td style={{fontSize:12}}>{order.pickupDate || "—"}</td>
                  <td>
                    <select value={order.status} onChange={e=>onStatusChange(order.id,e.target.value)}
                      style={{padding:"4px 8px",border:"1px solid var(--border)",borderRadius:20,fontSize:11,fontFamily:"var(--font-mono)",background:"var(--bg)",color:"var(--espresso)",cursor:"pointer"}}>
                      {["New","In Progress","Ready","Completed"].map(s=><option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>
                    <select value={order.payment} onChange={e=>onPayChange(order.id,e.target.value)}
                      style={{padding:"4px 8px",border:"1px solid var(--border)",borderRadius:20,fontSize:11,fontFamily:"var(--font-mono)",background:"var(--bg)",color:"var(--espresso)",cursor:"pointer"}}>
                      {["Pending","Paid","Refunded"].map(s=><option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      {editId === order.id ? (
                        <>
                          <button className="admin-action-btn save" onClick={() => { onStatusChange(order.id, order.status, editForm); cancelEdit(); }}>Save</button>
                          <button className="admin-action-btn" onClick={cancelEdit}>Cancel</button>
                        </>
                      ) : (
                        <button className="admin-action-btn" onClick={() => startEdit(order)}>Edit</button>
                      )}
                      <button className="admin-action-btn del" onClick={() => onDelete(order.id)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── TERM ROW (outside AdminTracker to prevent remount) ───────────────────────

function TermRow({ order, onAdvance, onRevert }) {
  const stages = ["New", "In Progress", "Ready", "Completed"];
  const idx = stages.indexOf(order.status);
  const isUrgent = order.pickupDate && (new Date(order.pickupDate) - new Date()) < 24 * 60 * 60 * 1000;

  return (
    <div className={`term-row ${isUrgent ? "urgent" : ""}`}>
      <div className="term-row__id" style={{fontFamily:"var(--font-mono)",fontSize:10,color:"var(--pink)",minWidth:60}}>{order.id}</div>
      <div className="term-row__item" style={{flex:1,fontSize:13}}>
        <strong>{order.itemName}</strong> × {order.qty||1}
        <span style={{marginLeft:8,fontSize:11,color:"var(--warm-gray)"}}>— {order.name}</span>
        {order.pickupDate && <span style={{marginLeft:8,fontSize:11,color:isUrgent?"var(--pink)":"var(--warm-gray)"}}>📅 {order.pickupDate}</span>}
        {isUrgent && <span style={{marginLeft:8,fontSize:10,color:"var(--pink)",fontFamily:"var(--font-mono)"}}>⚡ URGENT</span>}
      </div>
      <div className="term-row__actions" style={{display:"flex",gap:8}}>
        {idx > 0 && <button className="term-btn revert" onClick={() => onRevert(order.id)}>← Back</button>}
        {idx < stages.length - 1 && (
          <button className="term-btn advance" onClick={() => onAdvance(order.id)}>
            {idx === 0 ? "Start Baking →" : idx === 1 ? "Mark Ready →" : "Complete →"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── ADMIN TRACKER (Kanban) ─────────────────────────────────────────────────────

function AdminTracker({ orders, onAdvance, onRevert }) {
  const stages = [
    { key: "New", label: "// QUEUE", color: "var(--rose-gold)" },
    { key: "In Progress", label: "// BAKING", color: "var(--pink)" },
    { key: "Ready", label: "// READY", color: "var(--mocha)" },
  ];

  return (
    <div className="admin-section">
      <div className="tracker-grid">
        {stages.map(({ key, label, color }) => {
          const stageOrders = orders.filter(o => o.status === key);
          return (
            <div key={key} className="tracker-col">
              <div className="tracker-col__header" style={{borderBottomColor: color}}>
                <span style={{fontFamily:"var(--font-mono)",fontSize:11,color,letterSpacing:"0.12em"}}>{label}</span>
                <span className="tracker-col__count" style={{background:color}}>{stageOrders.length}</span>
              </div>
              {stageOrders.length === 0 && (
                <div className="tracker-empty">Empty — nothing here yet</div>
              )}
              {stageOrders.map(order => (
                <TermRow key={order.id} order={order} onAdvance={onAdvance} onRevert={onRevert} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── ADMIN INVENTORY ───────────────────────────────────────────────────────────

function AdminInventory({ inventory, onUpdate, onReset }) {
  const [editId, setEditId] = useState(null);
  const [editVal, setEditVal] = useState("");

  const lowItems = inventory.filter(i => i.qty <= i.min);

  return (
    <div className="admin-section">
      {lowItems.length > 0 && (
        <div className="inv-alert">
          <span className="inv-alert__icon">⚠</span>
          <span>{lowItems.length} item{lowItems.length>1?"s":""} low on stock: {lowItems.map(i=>i.name).join(", ")}</span>
        </div>
      )}

      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:16}}>
        <button className="admin-action-btn" onClick={onReset} style={{padding:"6px 16px"}}>Reset to Defaults</button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Item</th><th>Current Qty</th><th>Unit</th><th>Min Level</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map(item => {
              const pct = Math.min(100, Math.round((item.qty / (item.min * 3)) * 100));
              const isLow = item.qty <= item.min;
              return (
                <tr key={item.id} className={`admin-table-row ${isLow ? "inv-low" : ""}`}>
                  <td style={{fontWeight:600,fontSize:13}}>{item.name}</td>
                  <td>
                    {editId === item.id ? (
                      <input type="number" value={editVal} onChange={e=>setEditVal(e.target.value)}
                        style={{width:70,padding:"4px 8px",border:"1px solid var(--pink)",borderRadius:4,fontSize:13,textAlign:"center"}}
                        onKeyDown={e=>{if(e.key==="Enter"){onUpdate(item.id,{qty:Number(editVal)});setEditId(null);}if(e.key==="Escape")setEditId(null);}}
                        autoFocus
                      />
                    ) : (
                      <span style={{fontFamily:"var(--font-mono)",fontWeight:600,color:isLow?"var(--pink)":"var(--mocha)"}}>{item.qty}</span>
                    )}
                    <div style={{marginTop:4,height:3,background:"var(--bg-2)",borderRadius:2,overflow:"hidden",width:80}}>
                      <div style={{height:"100%",width:pct+"%",background:isLow?"var(--pink)":"var(--rose-gold)",transition:"width 0.4s"}} />
                    </div>
                  </td>
                  <td className="mono-sm">{item.unit}</td>
                  <td className="mono-sm">{item.min}</td>
                  <td>
                    {isLow
                      ? <span style={{color:"var(--pink)",fontFamily:"var(--font-mono)",fontSize:10,letterSpacing:"0.1em"}}>⚡ REORDER</span>
                      : <span style={{color:"var(--mocha)",fontFamily:"var(--font-mono)",fontSize:10,letterSpacing:"0.1em"}}>OK</span>
                    }
                  </td>
                  <td>
                    <div style={{display:"flex",gap:6,alignItems:"center"}}>
                      <button className="qty-btn" onClick={()=>onUpdate(item.id,{qty:Math.max(0,item.qty-1)})}>−</button>
                      <button className="qty-btn" onClick={()=>onUpdate(item.id,{qty:item.qty+1})}>+</button>
                      <button className="admin-action-btn" onClick={()=>{setEditId(item.id);setEditVal(String(item.qty));}}>Edit</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── ADMIN INQUIRIES ───────────────────────────────────────────────────────────

function AdminInquiries({ inquiries, onDelete }) {
  return (
    <div className="admin-section">
      {inquiries.length === 0 && (
        <div className="admin-empty">No inquiries yet. Messages from the contact form appear here.</div>
      )}
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        {inquiries.map(inq => (
          <div key={inq.id} className="inquiry-card">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div>
                <span style={{fontWeight:700,fontSize:15,color:"var(--mocha)"}}>{inq.name}</span>
                <span style={{marginLeft:12,fontSize:12,color:"var(--warm-gray)"}}>{inq.email}</span>
                {inq.phone && <span style={{marginLeft:12,fontSize:12,color:"var(--warm-gray)"}}>{inq.phone}</span>}
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <span style={{fontFamily:"var(--font-mono)",fontSize:10,color:"var(--warm-gray)"}}>{fmtDateTime(inq.createdAt)}</span>
                <button className="admin-action-btn del" onClick={()=>onDelete(inq.id)}>Del</button>
              </div>
            </div>
            <div style={{fontSize:11,fontFamily:"var(--font-mono)",color:"var(--rose-gold)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>{inq.eventType}</div>
            <p style={{fontSize:14,color:"var(--espresso)",lineHeight:1.6}}>{inq.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ADMIN PANEL ───────────────────────────────────────────────────────────────

function AdminPanel({ orders, inventory, inquiries, onStatusChange, onPayChange, onDeleteOrder, onAdvance, onRevert, onUpdateInventory, onResetInventory, onDeleteInquiry }) {
  const [tab, setTab] = useState("orders");
  const tabs = [
    { key:"orders",  label:"Orders",    count: orders.length },
    { key:"tracker", label:"Tracker",   count: orders.filter(o=>o.status!=="Completed").length },
    { key:"stock",   label:"Inventory", count: inventory.filter(i=>i.qty<=i.min).length },
    { key:"inquiries", label:"Inquiries", count: inquiries.length },
  ];

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Sweet Bakes</h1>
          <p className="admin-subtitle">Operations Dashboard · Atlanta, GA</p>
        </div>
        <div className="admin-header-badge">
          <span>{new Date().toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}</span>
        </div>
      </div>

      <div className="admin-tabs">
        {tabs.map(t => (
          <button key={t.key} className={`admin-tab ${tab===t.key?"active":""}`} onClick={()=>setTab(t.key)}>
            {t.label}
            {t.count > 0 && <span className="admin-tab-badge">{t.count}</span>}
          </button>
        ))}
      </div>

      <div className="admin-body">
        {tab === "orders"    && <AdminOrders orders={orders} onStatusChange={onStatusChange} onPayChange={onPayChange} onDelete={onDeleteOrder} />}
        {tab === "tracker"   && <AdminTracker orders={orders.filter(o=>o.status!=="Completed")} onAdvance={onAdvance} onRevert={onRevert} />}
        {tab === "stock"     && <AdminInventory inventory={inventory} onUpdate={onUpdateInventory} onReset={onResetInventory} />}
        {tab === "inquiries" && <AdminInquiries inquiries={inquiries} onDelete={onDeleteInquiry} />}
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

  // Persist state
  useEffect(() => { persist("sb_orders", orders); }, [orders]);
  useEffect(() => { persist("sb_inventory", inventory); }, [inventory]);
  useEffect(() => { persist("sb_inquiries", inquiries); }, [inquiries]);

  // Lenis smooth scroll setup
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.4, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);
    const onTick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Kill + refresh ScrollTrigger when view changes
  useEffect(() => {
    window.scrollTo(0, 0);
    if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate: true });
    setTimeout(() => ScrollTrigger.refresh(), 100);
  }, [view]);

  // Page wipe transition
  const switchView = useCallback((nextView) => {
    if (nextView === view) return;
    if (!wipeRef.current) { setView(nextView); return; }
    const tl = gsap.timeline();
    tl.set(wipeRef.current, { scaleX: 0, transformOrigin: "left center", display: "block" });
    tl.to(wipeRef.current, { scaleX: 1, duration: 0.45, ease: "power3.inOut" });
    tl.call(() => setView(nextView));
    tl.to(wipeRef.current, { scaleX: 0, transformOrigin: "right center", duration: 0.45, ease: "power3.inOut" });
    tl.set(wipeRef.current, { display: "none" });
  }, [view]);

  // Order CRUD
  const handleMenuOrder = useCallback((order) => {
    setOrders(prev => [order, ...prev]);
    switchView("admin");
  }, [switchView]);

  const handleStatusChange = useCallback((id, status, editData) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status, ...(editData || {}) } : o));
  }, []);

  const handlePayChange = useCallback((id, payment) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, payment } : o));
  }, []);

  const handleDeleteOrder = useCallback((id) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  }, []);

  const handleAdvance = useCallback((id) => {
    const stages = ["New", "In Progress", "Ready", "Completed"];
    setOrders(prev => prev.map(o => {
      if (o.id !== id) return o;
      const idx = stages.indexOf(o.status);
      return { ...o, status: stages[Math.min(idx + 1, stages.length - 1)] };
    }));
  }, []);

  const handleRevert = useCallback((id) => {
    const stages = ["New", "In Progress", "Ready", "Completed"];
    setOrders(prev => prev.map(o => {
      if (o.id !== id) return o;
      const idx = stages.indexOf(o.status);
      return { ...o, status: stages[Math.max(idx - 1, 0)] };
    }));
  }, []);

  // Inventory CRUD
  const handleUpdateInventory = useCallback((id, updates) => {
    setInventory(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  }, []);

  const handleResetInventory = useCallback(() => {
    setInventory(DEFAULT_INVENTORY);
  }, []);

  // Inquiry CRUD
  const handleNewInquiry = useCallback((inquiry) => {
    setInquiries(prev => [{ id: uid(), createdAt: new Date().toISOString(), ...inquiry }, ...prev]);
  }, []);

  const handleDeleteInquiry = useCallback((id) => {
    setInquiries(prev => prev.filter(i => i.id !== id));
  }, []);

  return (
    <>
      <CustomCursor />
      <PageWipe wipeRef={wipeRef} />
      <Nav view={view} onSwitch={switchView} orderCount={orders.filter(o=>o.status!=="Completed").length} />

      {view === "storefront" && (
        <Storefront
          onOrder={setModalItem}
          lenisRef={lenisRef}
          onSwitch={switchView}
          onInquiry={handleNewInquiry}
        />
      )}

      {view === "admin" && (
        <AdminPanel
          orders={orders}
          inventory={inventory}
          inquiries={inquiries}
          onStatusChange={handleStatusChange}
          onPayChange={handlePayChange}
          onDeleteOrder={handleDeleteOrder}
          onAdvance={handleAdvance}
          onRevert={handleRevert}
          onUpdateInventory={handleUpdateInventory}
          onResetInventory={handleResetInventory}
          onDeleteInquiry={handleDeleteInquiry}
        />
      )}

      {modalItem && (
        <OrderModal
          item={modalItem}
          onClose={() => setModalItem(null)}
          onSubmit={handleMenuOrder}
        />
      )}
    </>
  );
}

export default App;
