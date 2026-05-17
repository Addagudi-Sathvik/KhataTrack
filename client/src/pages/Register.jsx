import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuthError, registerUser } from '../store/slices/authSlice.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import KhataLogo from '../assets/KhataTrack.png';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const error = useSelector((state) => state.auth.error);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  async function submit(event) {
    event.preventDefault();
    dispatch(clearAuthError());
    const result = await dispatch(registerUser(form));
    if (registerUser.fulfilled.match(result)) navigate('/');
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-4 text-white">
      <form onSubmit={submit} className="glass w-full max-w-md rounded-lg p-6">
        <div className="mb-4 flex justify-center">
          <img src={KhataLogo} alt="KhataTrack" className="w-72 max-w-full sm:w-40 object-contain" style={{ boxShadow: '0 0 30px rgba(245,158,11,0.30)' }} />
        </div>
        <h1 className="mb-2 text-xl font-bold">Create KhataTrack account</h1>
        <p className="mb-6 text-sm text-slate-400">Email verification will be sent after signup.</p>
        <div className="grid gap-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          {error && <p className="rounded-md bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p>}
          <Button>Register</Button>
          <p className="text-center text-sm text-slate-400">
            Already have an account? <Link className="text-emerald-300" to="/login">Sign in</Link>
          </p>
        </div>
      </form>
    </main>
  );
}
