import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import Hero from "../components/Hero";
import SectionSeparator from "../components/SectionSeparator";
import NewsSection from "../components/NewsSection";
import Gallery from "../components/Gallery";
import ProductGrid from "../components/ProductGrid";
import Roadmap from "../components/Roadmap";
import Team from "../components/Team";
import Footer from "../components/Footer";
import TerminalWidget from "../components/TerminalWidget";
import CartSidebar from "../components/CartSidebar";

export default function StoreFront() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <SectionSeparator />
        <ProductGrid limit={3} />
        <div className="bg-white flex justify-center pb-16">
          <Link to="/loja" className="bg-black text-white px-12 py-4 font-bold font-mono tracking-widest hover:bg-neutral-800 transition-colors shadow-[6px_6px_0_0_#00f0ff] hover:shadow-[2px_2px_0_0_#00f0ff] active:shadow-none translate-y-0 hover:translate-y-1 active:translate-y-2">
            VER TODOS OS PRODUTOS
          </Link>
        </div>
        <Gallery />
        <NewsSection />
        <Roadmap />
        <Team />
      </main>
      <Footer />
      <CartSidebar />
      <TerminalWidget />
    </>
  );
}
