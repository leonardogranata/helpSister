import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'

const problems = [
  {
    title: 'Sem critério de verificação',
    description: '— você não sabe com quem está deixando seu filho.',
  },
  {
    title: 'Processo precário e informal',
    description: '— indicações sem qualquer garantia ou rastreabilidade.',
  },
  {
    title: 'Sem padrão de conduta',
    description: '— nenhuma clareza sobre o que esperar da profissional.',
  },
  {
    title: 'Ansiedade constante',
    description:
      '— pais que não conseguem aproveitar seus momentos por falta de paz.',
  },
]

export default function ProblemSection() {
  return (
    <section id="familias" className='w-full bg-hs-bg py-20 md:py-28'>
      <div className='max-w-content mx-auto px-6 flex flex-col md:flex-row items-start gap-14 md:gap-20'>

        <motion.div
          className='flex-1 flex flex-col gap-5 max-w-full md:max-w-[400px]'
          initial={{ opacity: 0, x: -28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          <span className='inline-flex items-center gap-1.5 font-alt text-xs font-normal text-hs-purple bg-hs-purple/[0.08] border border-hs-purple/20 px-4 py-1.5 rounded-full tracking-wide w-fit'>
            • O PROBLEMA
          </span>

          <h2 className='font-display font-semibold text-hs-purple-dark leading-[1.15] tracking-wide text-[clamp(1.9rem,7vw,2.8rem)]'>
            Encontrar uma babá confiável{' '}
            <em className='italic text-hs-purple-mid font-semibold'>
              não deveria ser
            </em>{' '}
            tão difícil
          </h2>
          <p className='font-body text-[1rem] leading-[1.75] text-hs-textbody/70 max-w-[385px] text-justify'>
            Muitas famílias enfrentam insegurança, processos sem transparência e
            profissionais sem critério de seleção. O que deveria ser simples,
            vira fonte de ansiedade.
          </p>
        </motion.div>

        <div className='flex-1 flex-col flex gap-6 w-full'>
          {problems.map(({ title, description }, i) => (
            <motion.div
              key={title}
              className='flex items-center gap-4 bg-hs-purple-light/10 border border-hs-purple-light/30 rounded-2xl px-5 py-4 shadow-xs hover:shadow-md hover:border-hs-purple-dark/20 transition-all duration-200'
              initial={{ opacity: 0, x: 28 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, ease: 'easeOut', delay: i * 0.1 }}
            >
              <div className='flex-shrink-0 w-6 h-6 rounded-full bg-hs-purple/10 flex items-center justify-center mt-0.5'>
                <FontAwesomeIcon
                  icon={faXmark}
                  className='text-hs-purple-mid text-[0.65rem]'
                />
              </div>
              <p className='font-body text-[0.9rem] leading-[1.65] text-hs-black/90'>
                <strong className='font-semibold text-hs-purple-dark'>
                  {title}
                </strong>{' '}
                {description}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
