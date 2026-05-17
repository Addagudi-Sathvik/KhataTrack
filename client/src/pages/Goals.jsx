import { Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../services/api.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';

const emptyGoal = { title: '', targetAmount: '', currentAmount: 0, targetDate: '', notes: '' };

export default function Goals() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyGoal);
  const [editing, setEditing] = useState(null);

  async function load() {
    const { data } = await api.get('/goals');
    setItems(data.items);
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(event) {
    event.preventDefault();
    const payload = {
      ...form,
      targetAmount: Number(form.targetAmount),
      currentAmount: Number(form.currentAmount || 0)
    };
    if (editing) {
      await api.patch(`/goals/${editing._id}`, payload);
    } else {
      await api.post('/goals', payload);
    }
    setEditing(null);
    setForm(emptyGoal);
    load();
  }

  function edit(goal) {
    setEditing(goal);
    setForm({
      title: goal.title,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      targetDate: new Date(goal.targetDate).toISOString().slice(0, 10),
      notes: goal.notes || ''
    });
  }

  async function remove(id) {
    await api.delete(`/goals/${id}`);
    load();
  }

  return (
    <section className="grid gap-6">
      <form onSubmit={submit} className="glass grid gap-4 rounded-[28px] p-5 md:grid-cols-2">
        <h2 className="font-semibold md:col-span-2">{editing ? 'Edit savings goal' : 'Create savings goal'}</h2>
        <Input label="Goal title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <Input label="Target amount" type="number" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} required />
        <Input label="Current saved" type="number" value={form.currentAmount} onChange={(e) => setForm({ ...form, currentAmount: e.target.value })} />
        <Input label="Target date" type="date" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} required />
        <Input label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <div className="flex gap-3 md:col-span-2">
          <Button>{editing ? 'Update savings goal' : 'Create savings goal'}</Button>
          {editing && <Button type="button" variant="secondary" onClick={() => { setEditing(null); setForm(emptyGoal); }}>Cancel</Button>}
        </div>
      </form>

      <section className="grid gap-4 md:grid-cols-2">
        {items.map((goal) => {
          const progress = goal.targetAmount ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
          return (
            <article key={goal._id} className="glass rounded-[28px] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{goal.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">Target date: {new Date(goal.targetDate).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="quiet" className="w-9 px-0" onClick={() => edit(goal)} title="Edit goal"><Pencil size={16} /></Button>
                  <Button variant="quiet" className="w-9 px-0" onClick={() => remove(goal._id)} title="Delete goal"><Trash2 size={16} /></Button>
                </div>
              </div>
              <p className="mt-3 text-sm">
                ₹{goal.currentAmount} / ₹{goal.targetAmount}
              </p>
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <div className="h-2 rounded-full bg-emerald-400" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-400">{progress}% complete</p>
            </article>
          );
        })}
        {!items.length && <p className="text-slate-400">No savings goals yet.</p>}
      </section>
    </section>
  );
}
