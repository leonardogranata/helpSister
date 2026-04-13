import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../../../assets/logo.png'
import { clearAuthSession, getStoredUser } from '../../../services/auth'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [authUserName, setAuthUserName] = useState<string | null>(null)

  useEffect(() => {
    const syncAuth = () => {
      const user = getStoredUser()
      setAuthUserName(user?.name ?? null)
    }

    syncAuth()
    window.addEventListener('storage', syncAuth)
    window.addEventListener('hs-auth-updated', syncAuth)

    return () => {
      window.removeEventListener('storage', syncAuth)
      window.removeEventListener('hs-auth-updated', syncAuth)
    }
  }, [])

  const firstName = useMemo(() => {
    if (!authUserName) return null
    return authUserName.trim().split(' ')[0] || authUserName
  }, [authUserName])

  function handleLogout() {
    clearAuthSession()
    setMenuOpen(false)
    window.location.href = '/'
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-hs-purple-dark border-b border-hs-purple-light/10">
      <div className="max-w-content mx-auto px-6 h-[68px] flex items-center justify-between">
        <Link to="/" className="flex-shrink-0">
          <img src={logo} alt="Help Sister" className="h-[5.5vh] min-h-[36px] max-h-[48px] w-auto" />
        </Link>

        <ul className="hidden md:flex items-center gap-1 list-none">
          {[
            { href: '#solucao', label: 'Nossa Solucao' },
            { href: '#como-funciona', label: 'Como Funciona' },
            { href: '#conversar', label: 'Conversar' },
            { href: '#contratar', label: 'Contratar' },
          ].map(({ href, label }) => (
            <li key={href}>
              <a
                href={href}
                className={`${styles.navLink} font-body text-base font-light text-hs-white/90 transition-colors duration-200`}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-3">
          {firstName ? (
            <>
              <span className="font-alt text-sm font-semibold text-hs-white px-4 py-2 rounded-full border border-white/30 bg-white/10">
                Ola, {firstName}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="font-alt text-sm font-medium text-hs-white px-5 py-2 rounded-full border border-white/30 hover:border-white hover:bg-white/10 transition-all duration-200"
              >
                Sair
              </button>
            </>
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
          {[
            { href: '#solucao', label: 'Nossa Solucao' },
            { href: '#como-funciona', label: 'Como Funciona' },
            { href: '#conversar', label: 'Conversar' },
            { href: '#contratar', label: 'Contratar' },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="font-body text-base font-light text-hs-white/90 hover:text-hs-purple-light transition-colors duration-200 py-1"
            >
              {label}
            </a>
          ))}

          <div className="flex flex-col gap-3 pt-2 border-t border-hs-purple-light/10">
            {firstName ? (
              <>
                <span className="font-alt text-sm font-semibold text-hs-white text-center px-5 py-2.5 rounded-full border border-white/30 bg-white/10">
                  Ola, {firstName}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="font-alt text-sm font-medium text-hs-white text-center px-5 py-2.5 rounded-full border border-white/30 hover:border-white hover:bg-white/10 transition-all duration-200"
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
