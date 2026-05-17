import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { WalletCards } from 'lucide-react';
import { clearAuthError, loginUser } from '../store/slices/authSlice.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import KhataLogo from '../assets/KhataTrack.png';

const Box = 'div';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const error = useSelector((state) => state.auth.error);
  const [form, setForm] = useState({ email: '', password: '' });

  async function submit(event) {
    event.preventDefault();
    dispatch(clearAuthError());
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) navigate('/');
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-4 text-white">
      <form onSubmit={submit} className="glass w-full max-w-md rounded-lg p-6">
        <div className="mb-6 flex flex-col items-center gap-3">
          <img src={KhataLogo} alt="KhataTrack" className="mb-2 w-72 max-w-full sm:w-40 object-contain" style={{ boxShadow: '0 0 30px rgba(245,158,11,0.30)' }} />
          <div className="text-center">
            <h1 className="text-xl font-bold">KhataTrack</h1>
            <p className="text-sm text-slate-400">Sign in to your finance workspace</p>
          </div>
        </div>
        <Box className="grid gap-4">
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          {error && <p className="rounded-md bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p>}
          <Button>Login</Button>
          <p className="text-center text-sm text-slate-400">
            <Link className="text-emerald-300" to="/forgot-password">
              Forgot password?
            </Link>
          </p>
          <p className="text-center text-sm text-slate-400">
            New here? <Link className="text-emerald-300" to="/register">Create account</Link>
          </p>
        </Box>
      </form>
    </main>
  );
}
