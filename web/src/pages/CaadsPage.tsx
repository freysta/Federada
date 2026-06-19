import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CAADS from "../components/CAADS";
import { useEffect } from "react";

export default function CaadsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <div className="pt-20">
        <CAADS />
      </div>
      <Footer />
    </div>
  );
}
