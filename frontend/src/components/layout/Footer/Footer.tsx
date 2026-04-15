import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faPhone, faClock } from '@fortawesome/free-solid-svg-icons'
import { faWhatsapp, faInstagram } from '@fortawesome/free-brands-svg-icons'
import logo from '../../../assets/logo.png'

const plataforma = [
  { href: '#como-funciona', label: 'Como Funciona' },
  { href: '#familias',      label: 'Para famílias' },
  { href: '#solucao',       label: 'Para babás' },
  { href: '#conversar',     label: 'Regras e Conduta' },
]

const empresa = [
  { href: '#conversar', label: 'Sobre nós' },
  { href: '#solucao',   label: 'Nossa missão' },
  { href: '#contato',   label: 'Contato' },
]

export default function Footer() {
  return (
    <footer className="w-full bg-hs-purple-dark">
      <div className="max-w-content mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1.5fr] gap-10">
          <div className="flex flex-col gap-5">
            <a href="/" className="flex items-center gap-3">
              <img src={logo} alt="Help Sister" className="h-10 w-auto" />
              <span className="font-display text-xl font-semibold text-hs-white">Help Sister</span>
            </a>
            <p className="font-body text-sm text-white/60 leading-relaxed max-w-[220px]">
              Conectando famílias a babás verificadas com segurança, acolhimento e transparência.
            </p>
            <div className="flex items-center gap-3 mt-1">
              <a
                href="mailto:contato@helpsister.com.br"
                className="w-9 h-9 rounded-lg border border-white/20 flex items-center justify-center text-white/60 hover:text-hs-purple-light hover:border-hs-purple-light transition-colors duration-200"
                aria-label="E-mail"
              >
                <FontAwesomeIcon icon={faEnvelope} className="text-sm" />
              </a>
              <a
                href="https://wa.me/5517999990000"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg border border-white/20 flex items-center justify-center text-white/60 hover:text-hs-purple-light hover:border-hs-purple-light transition-colors duration-200"
                aria-label="WhatsApp"
              >
                <FontAwesomeIcon icon={faWhatsapp} className="text-sm" />
              </a>
              <a
                href="https://instagram.com/helpsister"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg border border-white/20 flex items-center justify-center text-white/60 hover:text-hs-purple-light hover:border-hs-purple-light transition-colors duration-200"
                aria-label="Instagram"
              >
                <FontAwesomeIcon icon={faInstagram} className="text-sm" />
              </a>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <span className="font-alt text-xs font-semibold tracking-widest uppercase text-white/40">
              Plataforma
            </span>
            <ul className="flex flex-col gap-3 list-none">
              {plataforma.map(({ href, label }) => (
                <li key={href}>
                  <a
                    href={href}
                    className="font-body text-sm text-white/70 hover:text-hs-purple-light transition-colors duration-200"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-4">
            <span className="font-alt text-xs font-semibold tracking-widest uppercase text-white/40">
              Empresa
            </span>
            <ul className="flex flex-col gap-3 list-none">
              {empresa.map(({ href, label }) => (
                <li key={href}>
                  <a
                    href={href}
                    className="font-body text-sm text-white/70 hover:text-hs-purple-light transition-colors duration-200"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div id="contato" className="flex flex-col gap-4">
            <span className="font-alt text-xs font-semibold tracking-widest uppercase text-white/40">
              Contato
            </span>
            <div className="flex flex-col gap-3">
              <a
                href="mailto:contato@helpsister.com.br"
                className="flex items-center gap-2 font-body text-sm text-white/70 hover:text-hs-purple-light transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faEnvelope} className="text-hs-purple-mid text-xs" />
                contato@helpsister.com.br
              </a>
              <a
                href="tel:+5517999990000"
                className="flex items-center gap-2 font-body text-sm text-white/70 hover:text-hs-purple-light transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faPhone} className="text-hs-purple-mid text-xs" />
                (17) 99999-0000
              </a>
              <div className="flex items-center gap-2 mt-1">
                <span className="flex items-center gap-1.5 font-body text-xs text-white/60 border border-white/20 rounded-full px-3 py-1">
                  <FontAwesomeIcon icon={faClock} className="text-hs-purple-mid text-[10px]" />
                  Seg-Sex, 9h–18h
                </span>
              </div>
            </div>
          </div>

        </div>
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="font-body text-xs text-white/30">
            © {new Date().getFullYear()} Help Sister. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4">
            <a href="#privacidade" className="font-body text-xs text-white/30 hover:text-white/60 transition-colors duration-200">
              Política de Privacidade
            </a>
            <a href="#termos" className="font-body text-xs text-white/30 hover:text-white/60 transition-colors duration-200">
              Termos de Uso
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
