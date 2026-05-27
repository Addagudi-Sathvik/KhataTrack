import {
  Bell,
  Bot,
  ChartNoAxesCombined,
  CircleDollarSign,
  CalendarClock,
  LayoutDashboard,
  LogOut,
  Moon,
  PiggyBank,
  ReceiptText,
  Search,
  Settings,
  Sun,
  Target,
  TrendingUp,
  User,
  WalletCards
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../store/slices/authSlice.js';
import { useTheme } from '../../context/ThemeContext.jsx';
import api from '../../services/api.js';
import { getSocket } from '../../services/socket.js';
import Button from '../ui/Button.jsx';
import KhataLogo from '../../assets/KhataTrack.png';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, active: true },
  { to: '/reports', label: 'Analytics', icon: ChartNoAxesCombined },
  { to: '/transactions?tab=expense', label: 'Expenses', icon: ReceiptText, active: false },
  { to: '/transactions?tab=income', label: 'Income', icon: TrendingUp, active: false },
  { to: '/transactions?tab=all', label: 'Transactions', icon: WalletCards },
  { to: '/budgets', label: 'Budgets', icon: Target },
  { to: '/goals', label: 'Savings Goals', icon: PiggyBank },
  { to: '/recurring', label: 'Recurring', icon: CalendarClock },
  { to: '/', label: 'Notifications', icon: Bell, active: false },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/settings', label: 'Profile', icon: User, active: false },
  { to: '/ai', label: 'AI Assistant', icon: Bot }
];

const mobileNavItems = navItems.filter((item) => ['Dashboard', 'Transactions', 'Budgets', 'Savings Goals', 'Recurring', 'Settings'].includes(item.label));

export default function AppShell() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { isDark, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [search, setSearch] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/notifications').then(({ data }) => setNotifications(data.items)).catch(() => {});
    const socket = getSocket();
    socket?.on('notification:new', (item) => setNotifications((items) => [item, ...items]));
    return () => socket?.off('notification:new');
  }, []);

  const initials = user?.name?.slice(0, 1)?.toUpperCase() || 'K';

  function submitSearch(event) {
    event.preventDefault();
    const query = search.trim();
    navigate(query ? `/transactions?search=${encodeURIComponent(query)}` : '/transactions');
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#0B0F19] text-white">
      <motion.div
        className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_18%_0%,rgba(245,158,11,0.18),transparent_30%),radial-gradient(circle_at_78%_10%,rgba(99,102,241,0.18),transparent_34%),linear-gradient(135deg,#0B0F19_0%,#111827_48%,#070A12_100%)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      <motion.aside
        initial={{ x: -24, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.45 }}
        className="fixed left-0 top-0 z-30 hidden h-screen w-64 border-r border-white/10 bg-[#111827]/86 p-6 shadow-[30px_0_90px_rgba(0,0,0,0.32)] backdrop-blur-2xl lg:flex lg:flex-col"
      >
        {/* Brand / Logo Card */}
        <div className="mb-6" style={{ width: '100%' }}>
          <div className="sidebar-brand flex h-[140px] w-[207px] items-center justify-center rounded-[24px] bg-white/[0.04] border border-white/[0.08] p-0" style={{ boxShadow: '0 0 20px rgba(245,158,11,0.15)' }}>
            <img src={KhataLogo} alt="KhataTrack" style={{ width: '207px', height: '140px', objectFit: 'contain' }} />
          </div>
        </div>

        {/* Navigation (top) */}
        <nav className="flex flex-col gap-2 overflow-y-auto pr-1 scrollbar-soft">
          {navItems.map((item, index) => {
            const isActive = item.active !== false && (item.to === '/' ? location.pathname === '/' : location.pathname === item.to);

            return (
              <motion.div key={`${item.label}-${index}`} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.02 }}>
                <Link
                  to={item.to}
                  className={`group flex h-12 items-center gap-3 rounded-3xl px-4 text-sm font-semibold transition duration-200 ${
                    isActive
                      ? 'bg-white text-slate-950 shadow-[0_18px_44px_rgba(255,255,255,0.12)]'
                      : 'text-slate-300 hover:bg-white/[0.08] hover:text-white'
                  }`}
                >
                  <item.icon size={19} className="transition group-hover:scale-110" />
                  {item.label}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Spacer pushes logout to bottom */}
        <div className="mt-auto pt-4">
          <div className="w-full">
            <button
              onClick={() => dispatch(logoutUser())}
              className="flex w-full h-12 items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-slate-300 transition hover:bg-rose-500/10 hover:text-white"
            >
              <LogOut size={19} />
              Logout
            </button>
          </div>
        </div>
      </motion.aside>

      <div className="md:ml-64">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0B0F19]/82 flex items-center justify-between h-24 px-6">
          <div className="flex items-center gap-4">
            <img src={KhataLogo} alt="KhataTrack" className="h-10 w-auto object-contain" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300">KhataTrack workspace</p>
              <h1 className="mt-0 text-2xl font-extrabold tracking-tight">Welcome, {user?.name || 'Sathvik'}</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <form onSubmit={submitSearch} className="flex h-10 items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.06] px-4 text-slate-400 shadow-[0_18px_42px_rgba(0,0,0,0.16)] sm:w-80">
              <Search size={18} />
              <input
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                placeholder="Search transactions"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </form>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Button variant="secondary" className="relative w-12 px-0" title="Notifications" onClick={() => setShowNotifications((open) => !open)}>
                  <Bell size={18} />
                  {notifications.length > 0 && <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_18px_rgba(245,158,11,0.8)]" />}
                </Button>
                {showNotifications && (
                  <div className="absolute right-0 top-14 z-40 w-80 rounded-[24px] border border-white/10 bg-[#111827] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.44)]">
                    <p className="px-2 pb-2 text-sm font-bold text-white">Notifications</p>
                    <div className="grid max-h-80 gap-2 overflow-y-auto">
                      {notifications.slice(0, 8).map((notification) => (
                        <div key={notification._id} className="rounded-2xl bg-white/[0.06] p-3">
                          <p className="text-sm font-semibold text-white">{notification.title}</p>
                          <p className="mt-1 text-xs text-slate-400">{notification.message}</p>
                        </div>
                      ))}
                      {!notifications.length && <p className="rounded-2xl bg-white/[0.04] p-3 text-sm text-slate-400">No notifications yet.</p>}
                    </div>
                  </div>
                )}
              </div>
              <Button variant="secondary" className="w-12 px-0" onClick={toggleTheme} title="Theme">
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </Button>
              <div className="flex h-12 items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.06] px-2 pr-4">
                <div className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-500 text-sm font-black">
                  {initials}
                </div>
                <span className="hidden text-sm font-semibold text-slate-200 sm:inline">{user?.name || 'Profile'}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 xl:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
