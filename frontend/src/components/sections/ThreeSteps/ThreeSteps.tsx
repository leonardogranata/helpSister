import { motion } from 'framer-motion'

interface Step {
  number: number
  title: string
  description: string
}

const steps: Step[] = [
  {
    number: 1,
    title: 'Escolha seu perfil',
    description:
      'Informe se é um contratante em busca de cuidado, ou uma candidata que quer trabalhar com segurança.',
  },
  {
    number: 2,
    title: 'Preencha o questionário',
    description:
      'Um formulário pensado para entender de verdade rotina, valores, expectativas e disponibilidade.',
  },
  {
    number: 3,
    title: 'Conecte-se',
    description:
      'Receba sugestões compatíveis com seu perfil e inicie a conexão com confiança e transparência.',
  },
]

export default function ThreeSteps() {
  return (
    <section id="como-funciona" className="w-full bg-hs-bg py-20 md:py-28">
      <div className="max-w-content mx-auto px-6">

        <motion.div
          className="flex flex-col items-center text-center gap-5 mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          <span className="inline-flex items-center gap-1.5 font-alt text-xs font-normal text-hs-purple bg-hs-purple/[0.08] border border-hs-purple/20 px-4 py-1.5 rounded-full tracking-wide">
            • COMO FUNCIONA
          </span>

          <h2 className="font-display font-bold text-hs-purple-dark leading-[1.15] tracking-tight text-[clamp(1.9rem,4vw,3rem)]">
            Três passos.{' '}
            <em className="italic text-hs-purple-mid font-semibold">Muita paz.</em>
          </h2>

          <p className="font-body text-[0.9rem] leading-[1.75] text-hs-purple-dark/55 max-w-[440px]">
            Simples do início ao fim — para pais e babás
          </p>
        </motion.div>

        <div className="relative flex flex-col md:flex-row items-start gap-10 md:gap-0">

          <div
            className="hidden md:block absolute left-0 right-0 border-t-2 border-dashed border-hs-purple/25"
            style={{ top: '1.5rem' }}
            aria-hidden="true"
          />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              className="relative flex flex-col items-start md:flex-1"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: i * 0.15 }}
            >
              <div
                className={[
                  'relative z-10 w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center shadow-sm mb-6',
                  step.number === 3
                    ? 'bg-hs-purple text-white'
                    : step.number === 2
                    ? 'bg-hs-purple-mid text-white'
                    : 'bg-hs-purple-light text-white',
                ].join(' ')}
              >
                <span className="font-display font-bold text-[1.3rem] leading-none">{step.number}</span>
              </div>

              <div className="flex flex-col gap-2 pr-10">
                <h3 className="font-body font-medium text-hs-purple-dark text-[1.1rem]">
                  {step.title}
                </h3>
                <p className="font-body text-[0.875rem] leading-[1.7] text-hs-purple-dark/55">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}

        </div>
      </div>
    </section>
  )
}
