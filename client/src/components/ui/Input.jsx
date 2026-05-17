import { forwardRef } from 'react';

const Input = forwardRef(function Input({ label, className = '', ...props }, ref) {
  return (
    <label className="grid gap-2 text-sm text-slate-300">
      <span>{label}</span>
      <input
        ref={ref}
        className={`h-11 rounded-md border border-white/10 bg-white/10 px-3 text-white outline-none transition placeholder:text-slate-500 focus:border-teal-300 ${className}`}
        {...props}
      />
    </label>
  );
});

export default Input;
