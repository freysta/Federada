import Navbar from "../components/Navbar";
import ProductGrid from "../components/ProductGrid";
import Footer from "../components/Footer";
import CartSidebar from "../components/CartSidebar";
import TerminalWidget from "../components/TerminalWidget";

export default function Store() {
  return (
    <>
      <Navbar />
      <main className="pt-24 min-h-screen">
        <ProductGrid limit={undefined} />
      </main>
      <Footer />
      <CartSidebar />
      <TerminalWidget />
    </>
  );
}
