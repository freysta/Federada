import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import SectionSeparator from "./components/SectionSeparator";
import NewsSection from "./components/NewsSection";
import Gallery from "./components/Gallery";
import ProductGrid from "./components/ProductGrid";
import Roadmap from "./components/Roadmap";
import Team from "./components/Team";
import Footer from "./components/Footer";
import TerminalWidget from "./components/TerminalWidget";
import CAADS from "./components/CAADS";

function App() {
	return (
		<div className="bg-white min-h-screen selection:bg-black selection:text-white">
			<Navbar />
			<main>
				<Hero />
				<SectionSeparator />
				<ProductGrid />
				<Gallery />
				<NewsSection />
				<CAADS />
				<Roadmap />
				<Team />
			</main>
			<Footer />
			<TerminalWidget />
		</div>
	);
}

export default App;
