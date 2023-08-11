import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import clsx from 'clsx'
import rulesData from '../data/association_rules.json'

const { rules } = rulesData

type SortKey = 'confidence' | 'support' | 'lift'

function Tag({ label }: { label: string }) {
  const isGenre   = label.startsWith('genre:')
  const isNet     = label.startsWith('net:') || label.startsWith('network:')
  const isPop     = label.startsWith('pop:')

  const colors = isGenre
    ? 'bg-brand-600/20 text-brand-300 border-brand-500/30'
    : isNet
    ? 'bg-blue-600/20 text-blue-300 border-blue-500/30'
    : isPop
    ? 'bg-gold-500/20 text-gold-300 border-gold-500/30'
    : 'bg-surface-500/40 text-slate-300 border-surface-400/30'

  const display = label
    .replace('genre:', '')
    .replace('network:', '')
    .replace('net:', '')
    .replace('pop:', '')

  return (
    <span className={clsx('badge border', colors)}>{display}</span>
  )
}

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 h-1.5 bg-surface-500/40 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${(value / max) * 100}%`, background: color }}
        />
      </div>
      <span className="text-xs font-mono text-slate-300 w-10 text-right">{value.toFixed(3)}</span>
    </div>
  )
}

export default function AssociationRulesTable() {
  const [sortKey, setSortKey]   = useState<SortKey>('lift')
  const [sortAsc, setSortAsc]   = useState(false)
  const [showAll, setShowAll]   = useState(false)

  const sorted = [...rules].sort((a, b) =>
    sortAsc ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey]
  )

  const displayed = showAll ? sorted : sorted.slice(0, 10)

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(a => !a)
    else { setSortKey(key); setSortAsc(false) }
  }

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k
      ? sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
      : <ChevronDown className="w-3 h-3 opacity-30" />

  return (
    <div className="card p-6 flex flex-col gap-6">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="section-title">Association Rule Mining</h3>
          <span className="badge bg-gold-500/20 text-gold-400 border border-gold-500/30">
            Apriori · {rulesData.total_rules} rules
          </span>
        </div>
        <p className="text-sm text-slate-400">
          min_support={rulesData.min_support} · min_confidence={rulesData.min_confidence} · sorted by lift
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-surface-500/30">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-500/30 bg-surface-600/40">
              <th className="px-4 py-3 text-left text-slate-400 font-medium w-5/12">Antecedent → Consequent</th>
              {(['confidence', 'support', 'lift'] as SortKey[]).map(k => (
                <th key={k} className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort(k)}
                    className="flex items-center gap-1 text-slate-400 hover:text-white font-medium capitalize transition-colors"
                  >
                    {k} <SortIcon k={k} />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayed.map((rule, i) => (
              <tr
                key={i}
                className="border-b border-surface-500/20 hover:bg-surface-600/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {rule.antecedent.map(t => <Tag key={t} label={t} />)}
                    <span className="text-slate-500 text-xs">→</span>
                    {rule.consequent.map(t => <Tag key={t} label={t} />)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Bar value={rule.confidence} max={1} color="#7c3aed" />
                </td>
                <td className="px-4 py-3">
                  <Bar value={rule.support} max={0.15} color="#10b981" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={clsx(
                        'text-xs font-bold font-mono px-2 py-0.5 rounded-md',
                        rule.lift >= 2.2
                          ? 'bg-gold-500/20 text-gold-400'
                          : rule.lift >= 1.9
                          ? 'bg-brand-500/20 text-brand-400'
                          : 'bg-surface-500/40 text-slate-300'
                      )}
                    >
                      {rule.lift.toFixed(3)}×
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!showAll && rules.length > 10 && (
        <button
          onClick={() => setShowAll(true)}
          className="btn-ghost self-center text-brand-400 hover:text-brand-300"
        >
          Show all {rules.length} rules
        </button>
      )}
    </div>
  )
}
