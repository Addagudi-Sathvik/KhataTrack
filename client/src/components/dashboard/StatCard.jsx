import { motion } from 'framer-motion';

export default function StatCard({ icon: Icon, label, value, accent = 'text-teal-300', hint }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.28 }}
      className="glass premium-panel rounded-[28px] p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-400">{label}</p>
          <p className="mt-3 text-2xl font-bold text-white">{value}</p>
          {hint && <p className="mt-3 text-xs font-medium text-slate-400">{hint}</p>}
        </div>
        <div className={`grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/10 ${accent}`}>
          <Icon size={21} />
        </div>
      </div>
    </motion.section>
  );
}
