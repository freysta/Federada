import ifroLogo from '../assets/logos/logo-ifro-branca-white-branco.png.webp';

export default function Footer() {
    return (
      <footer className="bg-black text-gray-400 py-16 font-sans border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            
            {/* Column 1: Brand */}
            <div>
              <h2 className="text-2xl text-white font-bold mb-4 tracking-tight">FEDERADA</h2>
              <p className="max-w-sm text-sm leading-relaxed mb-6">
                Atlética de Análise e Desenvolvimento de Sistemas.<br/>
                IFRO - Campus Ji-Paraná.
              </p>
              
              <img src={ifroLogo} alt="IFRO Logo" className="h-10 opacity-60 mb-6 hover:opacity-100 transition-opacity" />

              <div className="text-xs text-gray-500">
                Fundada em 2024
              </div>
            </div>
    
            {/* Column 2: Navigation */}
            <div>
               <h3 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Navegação</h3>
               <ul className="space-y-3 text-sm">
                 <li><a href="#" className="hover:text-white transition-colors">Início</a></li>
                 <li><a href="#merch" className="hover:text-white transition-colors">Loja Oficial</a></li>
                 <li><a href="#news" className="hover:text-white transition-colors">Notícias</a></li>
                 <li><a href="#about" className="hover:text-white transition-colors">Quem Somos</a></li>
               </ul>
            </div>

            {/* Column 3: Contact */}
            <div>
                <h3 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Contato & Social</h3>
                <ul className="space-y-3 text-sm">
                    <li><a href="#" className="hover:text-white transition-colors flex items-center gap-2">Instagram</a></li>
                    <li><a href="#" className="hover:text-white transition-colors flex items-center gap-2">WhatsApp</a></li>
                    <li><a href="#" className="hover:text-white transition-colors flex items-center gap-2">Email</a></li>
                </ul>
            </div>
    
          </div>
          
          <div className="pt-8 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600 gap-4">
            <div>
              © 2026 FEDERADA. Todos os direitos reservados.
            </div>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Sistemas Operacionais</span>
            </div>
          </div>

        </div>
      </footer>
    );
  }
