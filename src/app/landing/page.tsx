import { Navigation } from './components/Navigation'
import { HeroSection } from './components/HeroSection'
import { ProblemSection } from './components/ProblemSection'
import { SolutionSection } from './components/SolutionSection'
import { FeaturesSection } from './components/FeaturesSection'
import { ScreenshotSection } from './components/ScreenshotSection'
import { SocialProofSection } from './components/SocialProofSection'
import { PricingSection } from './components/PricingSection'
import { FAQSection } from './components/FAQSection'
import { FinalCTASection } from './components/FinalCTASection'
import { Footer } from './components/Footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A1A2F]">
      <Navigation />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <FeaturesSection />
      <ScreenshotSection />
      <SocialProofSection />
      <PricingSection />
      <FAQSection />
      <FinalCTASection />
      <Footer />
    </div>
  )
}
