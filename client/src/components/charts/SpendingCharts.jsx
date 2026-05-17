import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, BarElement, CategoryScale, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip);

const palette = ['#14b8a6', '#f472b6', '#f59e0b', '#60a5fa', '#a78bfa', '#34d399'];

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { labels: { color: '#cbd5e1' } } },
  scales: {
    x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.08)' } },
    y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.08)' } }
  }
};

export function DailySpendingChart({ rows = [] }) {
  const labels = rows.map((item) => `Day ${item._id}`);
  return (
    <div className="h-72">
      <Line
        options={options}
        data={{
          labels,
          datasets: [
            {
              label: 'Daily spending',
              data: rows.map((item) => item.total),
              borderColor: '#14b8a6',
              backgroundColor: 'rgba(20,184,166,0.16)',
              fill: true,
              tension: 0.38
            }
          ]
        }}
      />
    </div>
  );
}

export function CategoryChart({ rows = [] }) {
  return (
    <div className="h-72">
      <Doughnut
        data={{
          labels: rows.map((item) => item._id),
          datasets: [{ data: rows.map((item) => item.total), backgroundColor: palette }]
        }}
      />
    </div>
  );
}

export function YearlyChart({ rows = [] }) {
  return (
    <div className="h-72">
      <Bar
        options={options}
        data={{
          labels: rows.map((item) => `M${item._id}`),
          datasets: [{ label: 'Yearly trend', data: rows.map((item) => item.total), backgroundColor: '#f472b6' }]
        }}
      />
    </div>
  );
}
