import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const COLORS = ['#34d399', '#fb7185', '#38bdf8', '#fbbf24', '#a78bfa', '#f472b6'];

export function CategoryPieChart({ rows = [] }) {
  const data = rows.map((row) => ({ name: row._id, value: row.total }));
  if (!data.length) return <EmptyChart label="No category data yet" />;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={96} paddingAngle={3}>
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function SpendingLineChart({ rows = [] }) {
  const data = rows.map((row) => ({ day: row._id, amount: row.total }));
  if (!data.length) return <EmptyChart label="No spending trend yet" />;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
        <XAxis dataKey="day" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip />
        <Line type="monotone" dataKey="amount" stroke="#fb7185" strokeWidth={3} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function IncomeExpenseBarChart({ rows = [] }) {
  const map = new Map();
  rows.forEach((row) => {
    const month = row._id.month;
    const current = map.get(month) || { month: `M${month}`, income: 0, expenses: 0 };
    if (row._id.type === 'income') current.income = row.total;
    else current.expenses = row.total;
    map.set(month, current);
  });
  const data = [...map.values()];
  if (!data.length) return <EmptyChart label="No income vs expense data" />;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
        <XAxis dataKey="month" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip />
        <Bar dataKey="income" fill="#34d399" radius={[6, 6, 0, 0]} />
        <Bar dataKey="expenses" fill="#fb7185" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SavingsAreaChart({ rows = [] }) {
  const map = new Map();
  rows.forEach((row) => {
    const month = row._id.month;
    const current = map.get(month) || { month: `M${month}`, net: 0 };
    current.net += row._id.type === 'income' ? row.total : -row.total;
    map.set(month, current);
  });
  let cumulative = 0;
  const data = [...map.values()]
    .sort((a, b) => Number(a.month.slice(1)) - Number(b.month.slice(1)))
    .map((item) => {
      cumulative += item.net;
      return { month: item.month, savings: cumulative };
    });
  if (!data.length) return <EmptyChart label="No savings growth yet" />;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
        <XAxis dataKey="month" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip />
        <Area type="monotone" dataKey="savings" stroke="#34d399" fill="rgba(52,211,153,0.25)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function EmptyChart({ label }) {
  return <div className="grid h-[280px] place-items-center rounded-md border border-dashed border-white/15 text-sm text-slate-400">{label}</div>;
}
