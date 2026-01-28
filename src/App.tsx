import Navbar from './components/Navbar';
import Hero from './components/Hero';
import NewsSection from './components/NewsSection';
import Gallery from './components/Gallery';
import ProductGrid from './components/ProductGrid';
import Roadmap from './components/Roadmap';
import Team from './components/Team';
import CAADS from './components/CAADS';
import Footer from './components/Footer';
import TerminalWidget from './components/TerminalWidget';

function App() {
  return (
    <div className="bg-white min-h-screen selection:bg-black selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <NewsSection />
        <Gallery />
        <ProductGrid />
        <Roadmap />
        <Team />
        <CAADS />
      </main>
      <Footer />
      <TerminalWidget />
    </div>
  );
}

export default App;