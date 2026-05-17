import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import api from '../services/api.js';
import { setUser } from '../store/slices/authSlice.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';

export default function Settings() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [profile, setProfile] = useState({
    name: user?.name || '',
    currency: user?.currency || 'INR',
    savingsGoal: user?.savingsGoal || 0,
    globalMonthlyBudget: user?.globalMonthlyBudget || 0
  });
  const [passwords, setPasswords] = useState({ currentPassword: '', password: '' });
  const [message, setMessage] = useState('');

  async function saveProfile(event) {
    event.preventDefault();
    const { data } = await api.patch('/auth/profile', profile);
    dispatch(setUser(data.user));
    setMessage('Profile updated');
  }

  async function savePassword(event) {
    event.preventDefault();
    await api.patch('/auth/change-password', passwords);
    setPasswords({ currentPassword: '', password: '' });
    setMessage('Password changed');
  }

  async function uploadAvatar(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const body = new FormData();
    body.append('image', file);
    const { data } = await api.post('/upload/profile', body, { headers: { 'Content-Type': 'multipart/form-data' } });
    if (data.url) dispatch(setUser({ ...user, avatar: data.url }));
  }

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={saveProfile} className="glass grid gap-4 rounded-lg p-5">
        <h2 className="font-semibold">Profile</h2>
        {user?.avatar && <img src={user.avatar} alt="Profile" className="h-20 w-20 rounded-full object-cover" />}
        <input type="file" accept="image/*" onChange={uploadAvatar} className="text-sm text-slate-300" />
        <Input label="Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
        <Input label="Currency" value={profile.currency} onChange={(e) => setProfile({ ...profile, currency: e.target.value })} />
        <Input label="Savings goal" type="number" value={profile.savingsGoal} onChange={(e) => setProfile({ ...profile, savingsGoal: e.target.value })} />
        <Input label="Global monthly budget" type="number" value={profile.globalMonthlyBudget} onChange={(e) => setProfile({ ...profile, globalMonthlyBudget: e.target.value })} />
        <Button>Save profile</Button>
      </form>

      <form onSubmit={savePassword} className="glass grid gap-4 rounded-lg p-5">
        <h2 className="font-semibold">Change password</h2>
        <Input label="Current password" type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} />
        <Input label="New password" type="password" value={passwords.password} onChange={(e) => setPasswords({ ...passwords, password: e.target.value })} />
        <Button>Update password</Button>
      </form>

      {message && <p className="text-emerald-300">{message}</p>}
    </section>
  );
}
