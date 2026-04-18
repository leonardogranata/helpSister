import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../../../assets/logo.png'
import { clearAuthSession, getStoredUser } from '../../../services/auth'
import styles from './Navbar.module.css'

type NavItem = {
  label: string
  href?: string
  to?: string
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)
  const [authUser, setAuthUser] = useState<ReturnType<typeof getStoredUser>>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sync = () => setAuthUser(getStoredUser())
    sync()
    window.addEventListener('storage', sync)
    window.addEventListener('hs-auth-updated', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('hs-auth-updated', sync)
    }
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const firstName = useMemo(() => {
    if (!authUser?.name) return null
    return authUser.name.trim().split(' ')[0] || authUser.name
  }, [authUser])

  function handleLogout() {
    clearAuthSession()
    setDropOpen(false)
    setMenuOpen(false)
    window.location.href = '/'
  }

  const isBabysitter = authUser?.user_type === 'babysitter'
  const isContractor = authUser?.user_type === 'contractor'
  const navItems: NavItem[] = [
    { href: '#solucao', label: 'Nossa Solucao' },
    { href: '#como-funciona', label: 'Como Funciona' },
    { href: '#conversar', label: 'Conversar' },
    isContractor ? { to: '/contratar', label: 'Contratar' } : { href: '#contratar', label: 'Contratar' },
  ]

  const renderNavItem = (item: NavItem, onClick?: () => void) => {
    if (item.to) {
      return (
        <Link
          key={item.to}
          to={item.to}
          onClick={onClick}
          className={`${styles.navLink} font-body text-base font-light text-hs-white/90 transition-colors duration-200`}
        >
          {item.label}
        </Link>
      )
    }

    return (
      <a
        key={item.href}
        href={item.href}
        onClick={onClick}
        className={`${styles.navLink} font-body text-base font-light text-hs-white/90 transition-colors duration-200`}
      >
        {item.label}
      </a>
    )
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-hs-purple-dark border-b border-hs-purple-light/10">
      <div className="max-w-content mx-auto px-6 h-[68px] flex items-center justify-between">
        <Link to="/" className="flex-shrink-0">
          <img src={logo} alt="Help Sister" className="h-[5.5vh] min-h-[36px] max-h-[48px] w-auto" />
        </Link>

        <ul className="hidden md:flex items-center gap-1 list-none">
          {navItems.map(item => (
            <li key={item.to || item.href}>
              {renderNavItem(item)}
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-3">
          {firstName ? (
            <div className="relative" ref={dropRef}>
              <button
                onClick={() => setDropOpen(prev => !prev)}
                className="flex items-center gap-2 font-alt text-sm font-semibold text-hs-white px-4 py-2 rounded-full border border-white/30 bg-white/10 hover:bg-white/20 transition-all duration-200"
              >
                <span>{firstName}</span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${dropOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 overflow-hidden z-50">
                  {isContractor && (
                    <Link
                      to="/contratar"
                      onClick={() => setDropOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-hs-purple transition-colors"
                    >
                      <svg className="w-4 h-4 text-hs-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6l4 2m5-2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Encontrar babas
                    </Link>
                  )}
                  {isBabysitter && (
                    <Link
                      to="/baba/perfil"
                      onClick={() => setDropOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-hs-purple transition-colors"
                    >
                      <svg className="w-4 h-4 text-hs-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Meu perfil
                    </Link>
                  )}
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/entrar"
                className="font-alt text-sm font-medium text-hs-white px-5 py-2 rounded-full border border-white/30 hover:border-white hover:bg-white/10 transition-all duration-200"
              >
                Entrar
              </Link>
              <Link
                to="/cadastro"
                className="font-alt text-sm font-semibold text-hs-white px-5 py-2 rounded-full bg-gradient-to-r from-hs-purple-light to-hs-purple hover:scale-[1.03] hover:-translate-y-0.5 transition-transform duration-150 shadow-md"
              >
                Comecar Agora
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden flex flex-col gap-[5px] p-2 cursor-pointer"
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="Abrir menu"
        >
          <span className={`block w-6 h-0.5 bg-hs-white transition-all duration-300 origin-center ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
          <span className={`block w-6 h-0.5 bg-hs-white transition-all duration-300 ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-hs-white transition-all duration-300 origin-center ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
        </button>
      </div>

      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-hs-purple-dark border-t border-hs-purple-light/10 px-6 py-4 flex flex-col gap-4">
          {navItems.map(item => renderNavItem(item, () => setMenuOpen(false)))}

          <div className="flex flex-col gap-3 pt-2 border-t border-hs-purple-light/10">
            {firstName ? (
              <>
                <span className="font-alt text-sm font-semibold text-hs-white text-center px-5 py-2.5 rounded-full border border-white/30 bg-white/10">
                  Ola, {firstName}
                </span>
                {isContractor && (
                  <Link
                    to="/contratar"
                    onClick={() => setMenuOpen(false)}
                    className="font-alt text-sm font-medium text-hs-white text-center px-5 py-2.5 rounded-full border border-white/30 hover:bg-white/10 transition-all duration-200"
                  >
                    Encontrar babas
                  </Link>
                )}
                {isBabysitter && (
                  <Link
                    to="/baba/perfil"
                    onClick={() => setMenuOpen(false)}
                    className="font-alt text-sm font-medium text-hs-white text-center px-5 py-2.5 rounded-full border border-white/30 hover:bg-white/10 transition-all duration-200"
                  >
                    Meu perfil
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="font-alt text-sm font-medium text-hs-white/70 text-center px-5 py-2.5 rounded-full border border-white/20 hover:bg-red-500/20 hover:text-white transition-all duration-200"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/entrar"
                  onClick={() => setMenuOpen(false)}
                  className="font-alt text-sm font-medium text-hs-white text-center px-5 py-2.5 rounded-full border border-white/30 hover:border-white hover:bg-white/10 transition-all duration-200"
                >
                  Entrar
                </Link>
                <Link
                  to="/cadastro"
                  onClick={() => setMenuOpen(false)}
                  className="font-alt text-sm font-semibold text-hs-white text-center px-5 py-2.5 rounded-full bg-gradient-to-r from-hs-purple-light to-hs-purple shadow-md"
                >
                  Comecar Agora
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
