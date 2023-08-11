import clsx from 'clsx'

interface StatsCardProps {
  label:    string
  value:    string | number
  sub?:     string
  icon:     React.ReactNode
  accent?:  'purple' | 'gold' | 'green' | 'blue'
  trend?:   number
}

const ACCENT = {
  purple: { bg: 'bg-brand-600/15',  text: 'text-brand-400',  border: 'border-brand-500/25' },
  gold:   { bg: 'bg-gold-500/15',   text: 'text-gold-400',   border: 'border-gold-500/25'  },
  green:  { bg: 'bg-emerald-500/15',text: 'text-emerald-400',border: 'border-emerald-500/25'},
  blue:   { bg: 'bg-blue-500/15',   text: 'text-blue-400',   border: 'border-blue-500/25'  },
}

export default function StatsCard({ label, value, sub, icon, accent = 'purple', trend }: StatsCardProps) {
  const a = ACCENT[accent]
  return (
    <div className={clsx('card p-6 flex flex-col gap-4 transition-transform hover:-translate-y-0.5 duration-200', a.border)}>
      <div className="flex items-start justify-between">
        <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center', a.bg)}>
          <span className={a.text}>{icon}</span>
        </div>
        {trend !== undefined && (
          <span className={clsx(
            'badge text-xs',
            trend >= 0
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
              : 'bg-red-500/15 text-red-400 border border-red-500/25'
          )}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <p className="metric-label mb-1">{label}</p>
        <p className={clsx('font-display text-3xl font-bold', a.text)}>{value}</p>
        {sub && <p className="text-sm text-slate-500 mt-1">{sub}</p>}
      </div>
    </div>
  )
}
