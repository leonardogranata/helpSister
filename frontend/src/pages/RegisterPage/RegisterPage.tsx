/**
 * RegisterPage.tsx
 * Página de cadastro da plataforma Help Sister — 4 passos.
 *
 * Suporta dois tipos de usuário:
 *   - Contratante: busca cuidadoras para sua família
 *   - Cuidadora:   oferece serviços de cuidado profissional
 *
 * Os passos são:
 *   1. Dados pessoais
 *   2. Segurança da conta
 *   3. Perfil (campos diferentes por tipo de usuário)
 *   4. Revisão final e criação da conta
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * INTEGRAÇÃO COM BACKEND (Django) — INSTRUÇÕES PARA O TIME DE BACKEND:
 *
 * 1. ENDPOINT PRINCIPAL:
 *    POST /api/auth/register/
 *    Body (Contratante): {
 *      user_type: "contratante",
 *      first_name, last_name, email, phone, cpf,           // Passo 1
 *      password, password_confirm, birth_date,              // Passo 2
 *      profile_photo (File),                               // Passo 3
 *      cep, address_number, preferred_caregiver_age,       // Passo 3 (contratante)
 *    }
 *    Body (Cuidadora): {
 *      user_type: "cuidadora",
 *      first_name, last_name, email, phone, cpf,           // Passo 1
 *      password, password_confirm, birth_date,              // Passo 2
 *      profile_photo (File),                               // Passo 3
 *      cep, address_number, service_radius_km,             // Passo 3 (cuidadora)
 *    }
 *    Response (sucesso): { token: string, user: { id, name, email, user_type } }
 *    Response (erro):    { field_name: ["mensagem de erro"], ... } ou { detail: string }
 *
 * 2. VALIDAÇÃO DE CPF:
 *    O CPF é validado no frontend com regex, mas deve ser validado também no backend.
 *    Backend: usar validators customizados no Django.
 *
 * 3. UPLOAD DE FOTO:
 *    Usar multipart/form-data para enviar o arquivo junto com os outros dados.
 *    Ou enviar em etapas: POST /api/auth/register/ e depois PATCH /api/profiles/{id}/photo/
 *
 * 4. CEP:
 *    O frontend já consome a API ViaCEP (https://viacep.com.br) para autocompletar.
 *    O backend deve armazenar: cep, logradouro, bairro, cidade, estado.
 *
 * 5. VERIFICAÇÃO DE E-MAIL:
 *    Após o cadastro, o backend deve enviar e-mail de verificação (django-allauth).
 *    O endpoint de verificação: POST /api/auth/verify-email/ com { key: string }
 *
 * 6. REDIRECIONAMENTO PÓS-CADASTRO:
 *    Contratante → /dashboard/contratante (ou /verificar-email)
 *    Cuidadora   → /dashboard/cuidadora   (ou /verificar-email)
 *
 * 7. PREFERÊNCIA DE IDADE (Contratante):
 *    Valores esperados: "18-25", "26-35", "36-45", "46-55", "55+"
 *    Ou ajustar conforme o modelo Django em profiles/models.py
 *
 * 8. RAIO DE ATENDIMENTO (Cuidadora):
 *    Valores esperados: 5, 10, 15, 20, 30, 50 (km)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faHouse, faHeart, faEye, faEyeSlash,
  faCheck, faCamera, faSpinner,
} from '@fortawesome/free-solid-svg-icons'
import logo from '../../assets/logo_login.png'
import { registerUser, saveAuthSession } from '../../services/auth'

// ─── Tipos ───────────────────────────────────────────────────────────────────

type UserType = 'contratante' | 'cuidadora'
type Step = 1 | 2 | 3 | 4

interface Step1Data {
  first_name: string
  last_name: string
  email: string
  phone: string
  cpf: string
}

interface Step2Data {
  password: string
  password_confirm: string
  birth_date: string
  accepted_terms: boolean
}

interface Step3Data {
  profile_photo: File | null
  cep: string
  address_number: string
  street: string
  neighborhood: string
  city: string
  state: string
  // Contratante:
  preferred_caregiver_age: string
  // Cuidadora:
  service_radius_km: string
  pix_key: string
}

// ─── Masks ───────────────────────────────────────────────────────────────────

function maskPhone(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{4})$/, '$1-$2')
    .slice(0, 15)
}

function maskCPF(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14)
}

function maskCEP(value: string): string {
  return value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 9)
}

// ─── Conteúdo do painel esquerdo por tipo e passo ───────────────────────────

function getLeftContent(userType: UserType, step: Step) {
  if (userType === 'cuidadora') {
    return {
      badge: 'JUNTE-SE À NOSSA REDE',
      title: (
        <>
          Transforme seu{' '}
          <em className="italic text-hs-purple-mid font-light">talento</em>
          {' '}em oportunidade
        </>
      ),
      subtitle: 'Cadastre-se e conecte-se a famílias que precisam de você!',
    }
  }
  if (step <= 2) {
    return {
      badge: 'JUNTE-SE À NOSSA REDE',
      title: (
        <>
          Faça parte da maior rede de{' '}
          <em className="italic text-hs-purple-mid font-light">cuidado</em>
        </>
      ),
      subtitle: 'Complete seu cadastro em minutos. Processo simples, seguro e gratuito.',
    }
  }
  return {
    badge: 'JUNTE-SE À NOSSA REDE',
    title: (
      <>
        Transforme seu{' '}
        <em className="italic text-hs-purple-mid font-light">talento</em>
        {' '}em oportunidade
      </>
    ),
    subtitle: 'Cadastre-se e conecte-se a famílias que precisam de você!',
  }
}

const STEPS_LABELS = [
  'Dados pessoais',
  'Segurança da conta',
  'Perfil profissional',
  'Revisão final',
]

// ─── Componente Principal ────────────────────────────────────────────────────

export default function RegisterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Tipo de usuário pode vir da URL: /cadastro?tipo=cuidadora
  const initialType = (searchParams.get('tipo') as UserType) || 'contratante'

  const [userType, setUserType]   = useState<UserType>(initialType)
  const [step, setStep]           = useState<Step>(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [showPassword, setShowPassword]        = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [photoPreview, setPhotoPreview]        = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step1, setStep1] = useState<Step1Data>({
    first_name: '', last_name: '', email: '', phone: '', cpf: '',
  })
  const [step2, setStep2] = useState<Step2Data>({
    password: '', password_confirm: '', birth_date: '', accepted_terms: false,
  })
  const [step3, setStep3] = useState<Step3Data>({
    profile_photo: null,
    cep: '',
    address_number: '',
    street: '',
    neighborhood: '',
    city: '',
    state: '',
    preferred_caregiver_age: '',
    service_radius_km: '',
    pix_key: '',
  })

  const content = getLeftContent(userType, step)

  // Resetar erro ao mudar de step
  useEffect(() => { setError(null) }, [step])

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handleStep1Change(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setStep1(prev => ({
      ...prev,
      [name]: name === 'phone' ? maskPhone(value)
             : name === 'cpf'   ? maskCPF(value)
             : value,
    }))
  }

  function handleStep2Change(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target
    setStep2(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  function handleStep3Change(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setStep3(prev => ({
      ...prev,
      [name]: name === 'cep' ? maskCEP(value) : name === 'state' ? value.toUpperCase().slice(0, 2) : value,
    }))
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('A foto deve ter no máximo 5MB.'); return }
    setStep3(prev => ({ ...prev, profile_photo: file }))
    setPhotoPreview(URL.createObjectURL(file))
  }

  // ── Busca de CEP via ViaCEP ─────────────────────────────────────────────
  async function fetchCEP(cep: string) {
    const raw = cep.replace(/\D/g, '')
    if (raw.length !== 8) return
    try {
      const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setStep3(prev => ({
          ...prev,
          street: prev.street || (data.logradouro ?? ''),
          neighborhood: prev.neighborhood || (data.bairro ?? ''),
          city: prev.city || (data.localidade ?? ''),
          state: prev.state || (data.uf ?? ''),
        }))
      }
    } catch {
      // Ignorar erros silenciosamente — campo continua editável
    }
  }

  // ── Validações por passo ────────────────────────────────────────────────

  function validateStep1(): string | null {
    if (!step1.first_name.trim()) return 'Informe seu nome.'
    if (!step1.last_name.trim())  return 'Informe seu sobrenome.'
    if (!step1.email.includes('@')) return 'Informe um e-mail válido.'
    if (step1.phone.replace(/\D/g, '').length < 10) return 'Informe um telefone válido.'
    if (step1.cpf.replace(/\D/g, '').length !== 11)  return 'Informe um CPF válido (11 dígitos).'
    return null
  }

  function validateStep2(): string | null {
    if (step2.password.length < 8) return 'A senha deve ter no mínimo 8 caracteres.'
    if (step2.password !== step2.password_confirm) return 'As senhas não coincidem.'
    if (!step2.birth_date) return 'Informe sua data de nascimento.'
    if (!step2.accepted_terms) return 'Você deve aceitar os Termos de Uso e a Política de Privacidade.'
    return null
  }

  function validateStep3(): string | null {
    if (step3.cep.replace(/\D/g, '').length !== 8) return 'Informe um CEP válido.'
    if (!step3.street.trim()) return 'Informe a rua.'
    if (!step3.address_number.trim()) return 'Informe o número do endereço.'
    if (!step3.neighborhood.trim()) return 'Informe o bairro.'
    if (!step3.city.trim()) return 'Informe a cidade.'
    if (!step3.state.trim() || step3.state.trim().length !== 2) return 'Informe o estado com 2 letras.'
    if (userType === 'contratante' && !step3.preferred_caregiver_age) return 'Selecione uma preferência de idade.'
    if (userType === 'cuidadora'   && !step3.service_radius_km)       return 'Selecione o raio de atendimento.'
    if (userType === 'cuidadora'   && !step3.pix_key.trim())          return 'Informe a chave PIX.'
    return null
  }

  // ── Navegar entre passos ────────────────────────────────────────────────

  function handleNext() {
    let validationError: string | null = null
    if (step === 1) validationError = validateStep1()
    if (step === 2) validationError = validateStep2()
    if (step === 3) validationError = validateStep3()

    if (validationError) { setError(validationError); return }
    setStep(s => (s < 4 ? (s + 1) as Step : s))
  }

  function handleBack() {
    setStep(s => (s > 1 ? (s - 1) as Step : s))
  }

  // ── Submissão final ─────────────────────────────────────────────────────

  async function handleSubmit() {
    setIsLoading(true)
    setError(null)

    try {
      const payload = new FormData()
      payload.append('user_type', userType)
      payload.append('first_name', step1.first_name.trim())
      payload.append('last_name', step1.last_name.trim())
      payload.append('email', step1.email.trim())
      payload.append('phone', step1.phone)
      payload.append('cpf', step1.cpf)
      payload.append('password', step2.password)
      payload.append('confirm_password', step2.password_confirm)
      payload.append('password_confirm', step2.password_confirm)
      payload.append('birth_date', step2.birth_date)
      payload.append('zip_code', step3.cep)
      payload.append('street', step3.street.trim())
      payload.append('number', step3.address_number.trim())
      payload.append('neighborhood', step3.neighborhood.trim())
      payload.append('city', step3.city.trim())
      payload.append('state', step3.state.trim())
      payload.append('service_radius', step3.service_radius_km)
      payload.append('pix_key', step3.pix_key.trim())

      if (step3.profile_photo) {
        payload.append('profile_picture', step3.profile_photo)
      }

      const authData = await registerUser(payload)
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
    <div className="min-h-screen bg-hs-bg flex flex-col items-center justify-center py-12 px-5">

      {/* Logo mobile */}
      <Link to="/" className="lg:hidden mb-8">
        <img src={logo} alt="Help Sister" className="h-10 w-auto" />
      </Link>

      {/* Container principal — painéis agrupados e próximos */}
      <div className="w-full max-w-[920px] flex flex-col lg:flex-row items-center lg:items-stretch gap-10 lg:gap-14">

        {/* ── Painel Esquerdo (Marketing + Steps) ─────────────────────────── */}
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

            <h1 className="font-display font-semibold text-hs-purple-dark leading-[1.15] tracking-tight text-[clamp(1.8rem,3vw,2.75rem)]">
              {content.title}
            </h1>

            <p className="font-body text-hs-textbody text-[1.05rem] leading-relaxed">
              {content.subtitle}
            </p>

            {/* Indicador de passos (lado esquerdo) */}
            <div className="flex flex-col gap-2.5 mt-2">
              {STEPS_LABELS.map((label, i) => {
                const stepNum = (i + 1) as Step
                const isDone   = step > stepNum
                const isActive = step === stepNum
                return (
                  <div
                    key={label}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300
                      ${isActive ? 'border-2 border-hs-purple bg-white shadow-sm' : 'border border-hs-purple/15'}
                    `}
                  >
                    <div
                      className={`
                        w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300
                        ${isDone || isActive ? 'bg-hs-purple text-white' : 'border border-hs-purple/25 text-hs-textbody/40'}
                      `}
                    >
                      {isDone
                        ? <FontAwesomeIcon icon={faCheck} className="text-xs" />
                        : <span className="font-alt text-xs font-semibold">{stepNum}</span>
                      }
                    </div>
                    <span
                      className={`font-alt text-sm transition-all duration-300 ${
                        isActive ? 'text-hs-purple-dark font-semibold'
                      : isDone   ? 'text-hs-purple font-medium'
                      : 'text-hs-textbody/40'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <p className="font-body text-xs text-hs-textbody/50 mt-10">
            © {new Date().getFullYear()} Help Sister. Todos os direitos reservados.
          </p>
        </div>

        {/* ── Painel Direito (Formulário) ─────────────────────────────────── */}
        <div className="w-full max-w-[420px] lg:max-w-none lg:w-[420px] flex-shrink-0">
          <div className="bg-white rounded-3xl shadow-lg p-7 sm:p-9">

          {/* ── Tabs Contratante / Cuidadora ───────────────────────────────── */}
          <div className="flex gap-3 mb-6">
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

          {/* ── Progress dots ──────────────────────────────────────────────── */}
          <div className="flex items-center gap-2 mb-5">
            {([1, 2, 3, 4] as Step[]).map(s => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step ? 'flex-1 bg-hs-purple' : s < step ? 'flex-1 bg-hs-purple/40' : 'w-5 bg-hs-purple-light/20'
                }`}
              />
            ))}
          </div>

          {/* ── Badge ──────────────────────────────────────────────────────── */}
          <div className="mb-4">
            <span className="inline-flex items-center gap-1.5 font-alt text-[11px] font-semibold text-hs-purple bg-hs-purple/10 px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-hs-purple inline-block" />
              PASSO {step} DE 4
            </span>
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* PASSO 1 — Dados pessoais                                        */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {step === 1 && (
            <>
              <div className="mb-6">
                <h2 className="font-display font-semibold text-hs-purple-dark text-[1.75rem] leading-tight tracking-tight">
                  Olá! Vamos começar?
                </h2>
                <p className="font-body text-sm text-hs-textbody mt-1">Conte um pouco sobre você</p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex gap-3">
                  <Field label="NOME">
                    <input
                      type="text" name="first_name" value={step1.first_name}
                      onChange={handleStep1Change} placeholder="Alanis"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="SOBRENOME">
                    <input
                      type="text" name="last_name" value={step1.last_name}
                      onChange={handleStep1Change} placeholder="Vico"
                      className={inputClass}
                    />
                  </Field>
                </div>

                <Field label="E-MAIL">
                  <input
                    type="email" name="email" value={step1.email}
                    onChange={handleStep1Change} placeholder="seu@email.com"
                    className={inputClass}
                  />
                </Field>

                <div className="flex gap-3">
                  <Field label="TELEFONE / WHATSAPP">
                    <input
                      type="tel" name="phone" value={step1.phone}
                      onChange={handleStep1Change} placeholder="(17) 99999-9999"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="CPF">
                    <input
                      type="text" name="cpf" value={step1.cpf}
                      onChange={handleStep1Change} placeholder="000.000.000-00"
                      className={inputClass}
                    />
                  </Field>
                </div>
              </div>
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* PASSO 2 — Segurança da conta                                    */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {step === 2 && (
            <>
              <div className="mb-6">
                <h2 className="font-display font-semibold text-hs-purple-dark text-[1.75rem] leading-tight tracking-tight">
                  Crie sua senha
                </h2>
                <p className="font-body text-sm text-hs-textbody mt-1">
                  Use letras, números e caracteres especiais
                </p>
              </div>

              <div className="flex flex-col gap-4">
                {/* Senha */}
                <Field label="SENHA">
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password" value={step2.password}
                      onChange={handleStep2Change} placeholder="••••••••••••"
                      className={`${inputClass} pr-11`}
                    />
                    <button type="button" onClick={() => setShowPassword(p => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-hs-textbody/40 hover:text-hs-purple transition-colors duration-200"
                    >
                      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="text-sm" />
                    </button>
                  </div>
                  {/* Barra de força da senha */}
                  <PasswordStrengthBar password={step2.password} />
                  <p className="font-body text-[11px] text-hs-textbody/50 mt-1">Mínimo 8 caracteres</p>
                </Field>

                {/* Confirmar senha */}
                <Field label="CONFIRMAR SENHA">
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="password_confirm" value={step2.password_confirm}
                      onChange={handleStep2Change} placeholder="••••••••••••"
                      className={`${inputClass} pr-11`}
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(p => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-hs-textbody/40 hover:text-hs-purple transition-colors duration-200"
                    >
                      <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} className="text-sm" />
                    </button>
                  </div>
                </Field>

                {/* Data de nascimento */}
                <Field label="DATA DE NASCIMENTO">
                  <input
                    type="date" name="birth_date" value={step2.birth_date}
                    onChange={handleStep2Change}
                    max={new Date().toISOString().split('T')[0]}
                    className={inputClass}
                  />
                </Field>

                {/* Termos */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div
                    className={`
                      w-4 h-4 mt-0.5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all duration-200
                      ${step2.accepted_terms ? 'bg-hs-purple border-hs-purple' : 'border-hs-purple-light/40 group-hover:border-hs-purple/60'}
                    `}
                    onClick={() => setStep2(prev => ({ ...prev, accepted_terms: !prev.accepted_terms }))}
                  >
                    {step2.accepted_terms && <FontAwesomeIcon icon={faCheck} className="text-white text-[9px]" />}
                  </div>
                  <input
                    type="checkbox" name="accepted_terms" checked={step2.accepted_terms}
                    onChange={handleStep2Change} className="sr-only"
                  />
                  <span className="font-body text-xs text-hs-textbody leading-relaxed">
                    Li e aceito os{' '}
                    <Link to="/termos" className="text-hs-purple hover:underline">Termos de Uso</Link>
                    {' '}e a{' '}
                    <Link to="/privacidade" className="text-hs-purple hover:underline">Política de Privacidade</Link>
                  </span>
                </label>
              </div>
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* PASSO 3 — Perfil                                                */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {step === 3 && (
            <>
              <div className="mb-6">
                <h2 className="font-display font-semibold text-hs-purple-dark text-[1.75rem] leading-tight tracking-tight">
                  Seu perfil
                </h2>
                <p className="font-body text-sm text-hs-textbody mt-1">
                  {userType === 'contratante'
                    ? 'Como você quer ser apresentado?'
                    : 'Como as famílias vão te encontrar?'}
                </p>
              </div>

              <div className="flex flex-col gap-4">
                {/* Upload de foto */}
                <div>
                  <input
                    type="file" ref={fileInputRef} accept="image/jpg,image/jpeg,image/png"
                    onChange={handlePhotoChange} className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-hs-purple-light/40 hover:border-hs-purple/60 rounded-2xl p-6 flex flex-col items-center gap-2 transition-all duration-200 group"
                  >
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-hs-purple/10 group-hover:bg-hs-purple/15 flex items-center justify-center transition-colors duration-200">
                        <FontAwesomeIcon icon={faCamera} className="text-hs-purple text-lg" />
                      </div>
                    )}
                    <div className="text-center">
                      <p className="font-alt text-sm font-semibold text-hs-purple-dark">
                        {userType === 'contratante' ? 'Adicionar foto de perfil' : 'Foto profissional'}
                      </p>
                      <p className="font-body text-xs text-hs-textbody/50 mt-0.5">
                        {userType === 'cuidadora' ? 'Aumenta 3x suas contratações · ' : ''}
                        JPG, PNG – máx. 5MB
                      </p>
                    </div>
                  </button>
                </div>

                {/* CEP e Número */}
                <div className="flex gap-3">
                  <Field label="CEP">
                    <input
                      type="text" name="cep" value={step3.cep}
                      onChange={handleStep3Change}
                      onBlur={() => fetchCEP(step3.cep)}
                      placeholder="00000-000"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="NÚMERO">
                    <input
                      type="text" name="address_number" value={step3.address_number}
                      onChange={handleStep3Change} placeholder="1234"
                      className={inputClass}
                    />
                  </Field>
                </div>

                <div className="flex gap-3">
                  <Field label="RUA">
                    <input
                      type="text" name="street" value={step3.street}
                      onChange={handleStep3Change} placeholder="Rua / Avenida"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="BAIRRO">
                    <input
                      type="text" name="neighborhood" value={step3.neighborhood}
                      onChange={handleStep3Change} placeholder="Seu bairro"
                      className={inputClass}
                    />
                  </Field>
                </div>

                <div className="flex gap-3">
                  <Field label="CIDADE">
                    <input
                      type="text" name="city" value={step3.city}
                      onChange={handleStep3Change} placeholder="Sua cidade"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="UF">
                    <input
                      type="text" name="state" value={step3.state}
                      onChange={handleStep3Change} placeholder="SP"
                      maxLength={2}
                      className={inputClass}
                    />
                  </Field>
                </div>

                {/* Campo condicional por tipo */}
                {userType === 'contratante' ? (
                  <Field label="PREFERÊNCIA DE IDADE">
                    {/*
                     * TODO (Backend): ajustar os valores das opções conforme o
                     * campo `preferred_caregiver_age` no modelo profiles/models.py
                     */}
                    <select
                      name="preferred_caregiver_age"
                      value={step3.preferred_caregiver_age}
                      onChange={handleStep3Change}
                      className={`${inputClass} appearance-none`}
                    >
                      <option value="">Selecione...</option>
                      <option value="18-25">18 a 25 anos</option>
                      <option value="26-35">26 a 35 anos</option>
                      <option value="36-45">36 a 45 anos</option>
                      <option value="46-55">46 a 55 anos</option>
                      <option value="55+">Acima de 55 anos</option>
                      <option value="any">Sem preferência</option>
                    </select>
                  </Field>
                ) : (
                  <>
                  <Field label="RAIO DE ATENDIMENTO">
                    {/*
                     * TODO (Backend): ajustar os valores conforme o campo
                     * `service_radius_km` no modelo profiles/models.py
                     */}
                    <select
                      name="service_radius_km"
                      value={step3.service_radius_km}
                      onChange={handleStep3Change}
                      className={`${inputClass} appearance-none`}
                    >
                      <option value="">Selecione...</option>
                      <option value="5">Até 5 km</option>
                      <option value="10">Até 10 km</option>
                      <option value="15">Até 15 km</option>
                      <option value="20">Até 20 km</option>
                      <option value="30">Até 30 km</option>
                      <option value="50">Até 50 km</option>
                    </select>
                  </Field>
                  
                <Field label="CHAVE PIX">
                  <input
                    type="text" name="pix_key" value={step3.pix_key}
                    onChange={handleStep3Change} placeholder="CPF, e-mail, telefone ou aleatória"
                    className={inputClass}
                  />
                </Field>
                  </>
                )}
              </div>
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* PASSO 4 — Revisão final                                         */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {step === 4 && (
            <>
              <div className="mb-6">
                <h2 className="font-display font-semibold text-hs-purple-dark text-[1.75rem] leading-tight tracking-tight">
                  Quase lá!
                </h2>
                <p className="font-body text-sm text-hs-textbody mt-1">Confirme seus dados e finalize</p>
              </div>

              <div className="flex flex-col gap-3 mb-6">
                {[
                  { label: 'Dados pessoais preenchidos',  done: true },
                  { label: 'Senha criada com segurança',  done: true },
                  { label: 'Perfil configurado',          done: true },
                  { label: 'Verificação de e-mail (após cadastro)', done: false },
                ].map(item => (
                  <div
                    key={item.label}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200
                      ${item.done ? 'border-hs-purple-light/30 bg-hs-purple/[0.03]' : 'border-hs-purple-light/15 bg-white/50'}
                    `}
                  >
                    <div
                      className={`
                        w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0
                        ${item.done ? 'bg-hs-purple/10' : 'border-2 border-hs-purple-light/30'}
                      `}
                    >
                      {item.done && <FontAwesomeIcon icon={faCheck} className="text-hs-purple text-xs" />}
                    </div>
                    <span className={`font-body text-sm ${item.done ? 'text-hs-purple-dark' : 'text-hs-textbody/40'}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Aviso LGPD */}
              <div className="bg-hs-bg border border-hs-purple-light/20 rounded-xl px-4 py-3 mb-2">
                <p className="font-body text-xs text-hs-textbody leading-relaxed">
                  Seus dados são protegidos conforme a{' '}
                  <Link to="/privacidade" className="text-hs-purple hover:underline font-semibold">LGPD</Link>.
                  {' '}Um e-mail de verificação será enviado após o cadastro.
                </p>
              </div>
            </>
          )}

          {/* ── Mensagem de erro ───────────────────────────────────────────── */}
          {error && (
            <div className="font-body text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mt-4">
              {error}
            </div>
          )}

          {/* ── Botões de navegação ────────────────────────────────────────── */}
          <div className={`flex gap-3 mt-6 ${step === 1 ? 'flex-col' : 'flex-row'}`}>
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={isLoading}
                className="flex-1 font-alt text-sm font-medium text-hs-purple-dark py-3 rounded-xl border border-hs-purple-light/30 hover:border-hs-purple hover:bg-hs-purple/[0.03] transition-all duration-200 disabled:opacity-50"
              >
                ← Voltar
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 font-alt text-sm font-semibold text-hs-white py-3 rounded-xl bg-gradient-to-r from-hs-purple-light to-hs-purple hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200 shadow-md"
              >
                Próximo →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 font-alt text-sm font-semibold text-hs-white py-3 rounded-xl bg-gradient-to-r from-hs-purple-light to-hs-purple hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200 shadow-md disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
              >
                {isLoading
                  ? <><FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />Criando conta...</>
                  : 'Criar minha conta'
                }
              </button>
            )}
          </div>

          {/* ── Link para login ────────────────────────────────────────────── */}
          <p className="font-body text-sm text-hs-textbody text-center mt-5">
            Já tem uma conta?{' '}
            <Link
              to={`/entrar?tipo=${userType}`}
              className="font-semibold text-hs-purple hover:text-hs-purple-dark transition-colors duration-200"
            >
              Entrar agora
            </Link>
          </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Componentes auxiliares ───────────────────────────────────────────────────

const inputClass =
  'w-full font-body text-sm text-hs-purple-dark placeholder:text-hs-textbody/40 bg-hs-bg border border-hs-purple-light/20 rounded-xl px-4 py-3 outline-none focus:border-hs-purple focus:ring-2 focus:ring-hs-purple/10 transition-all duration-200'

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5 flex-1">
      <label className="font-alt text-[11px] font-semibold text-hs-purple-dark tracking-widest uppercase">
        {label}
      </label>
      {children}
    </div>
  )
}

function PasswordStrengthBar({ password }: { password: string }) {
  const strength = getPasswordStrength(password)
  const colors   = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400']
  const labels   = ['Fraca', 'Razoável', 'Boa', 'Forte']

  if (!password) return null

  return (
    <div className="mt-2 flex items-center gap-2">
      <div className="flex gap-1 flex-1">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= strength ? colors[strength] : 'bg-hs-purple-light/20'
            }`}
          />
        ))}
      </div>
      <span className={`font-body text-[11px] font-medium ${
        strength < 2 ? 'text-red-400' : strength < 3 ? 'text-yellow-500' : 'text-green-500'
      }`}>
        {labels[strength]}
      </span>
    </div>
  )
}

function getPasswordStrength(password: string): number {
  let score = 0
  if (password.length >= 8)  score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return Math.min(score - 1, 3)
}
