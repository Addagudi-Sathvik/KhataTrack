import { CalendarClock, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../services/api.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import { currency } from '../utils/format.js';

const initialForm = {
  amount: '',
  category: 'Bills',
  description: '',
  type: 'expense',
  paymentMethod: 'upi',
  dayOfMonth: 1,
  isActive: true
};

export default function Recurring() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  async function load() {
    const { data } = await api.get('/recurring');
    setItems(data.items);
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(event) {
    event.preventDefault();
    setError('');
    const payload = { ...form, amount: Number(form.amount), dayOfMonth: Number(form.dayOfMonth) };
    try {
      if (editing) {
        await api.patch(`/recurring/${editing._id}`, payload);
      } else {
        await api.post('/recurring', payload);
      }
      setEditing(null);
      setForm(initialForm);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Recurring payment could not be saved');
    }
  }

  function edit(item) {
    setEditing(item);
    setForm({
      amount: item.amount,
      category: item.category,
      description: item.description,
      type: item.type,
      paymentMethod: item.paymentMethod,
      dayOfMonth: item.dayOfMonth,
      isActive: item.isActive
    });
  }

  async function remove(id) {
    await api.delete(`/recurring/${id}`);
    load();
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <form onSubmit={submit} className="glass grid gap-4 rounded-[28px] p-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Automation</p>
          <h2 className="mt-1 text-xl font-bold text-white">{editing ? 'Edit recurring payment' : 'Create recurring payment'}</h2>
        </div>
        <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        <Input label="Amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
        <Input label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
        <div className="grid gap-4 md:grid-cols-3">
          <label className="grid gap-2 text-sm text-slate-300">
            <span>Type</span>
            <select className="h-11 rounded-2xl border border-white/10 bg-slate-900 px-3 text-white" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm text-slate-300">
            <span>Payment</span>
            <select className="h-11 rounded-2xl border border-white/10 bg-slate-900 px-3 text-white" value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
              <option value="wallet">Wallet</option>
              <option value="other">Other</option>
            </select>
          </label>
          <Input label="Day" type="number" min="1" max="28" value={form.dayOfMonth} onChange={(e) => setForm({ ...form, dayOfMonth: e.target.value })} />
        </div>
        <label className="flex items-center gap-3 text-sm text-slate-300">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
          Active
        </label>
        {error && <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-200">{error}</p>}
        <div className="flex gap-3">
          <Button><CalendarClock size={18} /> {editing ? 'Update' : 'Save'} recurring</Button>
          {editing && <Button type="button" variant="secondary" onClick={() => { setEditing(null); setForm(initialForm); }}>Cancel</Button>}
        </div>
      </form>

      <section className="grid gap-3">
        {items.map((item) => (
          <article key={item._id} className="glass flex flex-col gap-4 rounded-[28px] p-5 md:flex-row md:items-center md:justify-between">
            <button type="button" onClick={() => edit(item)} className="text-left">
              <p className="font-semibold text-white">{item.description}</p>
              <p className="mt-1 text-sm text-slate-400">
                {item.category} · day {item.dayOfMonth} · {item.paymentMethod} · {item.isActive ? 'active' : 'paused'}
              </p>
            </button>
            <div className="flex items-center gap-3">
              <span className={item.type === 'income' ? 'font-bold text-emerald-300' : 'font-bold text-rose-300'}>
                {item.type === 'income' ? '+' : '-'}{currency(item.amount)}
              </span>
              <Button variant="quiet" className="w-10 px-0" onClick={() => remove(item._id)} title="Delete recurring payment">
                <Trash2 size={17} />
              </Button>
            </div>
          </article>
        ))}
        {!items.length && <p className="rounded-[28px] border border-dashed border-white/15 p-6 text-sm text-slate-400">No recurring payments yet.</p>}
      </section>
    </section>
  );
}
