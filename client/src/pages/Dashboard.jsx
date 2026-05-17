import {
  ArrowRight,
  Banknote,
  CircleDollarSign,
  Plus,
  PiggyBank,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet
} from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  CategoryPieChart,
  IncomeExpenseBarChart,
  SavingsAreaChart,
  SpendingLineChart
} from '../components/charts/KhataCharts.jsx';
import StatCard from '../components/dashboard/StatCard.jsx';
import ExpenseTable from '../components/expenses/ExpenseTable.jsx';
import { deleteTransaction, fetchDashboard } from '../store/slices/transactionSlice.js';
import { getSocket } from '../services/socket.js';
import { currency } from '../utils/format.js';

const Box = 'div';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 }
  }
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } }
};

export default function Dashboard() {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.transactions.dashboard);
  const error = useSelector((state) => state.transactions.error);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(fetchDashboard());
    const socket = getSocket();
    const reload = () => dispatch(fetchDashboard());
    socket?.on('expense:created', reload);
    socket?.on('expense:updated', reload);
    socket?.on('expense:deleted', reload);
    return () => {
      socket?.off('expense:created', reload);
      socket?.off('expense:updated', reload);
      socket?.off('expense:deleted', reload);
    };
  }, [dispatch]);

  if (!data && error) {
    return (
      <Box className="rounded-[28px] border border-rose-400/30 bg-rose-400/10 p-5 text-sm text-rose-100">
        Dashboard could not load. {error}
      </Box>
    );
  }

  if (!data) {
    return (
      <Box className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Box key={i} className="skeleton h-40" />
        ))}
      </Box>
    );
  }

  const budgetTotal = data.budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const budgetProgress = budgetTotal ? Math.min(100, Math.round((data.summary.expenses / budgetTotal) * 100)) : 0;
  const savingsGoal = Number(user?.savingsGoal || 0);
  const savingsProgress = savingsGoal ? Math.min(100, Math.round((data.summary.savings / savingsGoal) * 100)) : 0;
  const topBudgets = data.budgets.slice(0, 3);
  const netTone = data.summary.balance >= 0 ? 'text-emerald-300' : 'text-rose-300';

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="grid gap-6">
      <motion.section variants={item} className="glass premium-panel rounded-[30px] p-5 sm:p-6">
        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr] xl:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300">Financial command center</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-tight text-white sm:text-4xl">
              Track cashflow, budgets, and savings with one calm money cockpit.
            </h2>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/transactions"
                className="inline-flex h-12 items-center gap-2 rounded-3xl bg-amber-500 px-5 text-sm font-bold text-slate-950 shadow-[0_18px_42px_rgba(245,158,11,0.24)] transition hover:bg-amber-400"
              >
                <Plus size={18} />
                Quick add expense
              </Link>
              <Link
                to="/reports"
                className="inline-flex h-12 items-center gap-2 rounded-3xl border border-white/10 bg-white/[0.06] px-5 text-sm font-bold text-white transition hover:bg-white/[0.1]"
              >
                View analytics
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[#0B0F19]/60 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-400">Available balance</span>
              <Wallet size={20} className={netTone} />
            </div>
            <p className={`mt-4 text-4xl font-black ${netTone}`}>{currency(data.summary.balance)}</p>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-3xl bg-white/[0.06] p-4">
                <p className="text-slate-400">Income</p>
                <p className="mt-1 font-bold text-emerald-300">{currency(data.summary.income)}</p>
              </div>
              <div className="rounded-3xl bg-white/[0.06] p-4">
                <p className="text-slate-400">Expense</p>
                <p className="mt-1 font-bold text-rose-300">{currency(data.summary.expenses)}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section variants={item} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Wallet} label="Total Balance" value={currency(data.summary.balance)} accent="text-cyan-300" hint="Live account position" />
        <StatCard icon={TrendingUp} label="Income" value={currency(data.summary.income)} accent="text-emerald-300" hint="This month" />
        <StatCard icon={TrendingDown} label="Expense" value={currency(data.summary.expenses)} accent="text-rose-300" hint={`${data.summary.monthlyVariance}% variance`} />
        <StatCard icon={PiggyBank} label="Savings" value={currency(data.summary.savings)} accent="text-amber-300" hint={`${savingsProgress}% of goal`} />
      </motion.section>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.75fr]">
        <motion.div variants={item} whileHover={{ y: -3 }} className="glass premium-panel rounded-[30px] p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">YTD movement</p>
              <h2 className="mt-1 text-xl font-bold text-white">Animated expense trend</h2>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm font-bold text-amber-300">
              {currency(data.summary.expenses)}
            </div>
          </div>
          <SpendingLineChart rows={data.daily} />
        </motion.div>

        <motion.div variants={item} whileHover={{ y: -3 }} className="glass rounded-[30px] p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">Categories</p>
              <h2 className="mt-1 text-xl font-bold text-white">Spend split</h2>
            </div>
            <CircleDollarSign className="text-amber-300" size={24} />
          </div>
          <CategoryPieChart rows={data.categories} />
        </motion.div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <motion.div variants={item} className="glass rounded-[30px] p-5">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Cashflow</p>
            <h2 className="mt-1 text-xl font-bold text-white">Income vs expenses</h2>
          </div>
          <IncomeExpenseBarChart rows={data.incomeVsExpense} />
        </motion.div>

        <motion.div variants={item} className="glass rounded-[30px] p-5">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Wealth curve</p>
            <h2 className="mt-1 text-xl font-bold text-white">Savings growth</h2>
          </div>
          <SavingsAreaChart rows={data.incomeVsExpense} />
        </motion.div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <motion.div variants={item} className="glass rounded-[30px] p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Budgets</p>
              <h2 className="mt-1 text-xl font-bold text-white">Progress controls</h2>
            </div>
            <Target className="text-cyan-300" />
          </div>

          <div className="grid gap-4">
            <ProgressCard label="Monthly budget" value={budgetProgress} amount={currency(data.summary.expenses)} total={currency(budgetTotal)} tone="bg-amber-400" />
            {topBudgets.map((budget) => (
              <ProgressCard
                key={budget._id}
                label={budget.category}
                value={budget.amount ? Math.min(100, Math.round((data.summary.expenses / budget.amount) * 100)) : 0}
                amount={currency(budget.amount)}
                total={`${budget.month}/${budget.year}`}
                tone="bg-cyan-400"
              />
            ))}
            {!topBudgets.length && <p className="rounded-3xl border border-dashed border-white/12 p-5 text-sm text-slate-400">No budget cards yet.</p>}
          </div>
        </motion.div>

        <motion.div variants={item} className="grid gap-6">
          <div className="glass rounded-[30px] p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Savings goals</p>
                <h2 className="mt-1 text-xl font-bold text-white">Target runway</h2>
              </div>
              <Banknote className="text-emerald-300" />
            </div>
            <ProgressCard
              label="Primary savings goal"
              value={savingsProgress}
              amount={currency(data.summary.savings)}
              total={savingsGoal ? currency(savingsGoal) : 'Set a goal'}
              tone="bg-emerald-400"
            />
          </div>

          <div className="glass rounded-[30px] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">Smart insights</p>
            <div className="mt-4 grid gap-3">
              {data.insights.slice(0, 3).map((insight) => (
                <p key={insight} className="rounded-3xl border border-white/10 bg-white/[0.05] p-4 text-sm text-slate-200">
                  {insight}
                </p>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <motion.div variants={item}>
        <ExpenseTable
          items={data.recent}
          onDelete={async (id) => {
            await dispatch(deleteTransaction(id));
            dispatch(fetchDashboard());
          }}
        />
      </motion.div>
    </motion.div>
  );
}

function ProgressCard({ label, value, amount, total, tone }) {
  return (
    <motion.div whileHover={{ scale: 1.01 }} className="rounded-[26px] border border-white/10 bg-white/[0.05] p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-white">{label}</p>
          <p className="mt-1 text-xs text-slate-400">
            {amount} / {total}
          </p>
        </div>
        <span className="text-sm font-bold text-white">{value}%</span>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/[0.08]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${tone}`}
        />
      </div>
    </motion.div>
  );
}
