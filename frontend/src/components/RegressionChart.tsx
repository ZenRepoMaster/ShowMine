import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ReferenceLine, Label,
} from 'recharts'
import regressionData from '../data/regression_results.json'

const { metrics, feature_importance, predictions } = regressionData

export default function RegressionChart() {
  return (
    <div className="flex flex-col gap-6">
      {/* Metrics row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'R² Score',    value: metrics.r2,          fmt: (v: number) => v.toFixed(4),  accent: 'text-emerald-400' },
          { label: 'RMSE',       value: metrics.rmse,         fmt: (v: number) => v.toFixed(2),  accent: 'text-gold-400'    },
          { label: 'MAE',        value: metrics.mae,          fmt: (v: number) => v.toFixed(2),  accent: 'text-blue-400'    },
          { label: 'CV R² (5-fold)', value: metrics.cv_r2_mean, fmt: (v: number) => `${v.toFixed(4)} ±${metrics.cv_r2_std.toFixed(4)}`, accent: 'text-brand-400' },
        ].map(m => (
          <div key={m.label} className="bg-surface-600/40 rounded-xl p-4 border border-surface-500/30">
            <p className="metric-label mb-2">{m.label}</p>
            <p className={`font-display text-xl font-bold ${m.accent}`}>{m.fmt(m.value)}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Importance */}
        <div className="card p-6">
          <h4 className="font-semibold text-white mb-1">Feature Importance</h4>
          <p className="text-xs text-slate-400 mb-4">Random Forest feature contribution to popularity prediction</p>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={feature_importance}
              layout="vertical"
              margin={{ top: 0, right: 16, bottom: 0, left: 140 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2d2848" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 0.32]} />
              <YAxis
                type="category" dataKey="feature"
                tick={{ fill: '#cbd5e1', fontSize: 11 }} width={136}
              />
              <Tooltip
                formatter={(v: number) => [v.toFixed(4), 'Importance']}
                contentStyle={{ background: '#1a1630', border: '1px solid #2d2848', borderRadius: 12 }}
              />
              <Bar dataKey="importance" fill="#7c3aed" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Actual vs Predicted */}
        <div className="card p-6">
          <h4 className="font-semibold text-white mb-1">Actual vs Predicted</h4>
          <p className="text-xs text-slate-400 mb-4">100 test-set samples · perfect fit = diagonal</p>
          <ResponsiveContainer width="100%" height={320}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d2848" />
              <XAxis type="number" dataKey="actual" domain={[0, 105]} tick={{ fill: '#94a3b8', fontSize: 11 }}>
                <Label value="Actual Popularity" offset={-10} position="insideBottom" fill="#64748b" fontSize={11} />
              </XAxis>
              <YAxis type="number" dataKey="predicted" domain={[0, 105]} tick={{ fill: '#94a3b8', fontSize: 11 }}>
                <Label value="Predicted" angle={-90} position="insideLeft" fill="#64748b" fontSize={11} />
              </YAxis>
              <ReferenceLine stroke="#f59e0b" strokeDasharray="6 4" segment={[{x:0,y:0},{x:105,y:105}]} />
              <Tooltip
                formatter={(v: number) => [v.toFixed(1), '']}
                contentStyle={{ background: '#1a1630', border: '1px solid #2d2848', borderRadius: 12 }}
              />
              <Scatter data={predictions} fill="#8b5cf6" opacity={0.65} r={3} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
