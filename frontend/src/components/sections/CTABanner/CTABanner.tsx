import styles from './CTABanner.module.css'
import { motion } from 'framer-motion'

export default function CTABanner() {
  return (
     <motion.div
          className="flex flex-col items-center text-center gap-5 mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
    <section id="contratar" className="w-full bg-hs-bg py-20 md:py-28">
      <div className="max-w-content mx-auto px-6">
        <div className={`${styles.section} rounded-3xl px-8 py-20 flex flex-col items-center text-center gap-5`}>
          <span className="font-alt text-xs font-semibold tracking-widest uppercase text-white/60">
            HELP SISTER
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-white leading-tight max-w-2xl">
            Seu filho merece o melhor cuidado. Você merece paz.
          </h2>
          <p className="font-body text-sm md:text-base text-white/70 max-w-md">
            Conecte agora e encontre o profissional ideal para você e sua família.
          </p>
          <a href="/cadastro" className={`${styles.btn} px-8 py-3 rounded-full text-sm font-semibold transition-all hover:-translate-y-0.5`}>
            Começar Agora
          </a>
          <p className="font-body text-xs text-white/50">
            Sem contrato. Sem compromisso. Apenas cuidado.
          </p>
        </div>
      </div>
    </section>
    </motion.div>
  )
}