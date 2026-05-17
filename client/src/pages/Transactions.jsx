import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import ExpenseForm from '../components/expenses/ExpenseForm.jsx';
import ExpenseTable from '../components/expenses/ExpenseTable.jsx';
import Input from '../components/ui/Input.jsx';
import useDebounce from '../hooks/useDebounce.js';
import { createTransaction, deleteTransaction, fetchDashboard, fetchTransactions, updateTransaction } from '../store/slices/transactionSlice.js';

export default function Transactions() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items, loading, page, pages } = useSelector((state) => state.transactions);

  const tab = searchParams.get('tab') || 'all';

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: '',
    type: tab === 'income' ? 'income' : tab === 'expense' ? 'expense' : '',
    paymentMethod: '',
    sortBy: 'date',
    order: 'desc',
    page: Number(searchParams.get('page') || 1),
    limit: 10
  });

  const debouncedSearch = useDebounce(filters.search);
  const [editing, setEditing] = useState(null);

  // Keep filters synchronized with URL params (tab/search/page)
  useEffect(() => {
    const nextTab = searchParams.get('tab') || 'all';
    const nextSearch = searchParams.get('search') || '';
    const nextPage = Number(searchParams.get('page') || 1);

    setFilters((current) => ({
      ...current,
      search: nextSearch,
      type: nextTab === 'income' ? 'income' : nextTab === 'expense' ? 'expense' : '',
      page: nextPage
    }));
  }, [searchParams]);

  useEffect(() => {
    dispatch(fetchTransactions({ ...filters, search: debouncedSearch }));
  }, [dispatch, debouncedSearch, filters.category, filters.type, filters.paymentMethod, filters.sortBy, filters.order, filters.page]);

  function setTab(nextTab) {
    const next = new URLSearchParams(searchParams);
    next.set('tab', nextTab);
    next.set('page', '1');
    setSearchParams(next);
  }

  const tabButtons = (
    <div className="flex flex-wrap gap-2 rounded-[18px] border border-white/10 bg-white/[0.04] p-2">
      <button
        type="button"
        onClick={() => setTab('income')}
        className={`rounded-[14px] px-4 py-2 text-sm font-semibold transition ${tab === 'income' ? 'bg-emerald-400/20 text-emerald-200' : 'text-slate-300 hover:bg-white/[0.06]'}`}
      >
        Income
      </button>
      <button
        type="button"
        onClick={() => setTab('expense')}
        className={`rounded-[14px] px-4 py-2 text-sm font-semibold transition ${tab === 'expense' ? 'bg-rose-400/20 text-rose-200' : 'text-slate-300 hover:bg-white/[0.06]'}`}
      >
        Expense
      </button>
      <button
        type="button"
        onClick={() => setTab('all')}
        className={`rounded-[14px] px-4 py-2 text-sm font-semibold transition ${tab === 'all' ? 'bg-cyan-400/20 text-cyan-200' : 'text-slate-300 hover:bg-white/[0.06]'}`}
      >
        Transactions
      </button>
    </div>
  );

  return (
    <section className="grid gap-6">
      {tabButtons}

      <ExpenseForm
        initialValues={editing}
        onCancel={() => setEditing(null)}
        onSubmit={async (payload) => {
          try {
            console.log('[Transactions] onSubmit called with:', payload);
            if (editing) {
              console.log('[Transactions] updating transaction id:', editing._id);
              await dispatch(updateTransaction({ id: editing._id, payload })).unwrap();
              setEditing(null);
            } else {
              console.log('[Transactions] creating transaction...');
              await dispatch(createTransaction(payload)).unwrap();
            }

            // Ensure UI + dashboard/charts refresh immediately
            console.log('[Transactions] refetching transactions...');
            const refreshed = await dispatch(fetchTransactions({ ...filters, search: debouncedSearch })).unwrap();
            console.log('[Transactions] refetched:', refreshed);
            dispatch(fetchDashboard());
            return refreshed;
          } catch (e) {
            console.error('[Transactions] transaction submit flow failed:', e);
            throw e;
          }
        }}
      />

      <section className="glass grid gap-4 rounded-lg p-5 lg:grid-cols-6">
        <Input label="Search" placeholder="Search notes, merchant" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })} />
        <Input label="Category" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })} />
        <Input label="Type" placeholder="expense/income" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })} />
        <Input label="Payment" value={filters.paymentMethod} onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value, page: 1 })} />
        <label className="grid gap-2 text-sm text-slate-300">
          <span>Sort</span>
          <select
            className="h-11 rounded-md border border-white/10 bg-slate-900 px-3 text-white"
            value={`${filters.sortBy}:${filters.order}`}
            onChange={(e) => {
              const [sortBy, order] = e.target.value.split(':');
              setFilters({ ...filters, sortBy, order, page: 1 });
            }}
          >
            <option value="date:desc">Date (newest)</option>
            <option value="date:asc">Date (oldest)</option>
            <option value="category:asc">Category (A-Z)</option>
            <option value="amount:desc">Amount (high)</option>
            <option value="amount:asc">Amount (low)</option>
          </select>
        </label>
        <button
          type="button"
          onClick={() => dispatch(fetchTransactions({ ...filters, search: debouncedSearch }))}
          className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-white text-sm font-semibold text-slate-950"
        >
          <Search size={17} /> {loading ? 'Loading...' : 'Apply'}
        </button>
      </section>

      <ExpenseTable items={items} onEdit={setEditing} onDelete={(id) => dispatch(deleteTransaction(id))} />

      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>
          Page {page} of {pages}
        </span>
        <div className="flex gap-2">
          <button disabled={page <= 1} className="rounded-md border border-white/10 px-3 py-1 disabled:opacity-40" onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}>
            Previous
          </button>
          <button disabled={page >= pages} className="rounded-md border border-white/10 px-3 py-1 disabled:opacity-40" onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}>
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
