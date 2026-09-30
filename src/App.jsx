import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, Pencil, Check, X, ClipboardList } from "lucide-react";

const PRIORITIES = {
  low: {
    label: "ต่ำ",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    bar: "border-l-emerald-400",
    active: "bg-emerald-500 text-white border-emerald-500",
  },
  medium: {
    label: "ปานกลาง",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    bar: "border-l-amber-400",
    active: "bg-amber-500 text-white border-amber-500",
  },
  high: {
    label: "สูง",
    badge: "bg-red-50 text-red-700 border-red-200",
    bar: "border-l-red-400",
    active: "bg-red-500 text-white border-red-500",
  },
};
const ORDER = ["low", "medium", "high"];

const FILTERS = [
  { key: "all", label: "ทั้งหมด" },
  { key: "active", label: "ยังไม่เสร็จ" },
  { key: "completed", label: "เสร็จแล้ว" },
];

const EMPTY_TEXT = {
  all: "ยังไม่มีงาน เพิ่มงานแรกของคุณได้เลย",
  active: "ไม่มีงานที่ค้างอยู่ เยี่ยมมาก!",
  completed: "ยังไม่มีงานที่เสร็จสมบูรณ์",
};

function TodoItem({ todo, onToggle, onDelete, onEdit, onCyclePriority }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.text);
  const [leaving, setLeaving] = useState(false);
  const inputRef = useRef(null);
  const p = PRIORITIES[todo.priority];

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const startEdit = () => {
    setDraft(todo.text);
    setEditing(true);
  };
  const save = () => {
    const t = draft.trim();
    if (t && t !== todo.text) onEdit(todo.id, t);
    setEditing(false);
  };
  const cancel = () => setEditing(false);

  const remove = () => {
    setLeaving(true);
    setTimeout(() => onDelete(todo.id), 300);
  };

  return (
    <li
      className="transition-all duration-300 ease-in-out overflow-hidden"
      style={{
        maxHeight: leaving ? 0 : 240,
        opacity: leaving ? 0 : 1,
        transform: leaving ? "translateX(32px)" : "translateX(0)",
        marginBottom: leaving ? 0 : 12,
      }}
    >
      <div
        className={`flex items-start gap-3 bg-white rounded-xl shadow-sm border border-slate-100 border-l-4 ${p.bar} px-3 sm:px-4 py-3`}
      >
        <button
          role="checkbox"
          aria-checked={todo.done}
          aria-label={todo.done ? "ทำเครื่องหมายว่ายังไม่เสร็จ" : "ทำเครื่องหมายว่าเสร็จแล้ว"}
          onClick={() => onToggle(todo.id)}
          className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 ${
            todo.done ? "bg-slate-800 border-slate-800" : "border-slate-300 hover:border-slate-500"
          }`}
        >
          {todo.done && <Check size={14} className="text-white" strokeWidth={3} />}
        </button>

        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") save();
                if (e.key === "Escape") cancel();
              }}
              onBlur={save}
              className="w-full px-2 py-1 -my-1 text-slate-800 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          ) : (
            <p
              onDoubleClick={startEdit}
              title="ดับเบิลคลิกเพื่อแก้ไข"
              className={`break-words cursor-text select-none transition-colors ${
                todo.done ? "line-through text-slate-400" : "text-slate-800"
              }`}
            >
              {todo.text}
            </p>
          )}
          <button
            onClick={() => onCyclePriority(todo.id)}
            title="คลิกเพื่อเปลี่ยนระดับความสำคัญ"
            className={`mt-1.5 inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${p.badge}`}
          >
            ความสำคัญ: {p.label}
          </button>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {!editing && (
            <button
              onClick={startEdit}
              aria-label="แก้ไข"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Pencil size={16} />
            </button>
          )}
          {editing && (
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={cancel}
              aria-label="ยกเลิก"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X size={16} />
            </button>
          )}
          <button
            onClick={remove}
            aria-label="ลบ"
            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </li>
  );
}

export default function TodoApp() {
  const nextId = useRef(4);
  const [todos, setTodos] = useState([
    { id: 1, text: "ส่งรายงานประจำสัปดาห์", done: false, priority: "high" },
    { id: 2, text: "ตอบอีเมลลูกค้า", done: false, priority: "medium" },
    { id: 3, text: "ซื้อของเข้าบ้าน", done: true, priority: "low" },
  ]);
  const [text, setText] = useState("");
  const [priority, setPriority] = useState("medium");
  const [filter, setFilter] = useState("all");

  const add = () => {
    const t = text.trim();
    if (!t) return;
    setTodos((prev) => [{ id: nextId.current++, text: t, done: false, priority }, ...prev]);
    setText("");
  };
  const toggle = (id) => setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const del = (id) => setTodos((prev) => prev.filter((t) => t.id !== id));
  const edit = (id, newText) => setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, text: newText } : t)));
  const cycle = (id) =>
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, priority: ORDER[(ORDER.indexOf(t.priority) + 1) % 3] } : t))
    );
  const clearDone = () => setTodos((prev) => prev.filter((t) => !t.done));

  const remaining = todos.filter((t) => !t.done).length;
  const doneCount = todos.length - remaining;
  const visible = todos.filter((t) => (filter === "all" ? true : filter === "active" ? !t.done : t.done));

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1">รายการงานของฉัน</h1>
        <p className="text-slate-500 mb-6 text-sm">จัดการงานประจำวันให้เป็นระเบียบ</p>

        <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder="เพิ่มงานใหม่..."
              className="flex-1 min-w-0 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
            <button
              onClick={add}
              disabled={!text.trim()}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={18} />
              เพิ่ม
            </button>
          </div>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-sm text-slate-500">ความสำคัญ:</span>
            {ORDER.map((k) => (
              <button
                key={k}
                onClick={() => setPriority(k)}
                aria-pressed={priority === k}
                className={`text-sm px-3 py-1 rounded-full border transition-colors ${
                  priority === k ? PRIORITIES[k].active : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {PRIORITIES[k].label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-1 p-1 bg-slate-200/60 rounded-xl mb-4" role="tablist">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              role="tab"
              aria-selected={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={`flex-1 py-2 text-sm rounded-lg font-medium transition-all ${
                filter === f.key ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 py-12 px-4 text-center text-slate-400">
            <ClipboardList size={36} className="mx-auto mb-3" />
            <p>{EMPTY_TEXT[filter]}</p>
          </div>
        ) : (
          <ul>
            {visible.map((t) => (
              <TodoItem key={t.id} todo={t} onToggle={toggle} onDelete={del} onEdit={edit} onCyclePriority={cycle} />
            ))}
          </ul>
        )}

        <div className="flex items-center justify-between mt-4 text-sm text-slate-500">
          <span>เหลืออีก {remaining} งาน</span>
          <button
            onClick={clearDone}
            disabled={doneCount === 0}
            className="px-3 py-1.5 rounded-lg hover:bg-slate-200/60 hover:text-slate-700 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
          >
            ล้างที่เสร็จแล้ว ({doneCount})
          </button>
        </div>
      </div>
    </div>
  );
}
