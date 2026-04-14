import { motion } from 'framer-motion'
import heroBaby from '../../../assets/hero-image.png'

export default function HeroBanner() {
  return (
    <section className="w-full bg-hs-bg pt-[calc(68px+4rem)] pb-16 md:pb-24 relative overflow-hidden">
      <div className="max-w-content mx-auto px-6 flex flex-col-reverse md:flex-row items-center justify-between gap-10 md:gap-6">

        <div className='pointer-events-none absolute inset-0 overflow-hidden'>
          <div className='absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-hs-purple-light/25 blur-[100px]'></div>
          <div className='absolute -bottom-24 -right-24 w-[420px] h-[420px] rounded-full bg-hs-purple-light/25 blur-[100px]'></div>
        </div>

        <motion.div
          className="flex-1 flex flex-col items-center md:items-start gap-5 text-center md:text-left max-w-full md:max-w-[480px]"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
        >
          <span className="inline-flex items-center gap-1.5 font-alt text-xs font-normal text-hs-purple bg-hs-purple/[0.08] border border-hs-purple/20 px-4 py-1.5 rounded-full tracking-wide">
            • PLATAFORMA DE BABÁS VERIFICADAS
          </span>

          <h1 className="font-display font-semibold text-hs-purple-dark leading-[1.15] tracking-tight text-[clamp(2rem,5vw,3.2rem)]">
            Seu filho em{' '}
            <em className=" italic text-hs-purple-mid font-light">
              boas<br />mãos.
            </em>{' '}
            Você com a<br className="hidden sm:block" /> paz que merece.
          </h1>

          <p className="font-body text-[0.95rem] leading-[1.75] text-hs-purple-dark/60 max-w-[360px] mx-auto md:mx-0">
            A Help Sister conecta pais a babás verificadas e qualificadas com
            segurança, acolhimento e transparência em cada etapa.
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-1">
            <a
              href="/cadastro"
              className="font-alt text-[0.95rem] font-semibold text-hs-white bg-hs-purple px-7 py-3 rounded-full shadow-[0_4px_16px_rgba(97,5,166,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(97,5,166,0.4)] transition-all duration-200"
            >
              Começar Agora
            </a>
            <a
              href="#como-funciona"
              className="font-alt text-[1rem] font-normal text-hs-purple px-7 py-3 rounded-full border border-hs-purple-dark/20 hover:border-hs-purple hover:bg-hs-purple/[0.04] transition-all duration-200"
            >
              Como Funciona
            </a>
          </div>
        </motion.div>

        <motion.div
          className="flex-1 flex justify-center items-center max-w-[340px] sm:max-w-[420px] md:max-w-[520px] w-full mx-auto"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.35 }}
        >
          <div className="relative w-full aspect-square rounded-full flex items-center justify-center">
            <img
              src={heroBaby}
              alt="Babá cuidando de bebê"
              className="w-[88%] h-[88%] object-contain relative z-10"
            />
          </div>
        </motion.div>

      </div>
    </section>
  )
}
