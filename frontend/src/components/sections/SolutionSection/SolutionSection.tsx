import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faShield, faCircleCheck, faLock, faDatabase } from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

interface Card {
  icon: IconDefinition
  title: string
  description: string
}

const cards: Card[] = [
  {
    icon: faShield,
    title: 'Verificação rigorosa',
    description: 'Toda candidata passa por questionário detalhado e validação de documentos antes de ser listada.',
  },
  {
    icon: faCircleCheck,
    title: 'Perfis compatíveis',
    description: 'Encontramos profissionais alinhadas com os valores, rotina e expectativas de cada família.',
  },
  {
    icon: faLock,
    title: 'Regras e conduta',
    description: 'Código de ética e boas práticas claro para todas — com transparência total para os contratantes.',
  },
  {
    icon: faDatabase,
    title: 'Tudo em um só lugar',
    description: 'Chat, escala de trabalho e rendimento integrados, organizados e sempre acessíveis no site.',
  },
]

export default function SolutionSection() {
  return (
    <section id="solucao" className="w-full bg-hs-bg py-20 md:py-28">
      <div className="max-w-content mx-auto px-6">
        <div className="bg-hs-lavender/60 rounded-3xl px-8 py-14 md:px-16 md:py-16">

          <motion.div
            className="flex flex-col items-center text-center gap-5 mb-14"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          >
            <span className="inline-flex items-center gap-1.5 font-alt text-xs font-normal text-hs-purple bg-hs-purple/[0.08] border border-hs-purple/20 px-4 py-1.5 rounded-full tracking-wide">
               • NOSSA SOLUÇÃO
            </span>

            <h2 className="font-display font-bold text-hs-purple-dark leading-[1.15] tracking-tight text-[clamp(1.9rem,4vw,3rem)]">
              Uma ponte{' '}
              <em className="italic text-hs-purple-mid font-semibold">confiável</em>
              {' '}entre<br />famílias e cuidadores
            </h2>

            <p className="font-body text-[0.9rem] leading-[1.75] text-hs-purple-dark/55 max-w-[440px]">
              A Help Sister torna esse processo simples, seguro e humano do início ao fim.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {cards.map(({ icon, title, description }, i) => (
              <motion.div
                key={title}
                className="bg-white/80 rounded-2xl px-7 py-8 flex flex-col gap-4 border border-hs-purple-light/15 hover:border-hs-purple-light/40 hover:shadow-md transition-all duration-200"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, ease: 'easeOut', delay: i * 0.1 }}
              >
                <div className="w-10 h-10 rounded-xl bg-hs-purple/10 flex items-center justify-center">
                  <FontAwesomeIcon icon={icon} className="text-hs-purple text-base" />
                </div>

                <div className="flex flex-col gap-2">
                  <h3 className="font-body font-semibold text-hs-purple-dark text-[1rem]">
                    {title}
                  </h3>
                  <p className="font-body text-[0.875rem] leading-[1.7] text-hs-purple-dark/55">
                    {description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
