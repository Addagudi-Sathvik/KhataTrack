import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import api from '../services/api.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function submit(event) {
    event.preventDefault();
    const { data } = await api.post(`/auth/reset-password/${token}`, { password });
    setMessage(data.message);
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-4 text-white">
      <form onSubmit={submit} className="glass w-full max-w-md rounded-lg p-6">
        <h1 className="mb-6 text-xl font-bold">Choose a new password</h1>
        <Input label="New password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {message && <p className="mt-4 rounded-md bg-emerald-500/10 p-3 text-sm text-emerald-200">{message}</p>}
        <Button className="mt-4 w-full">Update password</Button>
        <p className="mt-4 text-center text-sm text-slate-400">
          <Link className="text-emerald-300" to="/login">Back to login</Link>
        </p>
      </form>
    </main>
  );
}
