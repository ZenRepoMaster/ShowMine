import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Label,
} from 'recharts'
import overviewData from '../data/overview_stats.json'

const COLORS = [
  '#7c3aed','#f59e0b','#10b981','#3b82f6','#ef4444',
  '#ec4899','#06b6d4','#8b5cf6','#84cc16','#f97316',
  '#a78bfa','#fbbf24','#34d399','#60a5fa','#fb7185',
  '#c084fc','#67e8f9',
]

export default function GenreChart() {
  const genreData = overviewData.genre_distribution.map((g, i) => ({
    name: g.genre, value: g.count, color: COLORS[i % COLORS.length],
  }))

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut */}
        <div className="card p-6">
          <h4 className="font-semibold text-white mb-1">Genre Distribution</h4>
          <p className="text-xs text-slate-400 mb-4">Primary genre of all {overviewData.total_shows} shows</p>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genreData}
                cx="50%" cy="50%"
                innerRadius={70} outerRadius={110}
                paddingAngle={2} dataKey="value"
              >
                {genreData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number, name: string) => [v, name]}
                contentStyle={{ background: '#1a1630', border: '1px solid #2d2848', borderRadius: 12 }}
              />
              <Legend
                iconType="circle" iconSize={8}
                formatter={(v) => <span className="text-slate-300 text-xs">{v}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Year trend area chart */}
        <div className="card p-6">
          <h4 className="font-semibold text-white mb-1">Popularity Trend by Year</h4>
          <p className="text-xs text-slate-400 mb-4">Average show popularity score 2000–2024</p>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={overviewData.year_trend}
              margin={{ top: 10, right: 20, bottom: 30, left: 10 }}
            >
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d2848" />
              <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 11 }} tickCount={7}>
                <Label value="Year" offset={-10} position="insideBottom" fill="#64748b" fontSize={11} />
              </XAxis>
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[35, 75]} />
              <Tooltip
                formatter={(v: number) => [v.toFixed(1), 'Avg Popularity']}
                contentStyle={{ background: '#1a1630', border: '1px solid #2d2848', borderRadius: 12 }}
              />
              <Area
                type="monotone" dataKey="avg_popularity"
                stroke="#7c3aed" strokeWidth={2.5}
                fill="url(#grad)"
                dot={false} activeDot={{ r: 5, fill: '#a78bfa' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Network bars */}
      <div className="card p-6">
        <h4 className="font-semibold text-white mb-4">Shows by Network (Top 15)</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {overviewData.network_distribution.map((n, i) => {
            const max = overviewData.network_distribution[0].count
            const pct = (n.count / max) * 100
            return (
              <div key={n.network} className="flex items-center gap-3">
                <span className="text-slate-400 text-xs w-24 truncate">{n.network}</span>
                <div className="flex-1 h-1.5 bg-surface-500/40 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }}
                  />
                </div>
                <span className="text-slate-300 text-xs w-8 text-right">{n.count}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
