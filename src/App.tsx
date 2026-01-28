import Navbar from './components/Navbar';
import Hero from './components/Hero';
import NewsSection from './components/NewsSection';
import ProductGrid from './components/ProductGrid';
import Roadmap from './components/Roadmap';
import Team from './components/Team';
import Footer from './components/Footer';
import TerminalWidget from './components/TerminalWidget';

function App() {
  return (
    <div className="bg-white min-h-screen selection:bg-black selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <NewsSection />
        <ProductGrid />
        <Roadmap />
        <Team />
      </main>
      <Footer />
      <TerminalWidget />
    </div>
  );
}

export default App;