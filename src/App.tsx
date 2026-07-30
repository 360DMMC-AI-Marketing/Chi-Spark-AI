import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { Opportunity } from './components/Opportunity'
import { FiveLayers } from './components/FiveLayers'
import { Pillars } from './components/Pillars'
import { Tracks } from './components/Tracks'
import { Curriculum } from './components/Curriculum'
import { Impact } from './components/Impact'
import { Approach } from './components/Approach'
import { About } from './components/About'
import { GetInvolved } from './components/GetInvolved'
import { Support } from './components/Support'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'

function App() {
  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main>
        <Hero />
        <Opportunity />
        <FiveLayers />
        <Pillars />
        <Tracks />
        <Curriculum />
        <Impact />
        <Approach />
        <About />
        <GetInvolved />
        <Support />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}

export default App
