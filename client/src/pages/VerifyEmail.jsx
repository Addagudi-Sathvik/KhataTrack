import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api.js';

export default function VerifyEmail() {
  const { token } = useParams();
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    api
      .get(`/auth/verify-email/${token}`)
      .then(({ data }) => setMessage(data.message))
      .catch((error) => setMessage(error.response?.data?.message || 'Verification failed'));
  }, [token]);

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-4 text-white">
      <section className="glass w-full max-w-md rounded-lg p-6 text-center">
        <h1 className="mb-4 text-xl font-bold">KhataTrack email verification</h1>
        <p className="text-slate-300">{message}</p>
        <Link className="mt-6 inline-block text-emerald-300" to="/login">
          Continue to login
        </Link>
      </section>
    </main>
  );
}
