import Footer from "../components/Footer";
import CAADS from "../components/CAADS";
import { useEffect } from "react";

export default function CaadsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white min-h-screen">
      <div>
        <CAADS />
      </div>
      <Footer />
    </div>
  );
}
