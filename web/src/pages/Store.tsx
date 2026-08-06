import ProductGrid from "../components/ProductGrid";
import Footer from "../components/Footer";
import TerminalWidget from "../components/TerminalWidget";

export default function Store() {
  return (
    <>
      <main className="pb-12 min-h-screen">
        <ProductGrid limit={undefined} />
      </main>
      <Footer />
      <TerminalWidget />
    </>
  );
}
