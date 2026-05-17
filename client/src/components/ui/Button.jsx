export default function Button({ className = '', variant = 'primary', ...props }) {
  const styles = {
    primary: 'bg-amber-500 text-slate-950 shadow-[0_16px_34px_rgba(245,158,11,0.22)] hover:bg-amber-400',
    secondary: 'border border-white/10 bg-white/[0.07] text-white hover:border-white/20 hover:bg-white/[0.12]',
    quiet: 'bg-transparent text-slate-300 hover:bg-white/10 hover:text-white'
  };

  return (
    <button
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    />
  );
}
