import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, Pencil, Check, X, ClipboardList, Search, CalendarDays } from "lucide-react";

const PRIORITIES = {
  low: { label: "ต่ำ", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", bar: "border-l-emerald-400", active: "bg-emerald-500 text-white border-emerald-500" },
  medium: { label: "ปานกลาง", badge: "bg-amber-50 text-amber-700 border-amber-200", bar: "border-l-amber-400", active: "bg-amber-500 text-white border-amber-500" },
  high: { label: "สูง", badge: "bg-red-50 text-red-700 border-red-200", bar: "border-l-red-400", active: "bg-red-500 text-white border-red-500" },
};
const ORDER = ["low", "medium", "high"];

const CATS = {
  work: { label: "งาน", badge: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  personal: { label: "ส่วนตัว", badge: "bg-purple-50 text-purple-700 border-purple-200", dot: "bg-purple-500" },
  shopping: { label: "ช้อปปิ้ง", badge: "bg-pink-50 text-pink-700 border-pink-200", dot: "bg-pink-500" },
  health: { label: "สุขภาพ", badge: "bg-teal-50 text-teal-700 border-teal-200", dot: "bg-teal-500" },
};
const CAT_ORDER = Object.keys(CATS);

const FILTERS = [
  { key: "all", label: "ทั้งหมด" },
  { key: "active", label: "ยังไม่เสร็จ" },
  { key: "completed", label: "เสร็จแล้ว" },
];

const pad = (n) => String(n).padStart(2, "0");
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const plusDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return iso(d); };
const fmt = (s) => new Date(s + "T00:00:00").toLocaleDateString("th-TH", { day: "numeric", month: "short" });

const isOverdue = (t, today) => !t.done && t.due && t.due < today;

function dueInfo(t, today) {
  if (!t.due) return { text: "กำหนดส่ง", cls: "bg-white text-slate-400 border-slate-300 border-dashed" };
  if (t.done) return { text: fmt(t.due), cls: "bg-slate-50 text-slate-500 border-slate-200" };
  if (t.due < today) return { text: `เลยกำหนด ${fmt(t.due)}`, cls: "bg-red-100 text-red-700 border-red-300" };
  if (t.due === today) return { text: "วันนี้", cls: "bg-yellow-100 text-yellow-800 border-yellow-300" };
  return { text: fmt(t.due), cls: "bg-slate-50 text-slate-600 border-slate-200" };
}

function TodoItem({ todo, today, onToggle, onDelete, onEdit, onCyclePriority, onCycleCategory, onSetDue }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.text);
  const [leaving, setLeaving] = useState(false);
  const inputRef = useRef(null);
  const p = PRIORITIES[todo.priority];
  const c = CATS[todo.category];
  const due = dueInfo(todo, today);

  useEffect(() => {
    if (editing && inputRef.current) { inputRef.current.focus(); inputRef.current.select(); }
  }, [editing]);

  const startEdit = () => { setDraft(todo.text); setEditing(true); };
  const save = () => { const t = draft.trim(); if (t && t !== todo.text) onEdit(todo.id, t); setEditing(false); };
  const cancel = () => setEditing(false);
  const remove = () => { setLeaving(true); setTimeout(() => onDelete(todo.id), 300); };

  return (
    <li
      className="transition-all duration-300 ease-in-out overflow-hidden"
      style={{ maxHeight: leaving ? 0 : 260, opacity: leaving ? 0 : 1, transform: leaving ? "translateX(32px)" : "translateX(0)", marginBottom: leaving ? 0 : 12 }}
    >
      <div className={`flex items-start gap-3 bg-white rounded-xl shadow-sm border border-slate-100 border-l-4 ${p.bar} px-3 sm:px-4 py-3`}>
        <button
          role="checkbox"
          aria-checked={todo.done}
          aria-label={todo.done ? "ทำเครื่องหมายว่ายังไม่เสร็จ" : "ทำเครื่องหมายว่าเสร็จแล้ว"}
          onClick={() => onToggle(todo.id)}
          className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 ${todo.done ? "bg-slate-800 border-slate-800" : "border-slate-300 hover:border-slate-500"}`}
        >
          {todo.done && <Check size={14} className="text-white" strokeWidth={3} />}
        </button>

        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") cancel(); }}
              onBlur={save}
              className="w-full px-2 py-1 -my-1 text-slate-800 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          ) : (
            <p onDoubleClick={startEdit} title="ดับเบิลคลิกเพื่อแก้ไข" className={`break-words cursor-text select-none transition-colors ${todo.done ? "line-through text-slate-400" : "text-slate-800"}`}>
              {todo.text}
            </p>
          )}
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <button onClick={() => onCyclePriority(todo.id)} title="คลิกเพื่อเปลี่ยนระดับความสำคัญ" className={`text-xs font-medium px-2 py-0.5 rounded-full border ${p.badge}`}>
              ความสำคัญ: {p.label}
            </button>
            <button onClick={() => onCycleCategory(todo.id)} title="คลิกเพื่อเปลี่ยนหมวดหมู่" className={`text-xs font-medium px-2 py-0.5 rounded-full border ${c.badge}`}>
              {c.label}
            </button>
            <label className={`relative inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border cursor-pointer ${due.cls}`}>
              <CalendarDays size={12} />
              {due.text}
              <input
                type="date"
                value={todo.due}
                aria-label="กำหนดส่ง"
                onChange={(e) => onSetDue(todo.id, e.target.value)}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </label>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {!editing ? (
            <button onClick={startEdit} aria-label="แก้ไข" className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"><Pencil size={16} /></button>
          ) : (
            <button onMouseDown={(e) => e.preventDefault()} onClick={cancel} aria-label="ยกเลิก" className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"><X size={16} /></button>
          )}
          <button onClick={remove} aria-label="ลบ" className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 size={16} /></button>
        </div>
      </div>
    </li>
  );
}

function Stats({ todos, today }) {
  const total = todos.length;
  const done = todos.filter((t) => t.done).length;
  const overdue = todos.filter((t) => isOverdue(t, today)).length;
  const pending = total - done - overdue;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const segs = [
    { label: "เสร็จแล้ว", v: done, ring: "stroke-emerald-500", dot: "bg-emerald-500" },
    { label: "เลยกำหนด", v: overdue, ring: "stroke-red-500", dot: "bg-red-500" },
    { label: "ค้างอยู่", v: pending, ring: "stroke-slate-300", dot: "bg-slate-300" },
  ];
  let acc = 0;
  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-4 mb-6 flex items-center gap-4 sm:gap-6">
      <div className="relative w-24 h-24 flex-shrink-0" role="img" aria-label={`เสร็จแล้ว ${pct}%`}>
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          <circle cx="18" cy="18" r="15.9155" fill="none" strokeWidth="4" className="stroke-slate-100" />
          {segs.map((s) => {
            const len = total ? (s.v / total) * 100 : 0;
            const el = len > 0 && (
              <circle key={s.label} cx="18" cy="18" r="15.9155" fill="none" strokeWidth="4" className={s.ring} strokeDasharray={`${len} ${100 - len}`} strokeDashoffset={-acc} />
            );
            acc += len;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-slate-800">{pct}%</div>
      </div>
      <div className="flex-1 min-w-0 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <div className="col-span-2 flex gap-6 mb-1">
          <div><p className="text-2xl font-bold text-slate-800 leading-tight">{total}</p><p className="text-slate-500 text-xs">งานทั้งหมด</p></div>
          <div><p className="text-2xl font-bold text-slate-800 leading-tight">{pct}%</p><p className="text-slate-500 text-xs">เสร็จสมบูรณ์</p></div>
        </div>
        {segs.map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-slate-600">
            <span className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
            {s.label} {s.v}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TodoApp() {
  const nextId = useRef(5);
  const [todos, setTodos] = useState([
    { id: 1, text: "ส่งรายงานประจำสัปดาห์", done: false, priority: "high", category: "work", due: plusDays(-1) },
    { id: 2, text: "ตอบอีเมลลูกค้า", done: false, priority: "medium", category: "work", due: plusDays(0) },
    { id: 3, text: "ซื้อของเข้าบ้าน", done: true, priority: "low", category: "shopping", due: plusDays(-2) },
    { id: 4, text: "ไปออกกำลังกาย", done: false, priority: "medium", category: "health", due: plusDays(3) },
  ]);
  const [text, setText] = useState("");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("work");
  const [due, setDue] = useState("");
  const [filter, setFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("all");
  const [query, setQuery] = useState("");
  const today = iso(new Date());

  const update = (id, patch) => setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  const add = () => {
    const t = text.trim();
    if (!t) return;
    setTodos((prev) => [{ id: nextId.current++, text: t, done: false, priority, category, due }, ...prev]);
    setText(""); setDue("");
  };
  const toggle = (id) => setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const del = (id) => setTodos((prev) => prev.filter((t) => t.id !== id));
  const cyclePriority = (id) => setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, priority: ORDER[(ORDER.indexOf(t.priority) + 1) % 3] } : t)));
  const cycleCategory = (id) => setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, category: CAT_ORDER[(CAT_ORDER.indexOf(t.category) + 1) % CAT_ORDER.length] } : t)));
  const clearDone = () => setTodos((prev) => prev.filter((t) => !t.done));

  const remaining = todos.filter((t) => !t.done).length;
  const doneCount = todos.length - remaining;
  const q = query.trim().toLowerCase();
  const visible = todos.filter(
    (t) =>
      (filter === "all" || (filter === "active" ? !t.done : t.done)) &&
      (catFilter === "all" || t.category === catFilter) &&
      (!q || t.text.toLowerCase().includes(q))
  );
  const countOf = (k) => todos.filter((t) => t.category === k).length;
  const emptyText = q ? "ไม่พบงานที่ตรงกับคำค้นหา" : filter === "completed" ? "ยังไม่มีงานที่เสร็จสมบูรณ์" : filter === "active" ? "ไม่มีงานที่ค้างอยู่ เยี่ยมมาก!" : "ยังไม่มีงาน เพิ่มงานแรกของคุณได้เลย";

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1">รายการงานของฉัน</h1>
        <p className="text-slate-500 mb-6 text-sm">จัดการงานประจำวันให้เป็นระเบียบ</p>

        <Stats todos={todos} today={today} />

        <div className="flex flex-col md:flex-row gap-6">
          <aside className="md:w-52 flex-shrink-0">
            <h2 className="hidden md:block text-sm font-medium text-slate-500 mb-2">หมวดหมู่</h2>
            <nav className="flex md:flex-col gap-2 overflow-x-auto pb-1 md:pb-0">
              {[{ key: "all", label: "ทุกหมวด", dot: "bg-slate-400", n: todos.length }, ...CAT_ORDER.map((k) => ({ key: k, label: CATS[k].label, dot: CATS[k].dot, n: countOf(k) }))].map((c) => (
                <button
                  key={c.key}
                  onClick={() => setCatFilter(c.key)}
                  aria-pressed={catFilter === c.key}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm whitespace-nowrap flex-shrink-0 transition-colors ${catFilter === c.key ? "bg-white shadow-sm border border-slate-200 font-medium text-slate-800" : "text-slate-600 hover:bg-slate-200/60 border border-transparent"}`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
                  <span className="flex-1 text-left">{c.label}</span>
                  <span className="text-xs text-slate-500 bg-slate-100 rounded-full px-2 py-0.5">{c.n}</span>
                </button>
              ))}
            </nav>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-4 mb-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && add()}
                  placeholder="เพิ่มงานใหม่..."
                  className="flex-1 min-w-0 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
                <button onClick={add} disabled={!text.trim()} className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <Plus size={18} />เพิ่ม
                </button>
              </div>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className="text-sm text-slate-500">ความสำคัญ:</span>
                {ORDER.map((k) => (
                  <button key={k} onClick={() => setPriority(k)} aria-pressed={priority === k} className={`text-sm px-3 py-1 rounded-full border transition-colors ${priority === k ? PRIORITIES[k].active : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
                    {PRIORITIES[k].label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="หมวดหมู่" className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-slate-400">
                  {CAT_ORDER.map((k) => <option key={k} value={k}>{CATS[k].label}</option>)}
                </select>
                <input type="date" value={due} onChange={(e) => setDue(e.target.value)} aria-label="กำหนดส่ง" className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400" />
              </div>
            </div>

            <div className="relative mb-4">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ค้นหางาน..."
                aria-label="ค้นหางาน"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div className="flex gap-1 p-1 bg-slate-200/60 rounded-xl mb-4" role="tablist">
              {FILTERS.map((f) => (
                <button key={f.key} role="tab" aria-selected={filter === f.key} onClick={() => setFilter(f.key)} className={`flex-1 py-2 text-sm rounded-lg font-medium transition-all ${filter === f.key ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                  {f.label}
                </button>
              ))}
            </div>

            {visible.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 py-12 px-4 text-center text-slate-400">
                <ClipboardList size={36} className="mx-auto mb-3" />
                <p>{emptyText}</p>
              </div>
            ) : (
              <ul>
                {visible.map((t) => (
                  <TodoItem key={t.id} todo={t} today={today} onToggle={toggle} onDelete={del} onEdit={(id, v) => update(id, { text: v })} onCyclePriority={cyclePriority} onCycleCategory={cycleCategory} onSetDue={(id, d) => update(id, { due: d })} />
                ))}
              </ul>
            )}

            <div className="flex items-center justify-between mt-4 text-sm text-slate-500">
              <span>เหลืออีก {remaining} งาน</span>
              <button onClick={clearDone} disabled={doneCount === 0} className="px-3 py-1.5 rounded-lg hover:bg-slate-200/60 hover:text-slate-700 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors">
                ล้างที่เสร็จแล้ว ({doneCount})
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
