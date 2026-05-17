import { FileDown, Sheet } from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import api from '../services/api.js';

async function download(path, filename) {
  const { data } = await api.get(path, { responseType: 'blob' });
  const url = URL.createObjectURL(data);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function Reports() {
  return (
    <div className="grid gap-6">
      <section className="glass rounded-lg p-6">
        <h2 className="text-xl font-bold text-white">Reports</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Export monthly summaries for accounting, reviews, and portfolio demos. Reports use the authenticated API and include income, expenses, category data, and transaction history.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={() => download('/reports/pdf', 'expense-report.pdf')}><FileDown size={18} /> Download PDF</Button>
          <Button variant="secondary" onClick={() => download('/reports/excel', 'expense-report.xlsx')}><Sheet size={18} /> Download Excel</Button>
          <Button variant="secondary" onClick={() => download('/reports/csv', 'expense-report.csv')}><Sheet size={18} /> Download CSV</Button>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {['Budget alerts', 'Monthly comparisons', 'Savings summaries'].map((label) => (
          <div key={label} className="glass rounded-lg p-5">
            <p className="font-semibold text-white">{label}</p>
            <p className="mt-2 text-sm text-slate-400">Included in generated financial reports and dashboard insights.</p>
          </div>
        ))}
      </section>
    </div>
  );
}
