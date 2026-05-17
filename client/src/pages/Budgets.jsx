import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import api from '../services/api.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';

export default function Budgets() {
  const [items, setItems] = useState([]);
  const [globalBudget, setGlobalBudget] = useState(0);
  const [form, setForm] = useState({ category: 'Food', amount: '', alertThreshold: 90 });
  const [message, setMessage] = useState('');

  async function load() {
    const { data } = await api.get('/budgets');
    setItems(data.items);
    setGlobalBudget(data.globalMonthlyBudget || 0);
  }

  useEffect(() => {
    load();
  }, []);

  async function saveCategoryBudget(event) {
    event.preventDefault();
    await api.post('/budgets', { ...form, amount: Number(form.amount), alertThreshold: Number(form.alertThreshold) });
    setForm((current) => ({ ...current, amount: '' }));
    setMessage('Category budget saved');
    load();
  }

  async function saveGlobalBudget(event) {
    event.preventDefault();
    await api.patch('/budgets/global', { amount: Number(globalBudget) });
    setMessage('Global budget saved');
    load();
  }

  async function deleteBudget(id) {
    await api.delete(`/budgets/${id}`);
    setMessage('Budget deleted');
    load();
  }

  return (
    <section className="grid gap-6">
      <form onSubmit={saveGlobalBudget} className="glass grid gap-4 rounded-[28px] p-5 md:grid-cols-[1fr_auto]">
        <Input label="Global monthly budget" type="number" value={globalBudget} onChange={(e) => setGlobalBudget(e.target.value)} />
        <Button className="mt-7">Save global budget</Button>
      </form>

      <form onSubmit={saveCategoryBudget} className="glass grid gap-4 rounded-[28px] p-5 md:grid-cols-4">
        <Input label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <Input label="Monthly limit" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
        <Input label="Alert threshold %" type="number" value={form.alertThreshold} onChange={(e) => setForm({ ...form, alertThreshold: e.target.value })} />
        <Button className="mt-7">Add / update budget</Button>
      </form>

      {message && <p className="text-sm text-emerald-300">{message}</p>}

      <section className="grid gap-3">
        {items.map((budget) => (
          <article key={budget._id} className="glass rounded-[28px] p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold">{budget.category}</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">
                  {budget.month}/{budget.year}
                </span>
                <Button variant="quiet" className="w-9 px-0" onClick={() => deleteBudget(budget._id)} title="Delete budget">
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
            <p className="text-sm text-slate-300">
              Spent: ₹{budget.spent || 0} / Limit: ₹{budget.amount}
            </p>
            <div className="mt-3 h-2 rounded-full bg-white/10">
              <div className="h-2 rounded-full bg-emerald-400" style={{ width: `${budget.progress || 0}%` }} />
            </div>
            <p className="mt-2 text-xs text-slate-400">{budget.progress || 0}% used. Alerts fire at 50%, 75%, and 100%.</p>
          </article>
        ))}
        {!items.length && <p className="text-slate-400">No category budgets yet. Create one above.</p>}
      </section>
    </section>
  );
}
