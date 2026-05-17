import { ArrowDownUp, Pencil, Trash2 } from 'lucide-react';
import Button from '../ui/Button.jsx';
import { currency, shortDate } from '../../utils/format.js';

export default function ExpenseTable({ items = [], onDelete, onEdit }) {
  return (
    <div className="glass overflow-hidden rounded-[28px]">
      <div className="flex items-center justify-between border-b border-white/10 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Ledger</p>
          <h2 className="mt-1 text-lg font-semibold text-white">Recent transactions</h2>
        </div>
        <Button variant="secondary" className="w-11 px-0" title="Sort"><ArrowDownUp size={17} /></Button>
      </div>
      <div className="scrollbar-soft overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-slate-400">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id} className="border-t border-white/10 text-slate-200 transition hover:bg-white/[0.04]">
                <td className="px-4 py-3">{shortDate(item.date)}</td>
                <td className="px-4 py-3">{item.description}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs">{item.category}</span>
                </td>
                <td className="px-4 py-3 capitalize">{item.paymentMethod}</td>
                <td className={`px-4 py-3 font-semibold ${item.type === 'income' ? 'text-emerald-300' : 'text-pink-300'}`}>
                  {item.type === 'income' ? '+' : '-'}{currency(item.amount)}
                </td>
                <td className="px-4 py-3 text-right">
                  {onEdit && (
                    <Button variant="quiet" className="w-9 px-0" onClick={() => onEdit(item)} title="Edit">
                      <Pencil size={16} />
                    </Button>
                  )}
                  <Button variant="quiet" className="w-9 px-0" onClick={() => onDelete(item._id)} title="Delete">
                    <Trash2 size={16} />
                  </Button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan="6" className="px-4 py-12 text-center text-slate-400">No transactions match this view.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
