import { useState, useMemo } from 'react'
import { Search, ChevronUp, ChevronDown, Star, Flame } from 'lucide-react'
import clsx from 'clsx'
import showsData from '../data/shows_sample.json'

type Show = typeof showsData[0]
type SortKey = keyof Pick<Show, 'rating' | 'popularity' | 'year' | 'seasons' | 'vote_count'>

const STATUS_COLORS: Record<string, string> = {
  'Ongoing':        'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'Ended':          'bg-slate-500/20   text-slate-400   border-slate-500/30',
  'Cancelled':      'bg-red-500/20     text-red-400     border-red-500/30',
  'Limited Series': 'bg-blue-500/20    text-blue-400    border-blue-500/30',
}

const ALL_GENRES  = ['All', ...Array.from(new Set(showsData.map(s => s.genre))).sort()]
const ALL_NETWORKS = ['All', ...Array.from(new Set(showsData.map(s => s.network))).sort()]

export default function ShowExplorer() {
  const [query,    setQuery]    = useState('')
  const [genre,    setGenre]    = useState('All')
  const [network,  setNetwork]  = useState('All')
  const [sortKey,  setSortKey]  = useState<SortKey>('popularity')
  const [sortAsc,  setSortAsc]  = useState(false)
  const [page,     setPage]     = useState(0)
  const PAGE = 12

  const filtered = useMemo(() => {
    let data = showsData as Show[]
    if (query)              data = data.filter(s => s.name.toLowerCase().includes(query.toLowerCase()))
    if (genre   !== 'All')  data = data.filter(s => s.genre   === genre)
    if (network !== 'All')  data = data.filter(s => s.network === network)
    return [...data].sort((a, b) => {
      const diff = (a[sortKey] as number) - (b[sortKey] as number)
      return sortAsc ? diff : -diff
    })
  }, [query, genre, network, sortKey, sortAsc])

  const paged    = filtered.slice(page * PAGE, (page + 1) * PAGE)
  const pages    = Math.ceil(filtered.length / PAGE)

  const handleSort = (k: SortKey) => {
    if (sortKey === k) setSortAsc(a => !a); else { setSortKey(k); setSortAsc(false) }
    setPage(0)
  }
  const handleFilter = () => setPage(0)

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k
      ? sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
      : <ChevronDown className="w-3 h-3 opacity-25" />

  return (
    <div className="card p-6 flex flex-col gap-5">
      <div>
        <h3 className="section-title mb-1">Show Explorer</h3>
        <p className="text-sm text-slate-400">Browse and filter all {showsData.length} analyzed shows</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text" placeholder="Search shows…" value={query}
            onChange={e => { setQuery(e.target.value); handleFilter() }}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-surface-600/50 border border-surface-500/40 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/60 transition-colors"
          />
        </div>
        <select
          value={genre} onChange={e => { setGenre(e.target.value); handleFilter() }}
          className="px-4 py-2.5 rounded-xl bg-surface-600/50 border border-surface-500/40 text-sm text-white focus:outline-none focus:border-brand-500/60 cursor-pointer"
        >
          {ALL_GENRES.map(g => <option key={g} value={g}>{g === 'All' ? 'All Genres' : g}</option>)}
        </select>
        <select
          value={network} onChange={e => { setNetwork(e.target.value); handleFilter() }}
          className="px-4 py-2.5 rounded-xl bg-surface-600/50 border border-surface-500/40 text-sm text-white focus:outline-none focus:border-brand-500/60 cursor-pointer"
        >
          {ALL_NETWORKS.map(n => <option key={n} value={n}>{n === 'All' ? 'All Networks' : n}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-surface-500/30">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-500/30 bg-surface-600/40 text-left">
              <th className="px-4 py-3 text-slate-400 font-medium w-5/12">Show</th>
              {([
                ['popularity', 'Popularity'],
                ['rating',     'Rating'],
                ['year',       'Year'],
                ['seasons',    'Seasons'],
                ['vote_count', 'Votes'],
              ] as [SortKey, string][]).map(([k, label]) => (
                <th key={k} className="px-3 py-3">
                  <button
                    onClick={() => handleSort(k)}
                    className="flex items-center gap-1 text-slate-400 hover:text-white font-medium transition-colors"
                  >
                    {label} <SortIcon k={k} />
                  </button>
                </th>
              ))}
              <th className="px-3 py-3 text-slate-400 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(show => (
              <tr key={show.id} className="border-b border-surface-500/20 hover:bg-surface-600/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-medium text-white truncate max-w-[220px]">{show.name}</span>
                    <span className="text-xs text-slate-500">{show.genre} · {show.network}</span>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-gold-400" />
                    <span className="font-semibold text-gold-400">{show.popularity.toFixed(1)}</span>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-brand-400" />
                    <span className="text-brand-300">{show.rating}</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-slate-300">{show.year}</td>
                <td className="px-3 py-3 text-slate-300">{show.seasons}</td>
                <td className="px-3 py-3 text-slate-400 text-xs">{(show.vote_count / 1000).toFixed(0)}K</td>
                <td className="px-3 py-3">
                  <span className={clsx('badge border', STATUS_COLORS[show.status] ?? STATUS_COLORS['Ended'])}>
                    {show.status}
                  </span>
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">No shows match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} · page {page + 1} of {pages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => p - 1)} disabled={page === 0}
              className="btn-ghost disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← Prev
            </button>
            <button
              onClick={() => setPage(p => p + 1)} disabled={page >= pages - 1}
              className="btn-ghost disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
