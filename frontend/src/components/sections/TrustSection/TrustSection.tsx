import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faShield, faLock, faCircleCheck, faRotate } from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { motion } from 'framer-motion'

interface Feature {
  icon: IconDefinition
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: faShield,
    title: 'Documentos verificados',
    description: 'CPF e identidade confirmados',
  },
  {
    icon: faCircleCheck,
    title: 'Código de conduta',
    description: 'Regras claras para todas',
  },
  {
    icon: faLock,
    title: 'Privacidade garantida',
    description: 'Dados protegidos',
  },
  {
    icon: faRotate,
    title: 'Compatibilidade real',
    description: 'Match por valores e rotina',
  },
]

export default function TrustSection() {
  return (
        <motion.div
          className="flex flex-col items-center text-center gap-5 mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
    <section className="w-full bg-hs-bg py-20 md:py-28">
      <div className="max-w-content mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-start">

      
          <div className="flex flex-col gap-8 md:flex-1">

         
            <span className="inline-flex items-center gap-1.5 font-alt text-xs font-normal text-hs-purple bg-hs-purple/[0.08] border border-hs-purple/20 px-4 py-1.5 rounded-full tracking-wide self-start">
              • POR QUE CONFIAR
            </span>

        
            <h2 className="font-display font-bold text-hs-purple-dark leading-[1.2] tracking-tight text-[clamp(1.9rem,4vw,3rem)]">
              Cada detalhe pensado para{' '}
              <em className="italic text-hs-purple-mid font-semibold">sua segurança.</em>
            </h2>

   
            <p className="font-body text-[0.9rem] leading-[1.75] text-hs-purple-dark/55 max-w-[400px] -mt-4">
              Desenvolvemos um sistema com foco em proteção, ética e cuidado tanto
              para famílias quanto para profissionais.
            </p>


            <div className="grid grid-cols-2 gap-3">
              {features.map(({ icon, title, description }) => (
                <div
                  key={title}
                  className="bg-white/70 rounded-2xl px-5 py-4 flex items-center gap-3 border border-hs-purple-light/15 hover:border-hs-purple-light/40 hover:shadow-sm transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-lg bg-hs-purple/10 flex items-center justify-center shrink-0">
                    <FontAwesomeIcon icon={icon} className="text-hs-purple text-sm" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-body font-semibold text-hs-purple-dark text-[0.8rem] leading-tight">
                      {title}
                    </span>
                    <span className="font-body text-[0.75rem] leading-snug text-hs-purple-dark/50">
                      {description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:flex-1 w-full">
            <div className="bg-[#F4E6FF] h-[420px] rounded-3xl px-8 py-10 md:px-10 md:py-12 flex flex-col gap-10">

 
              <span className="font-display text-hs-purple text-[4.5rem] leading-none select-none">"</span>

              <p className="font-display italic text-hs-purple-dark text-[clamp(1.5rem,2vw,1.25rem)] leading-[1.65] -mt-7 font-medium">
                Finalmente senti que podia sair de casa sem aquela angústia. Meu filho estava em
                boas mãos, e eu sabia exatamente com quem.
              </p>


              <div className="flex items-center gap-3 mt-4">
                <div className="w-10 h-10 rounded-full bg-hs-purple flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5" aria-hidden="true">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="font-body font-semibold text-hs-purple-dark text-[0.875rem]">
                    Andrea Jordão Granata
                  </span>
                  <span className="font-body text-[0.775rem] text-hs-purple-dark/50">
                    Mãe solo
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
    </motion.div>
  )
}