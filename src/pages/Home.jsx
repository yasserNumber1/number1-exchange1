import HeroSection from '../components/home/HeroSection'
import PromoBanner from '../components/home/PromoBanner'
import ExchangeForm from '../components/home/ExchangeForm'
import ReviewsSidebar from '../components/home/ReviewsSidebar'
import PairsSidebar from '../components/home/PairsSidebar'
import FeaturesSection from '../components/home/FeaturesSection'

function Home({ onNavigate }) {
  return (
    <div style={{ position: 'relative', zIndex: 2 }}>
      <section style={{ padding: '45px 0 55px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 22px' }}>
          <HeroSection onAbout={() => onNavigate('about')} />
          <PromoBanner />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, alignItems: 'start' }}>
            <ExchangeForm />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <ReviewsSidebar />
              <PairsSidebar />
            </div>
          </div>
          <FeaturesSection />
        </div>
      </section>
    </div>
  )
}

export default Home