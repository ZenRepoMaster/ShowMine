import { Link, useLocation } from 'react-router-dom'
import { TvIcon, BarChart3, Home } from 'lucide-react'
import clsx from 'clsx'

export default function Navbar() {
  const { pathname } = useLocation()

  return (
    <header className="sticky top-0 z-50 border-b border-surface-500/30 bg-surface-900/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">

        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-glow-sm group-hover:shadow-glow-md transition-shadow">
            <TvIcon className="w-4 h-4 text-white" />
          </div>
          <span className="font-display text-xl font-bold text-white">
            Show<span className="text-brand-400">Mine</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <NavLink to="/"          icon={<Home    className="w-4 h-4" />} active={pathname === '/'}>          Home      </NavLink>
          <NavLink to="/dashboard" icon={<BarChart3 className="w-4 h-4" />} active={pathname === '/dashboard'}>Dashboard </NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <span className="badge bg-brand-600/20 text-brand-400 border border-brand-500/30">
            847 Shows Analyzed
          </span>
        </div>
      </div>
    </header>
  )
}

function NavLink({ to, children, active, icon }: {
  to: string; children: React.ReactNode; active: boolean; icon: React.ReactNode
}) {
  return (
    <Link
      to={to}
      className={clsx(
        'nav-link btn-ghost',
        active && 'text-white bg-surface-600/60 active'
      )}
    >
      {icon}
      {children}
    </Link>
  )
}
