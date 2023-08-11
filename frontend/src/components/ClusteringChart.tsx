import { useState } from 'react'
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Label,
} from 'recharts'
import clsx from 'clsx'
import clusteringData from '../data/clustering_results.json'

const { clusters, scatter_data } = clusteringData

type Point = typeof scatter_data[0]

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: Point }[] }) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  const cluster = clusters.find(c => c.id === p.cluster)
  return (
    <div className="bg-surface-700 border border-surface-500/40 rounded-xl p-3 shadow-glow-sm text-sm max-w-[220px]">
      <p className="font-semibold text-white truncate">{p.name}</p>
      <p className="text-slate-400 text-xs mt-0.5">{p.genre} · {p.network} · {p.year}</p>
      <div className="mt-2 flex flex-col gap-1">
        <span className="flex justify-between"><span className="text-slate-400">IMDb</span><span className="text-white font-medium">{p.x}</span></span>
        <span className="flex justify-between"><span className="text-slate-400">Popularity</span><span className="text-white font-medium">{p.y}</span></span>
        <span className="flex justify-between items-center">
          <span className="text-slate-400">Cluster</span>
          <span className="font-medium" style={{ color: cluster?.color }}>{cluster?.name}</span>
        </span>
      </div>
    </div>
  )
}

export default function ClusteringChart() {
  const [hidden, setHidden] = useState<Set<number>>(new Set())

  const toggle = (id: number) => setHidden(h => {
    const next = new Set(h)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  return (
    <div className="card p-6 flex flex-col gap-6">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="section-title">K-Means Clustering</h3>
          <span className="badge bg-brand-600/20 text-brand-400 border border-brand-500/30">
            k={clusteringData.k} · Silhouette: {clusteringData.silhouette_score}
          </span>
        </div>
        <p className="text-sm text-slate-400">Shows grouped by rating, popularity, vote count &amp; seasons</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {clusters.map(c => (
          <button
            key={c.id}
            onClick={() => toggle(c.id)}
            className={clsx(
              'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200',
              hidden.has(c.id)
                ? 'opacity-40 bg-surface-600/30 border-surface-500/30 text-slate-400'
                : 'border-surface-500/40 text-white bg-surface-600/40'
            )}
          >
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
            {c.name}
            <span className="text-slate-500">({c.size})</span>
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={360}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d2848" />
          <XAxis
            type="number" dataKey="x" domain={[4.5, 10]}
            tick={{ fill: '#94a3b8', fontSize: 12 }} tickCount={7}
          >
            <Label value="IMDb Rating" offset={-10} position="insideBottom" fill="#64748b" fontSize={12} />
          </XAxis>
          <YAxis
            type="number" dataKey="y" domain={[0, 102]}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
          >
            <Label value="Popularity Score" angle={-90} position="insideLeft" fill="#64748b" fontSize={12} offset={10} />
          </YAxis>
          <Tooltip content={<CustomTooltip />} />
          {clusters.map(c => (
            hidden.has(c.id) ? null : (
              <Scatter
                key={c.id}
                name={c.name}
                data={scatter_data.filter(p => p.cluster === c.id)}
                fill={c.color}
                opacity={0.8}
                r={4}
              />
            )
          ))}
        </ScatterChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {clusters.map(c => (
          <div key={c.id} className="bg-surface-600/40 rounded-xl p-3 border border-surface-500/30">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
              <span className="text-sm font-semibold text-white">{c.name}</span>
              <span className="ml-auto badge bg-surface-500/40 text-slate-400 border-0">{c.size}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{c.description}</p>
            <div className="mt-2 flex gap-3 text-xs">
              <span className="text-slate-500">Avg rating: <span className="text-slate-300">{c.avg_rating}</span></span>
              <span className="text-slate-500">Popularity: <span className="text-slate-300">{c.avg_popularity}</span></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
