import { Link } from 'react-router-dom';
import { useState } from 'react';
import api from '../services/api.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import KhataLogo from '../assets/KhataTrack.png';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  async function submit(event) {
    event.preventDefault();
    const { data } = await api.post('/auth/forgot-password', { email });
    setMessage(data.message);
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-4 text-white">
      <form onSubmit={submit} className="glass w-full max-w-md rounded-lg p-6">
        <div className="mb-6 flex flex-col items-center gap-3">
          <img src={KhataLogo} alt="KhataTrack" className="mb-2 w-72 max-w-full sm:w-40 object-contain" style={{ boxShadow: '0 0 30px rgba(245,158,11,0.30)' }} />
        </div>
        <h1 className="mb-6 text-xl font-bold">Reset your KhataTrack password</h1>
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        {message && <p className="mt-4 rounded-md bg-emerald-500/10 p-3 text-sm text-emerald-200">{message}</p>}
        <Button className="mt-4 w-full">Send reset link</Button>
        <p className="mt-4 text-center text-sm text-slate-400">
          <Link className="text-emerald-300" to="/login">Back to login</Link>
        </p>
      </form>
    </main>
  );
}
