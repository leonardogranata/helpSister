import Navbar from '../../components/layout/Navbar/Navbar'
import Footer from '../../components/layout/Footer/Footer'
import CTABanner from '../../components/sections/CTABanner/CTABanner'
import HeroBanner from '../../components/sections/HeroBanner/HeroBanner'
import ProblemSection from '../../components/sections/ProblemSection/ProblemSection'
import SolutionSection from '../../components/sections/SolutionSection/SolutionSection'
import ThreeSteps from '../../components/sections/ThreeSteps/ThreeSteps'
import TrustSection from '../../components/sections/TrustSection/TrustSection'

export default function LandingPage() {
  return (
    <main>
      <Navbar />
      <HeroBanner />
      <hr className='border-black/20'/>
      <ProblemSection />
      <SolutionSection />
      <ThreeSteps />
      <TrustSection />
      <CTABanner />
      <Footer />
    </main>
  )
}