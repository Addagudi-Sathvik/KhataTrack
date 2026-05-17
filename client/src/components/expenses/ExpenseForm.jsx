import { FileScan, Mic, Plus, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../../services/api.js';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';

const schema = z.object({
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  description: z.string().min(2, 'Description is required'),
  category: z.string().min(1),
  date: z.string().min(1),
  paymentMethod: z.enum(['cash', 'bank', 'upi', 'card', 'wallet', 'other']),
  type: z.enum(['expense', 'income']),
  tags: z.string().optional(),
  notes: z.string().optional()
});

const categories = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Education', 'Travel', 'Salary', 'Other'];

const emptyValues = {
  amount: '',
  category: 'Food',
  description: '',
  date: new Date().toISOString().slice(0, 10),
  paymentMethod: 'upi',
  type: 'expense',
  tags: '',
  notes: ''
};

export default function ExpenseForm({ initialValues, onCancel, onSubmit }) {
  const [aiText, setAiText] = useState('');
  const [status, setStatus] = useState('');
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: emptyValues
  });

  useEffect(() => {
    if (!initialValues) {
      reset(emptyValues);
      return;
    }
    reset({
      amount: initialValues.amount,
      category: initialValues.category,
      description: initialValues.description,
      date: new Date(initialValues.date).toISOString().slice(0, 10),
      paymentMethod: initialValues.paymentMethod || 'upi',
      type: initialValues.type || 'expense',
      tags: initialValues.tags?.join(', ') || '',
      notes: initialValues.notes || ''
    });
  }, [initialValues, reset]);

  const [submitting, setSubmitting] = useState(false);

  async function submit(values) {
    try {
      console.log('Button clicked');
      console.log('Form data:', values);
      setSubmitting(true);
      console.log('Invoking onSubmit with payload...');


      console.log('Raw values from react-hook-form:', values);

      const payload = {
        ...values,
        // keep backend compatible
        tags: values.tags?.split(',').map((tag) => tag.trim()).filter(Boolean) || []
      };

      // ensure the form submission always has the correct type string
      payload.type = payload.type === 'income' ? 'income' : 'expense';
      console.log('Submitting payload (after coercions):', payload);

      const result = await onSubmit(payload);

      console.log('onSubmit() resolved with:', result);


      reset(emptyValues);
      setStatus(initialValues ? 'Transaction updated' : 'Transaction added');
    } catch (err) {
      console.error('Submit failed:', err);
      setStatus('Failed to save transaction');
    } finally {
      setSubmitting(false);
    }
  }

  async function parseWithAi() {
    if (!aiText.trim()) return;
    const { data } = await api.post('/ai/parse-text', { text: aiText });
    const parsed = data.parsed;
    if (parsed.amount) setValue('amount', parsed.amount);
    if (parsed.category) setValue('category', parsed.category);
    if (parsed.merchant || parsed.description) setValue('description', parsed.merchant || parsed.description);
  }

  async function scanReceipt(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setStatus('Scanning receipt...');
    const body = new FormData();
    body.append('receipt', file);
    const { data } = await api.post('/ai/scan-receipt', body, { headers: { 'Content-Type': 'multipart/form-data' } });
    if (data.amount) setValue('amount', data.amount);
    if (data.category) setValue('category', data.category);
    if (data.merchant || data.description) setValue('description', data.merchant || data.description);
    setStatus('Receipt scanned');
  }

  function startVoice() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return;
    const recognition = new Recognition();
    recognition.lang = 'en-IN';
    recognition.onresult = (event) => setAiText(event.results?.[0]?.[0]?.transcript || '');
    recognition.start();
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="glass grid gap-4 rounded-[28px] p-5">
      <section className="grid gap-3 rounded-md border border-white/10 bg-white/5 p-3 md:grid-cols-[1fr_auto_auto]">
        <Input label="Quick AI / voice text" value={aiText} onChange={(e) => setAiText(e.target.value)} placeholder='e.g. "KFC ₹500"' />
        <Button type="button" variant="secondary" className="mt-7" onClick={startVoice}>
          <Mic size={16} /> Voice
        </Button>
        <Button type="button" className="mt-7" onClick={parseWithAi}>
          <Sparkles size={16} /> Parse
        </Button>
      </section>

      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-white/[0.04] p-4 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.08]">
        <FileScan size={17} />
        Upload and scan receipt
        <input type="file" accept="image/*" onChange={scanReceipt} className="hidden" />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Input label="Amount" type="number" {...register('amount')} required />
          {errors.amount && <p className="mt-1 text-sm text-rose-300">{errors.amount.message}</p>}
        </div>
        <div>
          <Input label="Description" {...register('description')} required />
          {errors.description && <p className="mt-1 text-sm text-rose-300">{errors.description.message}</p>}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <label className="grid gap-2 text-sm text-slate-300">
          <span>Category</span>
          <select className="h-11 rounded-md border border-white/10 bg-slate-900 px-3 text-white" {...register('category')}>
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
          {errors.category && <p className="mt-1 text-sm text-rose-300">{errors.category.message}</p>}
        </label>
        <label className="grid gap-2 text-sm text-slate-300">
          <span>Type</span>
          <select className="h-11 rounded-md border border-white/10 bg-slate-900 px-3 text-white" {...register('type')}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          {errors.type && <p className="mt-1 text-sm text-rose-300">{errors.type.message}</p>}
        </label>
        <label className="grid gap-2 text-sm text-slate-300">
          <span>Payment</span>
          <select className="h-11 rounded-md border border-white/10 bg-slate-900 px-3 text-white" {...register('paymentMethod')}>
            <option value="upi">UPI</option>
            <option value="card">Credit Card</option>
            <option value="cash">Cash</option>
            <option value="bank">Bank</option>
            <option value="wallet">Wallet</option>
          </select>
          {errors.paymentMethod && <p className="mt-1 text-sm text-rose-300">{errors.paymentMethod.message}</p>}
        </label>
        <div>
          <Input label="Date" type="date" {...register('date')} />
          {errors.date && <p className="mt-1 text-sm text-rose-300">{errors.date.message}</p>}
        </div>
      </div>
      <Input label="Tags" placeholder="rent, family" {...register('tags')} />
      <Input label="Notes" {...register('notes')} />
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" className="w-full sm:w-fit" disabled={submitting}>
          <Plus size={18} /> {submitting ? 'Saving...' : `${initialValues ? 'Update' : 'Add'} transaction (${watch('type')})`}
        </Button>
        {initialValues && <Button type="button" variant="secondary" onClick={onCancel}>Cancel edit</Button>}
        {status && <p className={`text-sm ${status.startsWith('Failed') ? 'text-rose-300' : 'text-emerald-300'}`}>{status}</p>}
      </div>
    </form>
  );
}
