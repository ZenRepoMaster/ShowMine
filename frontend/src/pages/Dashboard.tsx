import { Tv, Star, Flame, Layers, GitBranch, TrendingUp, Database } from 'lucide-react'
import { motion } from 'framer-motion'
import StatsCard         from '../components/StatsCard'
import ClusteringChart   from '../components/ClusteringChart'
import AssociationRulesTable from '../components/AssociationRulesTable'
import RegressionChart   from '../components/RegressionChart'
import GenreChart        from '../components/GenreChart'
import ShowExplorer      from '../components/ShowExplorer'
import overviewData      from '../data/overview_stats.json'

const STAGGER = { show: { transition: { staggerChildren: 0.07 } } }
const FADE_UP = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

function SectionHeader({ icon, label, tag, tagColor = 'brand' }: {
  icon: React.ReactNode; label: string; tag?: string; tagColor?: 'brand' | 'gold' | 'green'
}) {
  const tagCls = {
    brand: 'bg-brand-600/20 text-brand-400 border-brand-500/30',
    gold:  'bg-gold-500/20  text-gold-400  border-gold-500/30',
    green: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  }[tagColor]

  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-8 h-8 rounded-lg bg-surface-600 flex items-center justify-center text-slate-400">
        {icon}
      </div>
      <h2 className="font-display text-xl font-bold text-white">{label}</h2>
      {tag && <span className={`badge border ml-auto ${tagCls}`}>{tag}</span>}
    </div>
  )
}

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col gap-12">

      {/* Page header */}
      <motion.div initial="hidden" animate="show" variants={STAGGER}>
        <motion.div variants={FADE_UP} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-bold text-white">Analytics Dashboard</h1>
            <p className="text-slate-400 mt-1">
              TV show popularity analysis · 847 shows · 2000–2024
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              ● Live Analysis
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* KPI cards */}
      <motion.section initial="hidden" animate="show" variants={STAGGER}>
        <motion.div variants={FADE_UP} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            label="Total Shows"
            value={overviewData.total_shows.toLocaleString()}
            sub={`${overviewData.year_range[0]}–${overviewData.year_range[1]}`}
            icon={<Tv className="w-5 h-5" />}
            accent="purple" trend={12}
          />
          <StatsCard
            label="Avg IMDb Rating"
            value={overviewData.avg_rating.toFixed(2)}
            sub="out of 10.0"
            icon={<Star className="w-5 h-5" />}
            accent="gold"
          />
          <StatsCard
            label="Avg Popularity Score"
            value={overviewData.avg_popularity.toFixed(1)}
            sub="out of 100"
            icon={<Flame className="w-5 h-5" />}
            accent="green" trend={8}
          />
          <StatsCard
            label="Total Episodes"
            value={(overviewData.total_episodes / 1000).toFixed(0) + 'K'}
            sub={`${overviewData.total_genres} genres · ${overviewData.total_networks} networks`}
            icon={<Database className="w-5 h-5" />}
            accent="blue"
          />
        </motion.div>
      </motion.section>

      {/* Section 1: Clustering */}
      <motion.section
        initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.4 }}
      >
        <SectionHeader icon={<Layers className="w-4 h-4" />} label="Cluster Analysis" tag="K-Means" />
        <ClusteringChart />
      </motion.section>

      {/* Section 2: Genre & Year */}
      <motion.section
        initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.4 }}
      >
        <SectionHeader icon={<TrendingUp className="w-4 h-4" />} label="Genre & Trend Overview" />
        <GenreChart />
      </motion.section>

      {/* Section 3: Association Rules */}
      <motion.section
        initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.4 }}
      >
        <SectionHeader icon={<GitBranch className="w-4 h-4" />} label="Association Rules" tag="Apriori" tagColor="gold" />
        <AssociationRulesTable />
      </motion.section>

      {/* Section 4: Regression */}
      <motion.section
        initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.4 }}
      >
        <SectionHeader icon={<TrendingUp className="w-4 h-4" />} label="Popularity Regression" tag="Random Forest · R²=0.871" tagColor="green" />
        <RegressionChart />
      </motion.section>

      {/* Section 5: Top Shows */}
      <motion.section
        initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.4 }}
      >
        <SectionHeader icon={<Star className="w-4 h-4" />} label="Top Shows" tag="By Popularity" tagColor="gold" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {overviewData.top_shows.slice(0, 8).map((show, i) => (
            <div key={i} className="card p-4 flex flex-col gap-3 hover:-translate-y-0.5 transition-transform duration-200">
              <div className="flex items-start justify-between gap-2">
                <span className="font-display text-sm font-semibold text-white leading-tight">{show.name}</span>
                <span className="badge bg-brand-600/20 text-brand-400 border border-brand-500/30 flex-shrink-0 text-xs">
                  #{i + 1}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="badge bg-surface-500/40 text-slate-300 border-0">{show.genre}</span>
                <span>{show.network}</span>
                <span>·</span>
                <span>{show.year}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-gold-400" />
                  <span className="text-gold-400 font-bold text-sm">{show.popularity.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-brand-400" />
                  <span className="text-brand-300 text-sm font-medium">{show.rating}</span>
                </div>
              </div>
              <div className="h-1 rounded-full bg-surface-500/40 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${show.popularity}%`,
                    background: 'linear-gradient(90deg, #7c3aed, #f59e0b)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Section 6: Show Explorer */}
      <motion.section
        initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.4 }}
      >
        <SectionHeader icon={<Database className="w-4 h-4" />} label="Show Explorer" />
        <ShowExplorer />
      </motion.section>

      {/* Footer */}
      <footer className="border-t border-surface-500/20 pt-8 text-center text-sm text-slate-500">
        <p>
          <span className="font-display font-semibold text-brand-400">ShowMine</span>
          {' '}· TV Show Popularity Analysis via Data Mining ·{' '}
          K-Means · Apriori · Random Forest · Python + React
        </p>
      </footer>
    </div>
  )
}
