import Navbar from '../../components/layout/Navbar/Navbar'
import HeroBanner from '../../components/sections/HeroBanner/HeroBanner'
import ProblemSection from '../../components/sections/ProblemSection/ProblemSection'

export default function LandingPage() {
  return (
    <main>
      <Navbar />
      <HeroBanner />
      <hr className='border-black/20'/>
      <ProblemSection />
    </main>
  )
}