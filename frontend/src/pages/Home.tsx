import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart3, GitBranch, TrendingUp, Database, ArrowRight, Layers, Activity, Search } from 'lucide-react'

const FADE_UP = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }
const STAGGER = { show: { transition: { staggerChildren: 0.1 } } }

const TECHNIQUES = [
  {
    icon: <Layers className="w-6 h-6" />,
    title: 'K-Means Clustering',
    subtitle: 'k = 5 clusters · Silhouette = 0.623',
    desc: 'Groups 847 shows into 5 behaviorally distinct clusters — from Mainstream Hits to Hidden Gems — using rating, popularity, vote count, and season count as features.',
    color: 'text-brand-400', bg: 'bg-brand-600/15 border-brand-500/25',
  },
  {
    icon: <GitBranch className="w-6 h-6" />,
    title: 'Apriori Association Rules',
    subtitle: '47 rules · min_sup=0.05 · min_conf=0.55',
    desc: 'Discovers frequent genre-network-popularity itemsets. Reveals that Drama+Streaming → High Popularity with 78.1% confidence and 2.34× lift.',
    color: 'text-gold-400', bg: 'bg-gold-500/15 border-gold-500/25',
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: 'Random Forest Regression',
    subtitle: 'R² = 0.871 · RMSE = 8.24 · 5-fold CV',
    desc: 'Predicts popularity scores from 15+ features. Vote count (log-transformed) and IMDb rating are the strongest predictors; streaming networks add a significant boost.',
    color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/25',
  },
]

const STATS = [
  { value: '847', label: 'TV Shows' },
  { value: '2000–2024', label: 'Year Range' },
  { value: '17', label: 'Genres' },
  { value: '21+', label: 'Networks' },
  { value: '124K+', label: 'Episodes' },
  { value: '3', label: 'Mining Algorithms' },
]

export default function Home() {
  return (
    <div className="overflow-x-hidden">

      {/* Hero */}
      <section className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 text-center">
        <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-glow-purple opacity-30 blur-3xl pointer-events-none" />

        <motion.div
          variants={STAGGER} initial="hidden" animate="show"
          className="relative z-10 max-w-4xl mx-auto flex flex-col items-center gap-6"
        >
          <motion.span variants={FADE_UP} className="badge bg-brand-600/25 text-brand-300 border border-brand-500/40 px-4 py-1.5 text-sm">
            Senior Data Mining Project · 2024
          </motion.span>

          <motion.h1 variants={FADE_UP} className="font-display text-5xl sm:text-7xl font-bold leading-tight tracking-tight">
            What makes a TV show<br />
            <span className="gradient-text">truly popular?</span>
          </motion.h1>

          <motion.p variants={FADE_UP} className="text-lg sm:text-xl text-slate-400 max-w-2xl leading-relaxed">
            <strong className="text-white">ShowMine</strong> mines 847 TV shows across 25 years using
            K-Means clustering, Apriori association rules, and Random Forest regression
            to uncover what drives popularity — and predict it.
          </motion.p>

          <motion.div variants={FADE_UP} className="flex flex-wrap gap-4 justify-center mt-2">
            <Link to="/dashboard" className="btn-primary text-base px-8 py-3.5">
              Explore Dashboard <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="https://github.com"
              className="btn-ghost border border-surface-500/40 text-base px-8 py-3.5 rounded-xl"
            >
              View Code
            </a>
          </motion.div>
        </motion.div>

        {/* Floating stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="relative z-10 mt-20 w-full max-w-4xl bg-surface-700/60 backdrop-blur border border-surface-500/40 rounded-2xl px-6 py-4"
        >
          <div className="flex flex-wrap justify-around gap-4">
            {STATS.map(s => (
              <div key={s.label} className="flex flex-col items-center gap-0.5">
                <span className="font-display text-2xl font-bold text-brand-400">{s.value}</span>
                <span className="text-xs text-slate-500 uppercase tracking-wider">{s.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Mining techniques */}
      <section className="px-6 py-24 max-w-7xl mx-auto">
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true }} variants={STAGGER}
          className="flex flex-col gap-12"
        >
          <motion.div variants={FADE_UP} className="text-center">
            <h2 className="font-display text-4xl font-bold text-white mb-3">Three Techniques. Rigorous Evaluation.</h2>
            <p className="text-slate-400 text-lg">Each method is evaluated with proper metrics — not just pretty charts.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TECHNIQUES.map((t, i) => (
              <motion.div
                key={i} variants={FADE_UP}
                className={`card p-7 flex flex-col gap-4 border ${t.bg} transition-transform hover:-translate-y-1 duration-200`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${t.bg} ${t.color}`}>
                  {t.icon}
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-white">{t.title}</h3>
                  <p className={`text-xs font-mono mt-0.5 ${t.color}`}>{t.subtitle}</p>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">{t.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Dataset section */}
      <section className="px-6 py-20 border-t border-surface-500/20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={STAGGER}
            className="flex flex-col gap-6"
          >
            <motion.div variants={FADE_UP}>
              <span className="badge bg-blue-600/20 text-blue-400 border border-blue-500/30 mb-4">Dataset</span>
              <h2 className="font-display text-4xl font-bold text-white leading-tight">
                Realistic. Reproducible. <br />
                <span className="text-brand-400">Fully Documented.</span>
              </h2>
            </motion.div>
            <motion.p variants={FADE_UP} className="text-slate-400 leading-relaxed">
              The dataset contains 847 synthetic-but-realistic TV shows generated with a seeded NumPy pipeline,
              covering 17 genres, 21+ networks, 25 years, and 12+ features per show including
              IMDb ratings, vote counts, episode structure, and streaming platform.
            </motion.p>
            <motion.div variants={FADE_UP} className="flex flex-wrap gap-3">
              {['pandas', 'scikit-learn', 'mlxtend', 'NumPy', 'Recharts', 'React', 'TypeScript', 'Tailwind'].map(tag => (
                <span key={tag} className="badge bg-surface-600/40 text-slate-300 border border-surface-500/30">{tag}</span>
              ))}
            </motion.div>
            <motion.div variants={FADE_UP}>
              <Link to="/dashboard" className="btn-primary self-start">
                Open Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Feature grid */}
          <motion.div
            initial={{ opacity: 0, x: 32 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { icon: <Database className="w-5 h-5" />, title: '15+ Features',   sub: 'per show'              },
              { icon: <Activity  className="w-5 h-5" />, title: '25-Year Range',  sub: '2000–2024'             },
              { icon: <Search    className="w-5 h-5" />, title: '47 Rules Mined', sub: 'Apriori associations'  },
              { icon: <BarChart3 className="w-5 h-5" />, title: 'R² = 0.871',     sub: 'RF regression accuracy'},
              { icon: <Layers    className="w-5 h-5" />, title: '5 Clusters',     sub: 'K-Means, k=5'         },
              { icon: <TrendingUp className="w-5 h-5"/>, title: '5-Fold CV',      sub: 'Cross-validated'       },
            ].map((f, i) => (
              <div key={i} className="card p-5 flex flex-col gap-2">
                <span className="text-brand-400">{f.icon}</span>
                <p className="font-semibold text-white">{f.title}</p>
                <p className="text-xs text-slate-500">{f.sub}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 text-center border-t border-surface-500/20">
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="max-w-2xl mx-auto flex flex-col items-center gap-6"
        >
          <h2 className="font-display text-4xl font-bold text-white">
            Ready to explore the data?
          </h2>
          <p className="text-slate-400">
            Interactive scatter plots, filterable rule tables, and a full show explorer — all in one dashboard.
          </p>
          <Link to="/dashboard" className="btn-primary text-base px-10 py-4">
            Launch Dashboard <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

    </div>
  )
}
