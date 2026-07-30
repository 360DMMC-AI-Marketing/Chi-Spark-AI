import { useEffect, useState } from 'react'
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
import { Portal } from './pages/Portal'

function usePathname() {
  const [path, setPath] = useState(window.location.pathname)
  useEffect(() => {
    const onNav = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onNav)
    return () => window.removeEventListener('popstate', onNav)
  }, [])
  return path
}

function App() {
  if (usePathname().startsWith('/portal')) return <Portal />
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
