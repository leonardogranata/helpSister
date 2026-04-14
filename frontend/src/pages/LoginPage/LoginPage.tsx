/**
 * LoginPage.tsx
 * Página de login da plataforma Help Sister.
 *
 * Suporte a dois tipos de usuário: Contratante e Cuidadora.
 * O formulário é o mesmo, mas o contexto visual e as mensagens mudam.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * INTEGRAÇÃO COM BACKEND (Django) — INSTRUÇÕES PARA O TIME DE BACKEND:
 *
 * 1. ENDPOINT ESPERADO:
 *    POST /api/auth/login/
 *    Body: { email: string, password: string, user_type: "contratante" | "cuidadora" }
 *    Response (sucesso): { token: string, user: { id, name, email, user_type } }
 *    Response (erro): { detail: string }
 *
 * 2. AUTENTICAÇÃO:
 *    Salvar o token retornado em localStorage ou cookie httpOnly (preferível).
 *    O token deve ser enviado no header: Authorization: Bearer <token>
 *
 * 3. SOCIAL LOGIN (Google, Apple, Facebook):
 *    Esses botões estão marcados com /* TODO: Social Login *\/
 *    Integrar com django-allauth ou dj-rest-auth para OAuth2.
 *
 * 4. RECUPERAÇÃO DE SENHA:
 *    POST /api/auth/password/reset/
 *    Body: { email: string }
 *
 * 5. REDIRECIONAMENTO PÓS-LOGIN:
 *    Contratante → /dashboard/contratante
 *    Cuidadora   → /dashboard/cuidadora
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHouse, faHeart, faEye, faEyeSlash, faShield, faStar, faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { faGoogle, faApple, faFacebookF } from '@fortawesome/free-brands-svg-icons'
import logo from '../../assets/logo_login.png'
import { loginUser, saveAuthSession } from '../../services/auth'

// ─── Tipos ───────────────────────────────────────────────────────────────────

type UserType = 'contratante' | 'cuidadora'

interface LoginFormData {
  email: string
  password: string
}

// ─── Conteúdo do painel esquerdo por tipo de usuário ────────────────────────

const leftPanelContent = {
  contratante: {
    badge: 'PLATAFORMA DE CUIDADOS',
    title: (
      <>
        Cuidado com{' '}
        <em className="italic text-hs-purple-mid font-light">excelência</em>
        {' '}e confiança
      </>
    ),
    subtitle:
      'Conectamos famílias a cuidadoras profissionais verificadas. Agendamento inteligente e suporte dedicado.',
    features: [
      { icon: faShield, title: 'Perfis 100% verificados', desc: 'Documentação, antecedentes e certificações' },
      { icon: faStar,   title: 'Avaliações reais',        desc: 'Sistema de reputação transparente' },
    ],
  },
  cuidadora: {
    badge: 'PLATAFORMA DE CUIDADOS',
    title: (
      <>
        Cuidado com{' '}
        <em className="italic text-hs-purple-mid font-light">excelência</em>
        {' '}e confiança
      </>
    ),
    subtitle:
      'Conectamos famílias a cuidadoras profissionais verificadas. Agendamento inteligente e suporte dedicado.',
    features: [
      { icon: faShield, title: 'Perfis 100% verificados', desc: 'Documentação, antecedentes e certificações' },
      { icon: faStar,   title: 'Avaliações reais',        desc: 'Sistema de reputação transparente' },
    ],
  },
}

// ─── Componente Principal ────────────────────────────────────────────────────

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialType = (searchParams.get('tipo') as UserType) || 'contratante'

  const [userType, setUserType]       = useState<UserType>(initialType)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading]     = useState(false)
  const [error, setError]             = useState<string | null>(null)

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  })

  const content = leftPanelContent[userType]

  // ── Handlers de formulário ──────────────────────────────────────────────

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null)
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      /*
       * ── INTEGRAÇÃO BACKEND ──────────────────────────────────────────────
       * Descomentar e adaptar quando o backend Django estiver pronto:
       *
       * const response = await fetch('/api/auth/login/', {
       *   method: 'POST',
       *   headers: { 'Content-Type': 'application/json' },
       *   body: JSON.stringify({
       *     email: formData.email,
       *     password: formData.password,
       *     user_type: userType,
       *   }),
       * })
       *
       * if (!response.ok) {
       *   const data = await response.json()
       *   throw new Error(data.detail || 'Erro ao fazer login')
       * }
       *
       * const { token, user } = await response.json()
       * localStorage.setItem('hs_token', token)
       * localStorage.setItem('hs_user', JSON.stringify(user))
       *
       * // Redirecionar conforme tipo de usuário
       * if (user.user_type === 'contratante') navigate('/dashboard/contratante')
       * else navigate('/dashboard/cuidadora')
       * ───────────────────────────────────────────────────────────────────
       *
       * Por enquanto (mock), simular delay e redirecionar:
       */
      const authData = await loginUser({
        email: formData.email,
        password: formData.password,
        userType,
      })
      saveAuthSession(authData)
      navigate('/')

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <motion.div
      className="min-h-screen bg-hs-bg flex flex-col items-center justify-center py-12 px-5"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.28, ease: 'easeInOut' }}
    >

      {/* Botão voltar — canto superior esquerdo */}
      <Link
        to="/"
        className="fixed top-4 left-4 z-50 flex items-center gap-2 font-alt text-sm font-semibold text-hs-purple hover:text-hs-purple-dark bg-white/90 backdrop-blur-sm border border-hs-purple/20 rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-all duration-200"
        aria-label="Voltar para a página inicial"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
        <span>Voltar</span>
      </Link>

      {/* Logo mobile (topo da página no mobile) */}
      <Link to="/" className="lg:hidden mb-8">
        <img src={logo} alt="Help Sister" className="h-10 w-auto" />
      </Link>

      {/* Container principal — agrupa os dois painéis com gap pequeno */}
      <div className="w-full max-w-[920px] flex flex-col lg:flex-row items-center lg:items-stretch gap-10 lg:gap-14 justify-center">

        {/* ── Painel Esquerdo (Marketing) ─────────────────────────────────── */}
        <div className="hidden lg:flex flex-col justify-between w-[360px] xl:w-[500px] flex-shrink-0 py-8 bg-hs-purple-light/10 px-8 border border-hs-purple-dark/10">

          {/* Logo + Badge */}
          <div className="flex-shrink-0 mb-7">
            <Link to="/">
              <img src={logo} alt="Help Sister" className="h-20 w-auto" />
            </Link>
            <div className="flex items-center gap-2 mt-7">
              <div className="w-5 h-px bg-hs-purple/40" />
              <span className="font-alt text-[11px] tracking-widest uppercase font-bold text-hs-purple/60">
                {content.badge}
              </span>
            </div>
          </div>

          {/* Conteúdo central */}
          <div className="flex flex-col gap-4 flex-1 justify-center">

            <h1 className="font-display font-semibold text-hs-purple-dark leading-[1.15] tracking-tight text-[clamp(1.9rem,3vw,2.75rem)]">
              {content.title}
            </h1>

            <p className="font-body text-hs-textbody text-[1.05rem] leading-relaxed">
              {content.subtitle}
            </p>

            <div className="flex flex-col gap-3 mt-1">
              {content.features.map(f => (
                <div
                  key={f.title}
                  className="flex items-start gap-4 bg-white/70 rounded-2xl px-5 py-4 border border-hs-purple-light/15"
                >
                  <div className="w-9 h-9 rounded-xl bg-hs-purple/10 flex items-center justify-center flex-shrink-0">
                    <FontAwesomeIcon icon={f.icon} className="text-hs-purple text-sm" />
                  </div>
                  <div>
                    <p className="font-alt text-sm font-semibold text-hs-purple-dark">{f.title}</p>
                    <p className="font-body text-xs text-hs-textbody mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer do painel */}
          <p className="font-body text-xs text-hs-textbody/50 mt-10">
            © {new Date().getFullYear()} Help Sister. Todos os direitos reservados.
          </p>
        </div>

        {/* ── Painel Direito (Formulário) ─────────────────────────────────── */}
        <div className="w-full max-w-[420px] lg:max-w-none lg:w-[420px] flex-shrink-0">
          <div className="bg-white rounded-3xl shadow-lg p-7 sm:p-9">

          {/* ── Tabs Contratante / Cuidadora ───────────────────────────────── */}
          <div className="flex gap-3 mb-7">
            {(['contratante', 'cuidadora'] as UserType[]).map(type => (
              <button
                key={type}
                onClick={() => { setUserType(type); setError(null) }}
                className={`
                  flex-1 flex flex-col items-center gap-1.5 py-3 px-3 rounded-2xl border-2 transition-all duration-200
                  ${userType === type
                    ? 'border-hs-purple bg-hs-purple/[0.07] ring-2 ring-hs-purple/20 shadow-sm'
                    : 'border-hs-purple-light/20 bg-white hover:border-hs-purple/40 hover:bg-hs-purple/[0.03]'
                  }
                `}
              >
                <FontAwesomeIcon
                  icon={type === 'contratante' ? faHouse : faHeart}
                  className={`transition-all duration-200 ${userType === type ? 'text-hs-purple text-2xl' : 'text-hs-textbody/40 text-lg'}`}
                />
                <span className={`font-alt text-xs font-semibold ${userType === type ? 'text-hs-purple-dark' : 'text-hs-textbody/50'}`}>
                  {type === 'contratante' ? 'Contratante' : 'Cuidadora'}
                </span>
                <span className={`font-body text-[10px] ${userType === type ? 'text-hs-textbody' : 'text-hs-textbody/40'}`}>
                  {type === 'contratante' ? 'Busco cuidadora' : 'Oferece serviços'}
                </span>
              </button>
            ))}
          </div>

          {/* ── Badge de área ──────────────────────────────────────────────── */}
          <div className="mb-5">
            <span className="inline-flex items-center gap-1.5 font-alt text-[11px] font-semibold text-hs-purple bg-hs-purple/10 px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-hs-purple inline-block" />
              {userType === 'contratante' ? 'ÁREA DO CONTRATANTE' : 'ÁREA DA CUIDADORA'}
            </span>
          </div>

          {/* ── Título ─────────────────────────────────────────────────────── */}
          <div className="mb-6">
            <h2 className="font-display font-semibold text-hs-purple-dark text-[1.75rem] leading-tight tracking-tight">
              {userType === 'contratante' ? 'Bem-vindo(a) de volta!' : 'Olá, cuidadora!'}
            </h2>
            <p className="font-body text-sm text-hs-textbody mt-1">
              {userType === 'contratante'
                ? 'Acesse sua conta e aproveite os melhores cuidados'
                : 'Acesse seu painel de oportunidades'}
            </p>
          </div>

          {/* ── Formulário ─────────────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="font-alt text-[11px] font-semibold text-hs-purple-dark tracking-widest uppercase">
                E-mail
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                required
                autoComplete="email"
                className="w-full font-body text-sm text-hs-purple-dark placeholder:text-hs-textbody/40 bg-hs-bg border border-hs-purple-light/20 rounded-xl px-4 py-3 outline-none focus:border-hs-purple focus:ring-2 focus:ring-hs-purple/10 transition-all duration-200"
              />
            </div>

            {/* Senha */}
            <div className="flex flex-col gap-1.5">
              <label className="font-alt text-[11px] font-semibold text-hs-purple-dark tracking-widest uppercase">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full font-body text-sm text-hs-purple-dark placeholder:text-hs-textbody/40 bg-hs-bg border border-hs-purple-light/20 rounded-xl px-4 py-3 pr-11 outline-none focus:border-hs-purple focus:ring-2 focus:ring-hs-purple/10 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-hs-textbody/40 hover:text-hs-purple transition-colors duration-200"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="text-sm" />
                </button>
              </div>
              <div className="flex justify-end">
                <Link
                  to="/recuperar-senha"
                  className="font-body text-xs text-hs-purple hover:text-hs-purple-dark transition-colors duration-200"
                >
                  {/* TODO: criar página /recuperar-senha que chama POST /api/auth/password/reset/ */}
                  Esqueci minha senha
                </Link>
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div className="font-body text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            {/* Botão principal */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full font-alt text-sm font-semibold text-hs-white py-3.5 rounded-xl bg-gradient-to-r from-hs-purple to-hs-purple-light hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200 shadow-md disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 mt-1"
            >
              {isLoading ? 'Entrando...' : 'Entrar na plataforma →'}
            </button>
          </form>

          {/* ── Divisor Social Login ────────────────────────────────────────── */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-hs-purple-light/20" />
            <span className="font-body text-xs text-hs-textbody/50">OU CONTINUE COM</span>
            <div className="flex-1 h-px bg-hs-purple-light/20" />
          </div>

          {/* ── Social Login ────────────────────────────────────────────────── */}
          {/*
           * TODO: Social Login (Backend)
           * Integrar com django-allauth:
           *   Google: GET /api/auth/google/
           *   Apple:  GET /api/auth/apple/
           *   Facebook: GET /api/auth/facebook/
           * Cada rota redireciona para OAuth2 e retorna token na callback.
           */}
          <div className="flex gap-3">
            {[
              { label: 'Google',   icon: faGoogle,    color: '#EA4335' },
              { label: 'Apple',    icon: faApple,     color: '#1E1E1E' },
              { label: 'Facebook', icon: faFacebookF, color: '#1877F2' },
            ].map(social => (
              <button
                key={social.label}
                type="button"
                onClick={() => console.log(`TODO: OAuth ${social.label}`)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-hs-purple/30 bg-white hover:bg-hs-bg hover:border-hs-purple/50 transition-all duration-200"
                aria-label={`Entrar com ${social.label}`}
              >
                <FontAwesomeIcon icon={social.icon} style={{ color: social.color }} className="text-sm" />
                <span className="font-alt text-xs font-medium text-hs-purple-dark">{social.label}</span>
              </button>
            ))}
          </div>

          {/* ── Link para cadastro ──────────────────────────────────────────── */}
          <p className="font-body text-sm text-hs-textbody text-center mt-6">
            Não tem uma conta?{' '}
            <Link
              to={`/cadastro?tipo=${userType}`}
              className="font-semibold text-hs-purple hover:text-hs-purple-dark transition-colors duration-200"
            >
              Cadastre-se
            </Link>
          </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

